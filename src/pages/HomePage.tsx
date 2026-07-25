import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { searchEngine } from '@/features/ai/hooks/useSmartSearch'
import { useMenuStore, useAuthStore, useCartStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { MenuGridSkeleton } from '@/components/ui/Skeleton'
import { staggerContainer } from '@/animations/variants'
import { useTextScramble } from '@/hooks/useAdvancedAnimations'
import { trackPageView } from '@/lib/analytics'
import { useSEO } from '@/hooks/useSEO'
import { hapticMedium, hapticHeavy } from '@/utils/haptics'
import { cn } from '@/utils/cn'

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
import { BentoGridShowcase } from '@/components/ui/BentoGridShowcase'

// Import games
import {
  WheelOfFortune,
  FoodRandomizer,
  VoiceOrder,
  QuickOrderModal,
  useWheelOfFortune
} from '@/features/games'
import type { MenuItem } from '@/types'

// Animation Variants
const slideUpItem = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 28 }
  }
}

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
    window.scrollTo(0, 0)
  }, [])

  useSEO({
    title: 'สั่งกะเพรา 52',
    description: 'กะเพรา 52 - เมนูอาหารไทยรสจัดจ้าน สั่งง่าย ส่งไว ถึงบ้านคุณ'
  })

  const favorites = useMenuStore(s => s.favorites)
  const filteredItems = menuItems ? (searchQuery ? searchEngine.search(menuItems, searchQuery).map(r => r.item) : menuItems.filter((item) => {
    if (activeCategory === 'favorites') return favorites.includes(item.id)
    return item.category === activeCategory
  })) : []

  const handleWheelWin = (code: string, value: number) => useCartStore.getState().applyCoupon(code, value)
  const handleRandomizerSelect = (item: MenuItem) => setSelectedItem(item)
  
  const handleVoiceSelect = (item: MenuItem, options: { egg?: string; spicy?: string }) => {
    const selectedOptions = []
    if (options.egg) selectedOptions.push({ optionId: `egg-${options.egg}`, name: options.egg, price: options.egg === 'ไข่ดาว' ? 10 : options.egg === 'ไข่เจียว' ? 15 : 0 })
    if (options.spicy) selectedOptions.push({ optionId: `spicy-${options.spicy}`, name: `ความเผ็ด: ${options.spicy}`, price: 0 })
    addItem(item, 1, selectedOptions)
  }

  const handleQuickReorder = (order: { items: { name: string; quantity: number; price: number; menuItemId?: number }[] }) => {
    order.items.forEach(orderItem => {
      const menuItem = menuItems?.find(m => (orderItem.menuItemId && m.id === orderItem.menuItemId) || m.name === orderItem.name)
      if (menuItem) addItem(menuItem, orderItem.quantity, [])
    })
  }

  const scrambledTitle = useTextScramble('KAPRAO', true)

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--page-bg)' }}>

      {/* Premium ambient orbs */}
      <div className="fixed top-0 inset-x-0 pointer-events-none z-0 overflow-hidden" style={{ height: '50vh' }}>
        <div
          className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full opacity-20 blur-[80px]"
          style={{ background: 'radial-gradient(circle, #FF7A00 0%, #FF5E00 40%, transparent 70%)' }}
        />
        <div
          className="absolute -top-10 -left-16 w-[280px] h-[280px] rounded-full opacity-10 blur-[60px]"
          style={{ background: 'radial-gradient(circle, #FFB347 0%, transparent 70%)' }}
        />
      </div>

      {/* PREMIUM Sticky Header */}
      <header className="sticky top-0 z-[60] safe-area-pt">
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(253, 248, 244, 0.82)',
            backdropFilter: 'blur(32px) saturate(220%)',
            WebkitBackdropFilter: 'blur(32px) saturate(220%)',
            borderBottom: '1px solid rgba(255, 120, 30, 0.08)',
            boxShadow: '0 1px 0 rgba(255,120,30,0.06), 0 8px 32px -8px rgba(0,0,0,0.06)'
          }}
        />
        <Container size="full" className="py-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={() => hapticMedium()} className="relative cursor-pointer group">
                {/* Logo glow */}
                <div
                  className="absolute inset-0 rounded-[18px] blur-md opacity-0 group-hover:opacity-60 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, #FF5E00, #FF8C42)' }}
                />
                <div
                  className="relative w-[48px] h-[48px] rounded-[18px] flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(145deg, #FF6B14 0%, #E84400 60%, #C73800 100%)',
                    boxShadow: '0 8px 20px -5px rgba(255, 80, 0, 0.5), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.2)'
                  }}
                >
                  <span className="text-white font-black text-[24px] tracking-tighter" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>K</span>
                </div>
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 border-white"
                  style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 2px 8px rgba(34,197,94,0.4)' }}
                >
                  <span className="text-[10px]">🌶️</span>
                </div>
              </motion.div>

              <div className="flex flex-col gap-0.5">
                <h1 className="font-black text-[18px] tracking-tight leading-none flex items-center gap-0.5">
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)' }}
                  >
                    {scrambledTitle}
                  </span>
                  <span
                    className="bg-clip-text text-transparent ml-0.5"
                    style={{ backgroundImage: 'linear-gradient(135deg, #FF5E00, #FF9500)' }}
                  >
                    52
                  </span>
                </h1>
                <GreetingPill displayName={user?.displayName} isGuest={isGuest} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SearchBar />
              {(!isGuest && user) && <NotificationBell />}
            </div>
          </div>
        </Container>
      </header>

      {/* Guest Banner */}
      <AnimatePresence>
        {isGuest && (
          <Container className="relative z-10 pt-4">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
              <div
                className="rounded-[22px] p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,247,237,0.95) 100%)',
                  border: '1px solid rgba(255, 120, 30, 0.12)',
                  boxShadow: '0 4px 24px -6px rgba(255,94,0,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                {/* Decorative stripe */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[22px]"
                  style={{ background: 'linear-gradient(180deg, #FF5E00, #FF9500)' }}
                />
                <div className="flex items-center justify-between pl-2">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-[14px] leading-tight mb-1 flex items-center gap-1.5">
                      <span>🎁</span>
                      เข้าสู่ระบบเพื่อรับสิทธิพิเศษ
                    </p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                      รับพอยต์ทุกออเดอร์ • ลุ้นกินฟรีทุกงวด
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    aria-label="เข้าสู่ระบบด้วย LINE"
                    onClick={async () => {
                      hapticHeavy()
                      try {
                        const { loginWithLine } = await import('@/lib/auth')
                        await loginWithLine()
                      } catch (e) { console.error('Login failed', e) }
                    }}
                    whileTap={{ scale: 0.93 }}
                    className="flex-shrink-0 text-white font-black text-xs px-5 py-2.5 rounded-full flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B900] focus-visible:ring-offset-2"
                    style={{
                      background: 'linear-gradient(135deg, #00C900, #00A800)',
                      boxShadow: '0 6px 18px -4px rgba(0,185,0,0.45)'
                    }}
                  >
                    LINE Login
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </Container>
        )}
      </AnimatePresence>

      <Container size="full" className="py-2 relative z-10">
        <ShopClosedBanner />
      </Container>

      <Container size="full" className="relative z-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-7">

          {/* Hero Slider */}
          <motion.div variants={slideUpItem} className={cn("", isGuest ? "" : "pt-4")}>
            <HeroSlider />
          </motion.div>

          {/* Bento Feature Grid */}
          <motion.div variants={slideUpItem}>
            <BentoGridShowcase
              spinsLeft={spinsLeft}
              onOpenWheel={() => setShowWheel(true)}
              onOpenRandomizer={() => setShowRandomizer(true)}
              onOpenVoice={() => setShowVoice(true)}
              onOpenQuickOrder={() => setShowQuickOrder(true)}
            />
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={slideUpItem}>
            <StatsRow />
          </motion.div>

          {/* AI Magic */}
          {user && (
            <motion.div variants={slideUpItem}>
              <AIRecommendations />
            </motion.div>
          )}

          {/* Recommended */}
          <motion.div variants={slideUpItem}>
            <RecommendedSection />
          </motion.div>

          {/* Menu Section Header */}
          <motion.div variants={slideUpItem} className="pt-1">
            <div className="flex items-end justify-between mb-4 px-1">
              <div>
                <p className="section-label mb-1.5">Our Menu</p>
                <h2 className="section-title">เมนูความอร่อย</h2>
              </div>
              <div
                className="text-xs font-black px-3 py-1.5 rounded-full"
                style={{
                  background: 'rgba(255, 94, 0, 0.08)',
                  color: '#FF5E00',
                  border: '1px solid rgba(255,94,0,0.12)'
                }}
              >
                {filteredItems?.length || 0} เมนู
              </div>
            </div>
            <CategoryTabs />
          </motion.div>

          {/* Menu Grid */}
          <motion.div variants={slideUpItem} className="min-h-[400px]">
            {isLoading ? <MenuGridSkeleton count={6} /> : <MenuGrid items={filteredItems || []} />}
          </motion.div>

          {/* Footer */}
          <motion.div variants={slideUpItem} className="text-center py-10 pb-20">
            <div className="inline-flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,94,0,0.08), rgba(255,150,50,0.06))',
                  border: '1px solid rgba(255,94,0,0.1)'
                }}
              >
                👨‍🍳
              </div>
              <div>
                <h3 className="font-black text-gray-800 tracking-tight">ทำด้วยความตั้งใจ</h3>
                <p className="section-label mt-1">KAPRAO52 EST. 2024</p>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </Container>

      <FloatingCart />

      <WheelOfFortune isOpen={showWheel} onClose={() => setShowWheel(false)} onWin={handleWheelWin} />
      <FoodRandomizer isOpen={showRandomizer} onClose={() => setShowRandomizer(false)} onSelect={handleRandomizerSelect} />
      <VoiceOrder isOpen={showVoice} onClose={() => setShowVoice(false)} onSelect={handleVoiceSelect} />
      <QuickOrderModal isOpen={showQuickOrder} onClose={() => setShowQuickOrder(false)} onReorder={handleQuickReorder} />

      {selectedItem && <MenuItemModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} />}
    </div>
  )
}

