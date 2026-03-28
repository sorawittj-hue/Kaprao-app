import { UnifiedOrder } from '@/types/v2'
import { supabase } from '@/lib/supabase'

export interface GeminiLotteryResponse {
  number: string
  fortune: string
}

export async function generateLuckyLotteryWithGemini(order: UnifiedOrder): Promise<GeminiLotteryResponse> {
  const apiKey = import.meta.env.VITE_AI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
  
  // Fallback if no API key is provided
  if (!apiKey) {
    const defaultNumber = String(order.id).slice(-2).padStart(2, '0')
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0)
    return {
      number: defaultNumber,
      fortune: `คุณสั่งเมนูไปทั้งหมด ${totalQty} อย่าง ขอให้เลข ${defaultNumber} นำโชคมาให้นะครับ`
    }
  }

  const itemsList = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
  const systemPrompt = `คุณคือซินแส AI ผู้เชี่ยวชาญด้านการให้เลขเด็ดจากเมนูอาหารที่คุณลูกค้าสั่ง 
วิเคราะห์เมนูเหล่านี้: ${itemsList}
แล้วให้ 'เลขเด็ด 2 ตัว' และ 'คำทำนายโชคดีสั้นๆ 1 ประโยค' (เช่น สั่งกะเพราหมูกรอบ ความกรอบจะนำพาเงินทอง)
ตอบกลับมาเป็น JSON เท่านั้น โดยมี property "number" (string 2 หลัก) และ "fortune" (string)`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: systemPrompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.9,
        }
      })
    })

    if (!res.ok) throw new Error('Gemini API Error')
    
    const data = await res.json()
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!textContent) throw new Error('Empty response')
    
    const parsed = JSON.parse(textContent)
    const newNumber = parsed.number || String(order.id).slice(-2).padStart(2, '0')

    // UPDATE DB SO THEY MATCH
    try {
      await supabase.from('lotto_pool').update({ number: newNumber }).eq('order_id', order.id)
      await supabase.from('lotto_tickets').update({ number: newNumber }).eq('order_id', order.id)
    } catch(e) { console.error('DB Update Error', e) }

    return {
      number: newNumber,
      fortune: parsed.fortune || 'ขอให้โชคดีกับเมนูอร่อยมื้อนี้นะครับ!'
    }
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      number: String(order.id).slice(-2).padStart(2, '0'),
      fortune: 'รับประทานให้อร่อยรวยๆ เฮงๆ ครับ!'
    }
  }
}
