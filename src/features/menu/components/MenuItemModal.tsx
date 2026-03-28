import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Flame, Egg, Beef, ChevronRight } from 'lucide-react'
import type { MenuItem, SelectedOption } from '@/types'
import { useCartStore, useUIStore } from '@/store'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { hapticAddToCart, hapticLight } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { SmartUpsell } from './SmartUpsell'
import { useMagnetic } from '@/hooks/useMagnetic'

interface MenuItemModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
}

// Default options for menu items - defined outside component to maintain reference stability
const MEAT_OPTIONS: SelectedOption[] = [
  { optionId: 'meat_sap', name: 'หมูสับ', price: 0 },
  { optionId: 'meat_sanko', name: 'หมูสันคอสไลด์', price: 0 },
  { optionId: 'meat_kai', name: 'ไก่', price: 0 },
  { optionId: 'meat_kai_sap', name: 'ไก่สับ', price: 0 },
  { optionId: 'meat_krob', name: 'หมูกรอบ', price: 15 },
]

const EGG_OPTIONS: SelectedOption[] = [
  { optionId: 'no_egg', name: 'ไม่ใส่ไข่', price: 0 },
  { optionId: 'egg_khon', name: 'ไข่ข้น', price: 10 },
  { optionId: 'egg_dao', name: 'ไข่ดาว', price: 10 },
  { optionId: 'egg_jiao', name: 'ไข่เจียว', price: 10 },
  { optionId: 'egg_yiaoma', name: 'ไข่เยี่ยวม้า', price: 15 },
  { optionId: 'egg_tom', name: 'ไข่ต้ม', price: 10 },
]

const SPICE_OPTIONS: SelectedOption[] = [
  { optionId: 'no_spicy', name: 'ไม่เผ็ด', price: 0 },
  { optionId: 'mild', name: 'เผ็ดน้อย', price: 0 },
  { optionId: 'medium', name: 'เผ็ดกลาง', price: 0 },
  { optionId: 'spicy', name: 'เผ็ด', price: 0 },
  { optionId: 'very_spicy', name: 'เผ็ดมาก', price: 0 },
  { optionId: 'extreme', name: 'เผ็ดสุดขีด', price: 0 },
]

const EXTRA_OPTIONS: SelectedOption[] = [
  { optionId: 'extra_rice', name: 'พิเศษ ข้าว', price: 10 },
  { optionId: 'extra_meat', name: 'พิเศษ เนื้อสัตว์', price: 15 },
]

import { useGlobalOptions, isOptionAvailable } from '../hooks/useGlobalOptions'

