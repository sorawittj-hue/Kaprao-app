import type { AIRecommendation, MenuItem } from '@/types'

const aiApiUrl = import.meta.env.VITE_AI_API_URL

export async function getAIRecommendations(
  userId: string,
  viewedItems: number[],
  orderHistory: number[]
): Promise<AIRecommendation[]> {
  if (!aiApiUrl) {
    // Fallback: return mock recommendations
    return getMockRecommendations(viewedItems, orderHistory)
  }

  try {
    const response = await fetch(`${aiApiUrl}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        viewedItems,
        orderHistory,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch AI recommendations')
    }

    const data = await response.json()
    return data.recommendations
  } catch (error) {
    console.error('AI recommendations error:', error)
    return getMockRecommendations(viewedItems, orderHistory)
  }
}

// Mock recommendations for demo/fallback
function getMockRecommendations(
  _viewedItems: number[],
  _orderHistory: number[]
): AIRecommendation[] {
  const mockReasons = [
    'ลูกค้าที่สั่งรายการนี้มักชอบความเผ็ด',
    'เมนูนี้เข้ากันได้ดีกับที่คุณดูไว้',
    'เป็นเมนูยอดนิยมในหมวดเดียวกัน',
    'ลูกค้าประจำมักสั่งคู่กัน',
    'เมนูใหม่ที่น่าลองสำหรับคุณ',
  ]

  // This would be populated from actual menu data
  // mockReasons is available for use when generating recommendations
  void mockReasons
  return []
}

export async function parseVoiceOrder(
  audioBlob: Blob,
  availableItems: MenuItem[]
): Promise<{
  items: { menuItemId: number; quantity: number; note?: string }[]
  confidence: number
  rawText: string
}> {
  if (!aiApiUrl) {
    throw new Error('AI API not configured')
  }

  const formData = new FormData()
  formData.append('audio', audioBlob)
  formData.append('menuItems', JSON.stringify(availableItems.map(item => ({
    id: item.id,
    name: item.name,
    keywords: [item.name, item.category],
  }))))

  const response = await fetch(`${aiApiUrl}/voice-order`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Voice parsing failed')
  }

  return response.json()
}

export async function estimateDeliveryTime(
  activeOrdersCount: number,
  timeOfDay: number
): Promise<{ estimatedMinutes: number; confidence: number }> {
  // Base preparation time: 15 minutes
  const baseTime = 15
  
  // Add time based on queue
  const queueTime = Math.min(activeOrdersCount * 3, 30)
  
  // Peak hour multiplier (11:30-13:30 and 17:30-19:30)
  const isPeakHour = 
    (timeOfDay >= 11.5 && timeOfDay <= 13.5) ||
    (timeOfDay >= 17.5 && timeOfDay <= 19.5)
  
  const peakMultiplier = isPeakHour ? 1.5 : 1
  
  const estimatedMinutes = Math.round((baseTime + queueTime) * peakMultiplier)
  
  return {
    estimatedMinutes,
    confidence: isPeakHour ? 0.7 : 0.85,
  }
}
