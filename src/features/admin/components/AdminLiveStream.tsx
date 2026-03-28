import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ClipboardList, Users, ChefHat, AlertCircle, Clock } from 'lucide-react'
import type { RecentActivity } from '@/types'
import { useRecentActivity } from '@/features/admin/hooks/useAdmin'

export function AdminLiveStream() {
  const { data: activities, isLoading } = useRecentActivity(15)
  const [stream, setStream] = useState<RecentActivity[]>([])

  useEffect(() => {
    if (activities) {
      setStream(activities)
    }
  }, [activities])

  const icons = {
    order: ClipboardList,
    customer: Users,
    menu: ChefHat,
    system: AlertCircle
  }

  const colors = {
    order: 'bg-blue-500',
    customer: 'bg-green-500',
    menu: 'bg-orange-500',
    system: 'bg-red-500'
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden flex flex-col h-[600px]">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h3 className="font-black text-gray-800 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            กิจกรรมล่าสุด
          </h3>
          <p className="text-xs text-gray-500">อัพเดตแบบเรียลไทม์</p>
        </div>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {stream.map((activity, index) => {
            const Icon = icons[activity.type] || ClipboardList
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
              >
                <div className={`w-10 h-10 rounded-xl ${colors[activity.type] || 'bg-gray-200'} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate">{activity.title}</p>
                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                      {new Date(activity.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {isLoading && !stream.length && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-4 border-gray-100 border-t-brand-500 rounded-full mb-4"
            />
            <p className="text-sm font-medium">กำลังโหลดกิจกรรม...</p>
          </div>
        )}

        {!isLoading && !stream.length && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
            <ClipboardList className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">ยังไม่มีกิจกรรมในช่วงนี้</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <button className="w-full py-2.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest">
          ดูประวัติกิจกรรมทั้งหมด
        </button>
      </div>
    </div>
  )
}
