import { useState, useMemo, forwardRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MoreVertical, Printer, Eye, X, Check, 
  Clock, MapPin, Phone, User, Package, CheckCircle,
  Trash2, CreditCard, Flame, AlertCircle
} from 'lucide-react'
import { useAllOrders, useUpdateOrderStatus, useCancelOrder, useDeleteOrder } from '@/features/admin/hooks/useAdmin'
import { useAllOrdersRealtime } from '@/features/orders/hooks/useOrders'
import { useToast } from '@/app/providers/ToastProvider'
import type { Order, OrderStatus } from '@/types'
import { formatPrice } from '@/utils/formatPrice'
import { formatOrderDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { hapticLight, hapticMedium, hapticHeavy } from '@/utils/haptics'
import { OrderCardSkeleton } from '@/components/ui/Skeleton'

const slideUpItem = { hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } } }
const staggerList = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }

const statusTabs: { status: OrderStatus | 'all'; label: string; color: string; bg: string }[] = [
  { status: 'all', label: 'ทั้งหมด', color: 'text-gray-500', bg: 'bg-gray-100' },
  { status: 'placed', label: 'รอดำเนินการ', color: 'text-amber-500', bg: 'bg-amber-100' },
  { status: 'preparing', label: 'กำลังทำ', color: 'text-orange-500', bg: 'bg-orange-100' },
  { status: 'ready', label: 'พร้อมเสิร์ฟ', color: 'text-blue-500', bg: 'bg-blue-100' },
  { status: 'delivered', label: 'ส่งสำเร็จ', color: 'text-green-500', bg: 'bg-green-100' },
  { status: 'cancelled', label: 'ยกเลิก', color: 'text-red-500', bg: 'bg-red-100' },
]

const statusConfigs = {
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock, label: 'รอชำระ' },
  placed: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Package, label: 'รอดำเนินการ' },
  confirmed: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: CheckCircle, label: 'รับออเดอร์แล้ว' },
  preparing: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: Flame, label: 'กำลังปรุงด่วน!' },
  ready: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Package, label: 'พร้อมจัดส่ง/รับ' },
  delivered: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: Check, label: 'เสร็จสมบูรณ์' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: X, label: 'ยกเลิกแล้ว' },
}

