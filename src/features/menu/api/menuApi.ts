import { supabase, isConfigured } from '@/lib/supabase'
import type { MenuItem, MenuCategory, CategoryType } from '@/types'

export const FALLBACK_MENU_ITEMS: MenuItem[] = [
  // ─── หมวดกะเพรา (Kaprao) ───
  {
    id: 1,
    name: 'ผัดกะเพรา',
    description: 'ผัดกะเพราพริกแห้งสูตรเด็ด รสจัดจ้าน หอมใบกะเพราแท้ (เลือกเนื้อสัตว์ได้)',
    price: 55,
    category: 'kaprao',
    imageUrl: '/images/kaprao-moo-sap.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 2,
    name: 'กะเพราหมูกรอบ',
    description: 'หมูกรอบชิ้นใหญ่ กรอบนอกนุ่มใน คั่วกะเพราพริกแห้งสูตรเด็ด',
    price: 70,
    category: 'kaprao',
    imageUrl: '/images/kaprao-moo-krob.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 3,
    name: 'กะเพราไข่เยี่ยวม้า',
    description: 'ไข่เยี่ยวม้าทอดกรอบ ผัดกะเพราร่วมกับเนื้อสัตว์ที่คุณเลือก',
    price: 75,
    category: 'kaprao',
    imageUrl: '/images/kaprao-kai-yiao-ma.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 4,
    name: 'กะเพรากุ้ง',
    description: 'กุ้งสดตัวโตเนื้อเด้ง ผัดกะเพราพริกสดจัดจ้านกลิ่นหอมฟุ้ง',
    price: 85,
    category: 'kaprao',
    imageUrl: '/images/kaprao-kung.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },

  // ─── หมวดกระเทียม (Garlic) ───
  {
    id: 5,
    name: 'ผัดกระเทียม',
    description: 'ผัดกระเทียมพริกไทยสูตรเข้มข้น โรยกระเทียมเจียวกรอบหอมฟุ้ง (เลือกเนื้อสัตว์ได้)',
    price: 55,
    category: 'garlic',
    imageUrl: '/images/kung-kra-thiam.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 6,
    name: 'กุ้งทอดกระเทียม',
    description: 'กุ้งสดตัวใหญ่ทอดกรอบ คลุกเคล้ากระเทียมพริกไทยสูตรลับ',
    price: 85,
    category: 'garlic',
    imageUrl: '/images/kung-kra-thiam.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 13,
    name: 'หมูกรอบคั่วพริกเกลือ',
    description: 'หมูกรอบชิ้นหนา คั่วกระเทียมพริกเกลือหอมกรอบ รสกลมกล่อม',
    price: 75,
    category: 'garlic',
    imageUrl: '/images/kaprao-moo-krob.jpg',
    requiresMeat: false,
    isRecommended: false,
    isAvailable: true,
  },

  // ─── หมวดพริกแกง (Curry) ───
  {
    id: 7,
    name: 'ผัดพริกแกงถั่วฝักยาว',
    description: 'เครื่องแกงใต้แท้ผัดกะทิหอมๆ ใส่ถั่วฝักยาวกรอบอร่อย (เลือกเนื้อสัตว์ได้)',
    price: 60,
    category: 'curry',
    imageUrl: '/images/prik-kang-moo-chin.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },

  // ─── หมวดหน่อไม้ (Bamboo) ───
  {
    id: 11,
    name: 'ผัดกะเพราหน่อไม้',
    description: 'หน่อไม้กรอบเปรี้ยวกำลังดี ผัดกะเพรารสชาติจัดจ้านถึงใจ (เลือกเนื้อสัตว์ได้)',
    price: 60,
    category: 'bamboo',
    imageUrl: '/images/prik-kang-moo-chin.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },
  {
    id: 12,
    name: 'ผัดพริกแกงหน่อไม้',
    description: 'พริกแกงเข้มข้นผัดหน่อไม้หวานกรอบ หอมใบโหระพา (เลือกเนื้อสัตว์ได้)',
    price: 60,
    category: 'bamboo',
    imageUrl: '/images/prik-kang-moo-chin.jpg',
    requiresMeat: true,
    isRecommended: false,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },

  // ─── หมวดเส้น (Noodle) ───
  {
    id: 9,
    name: 'มาม่าผัดขี้เมากะเพรา',
    description: 'เส้นมาม่าเหนียวนุ่ม ผัดขี้เมากะเพราแห้งรสแซ่บจัดจ้าน (เลือกเนื้อสัตว์ได้)',
    price: 55,
    category: 'noodle',
    imageUrl: '/images/mama-pad-kaprao.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
    spiceLevels: [0, 1, 2, 3, 4, 5],
  },

  // ─── หมวดอื่นๆ (Others) ───
  {
    id: 10,
    name: 'ข้าวผัด',
    description: 'ข้าวผัดหอมกลิ่นกระทะ ใส่ผักคะน้า มะเขือเทศ และไข่ไก่ (เลือกเนื้อสัตว์ได้)',
    price: 55,
    category: 'others',
    imageUrl: '/images/khao-pad-moo-chin.jpg',
    requiresMeat: true,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 8,
    name: 'ไข่ดาวทรงเครื่องซอสมะขาม',
    description: 'ไข่ดาวกรอบนอกนุ่มใน ราดซอสมะขามเปรี้ยวหวาน โรยหอมเจียว',
    price: 45,
    category: 'others',
    imageUrl: '/images/khai-dao-rod-sot-makham.jpg',
    requiresMeat: false,
    isRecommended: true,
    isAvailable: true,
  },
  {
    id: 14,
    name: 'ต้มจืดเต้าหู้หมูสับสาหร่าย',
    description: 'น้ำซุปใสกลมกล่อม เต้าหู้ไข่นุ่มๆ หมูสับปรุงรสและสาหร่ายวากาเมะ',
    price: 65,
    category: 'others',
    imageUrl: '/images/khai-dao-rod-sot-makham.jpg',
    requiresMeat: false,
    isRecommended: false,
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
  { id: 'kaprao', name: 'กะเพรา', nameEn: 'Kaprao', icon: 'pepper-hot', color: 'orange', gradient: 'from-orange-500 to-red-500' },
  { id: 'garlic', name: 'กระเทียม', nameEn: 'Garlic', icon: 'bread-slice', color: 'yellow', gradient: 'from-amber-500 to-yellow-500' },
  { id: 'curry', name: 'พริกแกง', nameEn: 'Curry', icon: 'bowl-food', color: 'red', gradient: 'from-red-600 to-red-400' },
  { id: 'noodle', name: 'เส้น/มาม่า', nameEn: 'Noodles', icon: 'bacon', color: 'amber', gradient: 'from-amber-500 to-orange-400' },
  { id: 'bamboo', name: 'หน่อไม้', nameEn: 'Bamboo', icon: 'bamboo', color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
  { id: 'others', name: 'อื่นๆ', nameEn: 'Others', icon: 'utensil-spoon', color: 'gray', gradient: 'from-slate-600 to-slate-500' },
  { id: 'favorites', name: 'เมนูโปรด', nameEn: 'Favorites', icon: 'heart', color: 'pink', gradient: 'from-pink-500 to-rose-500' },
]

export function getCategoryById(id: CategoryType): MenuCategory | undefined {
  return categories.find((c) => c.id === id)
}
