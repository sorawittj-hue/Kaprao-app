import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, Star, Check } from 'lucide-react'
import type { MenuItem } from '@/types'
import { useMenuStore, useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { hapticAddToCart, hapticLight } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { MenuItemModal } from './MenuItemModal'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addViewedItem, toggleFavorite, isFavorite } = useMenuStore()
  const { addItem } = useCartStore()
  const { addToast } = useUIStore()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isAdding || justAdded) return
    hapticAddToCart()
    setIsAdding(true); setJustAdded(true)
    addItem(item, 1, [])
    addToast({ type: 'cart-add', title: 'เพิ่มลงตะกร้าแล้ว! 🛒', message: item.name, imageUrl: item.imageUrl })
    setTimeout(() => setIsAdding(false), 300)
    setTimeout(() => setJustAdded(false), 1800)
  }, [addItem, addToast, isAdding, justAdded, item])

  const handleCardClick = useCallback(() => {
    addViewedItem(item.id)
    setIsModalOpen(true)
  }, [addViewedItem, item.id])

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    toggleFavorite(item.id)
    hapticLight()
  }, [toggleFavorite, item.id])

  const isFav = isFavorite(item.id)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -6,
          transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
        }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`ดูรายละเอียด ${item.name}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() } }}
        className={cn(
          'group relative overflow-hidden rounded-[20px] cursor-pointer select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
          !item.isAvailable && 'opacity-50'
        )}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[20px]"
          style={{ boxShadow: 'inset 0 0 0 1px rgba(255,94,0,0.15)' }}
        />

        {/* Image */}
        <div className="relative overflow-hidden" style={{ paddingBottom: '78%' }}>
          {!imageLoaded && <div className="absolute inset-0 skeleton" />}

          <img
            src={getValidImageUrl(item.imageUrl)}
            alt={item.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-500 will-change-transform',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              'group-hover:scale-[1.07]'
            )}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageLoaded(true)
              const t = e.target as HTMLImageElement
              const fallback = getValidImageUrl(null)
              if (t.src !== new URL(fallback, window.location.href).href) t.src = fallback
            }}
          />

          {/* Gradient overlay — stronger for dark bg */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          {/* Recommended badge */}
          {item.isRecommended && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-2.5 left-2.5"
            >
              <span
                className="inline-flex items-center gap-1 text-white text-[9px] font-black px-2 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #FF5E00, #FF9500)',
                  boxShadow: '0 4px 12px rgba(255,94,0,0.5)'
                }}
              >
                <Star className="w-2.5 h-2.5 fill-white" />
                แนะนำ
              </span>
            </motion.div>
          )}

          {/* Favorite */}
          <motion.button
            type="button"
            onClick={handleToggleFavorite}
            whileTap={{ scale: 0.72 }}
            whileHover={{ scale: 1.12 }}
            aria-label={isFav ? `เอาออกจากโปรด` : `เพิ่มเป็นโปรด`}
            aria-pressed={isFav}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            style={{
              background: isFav ? 'rgba(254,202,202,0.15)' : 'rgba(0,0,0,0.45)',
              border: isFav ? '1px solid rgba(252,165,165,0.3)' : '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              pointerEvents: 'auto',
            }}
          >
            <Heart
              aria-hidden
              className={cn(
                'w-3.5 h-3.5 transition-all duration-300',
                isFav ? 'fill-red-400 text-red-400 scale-110' : 'text-white/70'
              )}
            />
          </motion.button>

          {/* Spicy indicator */}
          {item.spiceLevels && item.spiceLevels.length > 0 && (
            <div className="absolute bottom-2 left-2.5 flex gap-0.5">
              {[...Array(Math.min(item.spiceLevels.length, 3))].map((_, i) => (
                <span key={i} className="text-[12px] drop-shadow">🌶️</span>
              ))}
            </div>
          )}

          {/* Sold out */}
          {!item.isAvailable && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            >
              <span
                className="text-white font-black text-sm px-5 py-2 rounded-full -rotate-6"
                style={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.15)' }}
              >
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 pt-2.5">
          <h3
            className="font-black text-[14px] line-clamp-1 leading-snug mb-1 transition-colors duration-200 group-hover:text-[#FF7A42]"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.name}
          </h3>
          <p className="text-[11px] line-clamp-1 mb-2.5 font-medium" style={{ color: 'var(--text-muted)' }}>
            {item.description || item.category}
          </p>

          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <span
              className="font-black text-[16px] text-gradient-fire"
            >
              {formatPrice(item.price)}
            </span>

            {item.isAvailable && (
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 4px 14px rgba(34,197,94,0.5)' }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    type="button"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.14 }}
                    whileTap={{ scale: 0.84 }}
                    onClick={handleQuickAdd}
                    disabled={isAdding}
                    aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                    className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                    style={{
                      background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                      boxShadow: '0 4px 14px rgba(255,58,0,0.5)',
                      pointerEvents: 'auto',
                    }}
                  >
                    <Plus className="w-4 h-4 text-white" strokeWidth={3} aria-hidden />
                  </motion.button>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </motion.div>

      {isModalOpen && (
        <MenuItemModal item={item} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}
