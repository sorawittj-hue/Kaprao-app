import { supabase } from '@/lib/supabase'
import type { Review, ReviewInput } from '../types'

export async function getReviews(menuItemId?: number): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*, profiles:user_id(display_name, picture_url)')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
  
  if (menuItemId) {
    query = query.contains('menu_item_ids', [menuItemId])
  }
  
  const { data, error } = await query.limit(50)
  
  if (error) throw new Error(error.message)
  return (data || []) as unknown as Review[]
}

export async function getReviewByOrderId(orderId: number): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('order_id', orderId)
    .single()
  
  if (error) return null
  return data as unknown as Review | null
}

export async function createReview(review: ReviewInput): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      order_id: review.orderId,
      rating: review.rating,
      comment: review.comment,
      images: review.images || [],
      would_recommend: review.wouldRecommend,
      menu_item_ids: review.menuItemIds || [],
      helpful_count: 0
    })
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data as unknown as Review
}

export async function updateReview(
  reviewId: number, 
  updates: Partial<ReviewInput>
): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      rating: updates.rating,
      comment: updates.comment,
      images: updates.images,
      would_recommend: updates.wouldRecommend,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single()
  
  if (error) throw new Error(error.message)
  return data as unknown as Review
}

export async function deleteReview(reviewId: number): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
  
  if (error) throw new Error(error.message)
}

export async function helpfulReview(reviewId: number): Promise<void> {
  const userId = (await supabase.auth.getUser()).data.user?.id
  if (!userId) throw new Error('Not authenticated')
  
  const { error: voteError } = await supabase
    .from('review_votes')
    .insert({ review_id: reviewId, user_id: userId })
  
  if (voteError && voteError.code !== '23505') {
    throw new Error(voteError.message)
  }
}

export async function replyToReview(
  reviewId: number, 
  reply: string
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      reply,
      replied_at: new Date().toISOString(),
      replied_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', reviewId)
  
  if (error) throw new Error(error.message)
}

export async function getMenuItemRating(menuItemId: number): Promise<{
  average: number
  count: number
  distribution: Record<number, number>
}> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .contains('menu_item_ids', [menuItemId])
    .eq('is_approved', true)
  
  if (error || !data.length) {
    return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
  }
  
  const ratings = data.map(r => r.rating)
  const average = ratings.reduce((a, b) => a + b, 0) / ratings.length
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  ratings.forEach(r => distribution[r as keyof typeof distribution]++)
  
  return { average, count: ratings.length, distribution }
}
