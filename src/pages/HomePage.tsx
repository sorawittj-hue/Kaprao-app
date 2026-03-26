import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { searchEngine } from '@/features/ai/hooks/useSmartSearch'
import { useMenuStore, useAuthStore, useCartStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { MenuGridSkeleton } from '@/components/ui/Skeleton'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { useTextScramble, useMagneticButton } from '@/hooks/useAdvancedAnimations'
import { trackPageView } from '@/lib/analytics'
import { Gift, Shuffle, Mic, History } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'

// Import feature components
import { HeroSlider } from '@/features/menu/components/HeroSlider'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { MenuGrid } from '@/features/menu/components/MenuGrid'
import { RecommendedSection } from '@/features/menu/components/RecommendedSection'
import { SearchBar } from '@/features/menu/components/SearchBar'
import { StatsRow } from '@/features/menu/components/StatsRow'
import { AIRecommendations } from '@/features/menu/components/AIRecommendations'
import { FloatingCart } from '@/features/cart/components/FloatingCart'
import { MenuItemModal } from '@/features/menu/components/MenuItemModal'
import { ShopClosedBanner } from '@/features/config/components/ShopClosedBanner'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

// Import games
import {
  WheelOfFortune,
  FoodRandomizer,
  VoiceOrder,
  QuickOrderModal,
  useWheelOfFortune
} from '@/features/games'
import type { MenuItem } from '@/types'

export default function HomePage() {
  const { data: menuItems, isLoading } = useMenuItems()
  const { activeCategory, searchQuery } = useMenuStore()
  const { user, isGuest } = useAuthStore()
  const { addItem } = useCartStore()
  const { spinsLeft } = useWheelOfFortune()

  // Modal states
  const [showWheel, setShowWheel] = useState(false)
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    trackPageView('/', 'Home')
  }, [])

  useSEO({
    title: 'สั่งกะเพราออนไลน์',
    description: 'กะเพรา 52 - เมนูอาหารไทยรสจัดจ้าน สั่งง่าย ส่งไว ถึงบ้านคุณ'
  })

  // Filter items based on category and search
  const favorites = useMenuStore(s => s.favorites)
  const filteredItems = menuItems ? (searchQuery ? searchEngine.search(menuItems, searchQuery).map(r => r.item) : menuItems.filter((item) => {
    if (activeCategory === 'favorites') {
      return favorites.includes(item.id)
    }
    return item.category === activeCategory
  })) : []

  // Handle wheel win - apply coupon
  const handleWheelWin = (code: string, value: number) => {
    useCartStore.getState().applyCoupon(code, value)
  }

  // Handle randomizer select
  const handleRandomizerSelect = (item: MenuItem) => {
    setSelectedItem(item)
  }

  // Handle voice order select
  const handleVoiceSelect = (item: MenuItem, options: { egg?: string; spicy?: string }) => {
    const selectedOptions = []
    if (options.egg) {
      selectedOptions.push({
        optionId: `egg-${options.egg}`,
        name: options.egg,
        price: options.egg === 'ไข่ดาว' ? 10 : options.egg === 'ไข่เจียว' ? 15 : 0
      })
    }
    if (options.spicy) {
      selectedOptions.push({
        optionId: `spicy-${options.spicy}`,
        name: `ความเผ็ด: ${options.spicy}`,
        price: 0
      })
    }
    addItem(item, 1, selectedOptions)
  }

  // Handle quick reorder — match by ID for reliability
  const handleQuickReorder = (order: { items: { name: string; quantity: number; price: number; menuItemId?: number }[] }) => {
    order.items.forEach(orderItem => {
      const menuItem = menuItems?.find(m => 
        (orderItem.menuItemId && m.id === orderItem.menuItemId) || m.name === orderItem.name
      )
      if (menuItem) {
        addItem(menuItem, orderItem.quantity, [])
      }
    })
  }

  const scrambledTitle = useTextScramble('KAPRAO', true)

  return (
    <div className="min-h-screen pb-24 bg-surface">
      {/* Header */}
      <header
        className="sticky top-0 z-30 safe-area-pt"
        style={{
          background: 'rgba(250, 250, 249, 0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 1px 12px -2px rgba(0,0,0,0.06)',
        }}
      >
        <Container size="full" className="py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated Logo Badge */}
              <motion.div
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.93 }}
                className="relative cursor-pointer"
              >
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 50%, #FFB347 100%)',
                    boxShadow: '0 4px 14px -2px rgba(255, 107, 0, 0.5)',
                  }}
                >
                  <span className="text-white font-black text-xl">K</span>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-md"
                >
                  <span className="text-[9px]">🔥</span>
                </motion.div>
              </motion.div>

              {/* Brand & Greeting */}
              <div>
                <h1 className="font-black text-[18px] tracking-tight leading-none mb-0.5">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #1C1917, #44403C)' }}
                  >
                    {scrambledTitle}
                  </span>
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #FF6B00, #FF8C42)' }}
                  >
                    52
                  </span>
                </h1>
                <GreetingPill displayName={user?.displayName} isGuest={isGuest} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SearchBar />
              {(!isGuest && user) ? <NotificationBell /> : null}
            </div>
          </div>
        </Container>
      </header>

      {/* Guest Banner — World Class */}
      <AnimatePresence>
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C42 60%, #FFB347 100%)',
              }}
            >
              {/* Animated shimmer */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                className="absolute inset-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
              />
              <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto relative">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, -8, 8, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="text-2xl"
                  >
                    ⭐
                  </motion.div>
                  <div>
                    <p className="font-black text-white text-sm leading-tight">
                      Login LINE เพื่อเริ่มสะสมแต้ม!
                    </p>
                    <p className="text-orange-100 text-[11px]">
                      ทุกออเดอร์ = พอยต์ + ตั๋วหวย + โอกาสได้อาหารฟรี
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const { loginWithLine } = await import('@/lib/auth')
                    await loginWithLine()
                  }}
                  className="flex items-center gap-1.5 bg-white font-black text-xs px-3.5 py-2 rounded-full flex-shrink-0"
                  style={{ color: '#FF6B00', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .345-.285.63-.631.63s-.63-.285-.63-.63V8.108c0-.345.283-.63.63-.63.346 0 .63.285.63.63v4.771zm-1.94-.532c0 .345-.282.63-.631.63-.345 0-.627-.285-.627-.63V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.631c-.691 0-1.25-.563-1.25-1.257V8.108c0-.345.284-.63.631-.63.345 0 .63.285.63.63v4.771c0 .173.14.315.315.315h.674c.348 0 .629.283.629.63 0 .344-.282.629-.629.629zM3.678 8.735c0-.345.285-.63.631-.63h2.505c.345 0 .627.285.627.63s-.282.63-.627.63H4.938v1.126h1.481c.346 0 .628.283.628.63 0 .344-.282.629-.628.629H4.938v1.756c0 .345-.286.63-.631.63-.346 0-.629-.285-.629-.63V8.735z" />
                  </svg>
                  Login
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Closed Banner */}
      <Container size="full" className="py-2">
        <ShopClosedBanner />
      </Container>

      <Container size="full">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          {/* Hero Slider */}
          <motion.div variants={fadeInUp}>
            <HeroSlider />
          </motion.div>

          {/* Quick Actions - Games */}
          <motion.div variants={fadeInUp}>
            <div className="grid grid-cols-4 gap-2">
              <QuickActionButton
                icon={Gift}
                label="วงล้อ"
                badge={spinsLeft > 0 ? spinsLeft.toString() : undefined}
                gradient="from-amber-500 to-orange-500"
                shadowColor="rgba(245, 158, 11, 0.4)"
                emoji="🎰"
                onClick={() => setShowWheel(true)}
              />
              <QuickActionButton
                icon={Shuffle}
                label="สุ่มเมนู"
                gradient="from-orange-500 to-red-500"
                shadowColor="rgba(239, 68, 68, 0.4)"
                emoji="🎲"
                onClick={() => setShowRandomizer(true)}
              />
              <QuickActionButton
                icon={Mic}
                label="สั่งด้วยเสียง"
                gradient="from-blue-500 to-indigo-600"
                shadowColor="rgba(99, 102, 241, 0.4)"
                emoji="🎤"
                onClick={() => setShowVoice(true)}
              />
              <QuickActionButton
                icon={History}
                label="สั่งซ้ำ"
                gradient="from-green-500 to-emerald-600"
                shadowColor="rgba(16, 185, 129, 0.4)"
                emoji="⚡"
                onClick={() => setShowQuickOrder(true)}
              />
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={fadeInUp}>
            <StatsRow />
          </motion.div>

          {/* AI Recommendations */}
          {user && (
            <motion.div variants={fadeInUp}>
              <AIRecommendations />
            </motion.div>
          )}

          {/* Recommended Section */}
          <motion.div variants={fadeInUp}>
            <RecommendedSection />
          </motion.div>

          {/* Section Header */}
          <motion.div variants={fadeInUp} className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-gray-800 text-lg">เมนูทั้งหมด</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filteredItems?.length || 0} รายการ
              </p>
            </div>
          </motion.div>

          {/* Category Tabs */}
          <motion.div variants={fadeInUp} className="-mt-2">
            <CategoryTabs />
          </motion.div>

          {/* Menu Grid */}
          <motion.div variants={fadeInUp}>
            {isLoading ? (
              <MenuGridSkeleton count={6} />
            ) : (
              <MenuGrid items={filteredItems || []} />
            )}
          </motion.div>

          {/* Footer */}
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(0,0,0,0.04)' }}>
              <span className="text-base">🌶️</span>
              <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                Kaprao52 · อร่อยทุกเมนู
              </p>
              <span className="text-base">🍽️</span>
            </div>
          </div>
        </motion.div>
      </Container>

      {/* Floating Cart */}
      <FloatingCart />

      {/* Game Modals */}
      <WheelOfFortune
        isOpen={showWheel}
        onClose={() => setShowWheel(false)}
        onWin={handleWheelWin}
      />

      <FoodRandomizer
        isOpen={showRandomizer}
        onClose={() => setShowRandomizer(false)}
        onSelect={handleRandomizerSelect}
      />

      <VoiceOrder
        isOpen={showVoice}
        onClose={() => setShowVoice(false)}
        onSelect={handleVoiceSelect}
      />

      <QuickOrderModal
        isOpen={showQuickOrder}
        onClose={() => setShowQuickOrder(false)}
        onReorder={handleQuickReorder}
      />

      {/* Menu Item Modal (for randomizer selection) */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}

// ─── Greeting Pill ────────────────────────────────────────────────────────────
interface GreetingPillProps {
  displayName?: string
  isGuest?: boolean
}

function GreetingPill({ displayName, isGuest }: GreetingPillProps) {
  const [greeting, setGreeting] = useState('สวัสดี')
  const [icon, setIcon] = useState('👋')
  const [style, setStyle] = useState({ bg: '#F3F4F6', text: '#6B7280' })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) {
      setGreeting('อรุณสวัสดิ์')
      setIcon('☀️')
      setStyle({ bg: '#FEF3C7', text: '#D97706' })
    } else if (hour >= 11 && hour < 14) {
      setGreeting('สวัสดีตอนกลางวัน')
      setIcon('🍽️')
      setStyle({ bg: '#FFEDD5', text: '#EA580C' })
    } else if (hour >= 14 && hour < 17) {
      setGreeting('สวัสดีตอนบ่าย')
      setIcon('☕')
      setStyle({ bg: '#DBEAFE', text: '#2563EB' })
    } else if (hour >= 17 && hour < 21) {
      setGreeting('สวัสดีตอนเย็น')
      setIcon('🌅')
      setStyle({ bg: '#FFF5EB', text: '#E66000' })
    } else {
      setGreeting('ราตรีสวัสดิ์')
      setIcon('🌙')
      setStyle({ bg: '#E0E7FF', text: '#4F46E5' })
    }
  }, [])

  const name = isGuest ? 'น้องสี่หัว' : (displayName || 'เพื่อน')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
      style={{ background: style.bg, color: style.text }}
    >
      <span>{icon}</span>
      <span>{greeting}, {name}</span>
    </motion.div>
  )
}

