import { supabase } from './supabase'
import { isLiffInitialized } from './liff'
import { useAuthStore } from '@/store'

// ─── Login with LINE ──────────────────────────────────────────────────────────
export async function loginWithLine(): Promise<void> {
  try {
    // On localhost, LIFF login will fail because the redirect URI is not whitelisted
    // in the LINE Developer Console. Show a clear error instead of a 400.
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost) {
      throw new Error('LINE Login ไม่สามารถใช้บน localhost ได้ — deploy ขึ้น production หรือเพิ่ม localhost URL ใน LINE Developer Console callback URLs')
    }

    // Initialize LIFF if not already done
    const { initLiff, isLiffInitialized } = await import('./liff')
    
    if (!isLiffInitialized()) {
      const initialized = await initLiff()
      if (!initialized) {
        throw new Error('ไม่สามารถเชื่อมต่อ LINE ได้ กรุณาลองใหม่อีกครั้ง')
      }
    }

    const liff = (await import('@line/liff')).default

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href })
    }
  } catch (error) {
    console.error('LINE Login Error:', error)
    throw error
  }
}

// ─── Guest Mode (no Supabase session needed) ──────────────────────────────────
// Guest mode is now handled purely in the AuthStore (isGuest: true, user: null)
// No Supabase anonymous session creation — keeps things simple & avoids conflicts
export function enterGuestMode(): void {
  const { setGuest } = useAuthStore.getState()
  setGuest()
  sessionStorage.setItem('kaprao_guest_mode', 'true')
}

// ─── Claim Guest Order After LINE Login ───────────────────────────────────────
// This is called automatically by AuthProvider — but can be called manually too
export async function claimGuestOrder(orderId: number, trackingToken: string): Promise<{
  success: boolean
  pointsEarned: number
  newBalance: number
}> {
  try {
    const { data, error } = await (supabase.rpc as any)('claim_guest_order', {
      p_order_id: orderId,
      p_tracking_token: trackingToken,
    })

    if (error) throw error

    const result = data as any
    return {
      success: result?.success ?? false,
      pointsEarned: result?.points_earned ?? 0,
      newBalance: result?.new_balance ?? 0,
    }
  } catch (error) {
    console.error('Claim guest order error:', error)
    return { success: false, pointsEarned: 0, newBalance: 0 }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  const { logout: storeLogout } = useAuthStore.getState()

  try {
    // Logout from LINE if initialized
    if (isLiffInitialized()) {
      const liff = (await import('@line/liff')).default
      if (liff.isLoggedIn()) {
        liff.logout()
      }
    }
  } catch (e) {
    console.warn('LINE logout warning:', e)
  }

  // Logout from Supabase
  await supabase.auth.signOut()

  // Clear all stored data
  localStorage.removeItem('kaprao_user_data')
  localStorage.removeItem('kaprao_orders')
  localStorage.removeItem('kaprao52-auth-storage')
  localStorage.removeItem('kaprao52-cart-storage')
  sessionStorage.removeItem('kaprao_guest_mode')
  sessionStorage.removeItem('pending_guest_order_id')
  sessionStorage.removeItem('pending_guest_tracking_token')

  // Update store
  storeLogout()
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ─── Sync user stats from server ──────────────────────────────────────────────
export async function syncUserStats(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('points, total_orders, tier')
    .eq('id', userId)
    .maybeSingle() as { data: { points: number; total_orders: number; tier: string } | null; error: Error | null }

  if (error) throw error
  if (!data) return { points: 0, totalOrders: 0, tier: 'MEMBER' as const }

  return {
    points: data.points || 0,
    totalOrders: data.total_orders || 0,
    tier: data.tier || 'MEMBER',
  }
}

// ─── Load user orders from Supabase ──────────────────────────────────────────
export async function loadUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── Check if user is admin ───────────────────────────────────────────────────
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle() as { data: { is_admin?: boolean } | null; error: Error | null }

    if (error || !data) return false
    return data.is_admin === true
  } catch {
    return false
  }
}

// ─── Save pending guest order for post-login claim ───────────────────────────
export function savePendingGuestOrder(orderId: number | string, trackingToken: string): void {
  sessionStorage.setItem('pending_guest_order_id', orderId.toString())
  sessionStorage.setItem('pending_guest_tracking_token', trackingToken)
}

// ─── Get pending guest order info ─────────────────────────────────────────────
export function getPendingGuestOrder(): { orderId: string | null; trackingToken: string | null } {
  return {
    orderId: sessionStorage.getItem('pending_guest_order_id'),
    trackingToken: sessionStorage.getItem('pending_guest_tracking_token'),
  }
}

// ─── Clear pending guest order ────────────────────────────────────────────────
export function clearPendingGuestOrder(): void {
  sessionStorage.removeItem('pending_guest_order_id')
  sessionStorage.removeItem('pending_guest_tracking_token')
}
