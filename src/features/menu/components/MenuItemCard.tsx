import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, Star, Check, Flame, Minus } from 'lucide-react'
import type { MenuItem } from '@/types'
import { useMenuStore, useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { hapticAddToCart, hapticLight, hapticMedium } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { MenuItemModal } from './MenuItemModal'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const { addViewedItem, toggleFavorite, isFavorite } = useMenuStore()
  const { addItem, updateQuantity, items: cartItems } = useCartStore()
  const { addToast } = useUIStore()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Count how many of this item are in the cart
  const cartItem = cartItems.find(ci => ci.menuItem.id === item.id)
  const cartQty = cartItem?.quantity ?? 0

  const handleQuickAdd = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (isAdding || justAdded) return
    hapticAddToCart()
    setIsAdding(true); setJustAdded(true)
    addItem(item, 1, [])
    addToast({ type: 'cart-add', title: 'เพิ่มลงตะกร้าแล้ว!', message: item.name, imageUrl: item.imageUrl })
    setTimeout(() => setIsAdding(false), 300)
    setTimeout(() => setJustAdded(false), 1800)
  }, [addItem, addToast, isAdding, justAdded, item])

  const handleDecrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!cartItem) return
    hapticLight()
    if (cartQty <= 1) {
      useCartStore.getState().removeItem(cartItem.id)
    } else {
      updateQuantity(cartItem.id, cartQty - 1)
    }
  }, [cartItem, cartQty, updateQuantity])

  const handleIncrement = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    if (!cartItem) return
    hapticMedium()
    updateQuantity(cartItem.id, cartQty + 1)
  }, [cartItem, cartQty, updateQuantity])

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
  const isHot = item.isRecommended && item.spiceLevels && item.spiceLevels.length > 0

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -4, transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] } }}
        whileTap={{ scale: 0.97 }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        aria-label={`ดูรายละเอียด ${item.name}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick() } }}
        className={cn(
          'group relative overflow-hidden rounded-[22px] cursor-pointer select-none touch-manipulation',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-1',
          !item.isAvailable && 'opacity-50'
        )}
        style={{
          background: 'var(--bg-card)',
          border: cartQty > 0
            ? '1.5px solid rgba(255,85,0,0.45)'
            : '1px solid var(--border-subtle)',
          boxShadow: cartQty > 0
            ? '0 6px 24px rgba(255,85,0,0.15), 0 0 0 1px rgba(255,85,0,0.2)'
            : '0 2px 14px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Hover border glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-[22px]"
          style={{ boxShadow: 'inset 0 0 0 1.5px rgba(255,85,0,0.30)' }}
        />

        {/* Cart quantity badge — top left badge */}
        <AnimatePresence>
          {cartQty > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
              className="absolute top-0 left-0 z-30"
            >
              <div
                className="text-white text-[9px] font-black px-2 py-[3px] rounded-br-[12px] rounded-tl-[21px]"
                style={{
                  background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                  boxShadow: '0 3px 12px rgba(255,58,0,0.55)',
                }}
              >
                ×{cartQty} ในตะกร้า
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Area */}
        <div className="relative overflow-hidden" style={{ paddingBottom: '78%' }}>
          {/* Skeleton shimmer */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton" />
          )}

          <img
            src={imageError ? getValidImageUrl(null) : getValidImageUrl(item.imageUrl)}
            alt={item.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-500 will-change-transform',
              imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
              'group-hover:scale-[1.06]'
            )}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
          {/* Top fade for badges */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

          {/* Badges row */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            {item.isRecommended && !isHot && (
              <motion.span
                initial={{ opacity: 0, x: -8, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.12 }}
                className="inline-flex items-center gap-1 text-white text-[9px] font-black px-2 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #FF5E00, #FF9500)',
                  boxShadow: '0 4px 12px rgba(255,94,0,0.55)',
                }}
              >
                <Star className="w-2.5 h-2.5 fill-white" />
                แนะนำ
              </motion.span>
            )}

            {isHot && (
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-1 text-white text-[9px] font-black px-2 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                  boxShadow: '0 4px 10px rgba(220,38,38,0.5)',
                }}
              >
                <Flame className="w-2.5 h-2.5" />
                HOT
              </motion.span>
            )}
          </div>

          {/* Favorite button */}
          <motion.button
            type="button"
            onClick={handleToggleFavorite}
            whileTap={{ scale: 0.72 }}
            whileHover={{ scale: 1.12 }}
            aria-label={isFav ? `เอาออกจากโปรด` : `เพิ่มเป็นโปรด`}
            aria-pressed={isFav}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            style={{
              background: isFav ? 'rgba(254,202,202,0.15)' : 'rgba(0,0,0,0.55)',
              border: isFav ? '1px solid rgba(252,165,165,0.35)' : '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(10px)',
              pointerEvents: 'auto',
            }}
          >
            <Heart
              aria-hidden
              className={cn(
                'w-3.5 h-3.5 transition-all duration-300',
                isFav ? 'fill-red-400 text-red-400 scale-110' : 'text-white/75'
              )}
            />
          </motion.button>

          {/* Spice dots */}
          {item.spiceLevels && item.spiceLevels.length > 0 && !isHot && (
            <div className="absolute bottom-2 left-2.5 flex gap-0.5">
              {[...Array(Math.min(item.spiceLevels.length, 3))].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: `rgba(239,68,68,${0.4 + i * 0.2})` }}
                />
              ))}
            </div>
          )}

          {/* Sold out overlay */}
          {!item.isAvailable && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(3px)' }}
            >
              <span
                className="text-white font-black text-sm px-5 py-2 rounded-full -rotate-6"
                style={{
                  background: 'rgba(0,0,0,0.85)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 pt-2.5">
          <h3
            className="font-black text-[14px] line-clamp-1 leading-snug mb-0.5 transition-colors duration-200 group-hover:text-orange-400"
            style={{ color: 'var(--text-primary)' }}
          >
            {item.name}
          </h3>
          <p
            className="text-[11px] line-clamp-1 mb-2.5 font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            {item.description || item.category}
          </p>

          {/* Price + Action Row */}
          <div
            className="flex items-center justify-between pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex flex-col">
              <span className="font-black text-[16px] text-gradient-fire num-display">
                {formatPrice(item.price)}
              </span>
            </div>

            {item.isAvailable && (
              <AnimatePresence mode="wait">
                {/* Show stepper when in cart, otherwise show add button */}
                {cartQty > 0 && !justAdded ? (
                  <motion.div
                    key="stepper"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.8 }}
                      onClick={handleDecrement}
                      aria-label="ลดจำนวน"
                      className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-soft)',
                      }}
                    >
                      <Minus className="w-3 h-3 text-gray-400" />
                    </motion.button>

                    <span className="font-black text-[13px] num-display min-w-[16px] text-center" style={{ color: 'var(--text-primary)' }}>
                      {cartQty}
                    </span>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.8 }}
                      onClick={handleIncrement}
                      aria-label="เพิ่มจำนวน"
                      className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                        boxShadow: '0 3px 10px rgba(255,58,0,0.45)',
                      }}
                    >
                      <Plus className="w-3 h-3 text-white" />
                    </motion.button>
                  </motion.div>
                ) : justAdded ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 18 }}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                      boxShadow: '0 4px 16px rgba(34,197,94,0.55)',
                    }}
                  >
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.button
                    key="add"
                    type="button"
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.82 }}
                    onClick={handleQuickAdd}
                    disabled={isAdding}
                    aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                    className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                      boxShadow: '0 4px 16px rgba(255,58,0,0.55)',
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
