import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Plus, Trash2, Check, ChefHat } from 'lucide-react'
import { useCartStore, useUIStore } from '@/store'
import { formatPrice } from '@/utils/formatPrice'
import { hapticAddToCart, hapticMedium } from '@/utils/haptics'
import { cn } from '@/utils/cn'
import type { MenuItem, SelectedOption } from '@/types'

export interface SavedMeal {
  id: string
  name: string
  menuItem: MenuItem
  selectedMeat?: SelectedOption | null
  selectedEgg?: SelectedOption
  selectedSpice?: SelectedOption
  selectedExtras: SelectedOption[]
  note?: string
  totalPrice: number
  createdAt: string
}

const STORAGE_KEY = 'kaprao_saved_custom_meals'

export function getSavedMeals(): SavedMeal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveMealPreset(meal: Omit<SavedMeal, 'id' | 'createdAt'>): SavedMeal {
  const existing = getSavedMeals()
  const newMeal: SavedMeal = {
    ...meal,
    id: 'meal_' + Date.now(),
    createdAt: new Date().toISOString(),
  }
  const updated = [newMeal, ...existing.slice(0, 7)] // Keep max 8 presets
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('saved_meals_updated'))
  return newMeal
}

export function removeSavedMeal(id: string) {
  const existing = getSavedMeals()
  const updated = existing.filter(m => m.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  window.dispatchEvent(new Event('saved_meals_updated'))
}

export function SavedCustomMealsStrip({ onSelectPreset }: { onSelectPreset?: (meal: SavedMeal) => void }) {
  const [meals, setMeals] = useState<SavedMeal[]>([])
  const { addItem } = useCartStore()
  const { addToast } = useUIStore()
  const [addedId, setAddedId] = useState<string | null>(null)

  const loadMeals = () => {
    setMeals(getSavedMeals())
  }

  useEffect(() => {
    loadMeals()
    window.addEventListener('saved_meals_updated', loadMeals)
    return () => window.removeEventListener('saved_meals_updated', loadMeals)
  }, [])

  if (meals.length === 0) return null

  const handleQuickAdd = (meal: SavedMeal) => {
    hapticAddToCart()
    setAddedId(meal.id)

    const selectedOptions: SelectedOption[] = [
      ...(meal.selectedMeat ? [meal.selectedMeat] : []),
      ...(meal.selectedEgg && meal.selectedEgg.optionId !== 'no_egg' ? [meal.selectedEgg] : []),
      ...(meal.selectedSpice ? [meal.selectedSpice] : []),
      ...meal.selectedExtras,
    ]

    addItem(meal.menuItem, 1, selectedOptions, meal.note)
    addToast({
      type: 'cart-add',
      title: 'เพิ่มสูตรโปรดลงตะกร้าแล้ว!',
      message: meal.name,
      imageUrl: meal.menuItem.imageUrl,
    })

    setTimeout(() => setAddedId(null), 1500)
    onSelectPreset?.(meal)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    hapticMedium()
    removeSavedMeal(id)
    addToast({ type: 'info', title: 'ลบสูตรโปรดแล้ว' })
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5">
          <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />
          <h3 className="font-black text-xs uppercase tracking-wider text-slate-900">
            สูตรโปรดสั่งด่วนใน 1 คลิก
          </h3>
        </div>
        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
          {meals.length} สูตร
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4">
        {meals.map((meal) => {
          const isJustAdded = addedId === meal.id
          return (
            <motion.div
              key={meal.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleQuickAdd(meal)}
              className={cn(
                'flex-shrink-0 w-64 p-3.5 rounded-[22px] border transition-all cursor-pointer relative overflow-hidden group select-none',
                isJustAdded
                  ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/10'
                  : 'border-[var(--border-subtle)] bg-white hover:border-orange-300 shadow-sm'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-[10px] bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-xs text-slate-900 truncate">
                    {meal.name}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, meal.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                  title="ลบสูตรโปรด"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Options Pills */}
              <div className="flex flex-wrap gap-1 mb-2.5">
                {meal.selectedMeat && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {meal.selectedMeat.name}
                  </span>
                )}
                {meal.selectedSpice && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-700">
                    {meal.selectedSpice.name}
                  </span>
                )}
                {meal.selectedEgg && meal.selectedEgg.optionId !== 'no_egg' && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800">
                    {meal.selectedEgg.name}
                  </span>
                )}
                {meal.selectedExtras.map((extra) => (
                  <span key={extra.optionId} className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-700">
                    {extra.name}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="font-black text-sm text-gradient-fire num-display">
                  {formatPrice(meal.totalPrice)}
                </span>

                <div
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 transition-all',
                    isJustAdded
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white'
                  )}
                >
                  {isJustAdded ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>ใส่แล้ว</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>สั่งซ้ำ</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