function GreetingPill({ displayName, isGuest }: { displayName?: string, isGuest?: boolean }) {
  const [greeting, setGreeting] = useState('สวัสดี')
  const [icon, setIcon] = useState('👋')
  const [style, setStyle] = useState({
    bg: 'rgba(243, 244, 246, 0.7)',
    border: 'rgba(229, 231, 235, 0.6)',
    text: '#6B7280'
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) {
      setGreeting('อรุณสวัสดิ์'); setIcon('☀️')
      setStyle({ bg: 'rgba(254, 243, 199, 0.7)', border: 'rgba(253, 211, 77, 0.4)', text: '#B45309' })
    } else if (hour >= 11 && hour < 14) {
      setGreeting('สวัสดีตอนเที่ยง'); setIcon('🍽️')
      setStyle({ bg: 'rgba(255, 237, 213, 0.7)', border: 'rgba(253, 186, 116, 0.4)', text: '#C2410C' })
    } else if (hour >= 14 && hour < 17) {
      setGreeting('สวัสดีตอนบ่าย'); setIcon('☕')
      setStyle({ bg: 'rgba(219, 234, 254, 0.7)', border: 'rgba(147, 197, 253, 0.4)', text: '#1D4ED8' })
    } else if (hour >= 17 && hour < 21) {
      setGreeting('สวัสดีตอนเย็น'); setIcon('🌅')
      setStyle({ bg: 'rgba(255, 237, 213, 0.7)', border: 'rgba(253, 186, 116, 0.4)', text: '#C2410C' })
    } else {
      setGreeting('ราตรีสวัสดิ์'); setIcon('🌙')
      setStyle({ bg: 'rgba(224, 231, 255, 0.7)', border: 'rgba(165, 180, 252, 0.4)', text: '#4338CA' })
    }
  }, [])

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[9px] font-black uppercase tracking-wider transition-all duration-300"
      style={{
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        backdropFilter: 'blur(8px)'
      }}
    >
      <span className="text-[11px]">{icon}</span>
      <span className="opacity-90">{greeting}, {isGuest ? 'GUEST' : displayName}</span>
    </div>
  )
}
