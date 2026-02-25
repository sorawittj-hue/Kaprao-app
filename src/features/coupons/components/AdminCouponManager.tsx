import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Power, 
  PowerOff,
  Search,
  Calendar,
  Tag,
  Percent,
  Truck,
  Copy,
  Check,
  TrendingUp,
  Users,
  DollarSign,
  X,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatPrice } from '@/utils/formatPrice'
import { 
  useAllCoupons, 
  useCreateCoupon, 
  useUpdateCoupon, 
  useDeactivateCoupon,
  useDeleteCoupon,
  useCouponStats 
} from '../hooks/useCoupons'
import type { Coupon, DiscountType, CouponFormData } from '../types/coupon.types'

// ==================== Coupon Form Modal ====================

interface CouponFormModalProps {
  isOpen: boolean
  onClose: () => void
  coupon?: Coupon | null
}

function CouponFormModal({ isOpen, onClose, coupon }: CouponFormModalProps) {
  const isEditing = !!coupon
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()

  const [formData, setFormData] = useState<CouponFormData>({
    code: coupon?.code || '',
    name: coupon?.name || '',
    description: coupon?.description || '',
    discountType: coupon?.discountType || 'fixed',
    discountValue: coupon?.discountValue || 0,
    minOrderAmount: coupon?.minOrderAmount || 0,
    maxDiscount: coupon?.maxDiscount ?? null,
    usageLimit: coupon?.usageLimit ?? null,
    perUserLimit: coupon?.perUserLimit || 1,
    applicableItems: coupon?.applicableItems || [],
    excludedItems: coupon?.excludedItems || [],
    startsAt: coupon?.startsAt ? new Date(coupon.startsAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '',
    isActive: coupon?.isActive ?? true,
  })

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      if (isEditing && coupon) {
        await updateMutation.mutateAsync({ id: coupon.id, updates: formData })
      } else {
        await createMutation.mutateAsync(formData)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    }
  }

  const discountTypes: { value: DiscountType; label: string; icon: React.ReactNode }[] = [
    { value: 'fixed', label: 'ส่วนลดจำนวนคงที่', icon: <Tag className="w-4 h-4" /> },
    { value: 'percentage', label: 'ส่วนลดเป็นเปอร์เซ็นต์', icon: <Percent className="w-4 h-4" /> },
    { value: 'free_delivery', label: 'ส่งฟรี', icon: <Truck className="w-4 h-4" /> },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEditing ? 'แก้ไขคูปอง' : 'สร้างคูปองใหม่'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Code & Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รหัสคูปอง *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="KAPRAO10"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm font-mono"
                  required
                  disabled={isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อคูปอง *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ส่วนลด 10%"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียด
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="รายละเอียดเพิ่มเติม..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm resize-none"
              />
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทส่วนลด
              </label>
              <div className="grid grid-cols-3 gap-2">
                {discountTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: type.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-xs font-medium',
                      formData.discountType === type.value
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    )}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.discountType === 'percentage' ? 'เปอร์เซ็นต์ (%)' : 'จำนวน (บาท)'} *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  min={0}
                  max={formData.discountType === 'percentage' ? 100 : undefined}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                  required
                />
              </div>
              
              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ส่วนลดสูงสุด (บาท)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : null })}
                    min={0}
                    placeholder="ไม่จำกัด"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                  />
                </div>
              )}
            </div>

            {/* Limits */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ยอดขั้นต่ำ
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                  min={0}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  จำกัดใช้ทั้งหมด
                </label>
                <input
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : null })}
                  min={1}
                  placeholder="ไม่จำกัด"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ต่อคน
                </label>
                <input
                  type="number"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: Number(e.target.value) })}
                  min={1}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เริ่มใช้งาน *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หมดอายุ
                </label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt || ''}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
                />
              </div>
            </div>

            {/* Active Status */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-400"
              />
              <span className="text-sm text-gray-700">เปิดใช้งานทันที</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  กำลังบันทึก...
                </span>
              ) : (
                isEditing ? 'บันทึกการแก้ไข' : 'สร้างคูปอง'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

// ==================== Stats Card ====================

function StatsCard({ 
  coupon, 
  isExpanded
}: { 
  coupon: Coupon
  isExpanded: boolean
}) {
  const { data: stats } = useCouponStats(isExpanded ? coupon.id : undefined)

  return (
    <motion.div
      initial={false}
      animate={{ height: isExpanded ? 'auto' : 0 }}
      className="overflow-hidden"
    >
      {isExpanded && stats && (
        <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-lg font-bold">{stats.totalUsage}</span>
            </div>
            <p className="text-xs text-gray-500">ใช้งานทั้งหมด</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-lg font-bold">{stats.uniqueUsers}</span>
            </div>
            <p className="text-xs text-gray-500">ผู้ใช้</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-lg font-bold">{formatPrice(stats.totalDiscountGiven)}</span>
            </div>
            <p className="text-xs text-gray-500">ส่วนลดรวม</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ==================== Main Admin Component ====================

export function AdminCouponManager() {
  const { data: coupons, isLoading } = useAllCoupons()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const deactivateMutation = useDeactivateCoupon()
  const deleteMutation = useDeleteCoupon()

  const handleCopy = async (code: string, id: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Silent fail
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingCoupon(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCoupon(null)
  }

  const handleToggleStatus = async (coupon: Coupon) => {
    if (coupon.isActive) {
      await deactivateMutation.mutateAsync(coupon.id)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบคูปองนี้?')) {
      await deleteMutation.mutateAsync(id)
    }
  }

  const filteredCoupons = coupons?.filter(coupon =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    coupon.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    const startsAt = new Date(coupon.startsAt)
    const expiresAt = coupon.expiresAt ? new Date(coupon.expiresAt) : null

    if (!coupon.isActive) {
      return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">ปิดใช้งาน</span>
    }
    if (startsAt > now) {
      return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">รอเปิดใช้งาน</span>
    }
    if (expiresAt && expiresAt < now) {
      return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-medium">หมดอายุ</span>
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-medium">ใช้ครบแล้ว</span>
    }
    return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">ใช้งานได้</span>
  }

  const getDiscountLabel = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}%`
      case 'free_delivery':
        return 'ส่งฟรี'
      default:
        return formatPrice(coupon.discountValue)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการคูปอง</h1>
          <p className="text-sm text-gray-500 mt-1">สร้างและจัดการคูปองส่วนลดทั้งหมด</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25"
        >
          <Plus className="w-5 h-5" />
          สร้างคูปองใหม่
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ค้นหาคูปอง..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none text-sm"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">คูปองทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-800">{coupons?.length || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">เปิดใช้งาน</p>
          <p className="text-2xl font-bold text-green-600">
            {coupons?.filter(c => c.isActive).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">หมดอายุ</p>
          <p className="text-2xl font-bold text-red-500">
            {coupons?.filter(c => c.expiresAt && new Date(c.expiresAt) < new Date()).length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">ใช้ครบแล้ว</p>
          <p className="text-2xl font-bold text-amber-500">
            {coupons?.filter(c => c.usageLimit && c.usageCount >= c.usageLimit).length || 0}
          </p>
        </div>
      </div>

      {/* Coupon List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredCoupons?.map((coupon) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Discount Badge */}
                    <div className={cn(
                      'flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white font-bold',
                      coupon.isActive 
                        ? 'bg-gradient-to-br from-orange-500 to-orange-400'
                        : 'bg-gray-400'
                    )}>
                      {coupon.discountType === 'percentage' && <Percent className="w-5 h-5" />}
                      {coupon.discountType === 'fixed' && <Tag className="w-5 h-5" />}
                      {coupon.discountType === 'free_delivery' && <Truck className="w-5 h-5" />}
                      <span className="text-xs mt-0.5">{getDiscountLabel(coupon)}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-800">{coupon.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-600">
                              {coupon.code}
                            </code>
                            <button
                              onClick={() => handleCopy(coupon.code, coupon.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {copiedId === coupon.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            {getStatusBadge(coupon)}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                        {coupon.minOrderAmount > 0 && (
                          <span>ขั้นต่ำ {formatPrice(coupon.minOrderAmount)}</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {coupon.expiresAt 
                            ? new Date(coupon.expiresAt).toLocaleDateString('th-TH')
                            : 'ไม่มีวันหมดอายุ'
                          }
                        </span>
                        {coupon.usageLimit && (
                          <span>
                            ใช้แล้ว {coupon.usageCount}/{coupon.usageLimit}
                          </span>
                        )}
                      </div>

                      {/* Expand Button */}
                      <button
                        onClick={() => setExpandedId(expandedId === coupon.id ? null : coupon.id)}
                        className="flex items-center gap-1 mt-2 text-orange-500 text-xs font-medium hover:text-orange-600"
                      >
                        สถิติการใช้งาน
                        {expandedId === coupon.id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>

                      {/* Stats */}
                      <StatsCard 
                        coupon={coupon} 
                        isExpanded={expandedId === coupon.id}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        disabled={!coupon.isActive}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          coupon.isActive
                            ? 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                            : 'text-gray-300 cursor-not-allowed'
                        )}
                        title={coupon.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งานแล้ว'}
                      >
                        {coupon.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="ลบ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredCoupons?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-500">ไม่พบคูปอง</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <CouponFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            coupon={editingCoupon}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
