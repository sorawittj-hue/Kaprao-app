/**
 * ============================================================================
 * Kaprao52 - Terms of Service Page
 * ============================================================================
 * Comprehensive terms of service
 */

import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Scale, Truck, RotateCcw, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'

const sections = [
  {
    id: 'acceptance',
    icon: FileText,
    title: 'การยอมรับเงื่อนไข',
    content: `
      การใช้บริการ Kaprao52 แสดงว่าคุณยอมรับและตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขเหล่านี้
      
      หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาอย่าใช้บริการของเรา เราขอสงวนสิทธิ์ในการแก้ไข
      ข้อกำหนดเหล่านี้ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า
    `,
  },
  {
    id: 'orders',
    icon: Truck,
    title: 'การสั่งซื้อและการจัดส่ง',
    content: `
      1. การยืนยันออเดอร์: ออเดอร์จะถูกยืนยันเมื่อชำระเงินเสร็จสิ้น
      
      2. การยกเลิก: คุณสามารถยกเลิกออเดอร์ได้ภายใน 15 นาทีหลังสั่งซื้อ
      
      3. การจัดส่ง: 
         - ส่งที่ทำงาน: ในวันทำการถัดไป
         - ส่งในหมู่บ้าน: ตามเวลาที่กำหนด
      
      4. การไม่รับสินค้า: หากไม่รับอาหาร 3 ครั้ง บัญชีอาจถูกระงับชั่วคราว
      
      5. ความล่าช้า: เราไม่รับผิดชอบต่อความล่าช้าที่เกิดจากสภาพอากาศหรือเหตุสุดวิสัย
    `,
  },
  {
    id: 'payment',
    icon: Scale,
    title: 'การชำระเงินและราคา',
    content: `
      1. วิธีการชำระเงิน:
         - เงินสด (เก็บเงินปลายทาง)
         - โอนเงินผ่านธนาคาร
         - พร้อมเพย์
      
      2. ราคา: ราคาที่แสดงรวมภาษีมูลค่าเพิ่มแล้ว (ถ้ามี)
      
      3. คูปองและส่วนลด:
         - ใช้ได้ 1 คูปองต่อออเดอร์
         - ไม่สามารถแลกเปลี่ยนเป็นเงินสดได้
         - อาจมีเงื่อนไขเฉพาะเจาะจง
      
      4. พอยต์: 
         - 1 พอยต์ = ส่วนลด 0.1 บาท
         - ใช้สูงสุด 50% ของยอดสั่งซื้อ
         - พอยต์ไม่มีวันหมดอายุ
    `,
  },
  {
    id: 'refund',
    icon: RotateCcw,
    title: 'การคืนเงินและการเคลม',
    content: `
      1. สิทธิ์การคืนเงิน:
         - อาหารไม่ตรงตามที่สั่ง
         - อาหารเสียหายจากการจัดส่ง
         - ออเดอร์ไม่ได้รับการจัดส่ง
      
      2. ระยะเวลายื่นเคลม: ภายใน 24 ชั่วโมงหลังได้รับอาหาร
      
      3. วิธีการคืนเงิน:
         - เครดิตเข้าบัญชี (ใช้สั่งซื้อครั้งต่อไป)
         - โอนเงินคืนภายใน 7 วันทำการ
      
      4. กรณีที่ไม่รับคืน:
         - รสชาติไม่ถูกปาก
         - สั่งผิดเอง
         - เกินระยะเวลายื่นเคลม
    `,
  },
  {
    id: 'conduct',
    icon: AlertCircle,
    title: 'การใช้งานที่เหมาะสม',
    content: `
      ผู้ใช้ตกลงที่จะ:
      
      • ให้ข้อมูลที่ถูกต้องและเป็นความจริง
      • ไม่ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย
      • ไม่ก่อกวนหรือคุกคามพนักงาน
      • ไม่สร้างบัญชีหลายบัญชีเพื่อหวังผลประโยชน์
      • ไม่แชร์ข้อมูลล็อกอินกับผู้อื่น
      • ไม่พยายามแฮ็กหรือเจาะระบบ
      
      การฝ่าฝืนอาจส่งผลให้บัญชีถูกระงับถาวร
    `,
  },
]

export default function TermsOfServicePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <Container className="py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-gray-900">ข้อกำหนดการใช้งาน</h1>
              <p className="text-sm text-gray-500">Terms of Service</p>
            </div>
          </div>
        </Container>
      </header>

      {/* Content */}
      <Container className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Introduction */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <p className="text-gray-600 leading-relaxed">
              ยินดีต้อนรับสู่ Kaprao52 กรุณาอ่านข้อกำหนดการใช้งานเหล่านี้อย่างละเอียด
              ก่อนใช้บริการสั่งอาหารออนไลน์ของเรา
            </p>
            <p className="text-sm text-gray-400 mt-4">
              อัปเดตล่าสุด: 24 กุมภาพันธ์ 2026
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">
                      {section.title}
                    </h2>
                    <div className="text-gray-600 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Agreement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-green-50 rounded-2xl"
          >
            <h3 className="font-bold text-gray-900 mb-2">การยอมรับ</h3>
            <p className="text-gray-600">
              การใช้บริการ Kaprao52 แสดงว่าคุณได้อ่าน เข้าใจ และยอมรับข้อกำหนดและเงื่อนไขทั้งหมด
              หากคุณไม่เห็นด้วย กรุณาหยุดใช้บริการทันที
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-center text-sm text-gray-400"
          >
            <p>© 2026 Kaprao52. All rights reserved.</p>
            <p className="mt-2">
              สงวนลิขสิทธิ์ตามกฎหมาย ห้ามคัดลอกหรือแจกจ่ายเนื้อหาโดยไม่ได้รับอนุญาต
            </p>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  )
}
