import { supabase } from './supabase'
import { isLiffInitialized } from './liff'
import { useAuthStore } from '@/store'
import type { User } from '@/types'

// ─── Login with LINE ──────────────────────────────────────────────────────────
export async function loginWithLine(): Promise<void> {
  const { initLiff, isLiffInitialized } = await import('./liff')

  let initialized = isLiffInitialized()
  if (!initialized) {
    initialized = await initLiff()
  }

  if (!initialized) {
    throw new Error('ไม่สามารถเชื่อมต่อ LINE LIFF ได้ในขณะนี้ กรุณาเข้าใช้งานผ่านเบอร์โทรศัพท์หรือโหมดผู้เยี่ยมชม')
  }

  const liff = (await import('@line/liff')).default

  if (!liff.isLoggedIn()) {
    console.log('🔄 Redirecting to official LINE Login screen...')
    liff.login({ redirectUri: window.location.href })
  } else {
    console.log('✅ Already logged in with LINE')
  }
}

// ─── Login with Phone Number ──────────────────────────────────────────────────
export async function loginWithPhone(phoneNumber: string, displayName: string = 'สมาชิกกะเพรา 52'): Promise<User> {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
  if (cleanPhone.length < 9) {
    throw new Error('กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้องอย่างน้อย 9-10 หลัก')
  }

  const userId = `usr_phone_${cleanPhone}`
  const user: User = {
    id: userId,
    phoneNumber: cleanPhone,
    displayName: displayName.trim() || `ลูกค้า ${cleanPhone.slice(-4)}`,
    points: 20, // Free welcome points for phone login!
    totalOrders: 0,
    tier: 'MEMBER',
    isAdmin: false,
    createdAt: new Date().toISOString(),
  }

  useAuthStore.getState().setUser(user)
  localStorage.setItem('kaprao_user_data', JSON.stringify(user))

  // Claim any pending guest order
  const pending = getPendingGuestOrder()
  if (pending.orderId && pending.trackingToken) {
    try {
      await claimGuestOrder(Number(pending.orderId), pending.trackingToken)
      clearPendingGuestOrder()
    } catch (_) { /* noop */ }
  }

  return user
}

// ─── Login with Demo / Fast Member Account ────────────────────────────────────
export function loginWithDemoAccount(name: string = 'สมาชิกทดสอบ (VIP)'): User {
  const user: User = {
    id: 'usr_demo_' + Date.now(),
    lineUserId: 'U_demo_' + Date.now(),
    displayName: name,
    points: 150,
    totalOrders: 5,
    tier: 'GOLD',
    isAdmin: false,
    pictureUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  }

  useAuthStore.getState().setUser(user)
  localStorage.setItem('kaprao_user_data', JSON.stringify(user))
  return user
}

// ─── Guest Mode (Zero Supabase barrier) ────────────────────────────────────────
export function enterGuestMode(): void {
  const { setGuest } = useAuthStore.getState()
  setGuest()
  sessionStorage.setItem('kaprao_guest_mode', 'true')
}

// ─── Claim Guest Order After LINE Login ───────────────────────────────────────
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
    if (isLiffInitialized()) {
      const liff = (await import('@line/liff')).default
      if (liff.isLoggedIn()) {
        liff.logout()
      }
    }
  } catch (e) {
    console.warn('LINE logout warning:', e)
  }

  try {
    await supabase.auth.signOut()
  } catch (_) { /* noop */ }

  localStorage.removeItem('kaprao_user_data')
  localStorage.removeItem('kaprao_orders')
  localStorage.removeItem('kaprao52-auth-storage')
  localStorage.removeItem('kaprao52-cart-storage')
  sessionStorage.removeItem('kaprao_guest_mode')
  sessionStorage.removeItem('pending_guest_order_id')
  sessionStorage.removeItem('pending_guest_tracking_token')

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
