import { useState, useMemo, forwardRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MoreVertical, Printer, Eye, X, Check, 
  Clock, MapPin, Phone, User, Package, CheckCircle,
  Trash2, CreditCard
} from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus, useCancelOrder, useDeleteOrder } from '@/features/admin/hooks/useAdmin'
import { useAllOrdersRealtime } from '@/features/orders/hooks/useOrders'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderCardSkeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/app/providers/ToastProvider'
import type { Order, OrderStatus } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'

const statusTabs: { status: OrderStatus | 'all'; label: string; color: string }[] = [
  { status: 'all', label: 'ทั้งหมด', color: 'bg-gray-500' },
  { status: 'placed', label: 'รอดำเนินการ', color: 'bg-amber-500' },
  { status: 'preparing', label: 'กำลังทำ', color: 'bg-orange-500' },
  { status: 'ready', label: 'พร้อมเสิร์ฟ', color: 'bg-blue-500' },
  { status: 'delivered', label: 'เสร็จสิ้น', color: 'bg-green-500' },
  { status: 'cancelled', label: 'ยกเลิก', color: 'bg-red-500' },
]

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  placed: 'bg-amber-100 text-amber-700 border-amber-200',
  confirmed: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  preparing: 'bg-orange-100 text-orange-700 border-orange-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'รอดำเนินการ',
  placed: 'รอดำเนินการ',
  confirmed: 'ยืนยันแล้ว',
  preparing: 'กำลังทำ',
  ready: 'พร้อมเสิร์ฟ',
  delivered: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
}

