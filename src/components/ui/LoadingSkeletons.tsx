/**
 * ============================================================================
 * Kaprao52 - Loading Skeletons
 * ============================================================================
 * Beautiful skeleton loaders for better UX
 */

import { motion } from 'framer-motion'

// ============================================
// Base Skeleton Pulse
// ============================================
function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-gray-200 rounded-lg ${className}`}
    />
  )
}

// ============================================
// Menu Item Skeleton
// ============================================
export function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex gap-4">
        <SkeletonPulse className="w-24 h-24 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-3/4" />
          <SkeletonPulse className="h-4 w-1/2" />
          <SkeletonPulse className="h-4 w-2/3" />
          <div className="flex items-center justify-between pt-2">
            <SkeletonPulse className="h-6 w-16" />
            <SkeletonPulse className="h-8 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Menu Grid Skeleton
// ============================================
export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <MenuItemSkeleton key={i} />
      ))}
    </div>
  )
}

// ============================================
// Order Card Skeleton
// ============================================
export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <SkeletonPulse className="h-5 w-24" />
        <SkeletonPulse className="h-5 w-20 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <SkeletonPulse className="h-4 w-full" />
        <SkeletonPulse className="h-4 w-2/3" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t">
        <SkeletonPulse className="h-5 w-16" />
        <SkeletonPulse className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}

// ============================================
// Order List Skeleton
// ============================================
export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ============================================
// Profile Skeleton
// ============================================
export function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 text-center">
        <SkeletonPulse className="w-24 h-24 rounded-full mx-auto mb-4" />
        <SkeletonPulse className="h-6 w-32 mx-auto mb-2" />
        <SkeletonPulse className="h-4 w-20 mx-auto" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4">
          <SkeletonPulse className="h-8 w-12 mx-auto mb-2" />
          <SkeletonPulse className="h-4 w-16 mx-auto" />
        </div>
        <div className="bg-white rounded-2xl p-4">
          <SkeletonPulse className="h-8 w-12 mx-auto mb-2" />
          <SkeletonPulse className="h-4 w-16 mx-auto" />
        </div>
        <div className="bg-white rounded-2xl p-4">
          <SkeletonPulse className="h-8 w-12 mx-auto mb-2" />
          <SkeletonPulse className="h-4 w-16 mx-auto" />
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <SkeletonPulse className="h-12 w-full rounded-xl" />
        <SkeletonPulse className="h-12 w-full rounded-xl" />
        <SkeletonPulse className="h-12 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ============================================
// Hero Skeleton
// ============================================
export function HeroSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden">
      <SkeletonPulse className="h-48 w-full" />
    </div>
  )
}

// ============================================
// Category Tabs Skeleton
// ============================================
export function CategoryTabsSkeleton() {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
      ))}
    </div>
  )
}

// ============================================
// Cart Skeleton
// ============================================
export function CartSkeleton() {
  return (
    <div className="space-y-4">
      {/* Cart Items */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 flex gap-4">
          <SkeletonPulse className="w-20 h-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonPulse className="h-5 w-3/4" />
            <SkeletonPulse className="h-4 w-1/3" />
            <div className="flex justify-between items-center">
              <SkeletonPulse className="h-6 w-20" />
              <SkeletonPulse className="h-8 w-24" />
            </div>
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 space-y-3">
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-4 w-16" />
        </div>
        <SkeletonPulse className="h-10 w-full rounded-xl" />
      </div>
    </div>
  )
}

// ============================================
// Admin Dashboard Skeleton
// ============================================
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4">
            <SkeletonPulse className="h-4 w-16 mb-2" />
            <SkeletonPulse className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-white rounded-2xl p-6">
        <SkeletonPulse className="h-6 w-32 mb-4" />
        <SkeletonPulse className="h-48 w-full rounded-xl" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6">
        <SkeletonPulse className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Full Page Skeleton
// ============================================
export function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="h-16 bg-white border-b" />
      <div className="p-4 space-y-4">
        <SkeletonPulse className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
        <MenuGridSkeleton count={4} />
      </div>
    </div>
  )
}
