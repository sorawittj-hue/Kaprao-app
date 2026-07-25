import { supabase, isConfigured } from '@/lib/supabase'
import type { MenuItem, MenuCategory, CategoryType } from '@/types'

export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: 'กะเพราหมูสับ',
    description: 'หมูสับเนื้อแน่น ผัดกะเพราพริกสด หอมร้อนแรง',
    price: 55,
    category: 'kaprao',
    imageUrl: '/images/kaprao-moo-sap.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [1, 2, 3],
  },
  {
    id: 2,
    name: 'กะเพราหมูกรอบ',
    description: 'หมูกรอบเหลืองอร่าม ผัดกะเพราสูตรเด็ด',
    price: 65,
    category: 'kaprao',
    imageUrl: '/images/kaprao-moo-krob.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [1, 2, 3],
  },
  {
    id: 3,
    name: 'กะเพราไข่เยี่ยวม้า',
    description: 'ไข่เยี่ยวม้าทอดกรอบ ผัดกะเพราพริกแห้ง เมนูยอดฮิต',
    price: 75,
    category: 'kaprao',
    imageUrl: '/images/kaprao-kai-yiao-ma.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [1, 2, 3],
  },
  {
    id: 4,
    name: 'กะเพรากุ้ง',
    description: 'กุ้งสดตัวใหญ่ ผัดกะเพราพริกสด กลิ่นหอมฟุ้ง',
    price: 85,
    category: 'kaprao',
    imageUrl: '/images/kaprao-kung.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [1, 2, 3],
  },
  {
    id: 5,
    name: 'หมูสับกระเทียม',
    description: 'หมูสับผัดกระเทียมพริกไทย โรยกระเทียมเจียว',
    price: 60,
    category: 'garlic',
    imageUrl: '/images/kung-kra-thiam.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 6,
    name: 'กุ้งกระเทียม',
    description: 'กุ้งทอดกรอบ ราดกระเทียมเจียวสูตรพิเศษ',
    price: 90,
    category: 'garlic',
    imageUrl: '/images/kung-kra-thiam.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 7,
    name: 'พริกแกงหมูชิ้น',
    description: 'ผัดพริกแกงเผ็ดร้อน หมูชิ้นนุ่มๆ ถั่วฝักยาว',
    price: 60,
    category: 'curry',
    imageUrl: '/images/prik-kang-moo-chin.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 8,
    name: 'ไข่ดาวซอสมะขาม',
    description: 'ไข่ดาวกรอบร้อน ราดซอสมะขามหวานอมเปรี้ยว',
    price: 45,
    category: 'others',
    imageUrl: '/images/khai-dao-rod-sot-makham.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 9,
    name: 'มาม่าผัดกะเพรา',
    description: 'มาม่าผัดแห้ง กะเพราสด หมูชิ้น เผ็ดจัดจ้าน',
    price: 50,
    category: 'noodle',
    imageUrl: '/images/mama-pad-kaprao.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 10,
    name: 'ข้าวผัดหมูชิ้น',
    description: 'ข้าวผัดหอมกระเทียม หมูชิ้นนุ่ม ผักคะน้า ไข่',
    price: 55,
    category: 'others',
    imageUrl: '/images/khao-pad-moo-chin.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
]

export async function fetchMenuItems(): Promise<MenuItem[]> {
  if (!isConfigured) {
    return FALLBACK_MENU_ITEMS
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching menu items:', error)
      return FALLBACK_MENU_ITEMS
    }

    if (!data || data.length === 0) {
      console.warn('No menu items found in database — using fallback menu data')
      return FALLBACK_MENU_ITEMS
    }

    return data.map(mapMenuItem)
  } catch (err) {
    console.error('Fetch menu error:', err)
    return FALLBACK_MENU_ITEMS
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
