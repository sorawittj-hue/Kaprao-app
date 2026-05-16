import type { Order } from '@/types'

interface BuildLineMessageParams {
  order: Order
  lottoNumber?: string
  drawDate?: string
  isGuest?: boolean
  pointsEarned?: number
  ticketsEarned?: number
}

function formatPrice(price: number): string {
  return price.toLocaleString('th-TH')
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

  const paymentLabel = order.paymentMethod === 'cod' ? 'เงินสด' : 'โอน/พร้อมเพย์'
  const deliveryLabel = order.deliveryMethod === 'workplace' ? 'ส่งที่ทำงาน' : 'ส่งในหมู่บ้าน'

  let msg = `ออเดอร์ใหม่ #${order.id}\n`
  msg += `==================\n`
  msg += `ลูกค้า: ${order.customerName}\n`
  if (order.phoneNumber) msg += `โทร: ${order.phoneNumber}\n`
  msg += `ส่ง: ${deliveryLabel}${order.address ? ` - ${order.address}` : ''}\n`
  msg += `ชำระ: ${paymentLabel}\n`
  msg += `ยอด: ${formatPrice(order.totalPrice)} บาท\n`
  msg += `เวลา: ${dateStr} ${timeStr} น.\n`

  msg += `\n-- รายการ --\n`

  order.items.forEach((item, index) => {
    const qty = item.quantity > 1 ? ` x${item.quantity}` : ''
    msg += `${index + 1}. ${item.name}${qty} (${formatPrice(item.subtotal)} บ.)\n`

    if (item.note) {
      const parts = item.note.split(' | หมายเหตุ: ')
      if (parts[0]) msg += `   > ${parts[0]}\n`
      if (parts[1]) msg += `   หมายเหตุ: ${parts[1]}\n`
    }
  })

  const ptsEarned = pointsEarned ?? order.pointsEarned ?? 0
  const tickets = ticketsEarned ?? Math.floor(order.totalPrice / 100)

  if (ptsEarned > 0 || tickets > 0 || lottoNumber) {
    msg += `\n-- พิเศษ --\n`
    if (ptsEarned > 0) msg += `พอยต์: +${ptsEarned}\n`
    if (tickets > 0) msg += `ตั๋วหวย: ${tickets} ใบ\n`
    if (lottoNumber) msg += `เลขนำโชค: ${lottoNumber}\n`
    if (drawDate) msg += `งวด: ${drawDate}\n`
  }

  if (isGuest) {
    msg += `\n[ยังไม่ได้ล็อกอิน LINE]\n`
  }

  msg += `==================\n`
  msg += `ขอบคุณที่ใช้บริการกะเพรา 52!`

  return msg
}

export function generateLottoNumber(orderId: number): string {
  return String(orderId).slice(-2).padStart(2, '0')
}

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

export async function redirectToLineOA(message: string): Promise<void> {
  const { getContactInfo } = await import('@/features/config/api/configApi')
  const contactInfo = await getContactInfo()
  const lineOAId = contactInfo.line_oa_id || '@772ysswn'
  const encodedMsg = encodeURIComponent(message)
  const lineUrl = `https://line.me/R/oaMessage/${lineOAId}/?${encodedMsg}`
  window.location.href = lineUrl
}