export function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const magneticButton = useMagnetic<HTMLButtonElement>()
  const { addItem } = useCartStore()
  const { addToast } = useUIStore()
  const { data: globalOptions = [] } = useGlobalOptions()

  // Use item.id as dependency instead of item object to prevent infinite re-renders
  const itemId = item?.id

  const [quantity, setQuantity] = useState(1)
  const [selectedMeat, setSelectedMeat] = useState<SelectedOption | null>(null)
  const [selectedEgg, setSelectedEgg] = useState<SelectedOption>(EGG_OPTIONS[0])
  const [selectedSpice, setSelectedSpice] = useState<SelectedOption>(SPICE_OPTIONS[2])
  const [selectedExtras, setSelectedExtras] = useState<SelectedOption[]>([])
  const [note, setNote] = useState('')
  const [activeTab, setActiveTab] = useState<'meat' | 'egg' | 'spicy' | 'extra'>('meat')
  const [isAdding, setIsAdding] = useState(false)

  // Track the last item ID we reset for to prevent duplicate resets (use ref to avoid re-render)
  const resetItemRef = useRef<number | null>(null)

  // Reset state when item changes - only when itemId actually changes
  useEffect(() => {
    if (itemId && isOpen && itemId !== resetItemRef.current) {
      resetItemRef.current = itemId
      setQuantity(1)

      // Select first available meat
      const firstAvailableMeat = item?.requiresMeat
        ? MEAT_OPTIONS.find(o => isOptionAvailable(o.optionId, globalOptions)) || MEAT_OPTIONS[0]
        : null
      setSelectedMeat(firstAvailableMeat)

      // Select first available egg (excluding 'no_egg' which is always available at index 0)
      setSelectedEgg(EGG_OPTIONS[0])

      setSelectedSpice(SPICE_OPTIONS[2])
      setSelectedExtras([])
      setNote('')
      setActiveTab(item?.requiresMeat ? 'meat' : 'egg')
    }
  }, [itemId, isOpen, item?.requiresMeat, globalOptions])

  // Lock body scroll when modal is open, clear resetItemRef when closed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Clear resetItemRef when modal closes so reopening same item works
      resetItemRef.current = null
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const toggleExtra = useCallback((option: SelectedOption) => {
    hapticLight()
    setSelectedExtras(prev => {
      const exists = prev.find(o => o.optionId === option.optionId)
      if (exists) {
        console.log('➖ Removing extra:', option.name)
        return prev.filter(o => o.optionId !== option.optionId)
      }
      console.log('➕ Adding extra:', option.name)
      return [...prev, option]
    })
  }, [])

  const calculateTotal = useMemo(() => {
    if (!item) return 0
    const basePrice = item.price
    const meatPrice = selectedMeat?.price || 0
    const eggPrice = selectedEgg.price
    const extrasPrice = selectedExtras.reduce((sum, opt) => sum + opt.price, 0)
    const unitPrice = basePrice + meatPrice + eggPrice + extrasPrice
    return unitPrice * quantity
  }, [item, selectedMeat, selectedEgg, selectedExtras, quantity])

  const calculateUnitPrice = useMemo(() => {
    if (!item) return 0
    const basePrice = item.price
    const meatPrice = selectedMeat?.price || 0
    const eggPrice = selectedEgg.price
    const extrasPrice = selectedExtras.reduce((sum, opt) => sum + opt.price, 0)
    return basePrice + meatPrice + eggPrice + extrasPrice
  }, [item, selectedMeat, selectedEgg, selectedExtras])

  const handleAddToCart = useCallback(() => {
    if (isAdding || !item) {
      console.log('⚠️ Add to cart blocked - already adding or no item')
      return
    }

    console.log('🛒 Adding to cart:', item.name, 'x', quantity)
    setIsAdding(true)
    hapticAddToCart()

    // Build selected options array
    const options: SelectedOption[] = [
      selectedMeat,
      selectedEgg,
      selectedSpice,
      ...selectedExtras,
    ].filter(Boolean) as SelectedOption[]

    // Build note from selections
    const optionNotes = [
      selectedMeat ? `เนื้อ: ${selectedMeat.name}` : null,
      selectedEgg.optionId !== 'no_egg' ? `ไข่: ${selectedEgg.name}` : null,
      `ความเผ็ด: ${selectedSpice.name}`,
      ...selectedExtras.map(e => e.name),
    ].filter(Boolean) as string[]

    const fullNote = note.trim()
      ? `${optionNotes.join(', ')} | หมายเหตุ: ${note.trim()}`
      : optionNotes.join(', ')

    addItem(item, quantity, options, fullNote)

    addToast({
      type: 'cart-add',
      title: 'เพิ่มลงตะกร้าแล้ว!',
      message: `${item.name} x${quantity}`,
      imageUrl: item.imageUrl,
    })

    // Animate and close
    setTimeout(() => {
      setIsAdding(false)
      console.log('✅ Item added, closing modal')
      onClose()
    }, 300)
  }, [isAdding, item, quantity, selectedMeat, selectedEgg, selectedSpice, selectedExtras, note, addItem, addToast, onClose])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('👆 Backdrop clicked, closing modal')
      onClose()
    }
  }, [onClose])

  const tabConfig = useMemo(() => ({
    meat: { icon: Beef, label: 'เนื้อ', color: 'bg-red-100 text-red-600' },
    egg: { icon: Egg, label: 'ไข่', color: 'bg-yellow-100 text-yellow-600' },
    spicy: { icon: Flame, label: 'เผ็ด', color: 'bg-orange-100 text-orange-600' },
    extra: { icon: ChevronRight, label: 'พิเศษ', color: 'bg-blue-100 text-blue-600' },
  }), [])

  if (!item) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[140]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[150] bg-white rounded-t-3xl max-h-[90vh] overflow-hidden"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              {/* Header Image */}
              <div className="relative h-48 bg-gray-100">
                <img
                  src={getValidImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>

                {item.isRecommended && (
                  <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    แนะนำ
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-6">
                {/* Title & Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-800">{item.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-brand-600">{formatPrice(calculateUnitPrice)}</p>
                    {calculateUnitPrice !== item.price && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(item.price)}</p>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {(Object.keys(tabConfig) as Array<keyof typeof tabConfig>).map((tab) => {
                    const config = tabConfig[tab]
                    const Icon = config.icon
                    const isActive = activeTab === tab

                    if (tab === 'meat' && !item.requiresMeat) return null;

                    return (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab)
                          hapticLight()
                        }}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all',
                          isActive
                            ? `${config.color} ring-2 ring-offset-2 ring-current`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    )
                  })}
                </div>

                {/* Tab Content */}
                <div className="space-y-3">
                  {activeTab === 'meat' && (
                    <>
                      <p className="text-sm font-bold text-gray-700">เลือกเนื้อ</p>
                      <div className="grid grid-cols-2 gap-2">
                        {MEAT_OPTIONS.map((meat) => {
                          const isAvailable = isOptionAvailable(meat.optionId, globalOptions)
                          return (
                            <button
                              key={meat.optionId}
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedMeat(meat)
                                hapticLight()
                              }}
                              className={cn(
                                'p-3 rounded-xl border-2 text-left transition-all active:scale-95 relative overflow-hidden',
                                selectedMeat?.optionId === meat.optionId
                                  ? 'border-red-500 bg-red-50'
                                  : isAvailable
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-100 bg-gray-50 opacity-60 grayscale cursor-not-allowed'
                              )}
                            >
                              <p className="font-bold text-sm">{meat.name}</p>
                              {meat.price > 0 && isAvailable && (
                                <p className="text-xs text-red-600">+{formatPrice(meat.price)}</p>
                              )}
                              {!isAvailable && (
                                <span className="absolute top-1 right-1 bg-gray-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                  หมด
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {activeTab === 'egg' && (
                    <>
                      <p className="text-sm font-bold text-gray-700">เลือกไข่</p>
                      <div className="grid grid-cols-2 gap-2">
                        {EGG_OPTIONS.map((egg) => {
                          const isAvailable = egg.optionId === 'no_egg' || isOptionAvailable(egg.optionId, globalOptions);
                          return (
                            <button
                              key={egg.optionId}
                              disabled={!isAvailable}
                              onClick={() => {
                                setSelectedEgg(egg)
                                hapticLight()
                              }}
                              className={cn(
                                'p-3 rounded-xl border-2 text-left transition-all active:scale-95 relative overflow-hidden',
                                selectedEgg.optionId === egg.optionId
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : isAvailable
                                    ? 'border-gray-200 hover:border-gray-300'
                                    : 'border-gray-100 bg-gray-50 opacity-60 grayscale cursor-not-allowed'
                              )}
                            >
                              <p className="font-bold text-sm">{egg.name}</p>
                              {egg.price > 0 && isAvailable && (
                                <p className="text-xs text-yellow-600">+{formatPrice(egg.price)}</p>
                              )}
                              {!isAvailable && (
                                <span className="absolute top-1 right-1 bg-gray-400 text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                                  หมด
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {activeTab === 'spicy' && (
                    <>
                      <p className="text-sm font-bold text-gray-700">เลือกระดับความเผ็ด</p>
                      <div className="space-y-2">
                        {SPICE_OPTIONS.map((spice, index) => (
                          <button
                            key={spice.optionId}
                            onClick={() => {
                              setSelectedSpice(spice)
                              hapticLight()
                            }}
                            className={cn(
                              'w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all active:scale-95',
                              selectedSpice.optionId === spice.optionId
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center',
                                index === 0 ? 'bg-green-100' :
                                  index === 1 ? 'bg-yellow-100' :
                                    index === 2 ? 'bg-orange-100' :
                                      'bg-red-100'
                              )}>
                                <Flame className={cn(
                                  'w-4 h-4',
                                  index === 0 ? 'text-green-600' :
                                    index === 1 ? 'text-yellow-600' :
                                      index === 2 ? 'text-orange-600' :
                                        'text-red-600'
                                )} />
                              </div>
                              <span className="font-bold">{spice.name}</span>
                            </div>
                            {selectedSpice.optionId === spice.optionId && (
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-3 h-3 bg-white rounded-full"
                                />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {activeTab === 'extra' && (
                    <>
                      <p className="text-sm font-bold text-gray-700">เพิ่มเติม (เลือกได้หลายอย่าง)</p>
                      <div className="grid grid-cols-2 gap-2">
                        {EXTRA_OPTIONS.map((extra) => {
                          const isSelected = selectedExtras.find(e => e.optionId === extra.optionId)
                          return (
                            <button
                              key={extra.optionId}
                              onClick={() => toggleExtra(extra)}
                              className={cn(
                                'p-3 rounded-xl border-2 text-left transition-all active:scale-95 relative',
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-2.5 h-2.5 bg-white rounded-full"
                                  />
                                </div>
                              )}
                              <p className="font-bold text-sm">{extra.name}</p>
                              {extra.price > 0 ? (
                                <p className="text-xs text-blue-600">+{formatPrice(extra.price)}</p>
                              ) : (
                                <p className="text-xs text-gray-400">ฟรี</p>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Note Input */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">หมายเหตุพิเศษ</p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น ไม่ใส่ผักชี, ผัดแห้งๆ..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all resize-none text-sm"
                  />
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ราคาต่อชิ้น</span>
                    <span>{formatPrice(calculateUnitPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">จำนวน</span>
                    <span>x{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>รวม</span>
                    <span className="text-brand-600">{formatPrice(calculateTotal)}</span>
                  </div>
                </div>

                {/* Smart Upsell */}
                <SmartUpsell 
                  hasEgg={selectedEgg.optionId !== 'no_egg'} 
                  onAddEgg={() => {
                    const eggDao = EGG_OPTIONS.find(o => o.optionId === 'egg_dao') || EGG_OPTIONS[2]
                    setSelectedEgg(eggDao)
                  }}
                />

                {/* Quantity & Add to Cart */}
                <div className="flex gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-gray-100 rounded-xl">
                    <button
                      onClick={() => {
                        if (quantity > 1) {
                          setQuantity(q => q - 1)
                          hapticLight()
                        }
                      }}
                      disabled={quantity <= 1}
                      className="w-12 h-14 flex items-center justify-center text-gray-600 disabled:text-gray-400 active:scale-95 transition-transform"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button
                      onClick={() => {
                        setQuantity(q => q + 1)
                        hapticLight()
                      }}
                      className="w-12 h-14 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Add Button */}
                  <div className="flex-1 overflow-visible">
                    <Button
                      {...magneticButton}
                      size="lg"
                      fullWidth
                      onClick={handleAddToCart}
                      isLoading={isAdding}
                    >
                      <span>เพิ่มลงตะกร้า</span>
                      <span className="ml-2">{formatPrice(calculateTotal)}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
