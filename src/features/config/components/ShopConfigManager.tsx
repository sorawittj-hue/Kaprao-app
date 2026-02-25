import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Phone, 
  MessageCircle, 
  CreditCard, 
  Save, 
  Plus, 
  Trash2,
  AlertCircle 
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  useContactInfo, 
  useShopHours, 
  usePaymentConfig, 
  useUpdateShopConfig 
} from '../hooks/useShopConfig'
import type { ContactInfo, ShopHours, PaymentConfig, BankAccount } from '../types'
import { formatThaiTimeRange } from '../utils/timeUtils'

const DAYS_OF_WEEK = [
  { value: 0, label: 'อาทิตย์' },
  { value: 1, label: 'จันทร์' },
  { value: 2, label: 'อังคาร' },
  { value: 3, label: 'พุธ' },
  { value: 4, label: 'พฤหัสบดี' },
  { value: 5, label: 'ศุกร์' },
  { value: 6, label: 'เสาร์' },
]

/**
 * Admin component to manage shop configuration
 * Allows editing of shop hours, contact info, and payment settings
 */
export function ShopConfigManager() {
  const { data: contactInfo, isLoading: contactLoading } = useContactInfo()
  const { data: shopHours, isLoading: hoursLoading } = useShopHours()
  const { data: paymentConfig, isLoading: paymentLoading } = usePaymentConfig()
  const updateConfig = useUpdateShopConfig()

  const [activeTab, setActiveTab] = useState<'hours' | 'contact' | 'payment'>('hours')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Form states
  const [contactForm, setContactForm] = useState<ContactInfo>({
    phone: '',
    line_id: '',
    line_oa_id: '',
    email: '',
    facebook: '',
  })

  const [hoursForm, setHoursForm] = useState<ShopHours>({
    open: '09:00',
    close: '20:00',
    days_open: [1, 2, 3, 4, 5, 6],
    timezone: 'Asia/Bangkok',
  })

  const [paymentForm, setPaymentForm] = useState<PaymentConfig>({
    promptpay_number: '',
    promptpay_name: '',
    bank_accounts: [],
  })

  // Initialize forms when data loads
  useState(() => {
    if (contactInfo) setContactForm(contactInfo)
    if (shopHours) setHoursForm(shopHours)
    if (paymentConfig) setPaymentForm(paymentConfig)
  })

  const handleSave = async () => {
    setSaveStatus('saving')
    try {
      switch (activeTab) {
        case 'contact':
          await updateConfig.mutateAsync({ key: 'contact', value: contactForm })
          break
        case 'hours':
          await updateConfig.mutateAsync({ key: 'shop_hours', value: hoursForm })
          break
        case 'payment':
          await updateConfig.mutateAsync({ key: 'payment', value: paymentForm })
          break
      }
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  const toggleDay = (day: number) => {
    setHoursForm(prev => ({
      ...prev,
      days_open: prev.days_open.includes(day)
        ? prev.days_open.filter(d => d !== day)
        : [...prev.days_open, day].sort((a, b) => a - b)
    }))
  }

  const addBankAccount = () => {
    setPaymentForm(prev => ({
      ...prev,
      bank_accounts: [
        ...prev.bank_accounts,
        { bank_name: '', account_number: '', account_name: '' }
      ]
    }))
  }

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    setPaymentForm(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.map((acc, i) => 
        i === index ? { ...acc, [field]: value } : acc
      )
    }))
  }

  const removeBankAccount = (index: number) => {
    setPaymentForm(prev => ({
      ...prev,
      bank_accounts: prev.bank_accounts.filter((_, i) => i !== index)
    }))
  }

  const isLoading = contactLoading || hoursLoading || paymentLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-800">ตั้งค่าร้านค้า</h2>
        <div className="flex items-center gap-2">
          {saveStatus === 'success' && (
            <span className="text-green-600 text-sm font-medium">✓ บันทึกสำเร็จ</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 text-sm font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              บันทึกไม่สำเร็จ
            </span>
          )}
          <Button
            onClick={handleSave}
            isLoading={updateConfig.isPending}
            disabled={saveStatus === 'saving'}
          >
            <Save className="w-4 h-4 mr-2" />
            บันทึก
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <TabButton
          active={activeTab === 'hours'}
          onClick={() => setActiveTab('hours')}
          icon={Clock}
          label="เวลาทำการ"
        />
        <TabButton
          active={activeTab === 'contact'}
          onClick={() => setActiveTab('contact')}
          icon={Phone}
          label="ติดต่อ"
        />
        <TabButton
          active={activeTab === 'payment'}
          onClick={() => setActiveTab('payment')}
          icon={CreditCard}
          label="การชำระเงิน"
        />
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {activeTab === 'hours' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">ตั้งค่าเวลาทำการ</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลาเปิด
                </label>
                <input
                  type="time"
                  value={hoursForm.open}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, open: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เวลาปิด
                </label>
                <input
                  type="time"
                  value={hoursForm.close}
                  onChange={(e) => setHoursForm(prev => ({ ...prev, close: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                วันทำการ
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`
                      px-4 py-2 rounded-xl text-sm font-medium transition-all
                      ${hoursForm.days_open.includes(day.value)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">
                <span className="font-medium">สรุป:</span>{' '}
                เปิด {formatThaiTimeRange(hoursForm.open, hoursForm.close)}
              </p>
            </div>
          </Card>
        )}

        {activeTab === 'contact' && (
          <Card className="p-6">
            <h3 className="font-bold text-gray-800 mb-4">ข้อมูลติดต่อ</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="0812345678"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE ID
                  </label>
                  <input
                    type="text"
                    value={contactForm.line_id}
                    onChange={(e) => setContactForm(prev => ({ ...prev, line_id: e.target.value }))}
                    placeholder="@kaprao52"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LINE Official Account ID
                  </label>
                  <input
                    type="text"
                    value={contactForm.line_oa_id}
                    onChange={(e) => setContactForm(prev => ({ ...prev, line_oa_id: e.target.value }))}
                    placeholder="@772ysswn"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ใช้สำหรับส่งข้อความออเดอร์ไปยังร้าน
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold text-gray-800 mb-4">พร้อมเพย์</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์พร้อมเพย์ / เลขบัตรประชาชน
                  </label>
                  <input
                    type="text"
                    value={paymentForm.promptpay_number}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, promptpay_number: e.target.value }))}
                    placeholder="0812345678"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อที่แสดงในพร้อมเพย์
                  </label>
                  <input
                    type="text"
                    value={paymentForm.promptpay_name}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, promptpay_name: e.target.value }))}
                    placeholder="กะเพรา 52"
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">บัญชีธนาคาร</h3>
                <Button variant="outline" size="sm" onClick={addBankAccount}>
                  <Plus className="w-4 h-4 mr-1" />
                  เพิ่มบัญชี
                </Button>
              </div>

              <div className="space-y-4">
                {paymentForm.bank_accounts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    ยังไม่มีบัญชีธนาคาร
                  </p>
                ) : (
                  paymentForm.bank_accounts.map((account, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">
                          บัญชี #{index + 1}
                        </span>
                        <button
                          onClick={() => removeBankAccount(index)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="ชื่อธนาคาร"
                          value={account.bank_name}
                          onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none text-sm"
                        />
                        <input
                          type="text"
                          placeholder="เลขบัญชี"
                          value={account.account_number}
                          onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none text-sm"
                        />
                        <input
                          type="text"
                          placeholder="ชื่อบัญชี"
                          value={account.account_name}
                          onChange={(e) => updateBankAccount(index, 'account_name', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}

function TabButton({ active, onClick, icon: Icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all
        border-b-2 -mb-0.5
        ${active 
          ? 'border-orange-500 text-orange-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

export default ShopConfigManager
