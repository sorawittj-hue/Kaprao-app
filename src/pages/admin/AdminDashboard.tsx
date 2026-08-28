import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ClipboardList,
  Flame,
  CheckCircle,
  Coins,
  TrendingUp,
  Users,
  RefreshCw,
  ChefHat,
  Utensils,
  Package,
  Calendar,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react'
import { useAdminStats, useTopSellingItems } from '@/features/admin/hooks/useAdmin'
import { useAllOrdersRealtime } from '@/features/orders/hooks/useOrders'
import { formatPrice } from '@/utils/formatPrice'
import { trackPageView } from '@/lib/analytics'
import { hapticLight, hapticMedium } from '@/utils/haptics'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryClient'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { TopSellingItem } from '@/types'
import { getValidImageUrl } from '@/utils/getImageUrl'
import { AdminLiveStream } from '@/features/admin/components/AdminLiveStream'
import { cn } from '@/utils/cn'

const slideUpItem = { hidden: { opacity: 0, y: 30, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } } }
const staggerList = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')

  const { data: stats, isLoading, refetch, isRefetching } = useAdminStats(selectedPeriod)
  const { data: topItems } = useTopSellingItems(5)

  useAllOrdersRealtime()

  useEffect(() => {
    trackPageView('/admin', 'Admin Dashboard')
  }, [])

  const handleRefresh = () => {
    hapticMedium()
    refetch()
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() })
  }

  const statCards = [
    { title: 'ออเดอร์ใหม่', value: stats?.pendingOrders ?? 0, icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', trend: 'Live', onClick: () => navigate('/admin/orders?status=pending') },
    { title: 'กำลังทำอาหาร', value: stats?.cookingOrders ?? 0, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', trend: 'Cooking', onClick: () => navigate('/admin/orders?status=preparing') },
    { title: 'พร้อมเสิร์ฟ / ส่ง', value: stats?.readyOrders ?? 0, icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', trend: 'Ready', onClick: () => navigate('/admin/orders?status=ready') },
    { title: 'เสร็จสิ้นวันนี้', value: stats?.completedOrders ?? 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', trend: 'Done', onClick: () => navigate('/admin/orders?status=delivered') },
  ]

  const revenueCards = [
    { title: 'ยอดขายรวม', value: formatPrice(stats?.todayRevenue ?? 0), icon: Coins, color: 'bg-gradient-to-br from-amber-600 to-orange-700', trend: '+Live', subtitle: 'ยอดขายประเมิน' },
    { title: 'จำนวนออเดอร์', value: `${stats?.totalOrdersToday ?? 0} ออเดอร์`, icon: TrendingUp, color: 'bg-gradient-to-br from-blue-600 to-indigo-700', trend: 'Today', subtitle: 'ออเดอร์วันนี้' },
    { title: 'ยอดเฉลี่ย/ออเดอร์', value: formatPrice(stats?.averageOrderValue ?? 0), icon: Zap, color: 'bg-gradient-to-br from-emerald-600 to-teal-700', trend: 'AOV', subtitle: 'เฉลี่ยต่อบิล' },
    { title: 'ลูกค้าทั้งหมด', value: `${stats?.totalCustomers ?? 0} คน`, icon: Users, color: 'bg-gradient-to-br from-purple-600 to-pink-700', trend: 'Active', subtitle: 'สมาชิกในระบบ' },
  ]

  const quickActions = [
    { label: 'จัดการออเดอร์', icon: Utensils, bg: 'var(--bg-card)', text: 'text-white', border: 'border-white/10', action: () => navigate('/admin/orders') },
    { label: 'จัดการเมนู', icon: ChefHat, bg: 'var(--bg-card)', text: 'text-white', border: 'border-white/10', action: () => navigate('/admin/menu') },
    { label: 'ลูกค้า & พอยต์', icon: Users, bg: 'var(--bg-card)', text: 'text-white', border: 'border-white/10', action: () => navigate('/admin/customers') },
    { label: 'รายงานยอดขาย', icon: BarChart3, bg: 'var(--bg-card)', text: 'text-white', border: 'border-white/10', action: () => navigate('/admin/reports') },
  ]

  const statusData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'รอดำเนินการ', value: stats.pendingOrders, color: '#f59e0b' },
      { name: 'กำลังทำ', value: stats.cookingOrders, color: '#f97316' },
      { name: 'พร้อมเสิร์ฟ', value: stats.readyOrders, color: '#3b82f6' },
      { name: 'เสร็จสิ้น', value: stats.completedOrders, color: '#22c55e' },
    ].filter(d => d.value > 0)
  }, [stats])

  return (
    <div className="space-y-6 pb-32">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 rounded-[28px] border border-white/10 relative overflow-hidden" style={{ background: 'var(--bg-card)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-12 h-12 bg-gradient-to-br from-[#FF5E00] to-[#FF3A00] rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-orange-500/30"><Activity className="w-6 h-6"/></div>
             <div>
                <h1 className="text-2xl font-black text-white tracking-tight">ภาพรวมร้านค้า</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> {new Date().toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex bg-[var(--bg-surface)] border border-white/10 rounded-[18px] p-1.5" role="tablist" aria-label="ช่วงเวลา">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button
                type="button"
                role="tab"
                aria-selected={selectedPeriod === period}
                key={period}
                onClick={() => { hapticLight(); setSelectedPeriod(period); }}
                className={cn("px-4 py-2 rounded-[14px] text-xs font-black transition-all", selectedPeriod === period ? "bg-[#FF5E00] text-white shadow-md shadow-orange-500/30" : "text-gray-400 hover:text-white")}
              >
                {period === 'today' && 'วันนี้'}
                {period === 'week' && 'สัปดาห์'}
                {period === 'month' && 'เดือน'}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="รีเฟรชข้อมูล"
            onClick={handleRefresh}
            disabled={isLoading || isRefetching}
            className="w-11 h-11 bg-[var(--bg-card)]/10 text-white rounded-[16px] border border-white/10 font-black flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 hover:bg-[var(--bg-card)]/20"
          >
            <RefreshCw className={cn("w-4.5 h-4.5", (isLoading || isRefetching) ? "animate-spin" : "")} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Extreme Metric Cards */}
      <motion.div variants={staggerList} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={slideUpItem} onClick={() => { hapticLight(); stat.onClick(); }} className="cursor-pointer group">
            <div className={cn("p-5 rounded-[24px] border transition-all duration-300 relative overflow-hidden", stat.border)} style={{ background: 'var(--bg-card)' }}>
               <div className="relative z-10 flex justify-between items-start mb-3">
                  <div className={cn("w-11 h-11 rounded-[14px] flex items-center justify-center border", stat.bg, stat.color, stat.border)}>
                     <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={cn("text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider", stat.bg, stat.color)}>
                     {stat.trend}
                  </span>
               </div>
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 relative z-10">{stat.title}</p>
               <p className="text-3xl font-black text-white tracking-tight relative z-10">{isLoading ? '-' : stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Power Cards */}
      <motion.div variants={staggerList} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {revenueCards.map((stat) => (
          <motion.div key={stat.title} variants={slideUpItem}>
            <div className={cn("p-5 rounded-[24px] text-white relative overflow-hidden shadow-lg border border-white/10", stat.color)}>
               <div className="flex justify-between items-start mb-3 relative z-10">
                  <div className="w-10 h-10 bg-[var(--bg-card)]/20 backdrop-blur-md rounded-[14px] flex items-center justify-center border border-white/30">
                     <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-black/30 border border-white/10">
                     {stat.trend}
                  </div>
               </div>
               <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-1 relative z-10">{stat.title}</p>
               <p className="text-2xl font-black text-white tracking-tight relative z-10">{isLoading ? '-' : stat.value}</p>
               <p className="text-[10px] font-medium text-white/50 mt-1 relative z-10">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Live Stream & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
         <div className="lg:col-span-2">
            <AdminLiveStream />
         </div>

         <div className="rounded-[28px] p-5 space-y-3 border border-white/10" style={{ background: 'var(--bg-card)' }}>
            <h3 className="font-black text-white text-sm mb-3">ทางลัดด่วน</h3>
            <div className="grid grid-cols-2 gap-2.5">
               {quickActions.map((act) => (
                 <button
                   key={act.label}
                   type="button"
                   onClick={act.action}
                   className="p-4 rounded-[20px] text-left hover:bg-[var(--bg-card)]/5 transition-colors border border-white/5 space-y-2 flex flex-col justify-between"
                   style={{ background: 'var(--bg-surface)' }}
                 >
                    <act.icon className="w-6 h-6 text-orange-400" />
                    <span className="font-black text-xs text-white block">{act.label}</span>
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* Top Selling Items & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
         <div className="lg:col-span-2 rounded-[28px] p-6 border border-white/10 space-y-4" style={{ background: 'var(--bg-card)' }}>
            <h3 className="font-black text-white text-base">5 เมนูขายดีที่สุด</h3>
            <div className="space-y-3">
               {topItems?.map((item: TopSellingItem, idx: number) => (
                 <div key={item.id} className="flex items-center justify-between p-3.5 rounded-[20px] bg-[var(--bg-card)]/5 border border-white/5">
                    <div className="flex items-center gap-3">
                       <span className="font-mono font-black text-xs text-orange-400 w-5">#{idx + 1}</span>
                       <img src={getValidImageUrl(item.imageUrl)} alt={item.name} className="w-11 h-11 rounded-[14px] object-cover border border-white/10" />
                       <div>
                          <p className="font-black text-sm text-white">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium">ขายแล้ว {item.totalSold} จาน</p>
                       </div>
                    </div>
                    <span className="font-black text-sm text-gradient-fire">{formatPrice(item.revenue)}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="rounded-[28px] p-6 border border-white/10 space-y-4" style={{ background: 'var(--bg-card)' }}>
            <h3 className="font-black text-white text-base">สัดส่วนสถานะออเดอร์</h3>
            {statusData.length > 0 ? (
              <div className="h-64 flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {statusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip contentStyle={{ background: '#1A1A1E', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, color: '#FFF' }} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center py-12">ยังไม่มีข้อมูลออเดอร์</p>
            )}
         </div>
      </div>
    </div>
  )
}
