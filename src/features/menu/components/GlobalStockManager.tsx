import { useState } from 'react'
import { Package, Check, X, AlertCircle } from 'lucide-react'
import { useGlobalOptions } from '../hooks/useGlobalOptions'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store'

export function GlobalStockManager() {
    const { data: options = [], refetch, isLoading } = useGlobalOptions()
    const { addToast } = useUIStore()
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        setIsUpdating(id)
        try {
            const { error } = await (supabase as unknown as { from: (table: string) => { update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: Error | null }> }}})
                .from('global_options')
                .update({ is_available: !currentStatus, updated_at: new Date().toISOString() })
                .eq('id', id)

            if (error) throw error

            await refetch()
            addToast({
                type: 'success',
                title: 'อัพเดตสำเร็จ',
                message: `เปลี่ยนสถานะเป็น ${!currentStatus ? 'พร้อมขาย' : 'สินค้าหมด'} แล้ว`,
            })
        } catch (err) {
            addToast({
                type: 'error',
                title: 'อัพเดตไม่สำเร็จ',
                message: 'กรุณาลองใหม่อีกครั้ง',
            })
        } finally {
            setIsUpdating(null)
        }
    }

    return (
        <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-500" />
                    คลังวัตถุดิบ (Global Stock)
                </h2>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">จัดการของหมดข้ามเมนู</span>
            </div>

            <div className="p-4">
                {isLoading ? (
                    <div className="py-8 flex justify-center">
                        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt) => (
                            <div
                                key={opt.id}
                                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${opt.isAvailable ? 'border-gray-100 bg-white' : 'border-red-100 bg-red-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${opt.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                        }`}>
                                        {opt.isAvailable ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{opt.name}</p>
                                        <p className={`text-[10px] font-bold ${opt.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                                            {opt.isAvailable ? 'พร้อมขาย' : 'สินค้าหมด'}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    size="sm"
                                    variant={opt.isAvailable ? 'outline' : 'default'}
                                    className={opt.isAvailable ? '' : 'bg-green-600 hover:bg-green-700'}
                                    isLoading={isUpdating === opt.id}
                                    onClick={() => toggleAvailability(opt.id, opt.isAvailable)}
                                >
                                    {opt.isAvailable ? 'ปิดการขาย' : 'เปิดการขาย'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-4 p-3 bg-amber-50 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                        <strong>หมายเหตุ:</strong> การปิดวัตถุดิบที่นี่ จะส่งผลให้เมนูที่มีวัตถุดิบนี้เป็นทางเลือก (Options) ไม่สามารถเลือกได้ในหน้าสั่งซื้อทันที
                    </p>
                </div>
            </div>
        </Card>
    )
}
