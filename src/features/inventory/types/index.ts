export interface InventoryItem {
  id: number
  name: string
  unit: string
  current_stock: number
  min_stock: number
  reorder_point: number
  cost_per_unit: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: number
  inventory_id: number
  type: 'in' | 'out' | 'adjust' | 'waste'
  quantity: number
  reason?: string
  order_id?: number
  created_at: string
}

export interface MenuItemIngredient {
  id: number
  menu_item_id: number
  inventory_id: number
  quantity_used: number
  is_required: boolean
  inventory?: InventoryItem
}
