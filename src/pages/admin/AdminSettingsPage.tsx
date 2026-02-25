import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { ShopConfigManager } from '@/features/config/components/ShopConfigManager'
import { GlobalStockManager } from '@/features/menu/components/GlobalStockManager'
import { AdminCouponManager } from '@/features/coupons/components/AdminCouponManager'
import { trackPageView } from '@/lib/analytics'

/**
 * Admin Settings Page
 * Manage shop configuration including hours, contact info, and payment settings
 */
export default function AdminSettingsPage() {
  // useConfigRealtime removed as it's not exported

  useEffect(() => {
    trackPageView('/admin/settings', 'Admin Settings')
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าร้านค้า</h1>
          <p className="text-sm text-gray-500">จัดการเวลาทำการ ข้อมูลติดต่อ และการชำระเงิน</p>
        </div>
      </div>

      {/* Stock Manager */}
      <GlobalStockManager />

      {/* Config Manager */}
      <ShopConfigManager />

      {/* Coupon Manager */}
      <AdminCouponManager />
    </motion.div>
  )
}
