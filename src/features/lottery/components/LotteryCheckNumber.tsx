import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Ticket, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { fetchLatestResult } from '@/features/lottery/api/lotteryApi'

interface LotteryCheckNumberProps {
  onResult?: (result: { isWin: boolean; prize: string }) => void
}

export function LotteryCheckNumber({ onResult }: LotteryCheckNumberProps) {
  const [number, setNumber] = useState('')
  const [result, setResult] = useState<{
    isWin: boolean
    prize: string
    show: boolean
  } | null>(null)
  


  const handleCheck = async () => {
    if (number.length !== 5) return

    try {
      const latestResult = await fetchLatestResult()
      
      if (!latestResult) {
        setResult({
          isWin: false,
          prize: 'ยังไม่มีผลรางวัล',
          show: true
        })
        return
      }

      // Check last 2 digits
      const last2Match = number.slice(-2) === latestResult.last2
      // Check first 3 digits
      const first3Match = latestResult.first3.includes(number.slice(0, 3))

      let isWin = false
      let prize = ''

      if (last2Match && first3Match) {
        isWin = true
        prize = 'ทายถูกเลขท้าย 2 ตัว และ 3 ตัวหน้า! 🎉'
      } else if (last2Match) {
        isWin = true
        prize = 'กินข้าวฟรี 1 มื้อ! 🤤'
      } else if (first3Match) {
        isWin = true
        prize = 'ทายถูกเลขหน้า 3 ตัว'
      } else {
        prize = 'ไม่ถูกรางวัล'
      }

      setResult({ isWin, prize, show: true })
      onResult?.({ isWin, prize })
    } catch (error) {
      console.error('Failed to check number:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Number Input */}
      <div className="flex gap-2">
        <div className="flex-1 flex gap-1">
          {Array(5).fill(0).map((_, idx) => (
            <input
              key={idx}
              type="text"
              maxLength={1}
              value={number[idx] || ''}
              onChange={(e) => {
                const newNumber = number.split('')
                newNumber[idx] = e.target.value
                setNumber(newNumber.join(''))
                
                // Auto focus next input
                if (e.target.value && idx < 4) {
                  const nextInput = e.target.parentElement?.querySelector(`input:nth-child(${idx + 2})`) as HTMLInputElement
                  nextInput?.focus()
                }
              }}
              className="w-full h-14 bg-white border-2 border-gray-200 rounded-xl text-center font-black text-2xl focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
            />
          ))}
        </div>
        
        <Button
          onClick={handleCheck}
          disabled={number.length !== 5}
          className="h-14 px-4"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>

      {/* Result */}
      {result?.show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl border-2 ${
            result.isWin
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.isWin ? (
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-gray-400" />
              </div>
            )}
            
            <div>
              <p className={`font-bold ${
                result.isWin ? 'text-green-700' : 'text-gray-700'
              }`}>
                {result.isWin ? '🎉 ยินดีด้วย!' : 'ไม่ถูกรางวัล'}
              </p>
              <p className={`text-sm ${
                result.isWin ? 'text-green-600' : 'text-gray-500'
              }`}>
                {result.prize}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