// ─── Quick Action Button ──────────────────────────────────────────────────────
interface QuickActionButtonProps {
  icon: React.ElementType
  label: string
  badge?: string
  gradient: string
  shadowColor: string
  emoji: string
  onClick: () => void
}

function QuickActionButton({ icon: Icon, label, badge, gradient, shadowColor, emoji, onClick }: QuickActionButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const magnetic = useMagneticButton(0.5)

  return (
    <motion.button
      ref={magnetic.ref as any}
      style={{ x: magnetic.x, y: magnetic.y }}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
      className="flex flex-col items-center gap-1.5 p-2"
    >
      <div className="relative">
        <motion.div
          className={`w-[58px] h-[58px] rounded-[18px] bg-gradient-to-br ${gradient} flex items-center justify-center`}
          style={{
            boxShadow: `0 8px 20px -4px ${shadowColor}`,
          }}
          animate={isPressed ? { scale: 0.9 } : { scale: 1 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

        {/* Floating emoji decoration */}
        <motion.span
          animate={{ y: [0, -4, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: Math.random() * 2 }}
          className="absolute -top-2 -right-2 text-base leading-none"
        >
          {emoji}
        </motion.span>

        {/* Badge */}
        {badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
            className="absolute -top-2 -left-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg"
          >
            {badge}
          </motion.span>
        )}
      </div>
      <span className="text-[11px] font-bold text-gray-600 text-center leading-tight">
        {label}
      </span>
    </motion.button>
  )
}
