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
  ArrowUpRight,
  ArrowDownRight,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

  const trends = useMemo(() => {
    if (!stats) return null
    return {
      revenue: stats.todayRevenue > stats.yesterdayRevenue ? 'up' : 'down',
      revenuePercent: stats.yesterdayRevenue > 0 ? Math.round(((stats.todayRevenue - stats.yesterdayRevenue) / stats.yesterdayRevenue) * 100) : 0,
      orders: stats.totalOrdersToday > 0 ? 'up' : 'stable',
    }
  }, [stats])

  const revenueChartData = useMemo(() => {
    if (stats?.chartData) return stats.chartData
    return [{ label: '08:00', value: 1200 }, { label: '10:00', value: 2500 }, { label: '12:00', value: 4800 }, { label: '14:00', value: 3200 }, { label: '16:00', value: 2100 }, { label: '18:00', value: 4500 }]
  }, [stats])

  const statCards = [
    { title: 'ออเดอร์ใหม่', value: stats?.pendingOrders || 0, icon: ClipboardList, bg: 'bg-[#FFB347]/10', color: 'text-[#FF8C42]', shadow: 'shadow-[#FF8C42]/20', border: 'border-[#FFB347]', trend: '+12%', onClick: () => navigate('/admin/orders?status=placed') },
    { title: 'กำลังทำ', value: stats?.cookingOrders || 0, icon: Flame, bg: 'bg-[#FF6B00]/10', color: 'text-[#FF6B00]', shadow: 'shadow-[#FF6B00]/20', border: 'border-[#FF6B00]', trend: '+5%', onClick: () => navigate('/admin/orders?status=preparing') },
    { title: 'พร้อมรับ/ส่ง', value: stats?.readyOrders || 0, icon: Package, bg: 'bg-blue-500/10', color: 'text-blue-500', shadow: 'shadow-blue-500/20', border: 'border-blue-500', trend: 'รอส่ง', onClick: () => navigate('/admin/orders?status=ready') },
    { title: 'เสร็จสิ้นวันนี้', value: stats?.completedOrders || 0, icon: CheckCircle, bg: 'bg-[#00C300]/10', color: 'text-[#00C300]', shadow: 'shadow-[#00C300]/20', border: 'border-[#00C300]', trend: '+23%', onClick: () => navigate('/admin/orders?status=delivered') },
  ]

  const revenueCards = [
    { title: 'รายได้วันนี้', value: formatPrice(stats?.todayRevenue || 0), icon: Coins, color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', trend: trends?.revenue === 'up' ? `+${trends.revenuePercent}%` : `${trends?.revenuePercent || 0}%`, trendUp: trends?.revenue === 'up', subtitle: 'เทียบกับเมื่อวาน' },
    { title: 'รายได้สัปดาห์นี้', value: formatPrice(stats?.weekRevenue || 0), icon: TrendingUp, color: 'bg-gradient-to-br from-teal-400 to-teal-600', trend: '+15%', trendUp: true, subtitle: 'สะสม 7 วัน' },
    { title: 'รายได้เดือนนี้', value: formatPrice(stats?.monthRevenue || 0), icon: BarChart3, color: 'bg-gradient-to-br from-blue-400 to-indigo-600', trend: '+8%', trendUp: true, subtitle: 'สะสม 30 วัน' },
    { title: 'ลูกค้าใหม่วันนี้', value: stats?.newCustomersToday || 0, icon: Users, color: 'bg-gradient-to-br from-[#FF8C42] to-[#FF6B00]', trend: '+5', trendUp: true, subtitle: 'คน' },
  ]

  const quickActions = [
    { label: 'ดูออเดอร์ทั้งหมด', icon: Utensils, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', action: () => navigate('/admin/orders'), badge: stats?.pendingOrders || 0 },
    { label: 'จัดการเมนูอาหาร', icon: ChefHat, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', action: () => navigate('/admin/menu') },
    { label: 'ฐานข้อมูลลูกค้า', icon: Users, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', action: () => navigate('/admin/customers') },
    { label: 'รายงานยอดขาย', icon: BarChart3, bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200', action: () => navigate('/admin/reports') },
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
    <div className="space-y-8 pb-32">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-1">
             <div className="w-12 h-12 bg-[#FF6B00] rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-[#FF6B00]/30"><Activity className="w-6 h-6"/></div>
             <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">ภาพรวมร้านค้า</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {new Date().toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex bg-[#FAFAF9] border border-gray-100 rounded-[20px] p-1.5 shadow-inner">
            {(['today', 'week', 'month'] as const).map((period) => (
              <button key={period} onClick={() => { hapticLight(); setSelectedPeriod(period); }} className={cn("px-5 py-2.5 rounded-[16px] text-sm font-black transition-all", selectedPeriod === period ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                {period === 'today' && 'วันนี้'}
                {period === 'week' && 'สัปดาห์'}
                {period === 'month' && 'เดือน'}
              </button>
            ))}
          </div>
          <button onClick={handleRefresh} disabled={isLoading || isRefetching} className="w-14 h-14 bg-gray-900 text-white rounded-[20px] shadow-lg shadow-gray-900/20 font-black flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50">
            <RefreshCw className={cn("w-5 h-5", (isLoading || isRefetching) ? "animate-spin" : "")} />
          </button>
        </div>
      </div>

      {/* Extreme Metric Cards */}
      <motion.div variants={staggerList} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={slideUpItem} onClick={() => { hapticLight(); stat.onClick(); }} className="cursor-pointer group">
            <div className={cn("bg-white p-6 rounded-[32px] border-2 transition-all duration-300 relative overflow-hidden", stat.border, "hover:shadow-2xl hover:-translate-y-1", stat.shadow)}>
               <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-transform group-hover:scale-150", stat.bg)} />
               <div className="relative z-10 flex justify-between items-start mb-4">
                  <div className={cn("w-14 h-14 rounded-[20px] flex items-center justify-center border", stat.bg, stat.color, stat.border)}>
                     <stat.icon className="w-6 h-6" />
                  </div>
                  <span className={cn("text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest", stat.bg, stat.color)}>
                     {stat.trend}
                  </span>
               </div>
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">{stat.title}</p>
               <p className="text-4xl font-black text-gray-900 tracking-tighter relative z-10">{isLoading ? '-' : stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Revenue Power Cards */}
      <motion.div variants={staggerList} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueCards.map((stat) => (
          <motion.div key={stat.title} variants={slideUpItem}>
            <div className={cn("p-6 rounded-[32px] text-white relative overflow-hidden shadow-xl", stat.color)}>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
               
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                     <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn("flex items-center gap-1 text-[11px] font-black px-2.5 py-1.5 rounded-xl border border-white/20 backdrop-blur-md", stat.trendUp ? "bg-white/20 text-white" : "bg-black/20 text-white")}>
                     {stat.trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                     {stat.trend}
                  </div>
               </div>
               <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1 relative z-10">{stat.title}</p>
               <p className="text-3xl font-black text-white tracking-tighter relative z-10">{isLoading ? '-' : stat.value}</p>
               <p className="text-[10px] font-medium text-white/50 mt-1 relative z-10">{stat.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Access Menu */}
      <motion.div variants={slideUpItem} initial="hidden" animate="visible">
         <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#FF6B00]" />
            <h3 className="font-black text-gray-900 text-lg">เมนูลัดผู้ดูแล</h3>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((item) => (
               <button key={item.label} onClick={() => { hapticLight(); item.action(); }} className={cn("p-6 rounded-[24px] border-2 transition-all flex flex-col items-center justify-center gap-3 relative group active:scale-95", item.bg, item.border, "hover:border-[#FF6B00] hover:shadow-lg")}>
                  {item.badge ? <span className="absolute top-3 right-3 min-w-[24px] h-6 bg-red-500 text-white text-[11px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm z-10">{item.badge}</span> : null}
                  <div className="w-14 h-14 bg-gray-50 rounded-[20px] flex items-center justify-center text-gray-600 group-hover:bg-[#FF6B00]/10 group-hover:text-[#FF6B00] transition-colors">
                     <item.icon className="w-6 h-6" />
                  </div>
                  <span className={cn("font-black text-[13px] text-center", item.text)}>{item.label}</span>
               </button>
            ))}
         </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={slideUpItem} initial="hidden" animate="visible" className="lg:col-span-2">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
               <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">กราฟรายได้</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Revenue Trend (Time-based)</p>
               </div>
               <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse"></span>
                  <span className="text-[11px] font-black text-gray-600 uppercase">ยอดขาย (THB)</span>
               </div>
            </div>
            <div className="p-6 h-[320px]">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                     <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                     <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dx={-10} tickFormatter={(v) => `฿${v}`} />
                     <Tooltip formatter={(v: number) => formatPrice(v)} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                     <Line type="monotone" dataKey="value" stroke="#FF6B00" strokeWidth={4} dot={{ fill: '#white', stroke: '#FF6B00', strokeWidth: 3, r: 5 }} activeDot={{ r: 8, strokeWidth: 0, fill: '#FF6B00' }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <motion.div variants={slideUpItem} initial="hidden" animate="visible">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-50 bg-gray-50/50">
               <h3 className="font-black text-gray-900 text-lg tracking-tight">สถานะออเดอร์</h3>
               <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Order Distribution</p>
            </div>
            <div className="p-6 flex-1 flex flex-col">
               <div className="flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value" stroke="none">
                           {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 space-y-3 bg-[#FAFAF9] p-4 rounded-[20px] border border-gray-100">
                  {statusData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                           <span className="w-3.5 h-3.5 rounded-md shadow-sm" style={{ backgroundColor: item.color }}></span>
                           <span className="font-bold text-gray-600">{item.name}</span>
                        </div>
                        <span className="font-black text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">{item.value}</span>
                     </div>
                  ))}
                  {statusData.length === 0 && <div className="text-center py-4 text-xs font-bold text-gray-400">ยังไม่มีออเดอร์</div>}
               </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Sellers & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={slideUpItem} initial="hidden" animate="visible">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden h-full">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight">เมนูขายดี</h3>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Top Sellers</p>
               </div>
               <button onClick={() => { hapticLight(); navigate('/admin/menu') }} className="px-4 py-2 bg-gray-900 text-white rounded-[14px] text-xs font-black shadow-lg shadow-gray-900/20 active:scale-95 transition-transform">
                 ดูเมนูทั้งหมด
               </button>
            </div>
            <div className="p-2">
               {topItems?.map((item, index) => <TopSellingItemRow key={item.id} item={item} index={index} />)}
               {!topItems?.length && (
                 <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mb-3 border border-gray-100"><ChefHat className="w-8 h-8 text-gray-300" /></div>
                    <p className="font-bold text-sm">ยังไม่มีข้อมูลการขาย</p>
                 </div>
               )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={slideUpItem} initial="hidden" animate="visible">
          <AdminLiveStream />
        </motion.div>
      </div>
    </div>
  )
}

function TopSellingItemRow({ item, index }: { item: TopSellingItem; index: number }) {
  return (
    <div className="px-4 py-3 flex items-center gap-4 hover:bg-[#FAFAF9] rounded-[24px] transition-colors cursor-pointer group">
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm border", index === 0 ? "bg-yellow-100 text-yellow-600 border-yellow-200" : index === 1 ? "bg-gray-100 text-gray-600 border-gray-200" : index === 2 ? "bg-orange-100 text-orange-600 border-orange-200" : "bg-[#FAFAF9] text-gray-400 border-gray-100")}>
          #{index + 1}
       </div>
       <div className="w-14 h-14 rounded-[16px] bg-gray-100 overflow-hidden border border-gray-200 shadow-inner flex-shrink-0 relative">
          <img src={getValidImageUrl(item.imageUrl) || '/placeholder-food.jpg'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
       </div>
       <div className="flex-1 min-w-0">
          <p className="font-black text-gray-900 text-sm truncate">{item.name}</p>
          <p className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1 uppercase tracking-widest">{item.category}</p>
       </div>
       <div className="text-right">
          <p className="font-black text-[#FF6B00] text-lg leading-none">{formatPrice(item.revenue)}</p>
          <p className="text-[11px] font-bold text-gray-500 mt-1">{item.totalSold} จาน</p>
       </div>
    </div>
  )
}
