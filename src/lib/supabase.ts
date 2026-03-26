import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate configuration
export const isConfigured = Boolean(
  supabaseUrl && 
  supabaseKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('placeholder') &&
  supabaseUrl.startsWith('https://')
)


if (!isConfigured) {
  // Only log once at warning level to avoid flooding but still notify developer
  if (typeof window !== 'undefined' && !(window as any).__SUPABASE_WARNED__) {
    console.warn('⚠️ Supabase not properly configured, using placeholder. Check your .env file.')
    ;(window as any).__SUPABASE_WARNED__ = true
  }
}


// Create Supabase client with resilient config
// Using the generic Database type for proper table type inference
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-application-name': 'kaprao52-react',
      },
    },
  }
)

// Health check function
export async function checkSupabaseHealth(): Promise<boolean> {
  if (!isConfigured) return false

  try {
    const { error } = await supabase.from('menu_items').select('count', { count: 'exact', head: true })
    return !error
  } catch {
    return false
  }
}

// Helper function to subscribe to order changes
export function subscribeToOrders(
  userId: string,
  callback: (payload: { new: unknown; old: unknown; eventType: string }) => void
) {
  return supabase
    .channel(`orders:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

// Helper function to subscribe to all orders (for admin)
export function subscribeToAllOrders(
  callback: (payload: { new: unknown; old: unknown; eventType: string }) => void
) {
  return supabase
    .channel('orders:all')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
      },
      callback
    )
    .subscribe()
}

// Helper function to subscribe to menu changes
export function subscribeToMenuChanges(
  callback: (payload: { new: unknown; old: unknown; eventType: string }) => void
) {
  return supabase
    .channel('menu:changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'menu_items',
      },
      callback
    )
    .subscribe()
}
