export interface Review {
  id: number
  order_id: number
  user_id: string
  menu_item_ids: number[]
  rating: number
  comment: string
  images: string[]
  would_recommend: boolean
  reply?: string
  replied_at?: string
  replied_by?: string
  is_approved: boolean
  helpful_count: number
  created_at: string
  updated_at: string
  profiles?: {
    display_name: string
    picture_url?: string
  }
}

export interface ReviewInput {
  orderId: number
  rating: number
  comment: string
  images?: string[]
  wouldRecommend?: boolean
  menuItemIds?: number[]
}

export interface ReviewStats {
  average: number
  count: number
  distribution: Record<number, number>
}
