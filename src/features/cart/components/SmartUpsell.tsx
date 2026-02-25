import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Sparkles, TrendingUp } from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { hapticLight } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'

export function SmartUpsell() {
  const { items, addItem } = useCartStore()
  const { addToast } = useUIStore()
  const { data: menuItems } = useMenuItems()

  // Smart recommendations based on cart contents
  const recommendations = useMemo(() => {
    if (!menuItems || items.length === 0) return []

    const cartItemIds = new Set(items.map(i => i.menuItem.id))
    const cartCategories = new Set(items.map(i => i.menuItem.category))

    // Common pairings
    const hasMainDish = cartCategories.has('kaprao') || cartCategories.has('bamboo') ||
      cartCategories.has('garlic') || cartCategories.has('curry') ||
      cartCategories.has('noodle')

    // Check if they already have an egg item in cart by searching names
    const hasEgg = items.some(i => i.menuItem.name.includes('ไข่'))

    const suggestions: Array<{ item: typeof menuItems[0]; reason: string; discount: number }> = []

    // Suggest side dishes if cart only has main dishes
    if (hasMainDish) {
      const sideDishes = menuItems.filter(i => i.category === 'others' && i.isAvailable && !cartItemIds.has(i.id))
      if (sideDishes.length > 0) {
        suggestions.push({
          item: sideDishes[0],
          reason: 'คู่กับอาหารจานนี้',
          discount: 5,
        })
      }
    }

    // Suggest egg dish if no egg in cart
    if (hasMainDish && !hasEgg) {
      const eggDishes = menuItems.filter(i => i.name.includes('ไข่') && i.isAvailable && !cartItemIds.has(i.id))
      if (eggDishes.length > 0) {
        suggestions.push({
          item: eggDishes[0],
          reason: 'เพิ่มเมนูไข่เข้าไป',
          discount: 0,
        })
      }
    }

    // Suggest popular add-ons
    const popularItems = menuItems.filter(i =>
      i.isRecommended &&
      i.isAvailable &&
      !cartItemIds.has(i.id) &&
      !suggestions.some(s => s.item.id === i.id)
    )

    if (popularItems.length > 0 && suggestions.length < 3) {
      suggestions.push({
        item: popularItems[0],
        reason: 'ขายดีประจำวัน',
        discount: 0,
      })
    }

    return suggestions.slice(0, 2)
  }, [menuItems, items])

  const handleAdd = (item: typeof recommendations[0]['item']) => {
    hapticLight()
    addItem(item, 1, [])
    addToast({
      type: 'cart-add',
      title: 'เพิ่มลงตะกร้าแล้ว',
      message: item.name,
      imageUrl: item.imageUrl,
    })
  }

  if (recommendations.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-purple-500" />
        <h3 className="font-bold text-purple-800 text-sm">แนะนำสำหรับคุณ</h3>
      </div>

      <div className="space-y-3">
        {recommendations.map(({ item, reason, discount }) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 bg-white rounded-xl p-2 shadow-sm"
          >
            <img
              src={getValidImageUrl(item.imageUrl)}
              alt={item.name}
              className="w-14 h-14 rounded-lg object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                {discount > 0 && (
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                    -{discount}฿
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <TrendingUp className="w-3 h-3" />
                <span>{reason}</span>
              </div>
              <p className="text-sm font-bold text-brand-600 mt-0.5">
                {discount > 0 ? (
                  <>
                    <span className="text-gray-400 line-through text-xs mr-1">
                      {formatPrice(item.price)}
                    </span>
                    {formatPrice(item.price - discount)}
                  </>
                ) : (
                  formatPrice(item.price)
                )}
              </p>
            </div>
            <button
              onClick={() => handleAdd(item)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center',
                'bg-purple-500 text-white shadow-md',
                'active:scale-90 transition-transform'
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
