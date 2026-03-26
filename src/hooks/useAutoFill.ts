import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store'

interface SavedAddress {
  id: string
  label: string
  address: string
  phoneNumber: string
  isDefault?: boolean
}

/**
 * Auto-fill hook for checkout form
 * บันทึกและดึงข้อมูลที่อยู่และเบอร์โทรอัตโนมัติ
 */
export function useAutoFill() {
  const { user } = useAuthStore()
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  // Load saved addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('kaprao_saved_addresses')
    if (saved) {
      try {
        const addresses = JSON.parse(saved) as SavedAddress[]
        setSavedAddresses(addresses)
        
        // Select default address
        const defaultAddress = addresses.find(a => a.isDefault)
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
        }
      } catch (e) {
        console.error('Error loading saved addresses:', e)
      }
    }
  }, [])

  // Save address
  const saveAddress = useCallback((address: Omit<SavedAddress, 'id'>) => {
    const newAddress: SavedAddress = {
      ...address,
      id: `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    }

    setSavedAddresses(prev => {
      const updated = [...prev, newAddress]
      localStorage.setItem('kaprao_saved_addresses', JSON.stringify(updated))
      return updated
    })

    return newAddress
  }, [])

  // Update address
  const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
    setSavedAddresses(prev => {
      const updated = prev.map(addr => 
        addr.id === id ? { ...addr, ...updates } : addr
      )
      localStorage.setItem('kaprao_saved_addresses', JSON.stringify(updated))
      return updated
    })
  }, [])

  // Delete address
  const deleteAddress = useCallback((id: string) => {
    setSavedAddresses(prev => {
      const updated = prev.filter(addr => addr.id !== id)
      localStorage.setItem('kaprao_saved_addresses', JSON.stringify(updated))
      return updated
    })

    if (selectedAddressId === id) {
      setSelectedAddressId(null)
    }
  }, [selectedAddressId])

  // Set default address
  const setDefaultAddress = useCallback((id: string) => {
    setSavedAddresses(prev => {
      const updated = prev.map(addr => ({
        ...addr,
        isDefault: addr.id === id,
      }))
      localStorage.setItem('kaprao_saved_addresses', JSON.stringify(updated))
      return updated
    })
    setSelectedAddressId(id)
  }, [])

  // Get selected address
  const selectedAddress = savedAddresses.find(a => a.id === selectedAddressId)

  // Auto-fill from user profile
  const autofillFromProfile = useCallback(() => {
    if (!user) return null

    return {
      customerName: user.displayName || '',
      phoneNumber: '', // Not stored in profile
      address: '', // Not stored in profile
    }
  }, [user])

  return {
    savedAddresses,
    selectedAddressId,
    selectedAddress,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    setSelectedAddressId,
    autofillFromProfile,
  }
}

/**
 * Save customer info after successful order
 */
export function useSaveCustomerInfo() {
  const { saveAddress } = useAutoFill()

  const saveAfterOrder = useCallback((
    _customerName: string,
    phoneNumber: string,
    address: string,
    deliveryMethod: string
  ) => {
    // Only save for village delivery
    if (deliveryMethod !== 'village') return

    // Check if this address already exists
    const saved = localStorage.getItem('kaprao_saved_addresses')
    if (saved) {
      const addresses = JSON.parse(saved) as SavedAddress[]
      const exists = addresses.some(a => 
        a.address === address && a.phoneNumber === phoneNumber
      )

      if (exists) return // Already saved
    }

    // Save new address
    saveAddress({
      label: 'บ้าน',
      address,
      phoneNumber,
      isDefault: false,
    })
  }, [saveAddress])

  return { saveAfterOrder }
}

/**
 * Recent orders for quick reordering
 */
export function useRecentOrders() {
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('kaprao_recent_orders')
    if (saved) {
      try {
        const orders = JSON.parse(saved)
        setRecentOrders(orders.slice(0, 5)) // Keep last 5 orders
      } catch (e) {
        console.error('Error loading recent orders:', e)
      }
    }
  }, [])

  const addRecentOrder = useCallback((order: any) => {
    const saved = localStorage.getItem('kaprao_recent_orders')
    const orders = saved ? JSON.parse(saved) : []
    
    // Add to beginning and remove duplicates
    const filtered = orders.filter((o: any) => o.id !== order.id)
    const updated = [order, ...filtered].slice(0, 10)
    
    localStorage.setItem('kaprao_recent_orders', JSON.stringify(updated))
    setRecentOrders(updated.slice(0, 5))
  }, [])

  return {
    recentOrders,
    addRecentOrder,
  }
}
