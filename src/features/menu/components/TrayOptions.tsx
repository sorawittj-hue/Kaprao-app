import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, ChefHat, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { MenuItem, SelectedOption } from '@/types'
import { cn } from '@/utils/cn'

interface TrayOptionsProps {
  isOpen: boolean
  onClose: () => void
  onAddToCart: (item: MenuItem, quantity: number, options: SelectedOption[], note: string) => void
  trayItem: MenuItem | null
}

const MEAT_OPTIONS = [
  { name: 'กะเพราหมูสับ', price: 0, icon: '🐷' },
  { name: 'กะเพราไก่ชิ้น', price: 0, icon: '🐔' },
  { name: 'กะเพราหน่อไม้-หมูสับ', price: 0, icon: '🎍' },
  { name: 'กะเพราหมูเด้ง', price: 10, icon: '🥓' },
  { name: 'กะเพราสันคอ', price: 10, icon: '🥩' },
  { name: 'กะเพราทะเล (กุ้ง/หมึก)', price: 20, icon: '🦐' },
]

const EGG_OPTIONS = [
  { name: 'ไข่ดาว', price: 0, icon: '🍳' },
  { name: 'ไข่เจียว', price: 5, icon: '🥞' },
  { name: 'ไข่ข้น', price: 10, icon: '🥘' },
]

export function TrayOptions({ isOpen, onClose, onAddToCart, trayItem }: TrayOptionsProps) {
  const [selectedMeat, setSelectedMeat] = useState(MEAT_OPTIONS[0])
  const [selectedEgg, setSelectedEgg] = useState(EGG_OPTIONS[0])
  const [quantity, setQuantity] = useState(1)

  if (!isOpen || !trayItem) return null

  const handleAddToCart = () => {
    const options: SelectedOption[] = [
      { optionId: `meat-${selectedMeat.name}`, name: selectedMeat.name, price: selectedMeat.price },
      { optionId: `egg-${selectedEgg.name}`, name: selectedEgg.name, price: selectedEgg.price },
    ]
    
    const note = `ถาด: ${selectedMeat.name} + ${selectedEgg.name}`
    
    onAddToCart(trayItem, quantity, options, note)
    onClose()
  }

  const totalPrice = trayItem.price + selectedMeat.price + selectedEgg.price

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center z-10 hover:bg-gray-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-3">
            <ChefHat className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">{trayItem.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            เริ่มต้น {trayItem.price} บาท
          </p>
        </div>

        {/* Meat Selection */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">1</span>
            เลือกเนื้อสัตว์หลัก
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {MEAT_OPTIONS.map((meat) => (
              <button
                key={meat.name}
                onClick={() => setSelectedMeat(meat)}
                className={cn(
                  'relative p-3 rounded-xl border-2 text-left transition-all',
                  selectedMeat.name === meat.name
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{meat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-800 truncate">{meat.name}</p>
                    {meat.price > 0 && (
                      <p className="text-xs text-amber-600">+{meat.price} บาท</p>
                    )}
                  </div>
                </div>
                {selectedMeat.name === meat.name && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Egg Selection */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">2</span>
            เลือกไข่
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {EGG_OPTIONS.map((egg) => (
              <button
                key={egg.name}
                onClick={() => setSelectedEgg(egg)}
                className={cn(
                  'relative p-3 rounded-xl border-2 text-center transition-all',
                  selectedEgg.name === egg.name
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-amber-200'
                )}
              >
                <span className="text-2xl block mb-1">{egg.icon}</span>
                <p className="font-bold text-xs text-gray-800">{egg.name}</p>
                {egg.price > 0 && (
                  <p className="text-xs text-amber-600">+{egg.price}</p>
                )}
                {selectedEgg.name === egg.name && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <div className="p-4">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <ChefHat className="w-4 h-4" />
              สรุปความอร่อย
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">เมนูหลัก:</span>
                <span className="font-medium">{selectedMeat.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ไข่:</span>
                <span className="font-medium">{selectedEgg.name}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-200">
                <span className="text-gray-800 font-bold">ราคารวม:</span>
                <span className="text-amber-600 font-black text-lg">{totalPrice} บาท</span>
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              * เสิร์ฟพร้อมแตงกวาและน้ำซุปฟรี!
            </p>
          </div>
        </Card>

        {/* Quantity */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-gray-700">จำนวน</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              -
            </button>
            <span className="font-bold text-xl w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          size="lg"
          fullWidth
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
        >
          เพิ่มลงตะกร้า {totalPrice * quantity} บาท
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default TrayOptions
