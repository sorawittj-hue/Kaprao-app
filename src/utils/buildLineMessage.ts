/**
 * Build a comprehensive LINE message for the order
 * Sends formatted order details to LINE OA including items, pricing,
 * delivery info, points, lottery tickets, and guest conversion CTA
 */
import type { Order } from '@/types'

interface BuildLineMessageParams {
  order: Order
  lottoNumber?: string
  drawDate?: string
  isGuest?: boolean
  pointsEarned?: number
  ticketsEarned?: number
}

export function buildLineOrderMessage({
  order,
  lottoNumber,
  drawDate,
  isGuest = false,
  pointsEarned,
  ticketsEarned,
}: BuildLineMessageParams): string {
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const dateStr = now.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Payment method label
  let paymentLabel = ''
  if (order.paymentMethod === 'promptpay' || order.paymentMethod === 'transfer') {
    paymentLabel = '💳 โอนเงิน/พร้อมเพย์ ✅'
  } else if (order.paymentMethod === 'cod') {
    paymentLabel = '💵 เงินสด / จ่ายทีหลัง 🕒'
  } else {
    paymentLabel = order.paymentMethod
  }

  // Delivery method label
  const deliveryLabel = order.deliveryMethod === 'workplace'
    ? '🏢 ส่งที่ทำงาน (พรุ่งนี้)'
    : '🏘️ ส่งในหมู่บ้าน'

  // ====================
  // BUILD MESSAGE
  // ====================

  let msg = ''

  // ── HEADER ──
  msg += `╔══════════════════════╗\n`
  msg += `   🔥 กะเพรา 52 — ออเดอร์ใหม่!\n`
  msg += `╚══════════════════════╝\n\n`

  // ── ORDER INFO ──
  msg += `📋 ออเดอร์ #${order.id}\n`
  msg += `👤 คุณ${order.customerName}\n`
  msg += `📞 ${order.phoneNumber || '-'}\n`
  msg += `🕐 ${dateStr} — ${timeStr} น.\n`
  msg += `${deliveryLabel}\n`
  if (order.address) {
    msg += `📍 ${order.address}\n`
  }
  msg += `${paymentLabel}\n`

  // ── ITEMS ──
  msg += `\n━━━ รายการอาหาร ━━━━━━━━\n`
  order.items.forEach((item, index) => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
    let detail = `${index + 1}. ${item.name}${qty}`

    // Options (เผ็ด, เนื้อ, ท็อปปิ้ง)
    if (item.options && item.options.length > 0) {
      const optionNames = item.options.map(opt => opt.name).join(', ')
      detail += `\n   ↳ ${optionNames}`
    }

    // Special note
    if (item.note) {
      detail += `\n   📝 ${item.note}`
    }

    msg += `${detail}\n   💰 ${item.subtotal}฿\n`
  })

  // ── PRICING ──
  msg += `\n━━━ สรุปยอด ━━━━━━━━━━━\n`

  if (order.discountAmount > 0 || order.pointsRedeemed > 0) {
    msg += `   ราคารวม:     ${order.subtotalPrice}฿\n`

    if (order.discountAmount > 0) {
      msg += `   🎁 ส่วนลด:   -${order.discountAmount}฿`
      if (order.discountCode) {
        msg += ` (${order.discountCode})`
      }
      msg += `\n`
    }

    if (order.pointsRedeemed > 0) {
      msg += `   🪙 ใช้พอยต์:  -${(order.pointsRedeemed / 10).toFixed(0)}฿ (${order.pointsRedeemed} pts)\n`
    }

    msg += `   ✅ สุทธิ:     ${order.totalPrice}฿\n`
  } else {
    msg += `   ✅ ยอดรวม:    ${order.totalPrice}฿\n`
  }

  // ── SPECIAL INSTRUCTIONS ──
  if (order.specialInstructions) {
    msg += `\n📝 หมายเหตุ: ${order.specialInstructions}\n`
  }

  // ── POINTS & LOTTERY ──
  const ptsEarned = pointsEarned ?? order.pointsEarned ?? 0
  const tickets = ticketsEarned ?? Math.floor(order.totalPrice / 100)

  if (ptsEarned > 0 || tickets > 0 || lottoNumber) {
    msg += `\n━━━ สิทธิพิเศษ ━━━━━━━━━\n`

    if (ptsEarned > 0) {
      msg += `   ⭐ พอยต์ที่ได้: +${ptsEarned} pts\n`
    }

    if (tickets > 0) {
      msg += `   🎟️ ตั๋วหวย: ${tickets} ใบ\n`
    }

    if (lottoNumber) {
      msg += `   🔢 เลขลุ้นโชค: ${lottoNumber}\n`
      if (drawDate) {
        msg += `   📅 งวดวันที่: ${drawDate}\n`
      }
    }
  }

  // ── GUEST CONVERSION CTA ──
  if (isGuest) {
    msg += `\n🌟 คุณยังไม่ได้ Login LINE!\n`
    msg += `   เข้าสู่ระบบเพื่อรับ ${ptsEarned} พอยต์\n`
    msg += `   และสะสมสิทธิ์ลุ้นอาหารฟรีทุกงวด\n`
  }

  // ── FOOTER ──
  msg += `\n╔══════════════════════╗\n`
  msg += `   ขอบคุณที่อุดหนุน\n`
  msg += `   ร้านกะเพรา 52 ครับ! 🙏\n`
  msg += `╚══════════════════════╝`

  return msg
}

/**
 * Generate lottery number from order ID
 * Uses last 2 digits of the order ID
 */
export function generateLottoNumber(orderId: number): string {
  return String(orderId).slice(-2).padStart(2, '0')
}

/**
 * Get Thai lottery draw date
 * Returns the next 1st or 16th of the month
 */
export function getThaiLotteryDrawDate(date: Date = new Date()): string {
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  let drawDay: number
  let drawMonth: number
  let drawYear: number

  if (day < 16) {
    drawDay = 16
    drawMonth = month
    drawYear = year
  } else {
    drawDay = 1
    drawMonth = month + 1
    drawYear = year
  }

  if (drawMonth > 11) {
    drawMonth = 0
    drawYear++
  }

  const drawDate = new Date(drawYear, drawMonth, drawDay)
  return drawDate.toLocaleDateString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

import { getContactInfo } from '@/features/config/api/configApi'

/**
 * Redirect to LINE OA with order message
 * Uses line_oa_id from shop_config
 */
export async function redirectToLineOA(message: string): Promise<void> {
  const contactInfo = await getContactInfo()
  const lineOAId = contactInfo.line_oa_id || '@772ysswn'
  const encodedMsg = encodeURIComponent(message)
  const lineUrl = `https://line.me/R/oaMessage/${lineOAId}/?${encodedMsg}`

  console.log('📱 Redirecting to LINE OA...')
  window.location.href = lineUrl
}
