import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Crown, ShoppingBag, Award, Loader2, Search, 
  ArrowUpDown, TrendingUp, Gift, Calendar, Phone,
  Mail, ChevronRight, X
} from 'lucide-react'
import { useCustomers, useUpdateCustomerPoints } from '@/features/admin/hooks/useAdmin'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useToast } from '@/app/providers/ToastProvider'
import { staggerContainer, fadeInUp } from '@/animations/variants'
import { formatPrice } from '@/utils/formatPrice'
import { cn } from '@/utils/cn'
import type { CustomerWithStats } from '@/types'

const tierOptions = [
  { value: 'all', label: 'ทุกระดับ', color: 'bg-gray-100 text-gray-600' },
  { value: 'MEMBER', label: 'สมาชิก', color: 'bg-gray-100 text-gray-600' },
  { value: 'SILVER', label: 'Silver', color: 'bg-gray-200 text-gray-700' },
  { value: 'GOLD', label: 'Gold', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'VIP', label: 'VIP', color: 'bg-emerald-100 text-emerald-700' },
]

const sortOptions = [
  { value: 'orders', label: 'จำนวนออเดอร์', icon: ShoppingBag },
  { value: 'spent', label: 'ยอดใช้จ่าย', icon: TrendingUp },
  { value: 'points', label: 'พอยต์', icon: Award },
  { value: 'recent', label: 'ออเดอร์ล่าสุด', icon: Calendar },
]

