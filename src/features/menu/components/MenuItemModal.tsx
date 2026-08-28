import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { X, Plus, Minus, Flame, Check, ChevronDown, ShoppingCart, AlertCircle, Bookmark } from 'lucide-react'
import type { MenuItem, SelectedOption } from '@/types'
import { useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import { hapticAddToCart, hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { useGlobalOptions, isOptionAvailable } from '../hooks/useGlobalOptions'
import { saveMealPreset } from './SavedCustomMeals'

interface MenuItemModalProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
}

// ─── Options Data ────────────────────────────────────────────────
const MEAT_OPTIONS: SelectedOption[] = [
  { optionId: 'meat_sap',     name: 'หมูสับ',              price: 0  },
  { optionId: 'meat_sanko',   name: 'หมูสันคอสไลด์',       price: 0  },
  { optionId: 'meat_kai',     name: 'ไก่ชิ้นเนื้อนุ่ม',     price: 0  },
  { optionId: 'meat_krob',    name: 'หมูกรอบพรีเมียม 🔥',  price: 20 },
  { optionId: 'meat_beef',    name: 'เนื้อโคขุนสไลด์ 🥩',   price: 25 },
  { optionId: 'meat_kung',    name: 'กุ้งสดตัวโต 🦐',      price: 25 },
  { optionId: 'meat_squid',   name: 'หมึกสดเด้ง 🦑',       price: 25 },
  { optionId: 'meat_talay',   name: 'รวมมิตรทะเล 🌊',      price: 30 },
]
const EGG_OPTIONS: SelectedOption[] = [
  { optionId: 'no_egg',       name: 'ไม่ใส่ไข่',               price: 0  },
  { optionId: 'egg_dao_yoi',  name: '🍳 ไข่ดาวกรอบ (ไข่แดงเยิ้ม)', price: 10 },
  { optionId: 'egg_dao_suk',  name: '🍳 ไข่ดาวสุก',             price: 10 },
  { optionId: 'egg_khon',     name: '🍳 ไข่ข้นนุ่มละมุน',        price: 15 },
  { optionId: 'egg_jiao',     name: '🍳 ไข่เจียวกรอบฟู',        price: 15 },
  { optionId: 'egg_yiaoma',   name: '🥚 ไข่เยี่ยวม้าทอดกรอบ',   price: 20 },
]
const SPICE_OPTIONS: SelectedOption[] = [
  { optionId: 'no_spicy',    name: 'ไม่เผ็ด (0)',       price: 0 },
  { optionId: 'mild',        name: 'เผ็ดน้อย (1) 🌶️',   price: 0 },
  { optionId: 'medium',      name: 'เผ็ดกลาง (2) 🔥',   price: 0 },
  { optionId: 'spicy',       name: 'เผ็ดจัดจ้าน (3) 🔥🔥', price: 0 },
  { optionId: 'very_spicy',  name: 'เผ็ดมาก (4) 🔥🔥🔥', price: 0 },
  { optionId: 'extreme',     name: 'เผ็ดนรกแตก (5) 💀', price: 0 },
]
const EXTRA_OPTIONS: SelectedOption[] = [
  { optionId: 'extra_special', name: 'พิเศษ (+ข้าว +เนื้อ)', price: 15 },
  { optionId: 'extra_crispy_pork_skin', name: 'กากหมูกระเทียมเจียวกรอบ', price: 15 },
  { optionId: 'extra_kun_chiang', name: 'กุนเชียงทอดหวานเค็ม', price: 15 },
  { optionId: 'extra_rice', name: 'เพิ่มข้าวสวยหอมมะลิ', price: 10 },
]

// ─── Spice color helpers ────────────────────────────────────────
const SPICE_COLORS = ['#22C55E','#84CC16','#F59E0B','#EF4444','#DC2626','#991B1B']
const SPICE_BG     = ['rgba(34,197,94,0.12)','rgba(132,204,22,0.12)','rgba(245,158,11,0.12)',
                       'rgba(239,68,68,0.12)','rgba(220,38,38,0.12)','rgba(153,27,27,0.18)']

// ─── Chip option button ─────────────────────────────────────────
function OptionChip({
  label, price, selected, disabled, onSelect,
  accentColor = '#FF5E00',
}: {
  label: string; price: number; selected: boolean; disabled?: boolean
  onSelect: () => void; accentColor?: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.93 }}
      disabled={disabled}
      onClick={() => { if (!disabled) { hapticLight(); onSelect() } }}
      className={cn(
        'relative flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] border text-[13px] font-bold transition-all cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
      style={selected ? {
        background: `rgba(${hexToRgb(accentColor)},0.15)`,
        borderColor: accentColor,
        color: accentColor,
        boxShadow: `0 0 0 1px ${accentColor}40`,
      } : {
        background: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-muted)',
      }}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        >
          <Check className="w-3 h-3 flex-shrink-0" />
        </motion.span>
      )}
      <span>{label}</span>
      {price > 0 && (
        <span
          className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
          style={selected ? {
            background: accentColor,
            color: '#fff',
          } : {
            background: 'var(--bg-card)',
            color: 'var(--text-micro)',
          }}
        >
          +{price}
        </span>
      )}
      {disabled && (
        <span className="text-[9px] font-bold text-gray-400">หมด</span>
      )}
    </motion.button>
  )
}

