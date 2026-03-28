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
import { Gift, Shuffle, Mic, History } from 'lucide-react'
import { useSEO } from '@/hooks/useSEO'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
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
const slideUpItem = { hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } } }

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
    <div className="min-h-screen pb-32 bg-[#F4F4F5]">
      
      {/* Immersive Header Backdrop - Elegant & Subtle */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-orange-50/80 via-white/50 to-transparent pointer-events-none z-0" />

      {/* Modern Sticky Header */}
      <header className="sticky top-0 z-[60] safe-area-pt">
        <div className="absolute inset-0 bg-white/70 backdrop-blur-2xl border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.05)]" />
        <Container size="full" className="py-2.5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => hapticMedium()} className="relative cursor-pointer group">
                <div className="w-[46px] h-[46px] rounded-[16px] flex items-center justify-center bg-gradient-to-br from-[#FF8800] to-[#E65000] shadow-[0_8px_16px_-6px_rgba(255,107,0,0.4)] border-2 border-white ring-1 ring-black/5">
                  <span className="text-white font-black text-[22px] tracking-tighter drop-shadow-sm">K</span>
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-[22px] h-[22px] bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                   <span className="text-[10px] drop-shadow-sm">🌶️</span>
                </div>
              </motion.div>
              <div className="flex flex-col gap-0.5">
                <h1 className="font-black text-lg tracking-tight leading-none flex items-center gap-0.5">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-700">{scrambledTitle}</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-[#FF6B00] to-orange-500 drop-shadow-sm ml-0.5">52</span>
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
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20, height: 0 }}>
              <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[24px] p-5 relative overflow-hidden shadow-sm">
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <p className="font-black text-gray-900 text-[15px] leading-tight flex items-center gap-1.5 mb-1">
                      เข้าสู่ระบบเพื่อสิทธิพิเศษ
                    </p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      รับพอยต์ทุกออเดอร์ • ลุ้นหวยกินฟรี
                    </p>
                  </div>
                  <motion.button onClick={async () => { hapticHeavy(); try { const { loginWithLine } = await import('@/lib/auth'); await loginWithLine() } catch (e) { console.error('Login failed', e) } }} whileTap={{ scale: 0.9 }} className="bg-[#00B900] text-white font-black text-xs px-5 py-2.5 rounded-full shadow-md shadow-green-500/20 flex-shrink-0 active:scale-95 transition-transform flex items-center gap-1.5">
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
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
          
          {/* Main Hero Slider */}
          <motion.div variants={slideUpItem} className={cn("", isGuest ? "" : "pt-4")}>
            <HeroSlider />
          </motion.div>

          {/* Elegant Quick Actions */}
          <motion.div variants={slideUpItem} className="grid grid-cols-4 gap-2 px-1">
            <QuickActionButton icon={Gift} label="วงล้อ" badge={spinsLeft > 0 ? spinsLeft.toString() : undefined} bgColor="bg-amber-100 text-amber-600" onClick={() => { hapticLight(); setShowWheel(true) }} />
            <QuickActionButton icon={Shuffle} label="สุ่มเมนู" bgColor="bg-orange-100 text-orange-600" onClick={() => { hapticLight(); setShowRandomizer(true) }} />
            <QuickActionButton icon={Mic} label="สั่งด้วยเสียง" bgColor="bg-blue-100 text-blue-600" onClick={() => { hapticLight(); setShowVoice(true) }} />
            <QuickActionButton icon={History} label="สั่งซ้ำ" bgColor="bg-emerald-100 text-emerald-600" onClick={() => { hapticLight(); setShowQuickOrder(true) }} />
          </motion.div>

          {/* Stats */}
          <motion.div variants={slideUpItem}>
            <StatsRow />
          </motion.div>

          {/* AI Magic */}
          {user && (
            <motion.div variants={slideUpItem}>
              <AIRecommendations />
            </motion.div>
          )}

          <motion.div variants={slideUpItem}>
            <RecommendedSection />
          </motion.div>

          {/* Smart Category Filter */}
          <motion.div variants={slideUpItem} className="pt-2">
            <div className="flex items-end justify-between mb-4 px-2">
              <div>
                <h2 className="font-black text-gray-900 text-xl tracking-tight">เมนูความอร่อย</h2>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">ทั้งหมด {filteredItems?.length || 0} เมนู</p>
              </div>
            </div>
            <CategoryTabs />
          </motion.div>

          {/* Grid View */}
          <motion.div variants={slideUpItem} className="min-h-[400px]">
            {isLoading ? <MenuGridSkeleton count={6} /> : <MenuGrid items={filteredItems || []} />}
          </motion.div>

          {/* Beautiful Footer */}
          <motion.div variants={slideUpItem} className="text-center py-10 pb-20">
             <div className="inline-flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-200/50 rounded-full flex items-center justify-center text-xl mb-1">👨‍🍳</div>
                <h3 className="font-black text-gray-800 tracking-tight">ทำด้วยความตั้งใจ</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">KAPRAO52 EST. 2024</p>
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
    text: '#4B5563',
    shadow: '0 2px 8px -2px rgba(0,0,0,0.05)'
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 11) { 
        setGreeting('อรุณสวัสดิ์'); setIcon('☀️'); 
        setStyle({ bg: 'rgba(254, 243, 199, 0.65)', border: 'rgba(253, 230, 138, 0.5)', text: '#B45309', shadow: '0 4px 12px -3px rgba(245,158,11,0.12)' }) 
    }
    else if (hour >= 11 && hour < 14) { 
        setGreeting('สวัสดีตอนเที่ยง'); setIcon('🍽️'); 
        setStyle({ bg: 'rgba(255, 237, 213, 0.65)', border: 'rgba(253, 186, 116, 0.4)', text: '#C2410C', shadow: '0 4px 12px -3px rgba(249,115,22,0.12)' }) 
    }
    else if (hour >= 14 && hour < 17) { 
        setGreeting('สวัสดีตอนบ่าย'); setIcon('☕'); 
        setStyle({ bg: 'rgba(219, 234, 254, 0.65)', border: 'rgba(191, 219, 254, 0.4)', text: '#1D4ED8', shadow: '0 4px 12px -3px rgba(59,130,246,0.12)' }) 
    }
    else if (hour >= 17 && hour < 21) { 
        setGreeting('สวัสดีตอนเย็น'); setIcon('🌅'); 
        setStyle({ bg: 'rgba(255, 245, 235, 0.65)', border: 'rgba(254, 215, 170, 0.4)', text: '#C2410C', shadow: '0 4px 12px -3px rgba(234,88,12,0.1)' }) 
    }
    else { 
        setGreeting('ราตรีสวัสดิ์'); setIcon('🌙'); 
        setStyle({ bg: 'rgba(224, 231, 255, 0.65)', border: 'rgba(199, 210, 254, 0.4)', text: '#4338CA', shadow: '0 4px 12px -3px rgba(67,56,202,0.12)' }) 
    }
  }, [])

  return (
    <div 
      className="inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md transition-all duration-300"
      style={{ 
        background: style.bg, 
        color: style.text,
        border: `1px solid ${style.border}`,
        boxShadow: style.shadow
      }}
    >
      <span className="drop-shadow-sm text-[11px]">{icon}</span>
      <span className="opacity-90">{greeting}, {isGuest ? 'GUEST' : displayName}</span>
    </div>
  )
}

function QuickActionButton({ icon: Icon, label, badge, bgColor, onClick }: any) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClick} onTapStart={() => setIsPressed(true)} onTap={() => setIsPressed(false)} onTapCancel={() => setIsPressed(false)} className="flex flex-col items-center gap-2 relative group touch-none mx-auto w-full">
       <div className="relative">
          <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center transition-transform", bgColor, isPressed ? "scale-95" : "")}>
            <Icon className="w-6 h-6" strokeWidth={2.5} />
          </div>
          
          {badge && (
             <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm z-20">
                {badge}
             </motion.span>
          )}
       </div>
       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</span>
    </motion.button>
  )
}
