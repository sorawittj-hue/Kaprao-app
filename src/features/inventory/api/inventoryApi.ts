import { supabase } from '@/lib/supabase'
import type { InventoryItem, MenuItemIngredient } from '../types'

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data || []
}

export async function getLowStockItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)

  if (error) throw new Error(error.message)

  return (data as any[] || [])
    .filter(item => item.current_stock <= item.min_stock)
    .sort((a, b) => a.current_stock - b.current_stock)
}

export async function updateStock(
  inventoryId: number,
  quantity: number,
  type: 'in' | 'out' | 'adjust',
  reason?: string
): Promise<void> {
  const { data: item, error: fetchError } = await supabase
    .from('inventory_items')
    .select('current_stock')
    .eq('id', inventoryId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const newStock = type === 'in'
    ? item.current_stock + quantity
    : type === 'out'
      ? item.current_stock - quantity
      : quantity

  const { error: updateError } = await supabase
    .from('inventory_items')
    .update({
      current_stock: newStock,
      updated_at: new Date().toISOString()
    })
    .eq('id', inventoryId)

  if (updateError) throw new Error(updateError.message)

  await supabase.from('inventory_transactions').insert({
    inventory_id: inventoryId,
    type,
    quantity,
    reason: reason || 'Manual adjustment',
    created_by: (await supabase.auth.getUser()).data.user?.id
  })
}

export async function getMenuItemIngredients(menuItemId: number): Promise<MenuItemIngredient[]> {
  const { data, error } = await supabase
    .from('menu_item_ingredients')
    .select('*, inventory:inventory_id(*)')
    .eq('menu_item_id', menuItemId)

  if (error) throw new Error(error.message)
  return (data || []) as unknown as MenuItemIngredient[]
}

export async function createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      name: item.name!,
      unit: item.unit!,
      current_stock: item.current_stock || 0,
      min_stock: item.min_stock || 10,
      reorder_point: item.reorder_point || 20,
      cost_per_unit: item.cost_per_unit || 0
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as unknown as InventoryItem
}