// ─── Section Header ─────────────────────────────────────────────
function SectionHeader({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="font-black text-[14px]" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {required && (
        <span
          className="text-[9px] font-black px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(255,94,0,0.12)', color: '#FF5E00', border: '1px solid rgba(255,94,0,0.25)' }}
        >
          จำเป็น
        </span>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────
export function MenuItemModal({ item, isOpen, onClose }: MenuItemModalProps) {
  const { addItem } = useCartStore()
  const { addToast } = useUIStore()
  const { data: globalOptions = [] } = useGlobalOptions()
  const contentRef = useRef<HTMLDivElement>(null)

  const itemId = item?.id

  const [quantity, setQuantity]         = useState(1)
  const [selectedMeat, setSelectedMeat] = useState<SelectedOption | null>(null)
  const [selectedEgg, setSelectedEgg]   = useState<SelectedOption>(EGG_OPTIONS[0])
  const [selectedSpice, setSelectedSpice] = useState<SelectedOption>(SPICE_OPTIONS[2])
  const [selectedExtras, setSelectedExtras] = useState<SelectedOption[]>([])
  const [note, setNote]                 = useState('')
  const [isAdding, setIsAdding]         = useState(false)
  const [imageLoaded, setImageLoaded]   = useState(false)
  const [showNoteInput, setShowNoteInput] = useState(false)
  const resetItemRef = useRef<number | null>(null)

  // Drag-to-dismiss
  const dragY = useMotionValue(0)
  const backdropOpacity = useTransform(dragY, [0, 200], [1, 0])

  // Reset state when item changes
  useEffect(() => {
    if (itemId && isOpen && itemId !== resetItemRef.current) {
      resetItemRef.current = itemId
      setQuantity(1)
      setImageLoaded(false)
      const firstAvailableMeat = item?.requiresMeat
        ? MEAT_OPTIONS.find(o => isOptionAvailable(o.optionId, globalOptions)) || MEAT_OPTIONS[0]
        : null
      setSelectedMeat(firstAvailableMeat)
      setSelectedEgg(EGG_OPTIONS[0])
      setSelectedSpice(SPICE_OPTIONS[2])
      setSelectedExtras([])
      setNote('')
      setShowNoteInput(false)
      contentRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [itemId, isOpen, item?.requiresMeat, globalOptions])

  // Scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      resetItemRef.current = null
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const toggleExtra = useCallback((option: SelectedOption) => {
    hapticLight()
    setSelectedExtras(prev => {
      const exists = prev.find(o => o.optionId === option.optionId)
      return exists ? prev.filter(o => o.optionId !== option.optionId) : [...prev, option]
    })
  }, [])

  const unitPrice = useMemo(() => {
    if (!item) return 0
    return item.price
      + (selectedMeat?.price || 0)
      + selectedEgg.price
      + selectedExtras.reduce((s, o) => s + o.price, 0)
  }, [item, selectedMeat, selectedEgg, selectedExtras])

  const totalPrice = unitPrice * quantity

  const handleAddToCart = useCallback(() => {
    if (isAdding || !item) return
    // Require meat selection if item requires meat
    if (item.requiresMeat && !selectedMeat) return

    setIsAdding(true)
    hapticAddToCart()

    const options: SelectedOption[] = [
      selectedMeat, selectedEgg, selectedSpice, ...selectedExtras,
    ].filter(Boolean) as SelectedOption[]

    const optionNotes = [
      selectedMeat         ? `เนื้อ: ${selectedMeat.name}`            : null,
      selectedEgg.optionId !== 'no_egg' ? `ไข่: ${selectedEgg.name}` : null,
      `ความเผ็ด: ${selectedSpice.name}`,
      ...selectedExtras.map(e => e.name),
    ].filter(Boolean) as string[]

    const fullNote = note.trim()
      ? `${optionNotes.join(', ')} | หมายเหตุ: ${note.trim()}`
      : optionNotes.join(', ')

    addItem(item, quantity, options, fullNote)
    addToast({ type: 'cart-add', title: 'เพิ่มลงตะกร้าแล้ว!', message: `${item.name} ×${quantity}`, imageUrl: item.imageUrl })

    setTimeout(() => { setIsAdding(false); onClose() }, 280)
  }, [isAdding, item, quantity, selectedMeat, selectedEgg, selectedSpice, selectedExtras, note, addItem, addToast, onClose])

  const [isSavedAsPreset, setIsSavedAsPreset] = useState(false)

  const handleSavePreset = useCallback(() => {
    if (!item) return
    if (item.requiresMeat && !selectedMeat) {
      addToast({ type: 'error', title: 'กรุณาเลือกเนื้อสัตว์ก่อน' })
      return
    }
    hapticHeavy()
    const presetName = `${item.name} (${selectedMeat?.name || 'ต้นตำรับ'})`
    saveMealPreset({
      name: presetName,
      menuItem: item,
      selectedMeat,
      selectedEgg,
      selectedSpice,
      selectedExtras,
      note: note.trim() || undefined,
      totalPrice: unitPrice,
    })
    setIsSavedAsPreset(true)
    addToast({
      type: 'success',
      title: 'บันทึกเป็นสูตรโปรดแล้ว!',
      message: 'สามารถกดสั่งด่วนใน 1 คลิกได้จากหน้าหลัก',
    })
    setTimeout(() => setIsSavedAsPreset(false), 2000)
  }, [item, selectedMeat, selectedEgg, selectedSpice, selectedExtras, note, unitPrice, addToast])

  const handleDragEnd = useCallback((_: unknown, info: { offset: { y: number } }) => {
    if (info.offset.y > 100) onClose()
    else dragY.set(0)
  }, [onClose, dragY])

  if (!item) return null

  const meatRequired = !!item.requiresMeat
  const noMeatSelected = meatRequired && !selectedMeat

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140]"
            style={{
              opacity: backdropOpacity,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Sheet */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={handleDragEnd}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-x-0 bottom-0 z-[150] overflow-hidden flex flex-col"
            style={{
              y: dragY,
              maxHeight: '92dvh',
              borderRadius: '28px 28px 0 0',
              background: '#FFFFFF',
              boxShadow: '0 -16px 50px rgba(15, 23, 42, 0.16)',
            }}
          >
            {/* ── Drag handle ── */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing" aria-hidden>
              <div className="w-10 h-1.5 rounded-full" style={{ background: '#CBD5E1' }} />
            </div>

            {/* ── Hero Image ── */}
            <div className="relative flex-shrink-0" style={{ height: 220 }}>
              {!imageLoaded && (
                <div className="absolute inset-0 skeleton" />
              )}
              <img
                src={getValidImageUrl(item.imageUrl)}
                alt={item.name}
                loading="eager"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-400',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
              />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, transparent)' }} />

              {/* Close button */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={onClose}
                aria-label="ปิด"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer z-10"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>

              {/* Recommended badge */}
              {item.isRecommended && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-white z-10"
                  style={{ background: 'linear-gradient(135deg,#FF5E00,#FF3A00)', boxShadow: '0 4px 12px rgba(255,58,0,0.5)' }}
                >
                  <Flame className="w-3 h-3" />
                  แนะนำ
                </div>
              )}

              {/* Title overlay */}
              <div className="absolute bottom-0 inset-x-0 px-5 pb-3">
                <h2 id="modal-title" className="font-black text-[22px] text-white leading-tight"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                  {item.name}
                </h2>
                {item.description && (
                  <p className="text-white/60 text-[12px] mt-0.5 line-clamp-1">{item.description}</p>
                )}
              </div>
            </div>

            {/* ── Scrollable content ── */}
            <div ref={contentRef} className="flex-1 overflow-y-auto overscroll-contain">
              <div className="px-5 pt-4 pb-4 space-y-6">

                {/* ── MEAT ── */}
                {meatRequired && (
                  <div>
                    <SectionHeader label="เลือกเนื้อ" required />
                    <div className="flex flex-wrap gap-2">
                      {MEAT_OPTIONS.map(opt => {
                        const avail = isOptionAvailable(opt.optionId, globalOptions)
                        return (
                          <OptionChip
                            key={opt.optionId}
                            label={opt.name}
                            price={opt.price}
                            selected={selectedMeat?.optionId === opt.optionId}
                            disabled={!avail}
                            accentColor="#EF4444"
                            onSelect={() => setSelectedMeat(opt)}
                          />
                        )
                      })}
                    </div>
                    {noMeatSelected && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-red-400"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        กรุณาเลือกเนื้อก่อน
                      </motion.p>
                    )}
                  </div>
                )}

                {/* ── EGG ── */}
                <div>
                  <SectionHeader label="เลือกไข่" />
                  <div className="flex flex-wrap gap-2">
                    {EGG_OPTIONS.map(opt => {
                      const avail = opt.optionId === 'no_egg' || isOptionAvailable(opt.optionId, globalOptions)
                      return (
                        <OptionChip
                          key={opt.optionId}
                          label={opt.name}
                          price={opt.price}
                          selected={selectedEgg.optionId === opt.optionId}
                          disabled={!avail}
                          accentColor="#F59E0B"
                          onSelect={() => setSelectedEgg(opt)}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* ── SPICE ── */}
                <div>
                  <SectionHeader label="ระดับความเผ็ด" required />
                  <div className="grid grid-cols-3 gap-2">
                    {SPICE_OPTIONS.map((opt, idx) => {
                      const isSelected = selectedSpice.optionId === opt.optionId
                      return (
                        <motion.button
                          key={opt.optionId}
                          type="button"
                          whileTap={{ scale: 0.91 }}
                          onClick={() => { setSelectedSpice(opt); hapticMedium() }}
                          className="relative flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-[14px] border transition-all cursor-pointer focus-visible:outline-none"
                          style={isSelected ? {
                            background: SPICE_BG[idx],
                            borderColor: SPICE_COLORS[idx],
                            boxShadow: `0 0 0 1px ${SPICE_COLORS[idx]}40`,
                          } : {
                            background: 'var(--bg-surface)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          {/* Flame stack */}
                          <div className="flex gap-px">
                            {[...Array(Math.min(idx + 1, 5))].map((_, i) => (
                              <Flame
                                key={i}
                                className="w-3 h-3"
                                style={{ color: isSelected ? SPICE_COLORS[idx] : 'var(--text-micro)', opacity: isSelected ? 1 : 0.5 }}
                              />
                            ))}
                          </div>
                          <span
                            className="text-[11px] font-black text-center leading-tight"
                            style={{ color: isSelected ? SPICE_COLORS[idx] : 'var(--text-muted)' }}
                          >
                            {opt.name}
                          </span>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                              style={{ background: SPICE_COLORS[idx] }}
                            >
                              <Check className="w-2 h-2 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* ── EXTRAS ── */}
                <div>
                  <SectionHeader label="เพิ่มเติม (เลือกได้หลายอย่าง)" />
                  <div className="flex flex-wrap gap-2">
                    {EXTRA_OPTIONS.map(opt => (
                      <OptionChip
                        key={opt.optionId}
                        label={opt.name}
                        price={opt.price}
                        selected={!!selectedExtras.find(e => e.optionId === opt.optionId)}
                        accentColor="#FF5E00"
                        onSelect={() => toggleExtra(opt)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── NOTE ── */}
                <div>
                  <button
                    type="button"
                    onClick={() => { setShowNoteInput(v => !v); hapticLight() }}
                    className="flex items-center gap-2 text-[13px] font-bold cursor-pointer focus-visible:outline-none"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <motion.span
                      animate={{ rotate: showNoteInput ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                    หมายเหตุพิเศษ {note && <span className="text-orange-400">({note.length})</span>}
                  </button>

                  <AnimatePresence>
                    {showNoteInput && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="เช่น ไม่ใส่ผักชี, ผัดแห้งๆ, ไม่หวาน..."
                          rows={2}
                          maxLength={100}
                          className="w-full mt-2.5 px-4 py-3 rounded-[16px] text-sm font-medium resize-none outline-none focus:ring-2 transition-all"
                          style={{
                            background: 'var(--bg-surface)',
                            border: '1.5px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                          }}
                          onFocus={e => (e.target.style.borderColor = '#FF5E00')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border-subtle)')}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ── Favorite Preset Quick Save ── */}
                <div className="pt-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={handleSavePreset}
                    disabled={noMeatSelected}
                    className={cn(
                      'w-full py-3 px-4 rounded-[16px] border flex items-center justify-center gap-2 font-black text-xs transition-all cursor-pointer',
                      isSavedAsPreset
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                        : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50/70 shadow-sm'
                    )}
                  >
                    {isSavedAsPreset ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>บันทึกเป็นสูตรโปรดเรียบร้อย!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 fill-orange-500 text-orange-500" />
                        <span>บันทึกชุดนี้เป็น "สูตรโปรดของฉัน"</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {/* spacer for sticky bar */}
                <div className="h-4" />
              </div>
            </div>

            {/* ── Sticky Bottom Bar ── */}
            <div
              className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
              style={{
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--border-subtle)',
                paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              }}
            >
              {/* Quantity stepper */}
              <div
                className="flex items-center rounded-[16px] overflow-hidden flex-shrink-0"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => { if (quantity > 1) { setQuantity(q => q - 1); hapticLight() } }}
                  disabled={quantity <= 1}
                  className="w-11 h-11 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                >
                  <Minus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                </motion.button>
                <span className="w-8 text-center font-black text-[16px] num-display" style={{ color: 'var(--text-primary)' }}>
                  {quantity}
                </span>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.8 }}
                  onClick={() => { setQuantity(q => q + 1); hapticMedium() }}
                  className="w-11 h-11 flex items-center justify-center cursor-pointer"
                >
                  <Plus className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </motion.button>
              </div>

              {/* Add to cart CTA */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleAddToCart}
                disabled={isAdding || noMeatSelected}
                className="flex-1 h-11 rounded-[16px] flex items-center justify-between px-5 font-black text-[14px] text-white cursor-pointer disabled:opacity-50 transition-opacity"
                style={{
                  background: noMeatSelected
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #FF5E00, #FF3A00)',
                  boxShadow: noMeatSelected
                    ? 'none'
                    : '0 6px 20px rgba(255,58,0,0.45)',
                }}
              >
                <span className="flex items-center gap-2">
                  {isAdding ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block"
                    />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {noMeatSelected ? 'เลือกเนื้อก่อน' : 'เพิ่มลงตะกร้า'}
                </span>
                <motion.span
                  key={totalPrice}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="font-black text-[15px] num-display"
                >
                  {formatPrice(totalPrice)}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modal, document.body)
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}