export default function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { showToast } = useToast()
  
  const initialStatus = (searchParams.get('status') as OrderStatus | 'all') || 'all'
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>(initialStatus)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('today')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  const [cancelReason, setCancelReason] = useState('')
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null)

  const { data: orders, isLoading } = useAllOrders()
  const updateStatusMutation = useUpdateOrderStatus()
  const cancelOrderMutation = useCancelOrder()
  const deleteOrderMutation = useDeleteOrder()
  
  useAllOrdersRealtime()

  // Routing synchronization
  const handleTabChange = (status: OrderStatus | 'all') => {
    hapticMedium()
    setActiveTab(status)
    if (status === 'all') searchParams.delete('status')
    else searchParams.set('status', status)
    setSearchParams(searchParams)
  }

  const filteredOrders = useMemo(() => {
    if (!orders) return []
    return orders.filter((order) => {
      const matchesTab = activeTab === 'all' || order.status === activeTab
      const query = searchQuery.toLowerCase()
      const matchesSearch = String(order.id).includes(query) || order.customerName.toLowerCase().includes(query) || order.phoneNumber?.includes(query)
      
      let matchesDate = true
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt)
        const now = new Date()
        if (dateFilter === 'today') matchesDate = orderDate.toDateString() === now.toDateString()
        else if (dateFilter === 'week') matchesDate = orderDate >= new Date(now.getTime() - 7 * 86400000)
        else if (dateFilter === 'month') matchesDate = orderDate >= new Date(now.getTime() - 30 * 86400000)
      }
      return matchesTab && matchesSearch && matchesDate
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [orders, activeTab, searchQuery, dateFilter])

  const stats = useMemo(() => {
    if (!orders) return null
    return {
      total: orders.length,
      pending: orders.filter(o => ['placed', 'pending'].includes(o.status)).length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalPrice, 0),
    }
  }, [orders])

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    hapticMedium()
    try {
      await updateStatusMutation.mutateAsync({ orderId, status: newStatus })
      showToast({ type: 'success', title: 'อัพเดตออเดอร์แล้ว', message: `ออเดอร์ #${orderId} ถูกเลื่อนสถานะเป็น ${statusConfigs[newStatus].label}` })
    } catch (e) { showToast({ type: 'error', title: 'ไม่สามารถอัพเดตได้', message: 'กรุณาลองใหม่อีกครั้ง' }) }
  }

  const handleCancelOrder = async () => {
    hapticHeavy()
    if (!orderToCancel) return
    try {
      await cancelOrderMutation.mutateAsync({ orderId: orderToCancel, reason: cancelReason })
      setCancelReason('')
      setOrderToCancel(null)
      showToast({ type: 'success', title: 'ยกเลิกสำเร็จ', message: `ออเดอร์ #${orderToCancel} ถูกยกเลิกแล้ว` })
    } catch (e) { showToast({ type: 'error', title: 'ไม่สามารถยกเลิกได้', message: 'กรุณาลองใหม่อีกครั้ง' }) }
  }

  const handleDeleteOrder = async (orderId: number) => {
    hapticHeavy()
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบออเดอร์ #${orderId} ถาวร?`)) return
    try {
       await deleteOrderMutation.mutateAsync(orderId)
       showToast({ type: 'success', title: 'ลบสำเร็จ', message: `ออเดอร์ #${orderId} ถูกลบออกจากระบบแล้ว` })
    } catch (e) { showToast({ type: 'error', title: 'ไม่สามารถลบได้' }) }
  }

  const printOrder = (order: Order) => {
    hapticLight()
    const win = window.open('', '_blank')
    if (win) { win.document.write(generateReceiptHTML(order)); win.document.close(); win.print() }
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Immersive Header */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/5 rounded-full blur-3xl" />
        <div className="relative z-10 flex-1">
           <div className="flex items-center gap-3 mb-1">
             <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center text-[#FF6B00] border border-[#FF6B00]/20"><Package className="w-6 h-6"/></div>
             <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">ออเดอร์ทั้งหมด</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manage your orders seamlessly</p>
             </div>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          <select value={dateFilter} onChange={(e) => { hapticLight(); setDateFilter(e.target.value as any) }} className="h-12 px-4 bg-[#FAFAF9] border-none rounded-2xl font-black text-sm text-gray-700 outline-none focus:ring-2 ring-[#FF6B00]/20 transition-all cursor-pointer">
            <option value="all">ทุกช่วงเวลา</option>
            <option value="today">เฉพาะวันนี้ (แนะนำ)</option>
            <option value="week">7 วันล่าสุด</option>
            <option value="month">30 วันล่าสุด</option>
          </select>
          <div className="relative flex-1 sm:min-w-[240px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input type="text" placeholder="ค้นหารหัส, ชื่อลูกค้า, เบอร์โทร..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pl-11 pr-4 bg-[#FAFAF9] border-none rounded-2xl font-bold text-sm text-gray-900 outline-none focus:ring-2 ring-[#FF6B00]/20 transition-all" />
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      {stats && (
        <motion.div variants={staggerList} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatMini label="ทั้งหมด" value={stats.total} bg="bg-gray-100" text="text-gray-900" />
          <StatMini label="รอดำเนินการ" value={stats.pending} bg="bg-amber-100" text="text-amber-700" pulse />
          <StatMini label="กำลังทำ" value={stats.preparing} bg="bg-orange-100" text="text-orange-700" pulse />
          <StatMini label="พร้อมส่ง" value={stats.ready} bg="bg-blue-100" text="text-blue-700" pulse />
          <StatMini label="ส่งสำเร็จ" value={stats.delivered} bg="bg-green-100" text="text-green-700" />
          <div className="bg-gradient-to-br from-[#1C1917] to-gray-900 rounded-[20px] p-4 text-white shadow-lg flex flex-col justify-center border border-gray-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl" />
             <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] mb-0.5 relative z-10">Revenue (Success)</p>
             <p className="text-xl font-black relative z-10 tracking-tight">{formatPrice(stats.revenue)}</p>
          </div>
        </motion.div>
      )}

      {/* Extreme Visual Tabs */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 pt-2 px-1">
        {statusTabs.map((tab) => (
          <button key={tab.status} onClick={() => handleTabChange(tab.status)} className={cn("px-5 py-3 rounded-[20px] font-black text-[13px] whitespace-nowrap transition-all flex items-center gap-2 relative", activeTab === tab.status ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100")}>
            {activeTab !== tab.status && <span className={cn("w-2 h-2 rounded-full", tab.bg.replace('bg-', 'bg-').replace('-100', '-500'))} />}
            {tab.label}
            {tab.status !== 'all' && orders && (
               <span className={cn("ml-1.5 px-2 py-0.5 rounded-full text-[10px]", activeTab === tab.status ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>
                  {orders.filter(o => o.status === tab.status).length}
               </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid Canvas */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
           {[...Array(6)].map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : filteredOrders?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm mt-4">
           <div className="w-24 h-24 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
             <AlertCircle className="w-10 h-10 text-gray-300" />
           </div>
           <p className="font-black text-2xl text-gray-800 tracking-tight mb-2">ไม่พบออเดอร์</p>
           <p className="text-sm font-medium text-gray-400">ในหน้าต่างปัจจุบัน คุณอาจต้องเปลี่ยนตัวกรองค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map(order => (
               <AdminOrderCard key={order.id} order={order} onView={() => setSelectedOrder(order)} onPrint={() => printOrder(order)} onStats={handleStatusUpdate} onCancel={() => setOrderToCancel(order.id)} onDelete={() => handleDeleteOrder(order.id)} isWait={updateStatusMutation.isPending} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onStats={handleStatusUpdate} onPrint={() => printOrder(selectedOrder)} isWait={updateStatusMutation.isPending} />}
        {orderToCancel && <CancelModal reason={cancelReason} setReason={setCancelReason} onConf={handleCancelOrder} onCan={() => setOrderToCancel(null)} isWait={cancelOrderMutation.isPending} />}
      </AnimatePresence>
    </div>
  )
}

function StatMini({ label, value, bg, text, pulse }: any) {
  return (
    <div className={cn("rounded-[20px] p-4 flex flex-col justify-center relative overflow-hidden", bg)}>
       {pulse && value > 0 && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-500 animate-ping opacity-50" />}
       <p className={cn("text-[10px] font-black uppercase tracking-widest mb-0.5", text, "opacity-70")}>{label}</p>
       <p className={cn("text-2xl font-black tracking-tighter", text)}>{value}</p>
    </div>
  )
}

const AdminOrderCard = forwardRef<HTMLDivElement, any>(({ order, onView, onPrint, onStats, onCancel, onDelete, isWait }, ref) => {
  const [showOptions, setShowOptions] = useState(false)
  const Config = statusConfigs[order.status as keyof typeof statusConfigs]

  const nextFlow: Record<string, string> = { pending: 'preparing', placed: 'preparing', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' }
  const nextTarget = nextFlow[order.status]
  
  return (
     <motion.div ref={ref} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full">
        <div className={cn("h-full bg-white rounded-[32px] border-2 shadow-sm hover:shadow-xl transition-all flex flex-col overflow-hidden relative group", Config.border, `hover:${Config.border}`)}>
           
           <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 transition-transform group-hover:scale-150 pointer-events-none", Config.bg.replace('50', '500') )} />

           <div className="p-5 flex-1 relative z-10 flex flex-col">
              {/* Header section */}
              <div className="flex items-start justify-between mb-4">
                 <div>
                    <h3 className="font-black text-gray-900 text-lg leading-tight flex items-center gap-1.5">
                      {order.customerName}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-400">ID: #{order.id} <span className="mx-1">•</span> {formatOrderDate(order.createdAt)}</p>
                 </div>
                 <div className={cn("flex flex-col items-center justify-center p-2 rounded-[14px]", Config.bg, Config.text)}>
                    <Config.icon className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">{Config.label}</span>
                 </div>
              </div>

              {/* Order quick info */}
              <div className="bg-gray-50 rounded-[20px] p-4 mb-4 flex-1">
                 <div className="flex items-start gap-3 mb-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-xs font-bold text-gray-700 leading-snug">{order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : order.address || 'ไม่ระบุที่อยู่'}</p>
                 </div>
                 <div className="flex items-center justify-between text-xs font-bold border-t border-gray-200/50 pt-3">
                    <span className="text-gray-500">{order.items.length} รายการอาหาร</span>
                    <span className="text-[#FF6B00] text-lg">{formatPrice(order.totalPrice)}</span>
                 </div>
              </div>

              {order.specialInstructions && (
                 <div className="bg-amber-50 rounded-[14px] p-3 mb-4 border border-amber-100 flex items-start gap-2">
                    <Flame className="w-4 h-4 text-amber-500 mt-0.5" />
                    <p className="text-[11px] font-bold text-amber-700 leading-relaxed">{order.specialInstructions}</p>
                 </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center gap-2 mt-auto">
                 {nextTarget && (
                    <button disabled={isWait} onClick={() => onStats(order.id, nextTarget)} className={cn("flex-1 h-12 rounded-[16px] font-black text-white text-sm tracking-wide shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50", nextTarget === 'preparing' ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/20" : nextTarget === 'ready' ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20" : "bg-green-500 hover:bg-green-600 shadow-green-500/20")}>
                       <Check className="w-4 h-4" /> อัพเดตสถานะ
                    </button>
                 )}
                 {!nextTarget && (
                    <div className="flex-1 h-12 rounded-[16px] bg-gray-100 flex items-center justify-center font-black text-gray-500 text-sm">
                       ไม่มี Action ถัดไป
                    </div>
                 )}

                 <button onClick={onView} className="w-12 h-12 bg-white border border-gray-200 rounded-[16px] flex items-center justify-center hover:bg-gray-50 text-gray-700 active:scale-95 transition-transform"><Eye className="w-5 h-5"/></button>
                 <button onClick={onPrint} className="w-12 h-12 bg-white border border-gray-200 rounded-[16px] flex items-center justify-center hover:bg-gray-50 text-gray-700 active:scale-95 transition-transform"><Printer className="w-5 h-5"/></button>
                 
                 <div className="relative">
                    <button onClick={() => setShowOptions(!showOptions)} className="w-12 h-12 bg-gray-50 rounded-[16px] flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"><MoreVertical className="w-5 h-5"/></button>
                    <AnimatePresence>
                       {showOptions && (
                          <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-full right-0 mb-2 w-48 bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden transform-gpu z-50 p-2">
                             {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                <button onClick={() => { setShowOptions(false); onCancel(); }} className="w-full text-left px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"><X className="w-4 h-4"/> บังคับยกเลิก</button>
                             )}
                             <button onClick={() => { setShowOptions(false); onDelete(); }} className="w-full text-left px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"><Trash2 className="w-4 h-4"/> ลบแบบถาวร</button>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </div>
           </div>
        </div>
     </motion.div>
  )
})
AdminOrderCard.displayName = 'AdminOrderCard'

function OrderDetailModal({ order, onClose, onStats, onPrint, isWait }: any) {
  const Config = statusConfigs[order.status as keyof typeof statusConfigs]
  const nextFlow: Record<string, string> = { pending: 'preparing', placed: 'preparing', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' }
  const nextTarget = nextFlow[order.status]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl border border-white">
        
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
           <div className="flex items-center gap-4">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner", Config.bg, Config.text, Config.border)}>
                <Config.icon className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-black text-gray-900">ออเดอร์ #{order.id}</h2>
                 <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{Config.label}</p>
              </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 h-[50vh] space-y-6">
           {/* Section: Customer */}
           <div className="bg-[#FAFAF9] rounded-[24px] p-5 border border-gray-100/50">
              <h3 className="font-black text-sm text-gray-900 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-[#FF6B00]"/> ข้อมูลลูกค้าและการจัดส่ง</h3>
              <div className="grid grid-cols-2 gap-4 text-sm font-bold text-gray-600">
                 <div><span className="text-gray-400 block text-[10px] uppercase tracking-widest mb-0.5">ชื่อลูกค้า</span><p className="text-gray-900">{order.customerName}</p></div>
                 <div><span className="text-gray-400 block text-[10px] uppercase tracking-widest mb-0.5">เบอร์ติดต่อ</span><p className="text-gray-900">{order.phoneNumber || '-'}</p></div>
                 <div className="col-span-2"><span className="text-gray-400 block text-[10px] uppercase tracking-widest mb-0.5">สถานที่จัดส่ง</span><p className="text-gray-900">{order.deliveryMethod === 'workplace' ? 'จัดส่งที่ทำงาน' : order.address || 'ไม่ระบุ'}</p></div>
              </div>
           </div>

           {/* Section: Items */}
           <div>
              <h3 className="font-black text-sm text-gray-900 mb-3 ml-2 flex items-center gap-2"><Package className="w-4 h-4 text-emerald-500"/> รายการอาหาร</h3>
              <div className="space-y-2">
                 {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                       <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 font-black flex items-center justify-center flex-shrink-0 text-xs">{item.quantity}x</div>
                       <div className="flex-1">
                          <p className="font-black text-gray-900 text-sm">{item.name}</p>
                          {item.options && item.options.length > 0 && <p className="text-xs font-bold text-gray-500 mt-0.5">ตัวเลือก: {item.options.map((o:any)=>o.name).join(', ')}</p>}
                          {item.note && <p className="text-xs font-bold text-amber-600 mt-1">📝 เพิ่มเติม: {item.note}</p>}
                       </div>
                       <div className="font-black text-gray-900">{formatPrice(item.subtotal)}</div>
                    </div>
                 ))}
                 {order.specialInstructions && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 font-bold text-sm flex gap-3">
                       <Flame className="w-5 h-5 flex-shrink-0" />
                       <p>หมายเหตุรวม: {order.specialInstructions}</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Cost Summary */}
           <div className="bg-gray-900 rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/20 rounded-full blur-2xl pointer-events-none" />
               <div className="space-y-3 relative z-10 text-sm font-medium">
                  <div className="flex justify-between text-gray-400"><span>ค่าอาหารรวม</span><span>{formatPrice(order.subtotalPrice)}</span></div>
                  {order.discountAmount > 0 && <div className="flex justify-between text-green-400"><span>ส่วนลดร้านค้า</span><span>-{formatPrice(order.discountAmount)}</span></div>}
                  {order.pointsRedeemed > 0 && <div className="flex justify-between text-green-400"><span>ส่วนลดพอยต์</span><span>-{order.pointsRedeemed} pts</span></div>}
               </div>
               <div className="flex justify-between items-center relative z-10 border-t border-gray-800 mt-4 pt-4">
                  <div>
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ยอดสุทธิ (Total)</p>
                     <p className="text-3xl font-black text-[#FF6B00] tracking-tighter leading-none">{formatPrice(order.totalPrice)}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ช่องทางชำระ</p>
                     <span className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-black inline-block backdrop-blur-md">{order.paymentMethod.toUpperCase()}</span>
                  </div>
               </div>
           </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-2">
           <button onClick={onPrint} className="h-16 rounded-[20px] bg-gray-100 text-gray-700 font-black flex items-center justify-center gap-2 active:scale-95 transition-transform"><Printer className="w-5 h-5"/> ปริ้นท์ใบเสร็จ</button>
           {nextTarget ? (
              <button disabled={isWait} onClick={() => { onStats(order.id, nextTarget); onClose(); }} className="h-16 rounded-[20px] bg-gray-900 text-white font-black flex items-center justify-center gap-2 shadow-lg shadow-gray-900/20 active:scale-95 transition-transform disabled:opacity-50 tracking-wide outline-none">
                 <Check className="w-5 h-5"/> กดเพื่ออัพเดตทันที
              </button>
           ) : (
              <div className="h-16 rounded-[20px] bg-gray-50 flex items-center justify-center text-sm font-black text-gray-400">ไม่มีสถานะถัดไป</div>
           )}
        </div>
      </motion.div>
    </div>
  )
}

function CancelModal({ reason, setReason, onConf, onCan, isWait }: any) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCan} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="bg-white rounded-[40px] w-full max-w-sm p-8 flex flex-col items-center relative z-10 text-center shadow-2xl">
         <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 border-[6px] border-white shadow-xl shadow-red-500/10"><X className="w-10 h-10" /></div>
         <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">คุณแน่ใจหรือไม่?</h3>
         <p className="text-sm text-gray-500 font-medium mb-6">หากยกเลิกออเดอร์นี้จะไม่สามารถนำกลับมาได้อีก โปรดระบุเหตุผลในการทิ้งออเดอร์</p>
         
         <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="เช่น วัตถุดิบหมด หรือลูกค้ายกเลิกเอง..." className="w-full p-4 bg-[#FAFAF9] border border-gray-200 rounded-[20px] text-sm font-bold focus:bg-white focus:border-red-500 outline-none transition-all resize-none shadow-inner mb-6" rows={3} />
         
         <div className="flex gap-3 w-full">
            <button onClick={onCan} className="flex-1 h-14 rounded-[16px] bg-gray-100 text-gray-600 font-black">ปิดหน้าต่าง</button>
            <button disabled={isWait || !reason.trim()} onClick={onConf} className="flex-1 h-14 rounded-[16px] bg-red-500 text-white font-black shadow-lg shadow-red-500/30 disabled:opacity-50">ยืนยันการทำลาย</button>
         </div>
      </motion.div>
    </div>
  )
}

function generateReceiptHTML(order: Order): string {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 8px 0; font-weight: bold; font-family: sans-serif;">${item.name}</td>
      <td style="padding: 8px 0; text-align: center; font-family: sans-serif;">${item.quantity}</td>
      <td style="padding: 8px 0; text-align: right; font-family: sans-serif;">${formatPrice(item.subtotal)}</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>ใบเสร็จ #${order.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 20px; max-width: 80mm; margin: 0 auto; color: #111; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 15px; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
        .header p { margin: 3px 0; font-size: 14px; color: #555; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { text-align: left; padding: 8px 0; font-size: 12px; text-transform: uppercase; border-bottom: 2px solid #eee; }
        .total-section { border-top: 2px dashed #ccc; margin-top: 15px; padding-top: 15px; }
        .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
        .total-row { font-size: 20px; font-weight: 900; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; border-top: 2px solid #eee; padding-top: 15px; }
        .info-box { background: #f9f9f9; padding: 10px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; }
      </style>
    </head>
    <body onload="window.print()">
      <div class="header">
        <h1>KAPRAO52</h1>
        <p>ORDER #${order.id}</p>
        <p>${new Date(order.createdAt).toLocaleString('th-TH')}</p>
      </div>
      
      <div class="info-box">
        <div class="row"><strong>ลูกค้า:</strong> <span>${order.customerName}</span></div>
        <div class="row"><strong>โทร:</strong> <span>${order.phoneNumber || '-'}</span></div>
        <div class="row"><strong>รับสินค้า:</strong> <span>${order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : 'ส่งในหมู่บ้าน'}</span></div>
      </div>
      
      <table>
        <thead><tr><th>Menu</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th></tr></thead>
        <tbody>${itemsHTML}</tbody>
      </table>
      
      <div class="total-section">
        <div class="row"><span>ยอดรวมเบื้องต้น</span><span>${formatPrice(order.subtotalPrice)}</span></div>
        ${order.discountAmount > 0 ? `<div class="row" style="color:#green"><span>ส่วนลด</span><span>-${formatPrice(order.discountAmount)}</span></div>` : ''}
        <div class="row total-row"><span>ยอดสุทธิ</span><span>${formatPrice(order.totalPrice)}</span></div>
      </div>
      
      <div class="footer">
        <p>THANK YOU FOR YOUR ORDER</p>
      </div>
    </body>
    </html>
  `
}