export default function AdminCustomersPage() {
  const { showToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'orders' | 'spent' | 'points' | 'recent'>('orders')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPointsModal, setShowPointsModal] = useState(false)
  const [pointsToAdd, setPointsToAdd] = useState('')
  const [pointsReason, setPointsReason] = useState('')

  const { data: customers, isLoading } = useCustomers()
  const updatePointsMutation = useUpdateCustomerPoints()

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    if (!customers) return []
    
    let items = customers.filter((customer) => {
      const matchesSearch = 
        customer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.phoneNumber?.includes(searchQuery) ?? false) ||
        (customer.email?.includes(searchQuery) ?? false)
      const matchesTier = selectedTier === 'all' || customer.tier === selectedTier
      return matchesSearch && matchesTier
    })
    
    // Sort
    items = [...items].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'orders') {
        comparison = a.totalOrders - b.totalOrders
      } else if (sortBy === 'spent') {
        comparison = a.totalSpent - b.totalSpent
      } else if (sortBy === 'points') {
        comparison = a.points - b.points
      } else if (sortBy === 'recent') {
        comparison = new Date(a.lastOrderAt || 0).getTime() - new Date(b.lastOrderAt || 0).getTime()
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })
    
    return items
  }, [customers, searchQuery, selectedTier, sortBy, sortOrder])

  // Stats
  const stats = useMemo(() => {
    if (!customers) return null
    return {
      total: customers.length,
      vip: customers.filter(c => c.tier === 'VIP').length,
      gold: customers.filter(c => c.tier === 'GOLD').length,
      totalPoints: customers.reduce((sum, c) => sum + c.points, 0),
      totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    }
  }, [customers])

  const handleUpdatePoints = async () => {
    if (!selectedCustomer || !pointsToAdd) return
    
    const newPoints = selectedCustomer.points + parseInt(pointsToAdd)
    
    try {
      await updatePointsMutation.mutateAsync({
        customerId: selectedCustomer.id,
        points: newPoints,
        reason: pointsReason || 'ปรับพอยต์โดยแอดมิน',
      })
      
      setShowPointsModal(false)
      setPointsToAdd('')
      setPointsReason('')
      
      showToast({
        type: 'success',
        title: 'อัพเดตพอยต์สำเร็จ',
        message: `${selectedCustomer.displayName} มีพอยต์ ${newPoints.toLocaleString()} แต้ม`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ไม่สามารถอัพเดตพอยต์ได้',
        message: 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  const openCustomerDetail = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer)
    setShowDetailModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!customers?.length) {
    return (
      <EmptyState
        type="generic"
        title="ยังไม่มีลูกค้า"
        description="ระบบจะแสดงรายชื่อลูกค้าที่สมัครสมาชิก"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการลูกค้า</h1>
          <p className="text-gray-500">ระบบ CRM ดูข้อมูลและจัดการลูกค้า</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            icon={Users}
            label="ลูกค้าทั้งหมด"
            value={stats.total}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Crown}
            label="VIP & Gold"
            value={stats.vip + stats.gold}
            color="bg-emerald-100 text-emerald-600"
          />
          <StatCard
            icon={Award}
            label="พอยต์รวม"
            value={stats.totalPoints.toLocaleString()}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={TrendingUp}
            label="ยอดใช้จ่ายรวม"
            value={formatPrice(stats.totalSpent)}
            color="bg-orange-100 text-orange-600"
            isCurrency
          />
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Tier Filter */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {tierOptions.map((tier) => (
            <button
              key={tier.value}
              onClick={() => setSelectedTier(tier.value)}
              className={cn(
                'px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all',
                selectedTier === tier.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-gray-500">จัดเรียง:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 bg-white"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50"
          >
            <ArrowUpDown className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customers Grid */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold">ไม่พบลูกค้า</p>
            <p className="text-sm">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                index={index}
                onClick={() => openCustomerDetail(customer)}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Customer Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedCustomer && (
          <CustomerDetailModal
            customer={selectedCustomer}
            onClose={() => setShowDetailModal(false)}
            onUpdatePoints={() => {
              setShowDetailModal(false)
              setShowPointsModal(true)
            }}
          />
        )}
      </AnimatePresence>

      {/* Points Modal */}
      <AnimatePresence>
        {showPointsModal && selectedCustomer && (
          <PointsModal
            customer={selectedCustomer}
            pointsToAdd={pointsToAdd}
            onPointsChange={setPointsToAdd}
            reason={pointsReason}
            onReasonChange={setPointsReason}
            onConfirm={handleUpdatePoints}
            onCancel={() => {
              setShowPointsModal(false)
              setPointsToAdd('')
              setPointsReason('')
            }}
            isLoading={updatePointsMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  // isCurrency = false,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  isCurrency?: boolean
}) {
  return (
    <Card>
      <div className="p-5">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-black text-gray-800 mt-1">{value}</p>
      </div>
    </Card>
  )
}

// Customer Card Component
interface CustomerCardProps {
  customer: CustomerWithStats
  index: number
  onClick: () => void
}

function CustomerCard({ customer, index, onClick }: CustomerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card isHoverable onClick={onClick}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {customer.pictureUrl ? (
                  <img
                    src={customer.pictureUrl}
                    alt={customer.displayName}
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  customer.displayName?.[0] || '?'
                )}
              </div>
              <TierBadge tier={customer.tier} className="absolute -bottom-1 -right-1" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 truncate text-lg">{customer.displayName}</h3>
              
              {customer.phoneNumber && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {customer.phoneNumber}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <Award className="w-4 h-4" />
                  {customer.points.toLocaleString()} พอยต์
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <ShoppingBag className="w-4 h-4" />
                  {customer.totalOrders} ออเดอร์
                </span>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400">ยอดใช้จ่าย</p>
              <p className="font-bold text-gray-800">{formatPrice(customer.totalSpent)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">ออเดอร์ล่าสุด</p>
              <p className="font-bold text-gray-800">
                {customer.lastOrderAt 
                  ? new Date(customer.lastOrderAt).toLocaleDateString('th-TH')
                  : '-'
                }
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Tier Badge Component
function TierBadge({ tier, className = '' }: { tier: string; className?: string }) {
  const colors: Record<string, string> = {
    MEMBER: 'bg-gray-100 text-gray-600 border-gray-200',
    SILVER: 'bg-gray-200 text-gray-700 border-gray-300',
    GOLD: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    VIP: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[tier] || colors.MEMBER} ${className}`}>
      {tier}
    </span>
  )
}

// Customer Detail Modal
interface CustomerDetailModalProps {
  customer: CustomerWithStats
  onClose: () => void
  onUpdatePoints: () => void
}

function CustomerDetailModal({ customer, onClose, onUpdatePoints }: CustomerDetailModalProps) {
  // const { data: customerDetail } = useCustomerDetail(customer.id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-3xl">
              {customer.pictureUrl ? (
                <img src={customer.pictureUrl} alt={customer.displayName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                customer.displayName?.[0] || '?'
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-800">{customer.displayName}</h2>
                <TierBadge tier={customer.tier} />
              </div>
              <p className="text-gray-500">สมัครเมื่อ {new Date(customer.joinedAt).toLocaleDateString('th-TH')}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <Award className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-emerald-700">{customer.points.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">พอยต์</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-blue-700">{customer.totalOrders}</p>
              <p className="text-xs text-blue-600">ออเดอร์</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-black text-green-700">{formatPrice(customer.totalSpent)}</p>
              <p className="text-xs text-green-600">ยอดใช้จ่าย</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">ข้อมูลติดต่อ</h3>
            <div className="space-y-2">
              {customer.phoneNumber && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{customer.phoneNumber}</span>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tier Progress */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">ระดับสมาชิก</h3>
            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all"
                style={{ width: `${customer.tierProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              ความคืบหน้า {customer.tierProgress}% สู่ระดับถัดไป
            </p>
          </div>

          {/* Recent Orders Preview */}
          <div>
            <h3 className="font-bold text-gray-800 mb-3">ออเดอร์ล่าสุด</h3>
            <div className="space-y-2">
              {customer.lastOrderAt ? (
                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">ออเดอร์ล่าสุด</p>
                      <p className="text-sm text-gray-500">
                        {new Date(customer.lastOrderAt).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">ยังไม่มีออเดอร์</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onUpdatePoints}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <Gift className="w-5 h-5" />
            ปรับพอยต์
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ปิด
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Points Modal
interface PointsModalProps {
  customer: CustomerWithStats
  pointsToAdd: string
  onPointsChange: (value: string) => void
  reason: string
  onReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function PointsModal({ 
  customer, 
  pointsToAdd, 
  onPointsChange, 
  reason, 
  onReasonChange,
  onConfirm, 
  onCancel, 
  isLoading 
}: PointsModalProps) {
  const newPoints = customer.points + (parseInt(pointsToAdd) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">ปรับพอยต์</h3>
        <p className="text-gray-500 mb-4">{customer.displayName}</p>
        
        <div className="bg-emerald-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-emerald-600">พอยต์ปัจจุบัน</p>
          <p className="text-2xl font-black text-emerald-700">{customer.points.toLocaleString()} แต้ม</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            เพิ่ม/ลด พอยต์ (ใส่ติดลบเพื่อหัก)
          </label>
          <input
            type="number"
            value={pointsToAdd}
            onChange={(e) => onPointsChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500"
            placeholder="เช่น 100 หรือ -50"
          />
        </div>

        {pointsToAdd && (
          <div className="mb-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">พอยต์ใหม่</p>
            <p className={`text-xl font-bold ${newPoints >= customer.points ? 'text-green-600' : 'text-red-600'}`}>
              {newPoints.toLocaleString()} แต้ม
            </p>
          </div>
        )}
        
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">เหตุผล</label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="เหตุผลในการปรับพอยต์..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 resize-none"
            rows={2}
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !pointsToAdd}
            className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
