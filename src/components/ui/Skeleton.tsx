import { cn } from '@/utils/cn'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean
}

/**
 * Skeleton placeholder. Uses the CSS `.skeleton` shimmer keyframe from globals.css
 * (single animated layer is much cheaper than animating an inline gradient via JS).
 */
export function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('rounded-lg', animate ? 'skeleton' : 'bg-gray-200', className)}
      {...props}
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
