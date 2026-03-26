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

  // Payment & Delivery labels
  const paymentLabel = order.paymentMethod === 'cod' ? '💵 เงินสด' : '💳 โอนเงิน/พร้อมเพย์'
  const deliveryLabel = order.deliveryMethod === 'workplace' ? '🏢 ส่งที่ทำงาน' : '🏘️ ส่งในหมู่บ้าน'

  // ====================
  // BUILD MESSAGE (Compact Version)
  // ====================
  let msg = `🔥 ออเดอร์ใหม่ #${order.id}\n`
  msg += `━━━━━━━━━━━━━━━━━━\n`
  msg += `👤 คุณ${order.customerName}\n`
  msg += `📱 ${order.phoneNumber || '-'}\n`
  msg += `📍 ${deliveryLabel}${order.address ? ` (${order.address})` : ''}\n`
  msg += `💰 รวม ${order.totalPrice}฿ | ${paymentLabel}\n`
  msg += `🕒 ${dateStr} - ${timeStr} น.\n`

  // 📝 ITEMS
  msg += `\n🥡 รายการอาหาร:\n`
  order.items.forEach((item, index) => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
    msg += `${index + 1}. ${item.name}${qty} (${item.subtotal}฿)\n`

    // Options (Compact)
    if (item.options && item.options.length > 0) {
      const optionNames = item.options.map(opt => opt.name).join(', ')
      msg += `   ↳ ${optionNames}\n`
    }

    if (item.note) msg += `   📝 ${item.note}\n`
  })

  // 🎁 REWARDS & LOTTO
  const ptsEarned = pointsEarned ?? order.pointsEarned ?? 0
  const tickets = ticketsEarned ?? Math.floor(order.totalPrice / 100)

  if (ptsEarned > 0 || tickets > 0 || lottoNumber) {
    msg += `━━━━━━━━━━━━━━━━━━\n`
    if (ptsEarned > 0) msg += `⭐ ได้รับ +${ptsEarned} pts\n`
    if (tickets > 0) msg += `🎟️ ตั๋วหวย ${tickets} ใบ (เลข ${lottoNumber || order.id.toString().slice(-2)})\n`
    if (drawDate) msg += `📅 งวดวันที่: ${drawDate}\n`
  }

  // ⚠️ GUEST CTA
  if (isGuest) {
    msg += `━━━━━━━━━━━━━━━━━━\n`
    msg += `‼️ ล็อกอิน LINE เพื่อสะสมพอยต์!\n`
  }

  // 💖 FOOTER
  msg += `━━━━━━━━━━━━━━━━━━\n`
  msg += `ขอบคุณที่สั่งกะเพรา 52 ครับ! 🙏`

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

/**
 * Redirect to LINE OA with order message
 * Uses line_oa_id from shop_config
 */
export async function redirectToLineOA(message: string): Promise<void> {
  const { getContactInfo } = await import('@/features/config/api/configApi')
  const contactInfo = await getContactInfo()
  const lineOAId = contactInfo.line_oa_id || '@772ysswn'
  const encodedMsg = encodeURIComponent(message)
  const lineUrl = `https://line.me/R/oaMessage/${lineOAId}/?${encodedMsg}`

  console.log('📱 Redirecting to LINE OA...')
  window.location.href = lineUrl
}
