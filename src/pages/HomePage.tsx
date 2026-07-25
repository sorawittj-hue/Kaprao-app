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
import { Flame } from 'lucide-react'

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

const slideUpItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } }
}

export default function HomePage() {
  const { data: menuItems, isLoading } = useMenuItems()
  const { activeCategory, searchQuery } = useMenuStore()
  const { user, isGuest } = useAuthStore()
  const { addItem } = useCartStore()
  const { spinsLeft } = useWheelOfFortune()

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
    title: 'กะเพรา 52 — สั่งด่วน รสจัด',
    description: 'กะเพรา 52 - เมนูไทยรสจัดจ้าน สั่งง่าย ส่งไว'
  })

  const favorites = useMenuStore(s => s.favorites)
  const filteredItems = menuItems
    ? (searchQuery
        ? searchEngine.search(menuItems, searchQuery).map(r => r.item)
        : menuItems.filter(item => {
            if (activeCategory === 'favorites') return favorites.includes(item.id)
            return item.category === activeCategory
          }))
    : []

  const handleWheelWin = (code: string, value: number) => useCartStore.getState().applyCoupon(code, value)
  const handleRandomizerSelect = (item: MenuItem) => setSelectedItem(item)

  const handleVoiceSelect = (item: MenuItem, options: { egg?: string; spicy?: string }) => {
    const selectedOptions = []
    if (options.egg) selectedOptions.push({ optionId: `egg-${options.egg}`, name: options.egg, price: options.egg === 'ไข่ดาว' ? 10 : 15 })
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
    <div className="min-h-screen pb-32 relative" style={{ background: 'var(--bg-base)' }}>

      {/* === AMBIENT GLOW ORBS === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,94,0,0.22) 0%, rgba(255,58,0,0.08) 40%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'glowPulse 5s ease-in-out infinite'
          }}
        />
        <div
          className="absolute top-1/3 -left-24 w-[280px] h-[280px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,140,66,0.12) 0%, transparent 70%)',
            filter: 'blur(50px)',
            animation: 'glowPulse 7s ease-in-out infinite 2s'
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-[200px] h-[200px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,94,0,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* === PREMIUM STICKY HEADER === */}
      <header className="sticky top-0 z-[60] safe-area-pt">
        <div
          className="absolute inset-0"
          style={{
            background: 'rgba(13,13,15,0.88)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 1px 0 rgba(255,94,0,0.08), 0 8px 32px rgba(0,0,0,0.5)'
          }}
        />
        <Container size="full" className="py-3 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.06, rotate: -3 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => hapticMedium()}
                className="relative cursor-pointer"
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-[18px] opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                    filter: 'blur(10px)',
                    transform: 'scale(1.15)',
                  }}
                />
                {/* Logo box */}
                <div
                  className="relative w-[48px] h-[48px] rounded-[18px] flex items-center justify-center noise-overlay overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #FF6B14 0%, #E84400 55%, #C03200 100%)',
                    boxShadow: '0 8px 24px rgba(255,58,0,0.5), inset 0 1px 1px rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,150,80,0.3)'
                  }}
                >
                  <span
                    className="text-white font-black text-[24px] tracking-tighter relative z-10"
                    style={{ textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}
                  >
                    K
                  </span>
                </div>
                {/* Online dot */}
                <div
                  className="absolute -bottom-1 -right-1 w-[14px] h-[14px] rounded-full border-2 flex items-center justify-center"
                  style={{
                    borderColor: 'var(--bg-base)',
                    background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                    boxShadow: '0 0 8px rgba(34,197,94,0.6)'
                  }}
                />
              </motion.div>

              <div className="flex flex-col gap-0.5">
                <h1 className="font-black text-[19px] tracking-tight leading-none flex items-center gap-1">
                  <span className="text-gradient-fire">{scrambledTitle}</span>
                  <span style={{ color: 'var(--text-primary)' }}>52</span>
                  <Flame className="w-4 h-4 ml-0.5" style={{ color: '#FF5E00' }} />
                </h1>
                <GreetingPill displayName={user?.displayName} isGuest={isGuest} />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <SearchBar />
              {(!isGuest && user) && <NotificationBell />}
            </div>
          </div>
        </Container>
      </header>

      {/* === GUEST BANNER === */}
      <AnimatePresence>
        {isGuest && (
          <Container className="relative z-10 pt-4">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12, height: 0 }}
            >
              <div
                className="rounded-[20px] p-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,94,0,0.12) 0%, rgba(255,58,0,0.06) 100%)',
                  border: '1px solid rgba(255,94,0,0.2)',
                  boxShadow: '0 4px 20px rgba(255,94,0,0.1)'
                }}
              >
                {/* Left accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[20px]"
                  style={{ background: 'linear-gradient(180deg, #FF5E00, #FF3A00)' }}
                />
                <div className="flex items-center justify-between pl-3">
                  <div className="flex-1">
                    <p
                      className="font-black text-[14px] mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      🎁 เข้าสู่ระบบเพื่อรับสิทธิพิเศษ
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      รับพอยต์ทุกออเดอร์ • ลุ้นกินฟรีทุกงวด
                    </p>
                  </div>
                  <motion.button
                    type="button"
                    aria-label="เข้าสู่ระบบด้วย LINE"
                    whileTap={{ scale: 0.92 }}
                    onClick={async () => {
                      hapticHeavy()
                      try {
                        const { loginWithLine } = await import('@/lib/auth')
                        await loginWithLine()
                      } catch (e) { console.error(e) }
                    }}
                    className="flex-shrink-0 text-white font-black text-[12px] px-5 py-2.5 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, #00C21A, #009A15)',
                      boxShadow: '0 6px 20px rgba(0,194,26,0.4)'
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

      {/* === SHOP CLOSED === */}
      <Container size="full" className="py-2 relative z-10">
        <ShopClosedBanner />
      </Container>

      {/* === MAIN CONTENT === */}
      <Container size="full" className="relative z-10">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-7">

          {/* Hero */}
          <motion.div variants={slideUpItem} className={cn(isGuest ? '' : 'pt-4')}>
            <HeroSlider />
          </motion.div>

          {/* Bento Features */}
          <motion.div variants={slideUpItem}>
            <BentoGridShowcase
              spinsLeft={spinsLeft}
              onOpenWheel={() => setShowWheel(true)}
              onOpenRandomizer={() => setShowRandomizer(true)}
              onOpenVoice={() => setShowVoice(true)}
              onOpenQuickOrder={() => setShowQuickOrder(true)}
            />
          </motion.div>

          {/* Stats */}
          <motion.div variants={slideUpItem}>
            <StatsRow />
          </motion.div>

          {/* AI */}
          {user && (
            <motion.div variants={slideUpItem}>
              <AIRecommendations />
            </motion.div>
          )}

          {/* Recommended */}
          <motion.div variants={slideUpItem}>
            <RecommendedSection />
          </motion.div>

          {/* Menu section */}
          <motion.div variants={slideUpItem} className="pt-1">
            <div className="flex items-end justify-between mb-4 px-1">
              <div>
                <p className="section-label mb-1">OUR MENU</p>
                <h2 className="section-title">เมนูความอร่อย</h2>
              </div>
              <span
                className="text-[11px] font-black px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--brand-bg)',
                  color: 'var(--brand)',
                  border: '1px solid var(--brand-border)'
                }}
              >
                {filteredItems?.length || 0} เมนู
              </span>
            </div>
            <CategoryTabs />
          </motion.div>

          {/* Grid */}
          <motion.div variants={slideUpItem} className="min-h-[400px]">
            {isLoading ? <MenuGridSkeleton count={6} /> : <MenuGrid items={filteredItems || []} />}
          </motion.div>

          {/* Footer */}
          <motion.div variants={slideUpItem} className="text-center py-10 pb-20">
            <div className="inline-flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                👨‍🍳
              </div>
              <div>
                <h3 className="font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>ทำด้วยความตั้งใจ</h3>
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

function GreetingPill({ displayName, isGuest }: { displayName?: string; isGuest?: boolean }) {
  const [greeting, setGreeting] = useState('สวัสดี')
  const [icon, setIcon] = useState('👋')

  useEffect(() => {
    const h = new Date().getHours()
    if (h >= 5 && h < 11)       { setGreeting('อรุณสวัสดิ์'); setIcon('☀️') }
    else if (h >= 11 && h < 14) { setGreeting('เที่ยงแล้ว'); setIcon('🍽️') }
    else if (h >= 14 && h < 17) { setGreeting('บ่ายสวัสดิ์'); setIcon('☕') }
    else if (h >= 17 && h < 21) { setGreeting('เย็นนี้กินอะไร?'); setIcon('🌅') }
    else                        { setGreeting('ราตรีสวัสดิ์'); setIcon('🌙') }
  }, [])

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[9px] font-black uppercase tracking-wider"
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: 'var(--text-muted)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="text-[11px]">{icon}</span>
      <span>{greeting}, {isGuest ? 'GUEST' : displayName}</span>
    </div>
  )
}
