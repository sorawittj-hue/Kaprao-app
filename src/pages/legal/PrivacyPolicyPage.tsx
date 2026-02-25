/**
 * ============================================================================
 * Kaprao52 - Privacy Policy Page
 * ============================================================================
 * GDPR & CCPA compliant privacy policy
 */

import { motion } from 'framer-motion'
import { ArrowLeft, Shield, Eye, Lock, Database, Share2, UserX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Container } from '@/components/layout/Container'

const sections = [
  {
    id: 'overview',
    icon: Shield,
    title: 'ภาพรวม',
    content: `
      นโยบายความเป็นส่วนตัวนี้อธิบายว่า Kaprao52 เก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณอย่างไร
      เมื่อคุณใช้บริการสั่งอาหารออนไลน์ของเรา เราให้ความสำคัญกับความเป็นส่วนตัวของคุณเป็นอันดับแรก
    `,
  },
  {
    id: 'collection',
    icon: Database,
    title: 'ข้อมูลที่เราเก็บรวบรวม',
    content: `
      เราเก็บรวบรวมข้อมูลต่อไปนี้:
      
      1. ข้อมูลบัญชี: ชื่อ รูปโปรไฟล์จาก LINE (ถ้า login ด้วย LINE)
      2. ข้อมูลการติดต่อ: เบอร์โทรศัพท์ ที่อยู่จัดส่ง
      3. ข้อมูลการสั่งซื้อ: ประวัติการสั่งอาหาร รายการโปรด
      4. ข้อมูลการใช้งาน: การเข้าถึงแอพ พฤติกรรมการใช้งาน
      5. ข้อมูลอุปกรณ์: ประเภทอุปกรณ์ IP address (ไม่ระบุตัวตน)
    `,
  },
  {
    id: 'usage',
    icon: Eye,
    title: 'การใช้ข้อมูล',
    content: `
      เราใช้ข้อมูลของคุณเพื่อ:
      
      • ดำเนินการสั่งซื้อและจัดส่งอาหาร
      • สะสมคะแนนและจัดการระบบสมาชิก
      • ปรับปรุงประสบการณ์การใช้งาน
      • ส่งการแจ้งเตือนเกี่ยวกับออเดอร์
      • วิเคราะห์และพัฒนาบริการ
      • ป้องกันการฉ้อโกงและรักษาความปลอดภัย
    `,
  },
  {
    id: 'protection',
    icon: Lock,
    title: 'การปกป้องข้อมูล',
    content: `
      เราใช้มาตรการรักษาความปลอดภัยที่เข้มงวด:
      
      • การเข้ารหัส SSL/TLS สำหรับการสื่อสารทั้งหมด
      • จัดเก็บข้อมูลในฐานข้อมูลที่มีการป้องกัน (Supabase)
      • การควบคุมการเข้าถึงแบบ Role-Based (RLS)
      • ไม่เก็บข้อมูลบัตรเครดิต/เดบิต (ใช้ระบบชำระเงินภายนอก)
      • ตรวจสอบความปลอดภัยอย่างสม่ำเสมอ
    `,
  },
  {
    id: 'sharing',
    icon: Share2,
    title: 'การแบ่งปันข้อมูล',
    content: `
      เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณ เราอาจแบ่งปันข้อมูลกับ:
      
      • ผู้ให้บริการจัดส่งอาหาร (เฉพาะข้อมูลที่จำเป็น)
      • ผู้ให้บริการชำระเงิน (สำหรับการทำธุรกรรม)
      • ผู้ให้บริการเทคโนโลยี (เช่น Supabase, hosting)
      • หน่วยงานราชการ (ตามคำสั่งศาลเท่านั้น)
      
      ทุกบุคคลภายนอกต้องปฏิบัติตามข้อกำหนดความเป็นส่วนตัวของเรา
    `,
  },
  {
    id: 'rights',
    icon: UserX,
    title: 'สิทธิ์ของคุณ',
    content: `
      คุณมีสิทธิ์ต่อไปนี้:
      
      • เข้าถึงข้อมูล: ขอสำเนาข้อมูลส่วนบุคคลของคุณ
      • แก้ไขข้อมูล: แก้ไขข้อมูลที่ไม่ถูกต้อง
      • ลบข้อมูล: ขอลบบัญชีและข้อมูลทั้งหมด
      • จำกัดการใช้: ขอจำกัดการประมวลผลข้อมูล
      • คัดค้าน: คัดค้านการใช้ข้อมูลบางประเภท
      • ถ่ายโอนข้อมูล: ขอข้อมูลในรูปแบบที่สามารถนำไปใช้ได้
      
      ติดต่อเราที่ contact@kaprao52.com เพื่อใช้สิทธิ์
    `,
  },
]

export default function PrivacyPolicyPage() {
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
              <h1 className="text-xl font-black text-gray-900">นโยบายความเป็นส่วนตัว</h1>
              <p className="text-sm text-gray-500">Privacy Policy</p>
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
          {/* Last Updated */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500">
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
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-brand-600" />
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

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-brand-50 rounded-2xl text-center"
          >
            <h3 className="font-bold text-gray-900 mb-2">มีคำถาม?</h3>
            <p className="text-gray-600 mb-4">
              หากคุณมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเรา
            </p>
            <a
              href="mailto:contact@kaprao52.com"
              className="text-brand-600 font-medium hover:underline"
            >
              contact@kaprao52.com
            </a>
          </motion.div>

          {/* Legal Footer */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>© 2026 Kaprao52. All rights reserved.</p>
            <p className="mt-1">This privacy policy is compliant with GDPR and CCPA regulations.</p>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}
