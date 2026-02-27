import { useMemo } from 'react'
import type { MenuItem } from '@/types'
import { motion } from 'framer-motion'
import { Sparkles, Plus, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/features/cart/store/cartStore'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { formatPrice } from '@/utils/formatPrice'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { hapticLight, hapticMedium } from '@/utils/haptics'

export function SmartUpsell() {
    const { items, addItem } = useCartStore()
    const { data: menuItems, isLoading } = useMenuItems()

    // Logic to suggest items:
    // 1. Not already in cart
    // 2. Is available
    // 3. Prioritize 'others' (drinks/sides) or 'recommended'
    const recommendations = useMemo(() => {
        if (!menuItems || menuItems.length === 0) return []

        const cartItemIds = new Set(items.map((i) => i.menuItem.id))

        return menuItems
            .filter((item) => !cartItemIds.has(item.id) && item.isAvailable)
            .sort((a, b) => {
                // Boost 'others' category (usually drinks/sides that people forget)
                if (a.category === 'others' && b.category !== 'others') return -1
                if (a.category !== 'others' && b.category === 'others') return 1

                // Boost recommended items
                if (a.isRecommended && !b.isRecommended) return -1
                if (!a.isRecommended && b.isRecommended) return 1

                return 0
            })
            .slice(0, 3)
    }, [menuItems, items])

    const handleAddItem = (item: MenuItem) => {
        hapticMedium()
        addItem(item, 1, [])
    }

    if (isLoading || recommendations.length === 0) return null

    return (
        <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    รับอะไรเพิ่มไหมคะ?
                </h3>
                <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Smart Suggest
                </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {recommendations.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-[240px]"
                    >
                        <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden group">
                            {/* Background Accent */}
                            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500" />

                            <div className="flex gap-3 relative z-10">
                                <div className="relative">
                                    <img
                                        src={getValidImageUrl(item.imageUrl)}
                                        alt={item.name}
                                        className="w-16 h-16 rounded-xl object-cover bg-gray-50 border border-gray-50 shadow-sm"
                                    />
                                    {item.isRecommended && (
                                        <div className="absolute -top-1 -left-1 bg-amber-400 text-white p-0.5 rounded-md shadow-sm">
                                            <Sparkles className="w-3 h-3" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800 truncate leading-tight">
                                            {item.name}
                                        </h4>
                                        <p className="text-xs text-brand-600 font-black mt-0.5">
                                            {formatPrice(item.price)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleAddItem(item)}
                                        className="mt-2 flex items-center justify-center gap-1 bg-brand-500 text-white text-[11px] font-bold py-1.5 px-3 rounded-lg shadow-sm shadow-brand-200 active:scale-90 transition-transform"
                                    >
                                        <Plus className="w-3 h-3" strokeWidth={3} />
                                        เพิ่มเลย
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* "View More" placeholder/card */}
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: recommendations.length * 0.1 }}
                    onClick={() => hapticLight()}
                    className="flex-shrink-0 w-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-100 transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold">ดูทั้งหมด</span>
                </motion.button>
            </div>
        </div>
    )
}
