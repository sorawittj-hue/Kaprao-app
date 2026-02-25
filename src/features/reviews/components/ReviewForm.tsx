import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCreateReview } from '../hooks/useReviews'
import type { Order } from '@/types'
import { cn } from '@/utils/cn'

interface ReviewFormProps {
  order: Order
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ order, onSuccess, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)
  
  const createReview = useCreateReview()
  
  const handleSubmit = async () => {
    if (rating === 0) return
    
    try {
      await createReview.mutateAsync({
        orderId: order.id,
        rating,
        comment,
        wouldRecommend: wouldRecommend || false,
        menuItemIds: order.items.map(item => item.menuItemId)
      })
      onSuccess?.()
    } catch (err) {
      console.error('Failed to submit review:', err)
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-3">ให้คะแนนอาหาร</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-10 h-10 transition-colors',
                  (hoverRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ความคิดเห็น
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="รสชาติเป็นอย่างไร?"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 outline-none resize-none"
        />
      </div>
      
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">แนะนำให้เพื่อน?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setWouldRecommend(true)}
            className={cn(
              'flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2',
              wouldRecommend === true
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200'
            )}
          >
            <ThumbsUp className="w-4 h-4" />
            แนะนำ
          </button>
          <button
            onClick={() => setWouldRecommend(false)}
            className={cn(
              'flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2',
              wouldRecommend === false
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200'
            )}
          >
            <ThumbsDown className="w-4 h-4" />
            ไม่แนะนำ
          </button>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          ยกเลิก
        </Button>
        <Button
          onClick={handleSubmit}
          isLoading={createReview.isPending}
          disabled={rating === 0}
          className="flex-1"
        >
          ส่งรีวิว
        </Button>
      </div>
    </div>
  )
}
