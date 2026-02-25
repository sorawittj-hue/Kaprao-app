import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
}

export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  if (!animate) {
    return (
      <div
        className={cn('bg-gray-200 rounded-lg', className)}
        {...props}
      />
    )
  }

  return (
    <motion.div
      className={cn('bg-gray-200 rounded-lg', className)}
      animate={{
        background: [
          'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          'linear-gradient(90deg, #e0e0e0 0%, #f0f0f0 50%, #e0e0e0 100%)',
          'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      style={{
        backgroundSize: '200% 100%',
      }}
      {...props as any}
    />
  )
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft">
      <Skeleton className="w-full aspect-square rounded-xl mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  )
}

export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MenuItemSkeleton key={i} />
      ))}
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}
