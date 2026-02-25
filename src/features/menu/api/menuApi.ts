import { supabase } from '@/lib/supabase'
import type { MenuItem, MenuCategory, CategoryType, MenuOption } from '@/types'

export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('name')

    if (error) {
      console.warn('Supabase error fetching menu items:', error)
      // Return sample data on any error for gracefully degrading UI
      return getSampleMenuItems()
    }

    if (!data || data.length === 0) {
      return getSampleMenuItems()
    }

    // Map snake_case database columns to camelCase component properties
    return data.map(mapMenuItem)
  } catch (err) {
    console.warn('Fetch menu error:', err)
    return getSampleMenuItems()
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

const TOP_UPS: MenuOption[] = [
  { id: 'extra_rice', name: 'พิเศษ ข้าว', price: 10, category: 'extra' },
  { id: 'extra_meat', name: 'พิเศษ เนื้อสัตว์', price: 15, category: 'extra' },
  { id: 'egg_khon', name: 'ไข่ข้น', price: 10, category: 'egg' },
  { id: 'egg_dao', name: 'ไข่ดาว', price: 10, category: 'egg' },
  { id: 'egg_jiao', name: 'ไข่เจียว', price: 10, category: 'egg' },
  { id: 'egg_yiao_ma', name: 'ไข่เยี่ยวม้า', price: 15, category: 'egg' },
  { id: 'egg_tom', name: 'ไข่ต้ม', price: 10, category: 'egg' },
]

// Meat selection
const MEAT_CHOICES: MenuOption[] = [
  { id: 'meat_sap', name: 'หมูสับ', price: 0, category: 'meat' },
  { id: 'meat_sanko', name: 'หมูสันคอสไลด์', price: 0, category: 'meat' },
  { id: 'meat_kai', name: 'ไก่', price: 0, category: 'meat' },
  { id: 'meat_kai_sap', name: 'ไก่สับ', price: 0, category: 'meat' },
  { id: 'meat_krob', name: 'หมูกรอบ', price: 15, category: 'meat' },
]

// ============================================================
// Sample Menu Data exact match to user specification
// ============================================================
function getSampleMenuItems(): MenuItem[] {
  return [
    // ══════════════════════════════════════════════
    // 🥘 หมวด: พริกแกง (curry)
    // ══════════════════════════════════════════════
    {
      id: 1, name: 'ผัดพริกแกง', description: 'เลือกระดับความเผ็ดและเนื้อสัตว์ได้', price: 50, category: 'curry', isRecommended: true, isAvailable: true, requiresMeat: true, imageUrl: '/images/prik-kang-moo-chin.jpg',
      options: [...MEAT_CHOICES, ...TOP_UPS]
    },
    {
      id: 2, name: 'ผัดพริกแกงกุ้ง', description: 'กุ้งเด้งๆ ผัดพริกแกงหอมๆ', price: 60, category: 'curry', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },

    // ══════════════════════════════════════════════
    // 🌶️ หมวด: กะเพรา (kaprao)
    // ══════════════════════════════════════════════
    {
      id: 3, name: 'กะเพรากุ้ง', description: 'กุ้งสดตัวใหญ่ ผัดกะเพราพริกสด', price: 60, category: 'kaprao', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-kung.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 4, name: 'กะเพราหมูสับ', description: 'เมนูยอดฮิตตลอดกาล', price: 50, category: 'kaprao', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-moo-sap.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 5, name: 'กะเพราหมูเด้ง', description: 'หมูเด้งเนื้อหนึบกรอบ', price: 50, category: 'kaprao', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-moo-deng.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 6, name: 'กะเพราสันคอสไลด์', description: 'สันคอสไลด์บางๆ นุ่มละมุน', price: 50, category: 'kaprao', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-san-ko.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 7, name: 'กะเพราหมูสับไข่เยี่ยวม้า', description: 'หมูสับไข่เยี่ยวม้ากรอบๆ', price: 60, category: 'kaprao', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-kai-yiao-ma.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 8, name: 'กะเพราหมูกรอบ', description: 'หมูกรอบเนื้อแน่น', price: 65, category: 'kaprao', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kaprao-moo-krob.jpg',
      options: [...TOP_UPS]
    },

    // ══════════════════════════════════════════════
    // 🍜 หมวด: เส้น (noodle)
    // ══════════════════════════════════════════════
    {
      id: 9, name: 'กะเพราวุ้นเส้น', description: 'วุ้นเส้นเหนียวนุ่ม ผัดเข้าเนื้อ', price: 55, category: 'noodle', isRecommended: false, isAvailable: true, requiresMeat: true,
      options: [...MEAT_CHOICES, ...TOP_UPS]
    },
    {
      id: 10, name: 'กะเพราวุ้นเส้นกุ้ง', description: 'วุ้นเส้นผัดกะเพรา ใส่กุ้งสด', price: 65, category: 'noodle', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },
    {
      id: 11, name: 'มาม่ากะเพรา', description: 'มาม่าเส้นหนึบ ผัดกะเพราแห้ง', price: 50, category: 'noodle', isRecommended: true, isAvailable: true, requiresMeat: true, imageUrl: '/images/mama-pad-kaprao.jpg',
      options: [...MEAT_CHOICES, ...TOP_UPS]
    },
    {
      id: 12, name: 'มาม่ากะเพรากุ้ง', description: 'มาม่ากะเพรา ใส่กุ้งเด้ง', price: 60, category: 'noodle', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },

    // ══════════════════════════════════════════════
    // 🎋 หมวด: หน่อไม้ (bamboo)
    // ══════════════════════════════════════════════
    {
      id: 13, name: 'กะเพราหน่อไม้', description: 'กะเพราใส่หน่อไม้ รสชาติจัดจ้าน', price: 55, category: 'bamboo', isRecommended: false, isAvailable: true, requiresMeat: true, imageUrl: '/images/kaprao-nor-mai.jpg',
      options: [...MEAT_CHOICES, ...TOP_UPS]
    },
    {
      id: 14, name: 'กะเพราหน่อไม้กุ้ง', description: 'กะเพราหน่อไม้ ใส่กุ้งตัวโต', price: 65, category: 'bamboo', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },

    // ══════════════════════════════════════════════
    // 🧄 หมวด: กระเทียม (garlic)
    // ══════════════════════════════════════════════
    {
      id: 15, name: 'กุ้งทอดกระเทียม', description: 'กุ้งทอดกระเทียมหอมๆ', price: 60, category: 'garlic', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kung-kra-thiam.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 16, name: 'หมูสับกระเทียม', description: 'หมูสับรวนกระเทียมพริกไทย', price: 50, category: 'garlic', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/moo-sap-kra-thiam.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 17, name: 'สันคอกระเทียม', description: 'สันคอหมูนุ่ม ผัดกระเทียม', price: 50, category: 'garlic', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/san-ko-kra-thiam.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 18, name: 'หมูเด้งกระเทียม', description: 'หมูเด้งหนึบ ผัดกระเทียม', price: 50, category: 'garlic', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },

    // ══════════════════════════════════════════════
    // 🍛 หมวด: อื่นๆ (others)
    // ══════════════════════════════════════════════
    {
      id: 19, name: 'ข้าวผัด', description: 'ข้าวผัดหอมกรุ่นกระทะ', price: 60, category: 'others', isRecommended: true, isAvailable: true, requiresMeat: true, imageUrl: '/images/khao-pad-moo-chin.jpg',
      options: [...MEAT_CHOICES, ...TOP_UPS]
    },
    {
      id: 20, name: 'ข้าวผัดกุ้ง', description: 'ข้าวผัดทะเลกุ้งเน้นๆ', price: 65, category: 'others', isRecommended: false, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },
    {
      id: 21, name: 'ข้าวไข่ข้นน้ำพริกเผา', description: 'ไข่ 2 ฟอง นุ่มลื่น ราดน้ำพริกเผา', price: 40, category: 'others', isRecommended: true, isAvailable: true, requiresMeat: false,
      options: [...TOP_UPS]
    },
    {
      id: 22, name: 'ข้าวไข่ข้น', description: 'ไข่ 2 ฟอง นุ่มลื่น ละลายในปาก', price: 40, category: 'others', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/khai-khon.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 23, name: 'กุ้งราดซอสมะขาม', description: 'กุ้งทอดซอสมะขามเปรี้ยวหวาน', price: 65, category: 'others', isRecommended: true, isAvailable: true, requiresMeat: false, imageUrl: '/images/kung-rod-sot-makham.jpg',
      options: [...TOP_UPS]
    },
    {
      id: 24, name: 'ไข่ดาวราดซอสมะขาม', description: 'ไข่ดาวทอดกรอบ ราดซอสมะขาม', price: 50, category: 'others', isRecommended: false, isAvailable: true, requiresMeat: false, imageUrl: '/images/khai-dao-rod-sot-makham.jpg',
      options: [...TOP_UPS]
    },
  ]
}