export default function AdminOrdersPage() {
  // const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  
  const initialStatus = (searchParams.get('status') as OrderStatus | 'all') || 'all'
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>(initialStatus)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null)

  const { data: orders, isLoading } = useAllOrders()
  const updateStatusMutation = useUpdateOrderStatus()
  const cancelOrderMutation = useCancelOrder()
  const deleteOrderMutation = useDeleteOrder()
  
  useAllOrdersRealtime()

  // Update URL when tab changes
  const handleTabChange = (status: OrderStatus | 'all') => {
    setActiveTab(status)
    if (status === 'all') {
      searchParams.delete('status')
    } else {
      searchParams.set('status', status)
    }
    setSearchParams(searchParams)
  }

  // Filter orders
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    
    return orders.filter((order) => {
      const matchesTab = activeTab === 'all' || order.status === activeTab
      const matchesSearch =
        order.id.toString().includes(searchQuery) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.phoneNumber?.includes(searchQuery)
      
      // Date filter
      let matchesDate = true
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        if (dateFilter === 'today') {
          matchesDate = orderDate.toDateString() === now.toDateString()
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= weekAgo
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDate = orderDate >= monthAgo
        }
      }
      
      return matchesTab && matchesSearch && matchesDate
    })
  }, [orders, activeTab, searchQuery, dateFilter])

  // Stats
  const stats = useMemo(() => {
    if (!orders) return null
    return {
      total: orders.length,
      pending: orders.filter(o => ['placed', 'pending'].includes(o.status)).length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      revenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalPrice, 0),
    }
  }, [orders])

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus })
      showToast({
        type: 'success',
        title: 'อัพเดตสถานะสำเร็จ',
        message: `ออเดอร์ #${orderId} ถูกอัพเดตเป็น ${statusLabels[newStatus]}`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ไม่สามารถอัพเดตสถานะได้',
        message: 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    
    try {
      await cancelOrderMutation.mutateAsync({ orderId: orderToCancel, reason: cancelReason })
      setShowCancelModal(false)
      setCancelReason('')
      setOrderToCancel(null)
      showToast({
        type: 'success',
        title: 'ยกเลิกออเดอร์สำเร็จ',
        message: `ออเดอร์ #${orderToCancel} ถูกยกเลิกแล้ว`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ไม่สามารถยกเลิกออเดอร์ได้',
        message: 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบออเดอร์ #${orderId}?`)) return
    
    try {
      await deleteOrderMutation.mutateAsync(orderId)
      showToast({
        type: 'success',
        title: 'ลบออเดอร์สำเร็จ',
        message: `ออเดอร์ #${orderId} ถูกลบแล้ว`,
      })
    } catch (error) {
      showToast({
        type: 'error',
        title: 'ไม่สามารถลบออเดอร์ได้',
        message: 'กรุณาลองใหม่อีกครั้ง',
      })
    }
  }

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
  }

  const printOrder = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML(order))
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการออเดอร์</h1>
          <p className="text-gray-500">ดูและจัดการออเดอร์ทั้งหมด</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 bg-white"
          >
            <option value="all">ทุกช่วงเวลา</option>
            <option value="today">วันนี้</option>
            <option value="week">7 วันล่าสุด</option>
            <option value="month">30 วันล่าสุด</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาออเดอร์..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="ทั้งหมด" value={stats.total} color="bg-gray-500" />
          <StatCard label="รอดำเนินการ" value={stats.pending} color="bg-amber-500" />
          <StatCard label="กำลังทำ" value={stats.preparing} color="bg-orange-500" />
          <StatCard label="พร้อมเสิร์ฟ" value={stats.ready} color="bg-blue-500" />
          <StatCard label="เสร็จสิ้น" value={stats.delivered} color="bg-green-500" />
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-4 text-white">
            <p className="text-xs font-medium opacity-80">รายได้รวม</p>
            <p className="text-lg font-black">{formatPrice(stats.revenue)}</p>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.status}
            onClick={() => handleTabChange(tab.status)}
            className={cn(
              'px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === tab.status
                ? 'bg-brand-500 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            <span className={`w-2 h-2 rounded-full ${tab.color}`}></span>
            {tab.label}
            {tab.status !== 'all' && orders && (
              <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {orders.filter((o) => o.status === tab.status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-bold">ไม่พบออเดอร์</p>
          <p className="text-sm">ลองเปลี่ยนตัวกรองหรือค้นหาใหม่</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredOrders?.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={() => openOrderDetail(order)}
                onPrint={() => printOrder(order)}
                onUpdateStatus={handleStatusUpdate}
                onCancel={() => {
                  setOrderToCancel(order.id)
                  setShowCancelModal(true)
                }}
                onDelete={() => handleDeleteOrder(order.id)}
                isUpdating={updateStatusMutation.isPending}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setShowDetailModal(false)}
            onUpdateStatus={handleStatusUpdate}
            onPrint={() => printOrder(selectedOrder)}
            isUpdating={updateStatusMutation.isPending}
          />
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelModal
            reason={cancelReason}
            onReasonChange={setCancelReason}
            onConfirm={handleCancelOrder}
            onCancel={() => {
              setShowCancelModal(false)
              setCancelReason('')
              setOrderToCancel(null)
            }}
            isLoading={cancelOrderMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className={`w-2 h-2 rounded-full ${color} mb-2`}></div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-black text-gray-800">{value}</p>
    </div>
  )
}

// Order Card Component
interface OrderCardProps {
  order: Order
  onView: () => void
  onPrint: () => void
  onUpdateStatus: (orderId: number, status: OrderStatus) => void
  onCancel: () => void
  onDelete: () => void
  isUpdating: boolean
}

const OrderCard = forwardRef<HTMLDivElement, OrderCardProps>(
  ({ order, onView, onPrint, onUpdateStatus, onCancel, onDelete, isUpdating }, ref) => {
    const [showActions, setShowActions] = useState(false)

    const getNextStatus = (current: OrderStatus): OrderStatus | null => {
      const flow: Record<OrderStatus, OrderStatus | null> = {
        pending: 'preparing',
        placed: 'preparing',
        confirmed: 'preparing',
        preparing: 'ready',
        ready: 'delivered',
        delivered: null,
        cancelled: null,
      }
      return flow[current]
    }

    const nextStatus = getNextStatus(order.status)

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Card className="h-full flex flex-col">
        <div className="p-5 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">ออเดอร์ #{order.id}</p>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                {order.customerName}
              </h3>
            </div>
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
          </div>

          {/* Time & Contact */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <Clock className="w-4 h-4" />
              {formatOrderDate(order.createdAt)}
            </div>
            {order.phoneNumber && (
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="w-4 h-4" />
                {order.phoneNumber}
              </div>
            )}
            <div className="flex items-start gap-2 text-gray-500">
              <MapPin className="w-4 h-4 mt-0.5" />
              <div>
                <span className="font-medium">
                  {order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : 'ส่งในหมู่บ้าน'}
                </span>
                {order.address && (
                  <p className="text-xs text-gray-400 mt-0.5 whitespace-pre-line">{order.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-2 mb-4 bg-gray-50 rounded-xl p-3">
            {order.items.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-gray-500">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-sm text-gray-400 text-center">
                +{order.items.length - 3} รายการอื่น
              </p>
            )}
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
              <span className="font-bold">หมายเหตุ:</span> {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-400">ยอดรวม</p>
              <p className="text-xl font-black text-brand-600">{formatPrice(order.totalPrice)}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <CreditCard className="w-4 h-4" />
              {order.paymentMethod === 'cod' ? 'เงินสด' : 
               order.paymentMethod === 'transfer' ? 'โอนเงิน' : 'พร้อมเพย์'}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {nextStatus && order.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(order.id, nextStatus)}
                disabled={isUpdating}
                className="flex-1 px-3 py-2 bg-brand-500 text-white text-sm font-bold rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {nextStatus === 'preparing' && 'เริ่มทำ'}
                {nextStatus === 'ready' && 'พร้อมส่ง'}
                {nextStatus === 'delivered' && 'ส่งสำเร็จ'}
              </button>
            )}
            
            <button
              onClick={onView}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={onPrint}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* More Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      onClick={() => {
                        onCancel()
                        setShowActions(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      ยกเลิกออเดอร์
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDelete()
                      setShowActions(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    ลบออเดอร์
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
})
OrderCard.displayName = 'OrderCard'

// Order Detail Modal
interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  onUpdateStatus: (orderId: number, status: OrderStatus) => void
  onPrint: () => void
  isUpdating: boolean
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onPrint, isUpdating }: OrderDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">รายละเอียดออเดอร์ #{order.id}</h2>
            <p className="text-sm text-gray-500">{formatOrderDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[order.status]}>
              {statusLabels[order.status]}
            </Badge>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">ข้อมูลลูกค้า</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{order.customerName}</span>
              </div>
              {order.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{order.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : 'ส่งในหมู่บ้าน'}
                  </p>
                  {order.address && (
                    <p className="text-gray-500 whitespace-pre-line">{order.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">รายการอาหาร</h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    {item.options && item.options.length > 0 && (
                      <p className="text-sm text-gray-500">
                        {item.options.map(o => o.name).join(', ')}
                      </p>
                    )}
                    {item.note && (
                      <p className="text-sm text-amber-600 mt-1">หมายเหตุ: {item.note}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{item.quantity} x {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-bold text-gray-800">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.specialInstructions && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <h3 className="font-bold text-amber-800 mb-1">คำแนะนำพิเศษ</h3>
              <p className="text-amber-700">{order.specialInstructions}</p>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ยอดรวม</span>
                <span>{formatPrice(order.subtotalPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>ส่วนลด {order.discountCode && `(${order.discountCode})`}</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              {order.pointsRedeemed > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>ใช้พอยต์</span>
                  <span>-{order.pointsRedeemed} พอยต์</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>ยอดสุทธิ</span>
                <span className="text-brand-600">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">
                {order.paymentMethod === 'cod' ? 'เงินสด' : 
                 order.paymentMethod === 'transfer' ? 'โอนเงิน' : 'พร้อมเพย์'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">
                สถานะการชำระ: {order.paymentStatus === 'paid' ? 'ชำระแล้ว' : 'รอชำระ'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <>
              {order.status === 'placed' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'preparing')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  เริ่มทำอาหาร
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'ready')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  พร้อมเสิร์ฟ
                </button>
              )}
              {order.status === 'ready' && (
                <button
                  onClick={() => onUpdateStatus(order.id, 'delivered')}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  ส่งสำเร็จ
                </button>
              )}
            </>
          )}
          <button
            onClick={onPrint}
            className="px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Printer className="w-5 h-5" />
            พิมพ์
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Cancel Modal
interface CancelModalProps {
  reason: string
  onReasonChange: (reason: string) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

function CancelModal({ reason, onReasonChange, onConfirm, onCancel, isLoading }: CancelModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md p-6"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-2">ยกเลิกออเดอร์</h3>
        <p className="text-gray-500 mb-4">กรุณาระบุเหตุผลในการยกเลิก</p>
        
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="เหตุผลการยกเลิก..."
          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 mb-4 resize-none"
          rows={3}
        />
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'ยืนยันการยกเลิก'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// Generate Receipt HTML
function generateReceiptHTML(order: Order): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${formatPrice(item.price)}</td>
      <td>${formatPrice(item.subtotal)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ใบเสร็จ #${order.id}</title>
      <style>
        body { font-family: 'Sarabun', sans-serif; padding: 20px; max-width: 300px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { text-align: left; padding: 5px; font-size: 14px; }
        th { border-bottom: 1px solid #000; }
        .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>KAPRAO52</h1>
        <p>ใบเสร็จรับเงิน</p>
        <p>ออเดอร์ #${order.id}</p>
        <p>${new Date(order.createdAt).toLocaleString('th-TH')}</p>
      </div>
      
      <div>
        <p><strong>ลูกค้า:</strong> ${order.customerName}</p>
        <p><strong>โทร:</strong> ${order.phoneNumber || '-'}</p>
        <p><strong>ที่อยู่:</strong> ${order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : 'ส่งในหมู่บ้าน'}</p>
        ${order.address ? `<p>${order.address.replace(/\n/g, '<br>')}</p>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>รายการ</th>
            <th>จำนวน</th>
            <th>ราคา</th>
            <th>รวม</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>
      
      <div class="total">
        <div class="total-row">
          <span>ยอดรวม</span>
          <span>${formatPrice(order.subtotalPrice)}</span>
        </div>
        ${order.discountAmount > 0 ? `
        <div class="total-row">
          <span>ส่วนลด</span>
          <span>-${formatPrice(order.discountAmount)}</span>
        </div>
        ` : ''}
        ${order.pointsRedeemed > 0 ? `
        <div class="total-row">
          <span>ใช้พอยต์</span>
          <span>-${order.pointsRedeemed} พอยต์</span>
        </div>
        ` : ''}
        <div class="total-row grand-total">
          <span>ยอดสุทธิ</span>
          <span>${formatPrice(order.totalPrice)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>ขอบคุณที่ใช้บริการ</p>
        <p>KAPRAO52 - กะเพราคุณภาพ ส่งตรงถึงคุณ</p>
      </div>
    </body>
    </html>
  `
}
