import { supabase, isConfigured } from '@/lib/supabase'
import type { MenuItem, MenuCategory, CategoryType } from '@/types'

export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (!isConfigured) {
    console.error('Supabase not configured — cannot fetch menu items')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching menu items:', error)
      return []
    }

    if (!data || data.length === 0) {
      console.warn('No menu items found in database')
      return []
    }

    // Map snake_case database columns to camelCase component properties
    return data.map(mapMenuItem)
  } catch (err) {
    console.error('Fetch menu error:', err)
    return []
  }
}

// Helper to map DB row to MenuItem
function mapMenuItem(item: any): MenuItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category: item.category,
    imageUrl: item.image_url,
    requiresMeat: item.requires_meat,
    isRecommended: item.is_recommended,
    isAvailable: item.is_available,
    spiceLevels: item.spice_levels,
    options: item.options,
    createdAt: item.created_at,
  }
}

export async function fetchMenuItemById(id: number): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data ? mapMenuItem(data) : null
}

export async function fetchMenuByCategory(category: CategoryType): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('category', category)
    .eq('is_available', true)
    .order('is_recommended', { ascending: false })
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data ? data.map(mapMenuItem) : []
}

export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('name')

  if (error) {
    throw new Error(error.message)
  }

  return data ? data.map(mapMenuItem) : []
}

export const categories: MenuCategory[] = [
  { id: 'favorites', name: 'ที่ชอบ', nameEn: 'Favorites', icon: 'heart', color: 'red', gradient: 'from-red-500 to-pink-500' },
  { id: 'curry', name: 'พริกแกง', nameEn: 'Curry Paste', icon: 'bowl-food', color: 'red', gradient: 'from-red-600 to-red-400' },
  { id: 'kaprao', name: 'กะเพรา', nameEn: 'Kaprao', icon: 'pepper-hot', color: 'orange', gradient: 'from-orange-500 to-red-500' },
  { id: 'noodle', name: 'เส้น', nameEn: 'Noodles', icon: 'bacon', color: 'amber', gradient: 'from-amber-400 to-orange-400' },
  { id: 'bamboo', name: 'หน่อไม้', nameEn: 'Bamboo', icon: 'bamboo', color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
  { id: 'garlic', name: 'กระเทียม', nameEn: 'Garlic', icon: 'bread-slice', color: 'yellow', gradient: 'from-yellow-400 to-orange-300' },
  { id: 'others', name: 'อื่นๆ', nameEn: 'Others', icon: 'utensil-spoon', color: 'gray', gradient: 'from-gray-500 to-gray-400' },
]

export function getCategoryById(id: CategoryType): MenuCategory | undefined {
  return categories.find((c) => c.id === id)
}
