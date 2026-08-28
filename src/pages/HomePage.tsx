import { useEffect, useState } from 'react'
import { useMenuItems } from '@/features/menu/hooks/useMenu'
import { searchEngine } from '@/features/ai/hooks/useSmartSearch'
import { useMenuStore, useCartStore } from '@/store'
import { Container } from '@/components/layout/Container'
import { MenuGridSkeleton } from '@/components/ui/Skeleton'
import { trackPageView } from '@/lib/analytics'
import { useSEO } from '@/hooks/useSEO'

// Feature Components
import { AppHeader } from '@/components/brand/AppHeader'
import { HeroSlider } from '@/features/menu/components/HeroSlider'
import { CategoryTabs } from '@/features/menu/components/CategoryTabs'
import { MenuGrid } from '@/features/menu/components/MenuGrid'
import { FloatingCart } from '@/features/cart/components/FloatingCart'
import { MenuItemModal } from '@/features/menu/components/MenuItemModal'
import { ShopClosedBanner } from '@/features/config/components/ShopClosedBanner'
import { BentoGridShowcase } from '@/components/ui/BentoGridShowcase'
import { useIsShopOpen } from '@/features/config/hooks/useShopConfig'
import { SavedCustomMealsStrip } from '@/features/menu/components/SavedCustomMeals'
import { DailyCheckInModal, isCheckedInToday } from '@/features/points/components/DailyCheckIn'
import { RewardsMarketplace } from '@/features/points/components/RewardsMarketplace'

// Interactive Feature Modals
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
  const { addItem } = useCartStore()
  const { spinsLeft } = useWheelOfFortune()
  const { data: isOpen } = useIsShopOpen()

  const [showWheel, setShowWheel] = useState(false)
  const [showRandomizer, setShowRandomizer] = useState(false)
  const [showVoice, setShowVoice] = useState(false)
  const [showQuickOrder, setShowQuickOrder] = useState(false)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const checkedToday = isCheckedInToday()

  useEffect(() => {
    trackPageView('/', 'Home')
    window.scrollTo(0, 0)
  }, [])

  useSEO({
    title: 'กะเพรา 52 — ต้นตำรับผัดกระทะเหล็ก',
    description: 'กะเพรา 52 - เมนูกะเพราและอาหารตามสั่งรสเด็ด ผัดกระทะเหล็กร้อนๆ สั่งง่าย ส่งไว'
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

  return (
    <div className="min-h-screen pb-36 relative" style={{ background: 'var(--bg-base)' }}>

      {/* === TOP LUXURY APP BAR === */}
      <AppHeader />

      {/* === MAIN FEED === */}
      <Container size="full" className="px-4 pt-2.5 space-y-3 relative z-10">

        {/* 1. Shop Closed Banner (Subtle inline if closed) */}
        {isOpen === false && (
          <ShopClosedBanner />
        )}

        {/* 2. Hero Promotional Slider */}
        <HeroSlider />

        {/* 3. Sleek Gourmet Quick Actions Strip */}
        <BentoGridShowcase
          spinsLeft={spinsLeft}
          checkedToday={checkedToday}
          onOpenWheel={() => setShowWheel(true)}
          onOpenCheckIn={() => setShowCheckIn(true)}
          onOpenRandomizer={() => setShowRandomizer(true)}
          onOpenVoice={() => setShowVoice(true)}
          onOpenRewards={() => setShowRewards(true)}
          onOpenQuickOrder={() => setShowQuickOrder(true)}
        />

        {/* 4. Saved Custom Meals (1-Tap Fast Reorder Strip) */}
        <SavedCustomMealsStrip />

        {/* 5. Food Menu Feed (Immediate Visual Food Focus) */}
        {/* 5. Food Menu Feed (Immediate Visual Food Focus) */}
        <div className="pt-1 space-y-2.5">
          {/* Category Tabs */}
          <CategoryTabs />

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <h2 className="font-black text-sm text-slate-900 tracking-tight truncate">
                {searchQuery
                  ? `ผลการค้นหา "${searchQuery}"`
                  : activeCategory === 'kaprao'
                  ? '🔥 เมนูกะเพรากระทะเหล็ก'
                  : activeCategory === 'garlic'
                  ? '🧄 เมนูผัดกระเทียมพริกไทย'
                  : activeCategory === 'curry'
                  ? '🌶️ เมนูผัดพริกแกงรสจัด'
                  : activeCategory === 'noodle'
                  ? '🍜 มาม่า & เมนูเส้น'
                  : activeCategory === 'bamboo'
                  ? '🎋 เมนูผัดกะเพราหน่อไม้'
                  : activeCategory === 'favorites'
                  ? '❤️ เมนูโปรดที่คุณชื่นชอบ'
                  : 'เมนูแนะนำ'}
              </h2>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-slate-500 bg-slate-100 border border-slate-200/80 flex-shrink-0"
            >
              {filteredItems?.length || 0} รายการ
            </span>
          </div>

          {/* Food Grid */}
          <div className="min-h-[350px] pt-1">
            {isLoading ? (
              <MenuGridSkeleton count={6} />
            ) : (
              <MenuGrid items={filteredItems || []} />
            )}
          </div>
        </div>

      </Container>

      {/* Floating Cart Indicator */}
      <FloatingCart />

      {/* Feature Modals */}
      <WheelOfFortune isOpen={showWheel} onClose={() => setShowWheel(false)} onWin={handleWheelWin} />
      <FoodRandomizer isOpen={showRandomizer} onClose={() => setShowRandomizer(false)} onSelect={handleRandomizerSelect} />
      <VoiceOrder isOpen={showVoice} onClose={() => setShowVoice(false)} onSelect={handleVoiceSelect} />
      <QuickOrderModal isOpen={showQuickOrder} onClose={() => setShowQuickOrder(false)} onReorder={handleQuickReorder} />
      <DailyCheckInModal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} />
      <RewardsMarketplace isOpen={showRewards} onClose={() => setShowRewards(false)} />

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
