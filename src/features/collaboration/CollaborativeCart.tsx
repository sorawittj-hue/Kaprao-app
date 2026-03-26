/**
 * ============================================================================
 * Kaprao52 - Real-time Collaborative Cart (Yjs CRDT)
 * ============================================================================
 * Order together with friends like Google Docs
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import { IndexeddbPersistence } from 'y-indexeddb'
import { motion } from 'framer-motion'
import { Users, Share2, Crown } from 'lucide-react'
import { logger } from '@/utils/logger'
import { useAuthStore } from '@/store'
import type { CartItem } from '@/types'

// ============================================
// Types
// ============================================
interface CollaborativeUser {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  isOnline: boolean
  lastSeen: number
  cursor?: { x: number; y: number }
}

interface CollaborativeCart {
  id: string
  hostId: string
  users: Map<string, CollaborativeUser>
  items: Y.Map<Y.Array<Y.Map<unknown>>>
  status: 'active' | 'ordering' | 'completed' | 'cancelled'
  createdAt: number
  expiresAt: number
}

// ============================================
// Collaborative Cart Manager (Yjs)
// ============================================
class CollaborativeCartManager {
  private doc: Y.Doc
  private provider: WebrtcProvider | null = null
  private persistence: IndexeddbPersistence | null = null
  private awareness: any
  private callbacks: Set<(cart: CollaborativeCart) => void> = new Set()

  constructor() {
    this.doc = new Y.Doc()
  }

  async createCart(hostId: string, hostName: string): Promise<string> {
    const cartId = `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Initialize Yjs structures
    const yUsers = this.doc.getMap('users')
    const yMeta = this.doc.getMap('meta')

    // Set metadata
    yMeta.set('id', cartId)
    yMeta.set('hostId', hostId)
    yMeta.set('status', 'active')
    yMeta.set('createdAt', Date.now())
    yMeta.set('expiresAt', Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Add host as first user
    const yHost = new Y.Map()
    yHost.set('id', hostId)
    yHost.set('name', hostName)
    yHost.set('isHost', true)
    yHost.set('isOnline', true)
    yHost.set('lastSeen', Date.now())
    yUsers.set(hostId, yHost)

    // Setup WebRTC provider for real-time sync
    this.provider = new WebrtcProvider(`kaprao52-${cartId}`, this.doc, {
      signaling: [
        'wss://signaling.yjs.dev',
        'wss://y-webrtc-signaling-eu.herokuapp.com',
        'wss://y-webrtc-signaling-us.herokuapp.com',
      ],
    })

    // Setup persistence
    this.persistence = new IndexeddbPersistence(`kaprao52-cart-${cartId}`, this.doc)

    // Setup awareness (cursors, presence)
    this.awareness = this.provider.awareness
    this.awareness.setLocalState({
      user: { id: hostId, name: hostName },
    })

    // Listen for changes
    this.setupListeners()

    logger.info('Collaborative cart created:', cartId)
    return cartId
  }

  async joinCart(cartId: string, userId: string, userName: string): Promise<boolean> {
    try {
      // Connect to existing cart
      this.provider = new WebrtcProvider(`kaprao52-${cartId}`, this.doc, {
        signaling: [
          'wss://signaling.yjs.dev',
          'wss://y-webrtc-signaling-eu.herokuapp.com',
          'wss://y-webrtc-signaling-us.herokuapp.com',
        ],
      })

      this.persistence = new IndexeddbPersistence(`kaprao52-cart-${cartId}`, this.doc)
      this.awareness = this.provider.awareness

      // Add user to cart
      const yUsers = this.doc.getMap('users')
      const yUser = new Y.Map()
      yUser.set('id', userId)
      yUser.set('name', userName)
      yUser.set('isHost', false)
      yUser.set('isOnline', true)
      yUser.set('lastSeen', Date.now())
      yUsers.set(userId, yUser)

      this.awareness.setLocalState({
        user: { id: userId, name: userName },
      })

      this.setupListeners()

      logger.info('Joined collaborative cart:', cartId)
      return true
    } catch (error) {
      logger.error('Failed to join cart:', error)
      return false
    }
  }

  private setupListeners() {
    // Listen for user changes
    const yUsers = this.doc.getMap('users')
    yUsers.observe(() => {
      this.notifySubscribers()
    })

    // Listen for item changes
    const yItems = this.doc.getMap('items')
    yItems.observe(() => {
      this.notifySubscribers()
    })

    // Listen for awareness changes (online status)
    if (this.awareness) {
      this.awareness.on('change', () => {
        this.updateOnlineStatus()
      })
    }
  }

  private updateOnlineStatus() {
    if (!this.awareness) return

    const states = Array.from(this.awareness.getStates().values())
    const onlineUserIds = new Set(states.map((s: any) => s.user?.id).filter(Boolean))

    const yUsers = this.doc.getMap('users')
    yUsers.forEach((yUser: unknown, userId: string) => {
      const typedYUser = yUser as Y.Map<unknown>
      const isOnline = onlineUserIds.has(userId)
      typedYUser.set('isOnline', isOnline)
      if (isOnline) {
        typedYUser.set('lastSeen', Date.now())
      }
    })
  }

  addItem(userId: string, item: CartItem) {
    const yItems = this.doc.getMap('items')
    let userItems = yItems.get(userId) as Y.Array<Y.Map<unknown>>

    if (!userItems) {
      userItems = new Y.Array()
      yItems.set(userId, userItems)
    }

    const yItem = new Y.Map()
    yItem.set('id', item.id)
    yItem.set('menuItemId', item.menuItem.id)
    yItem.set('menuItemName', item.menuItem.name)
    yItem.set('menuItemPrice', item.menuItem.price)
    yItem.set('quantity', item.quantity)
    yItem.set('selectedOptions', JSON.stringify(item.selectedOptions))
    yItem.set('note', item.note || '')
    yItem.set('subtotal', item.subtotal)
    yItem.set('addedAt', Date.now())
    yItem.set('addedBy', userId)

    userItems.push([yItem])
    this.notifySubscribers()
  }

  removeItem(userId: string, itemId: string) {
    const yItems = this.doc.getMap('items')
    const userItems = yItems.get(userId) as Y.Array<Y.Map<unknown>>

    if (!userItems) return

    const index = userItems.toArray().findIndex((item: Y.Map<unknown>) =>
      item.get('id') === itemId
    )

    if (index !== -1) {
      userItems.delete(index)
      this.notifySubscribers()
    }
  }

  updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const yItems = this.doc.getMap('items')
    const userItems = yItems.get(userId) as Y.Array<Y.Map<unknown>>

    if (!userItems) return

    const item = userItems.toArray().find((i: Y.Map<unknown>) =>
      i.get('id') === itemId
    )

    if (item) {
      item.set('quantity', quantity)
      const price = item.get('menuItemPrice') as number
      item.set('subtotal', price * quantity)
      this.notifySubscribers()
    }
  }

  getCartData(): CollaborativeCart | null {
    const yMeta = this.doc.getMap('meta')
    const yUsers = this.doc.getMap('users')
    const yItems = this.doc.getMap('items')

    const cartId = yMeta.get('id') as string
    if (!cartId) return null

    const users = new Map<string, CollaborativeUser>()
    yUsers.forEach((yUser: unknown, userId: string) => {
      const typedYUser = yUser as Y.Map<unknown>
      users.set(userId, {
        id: userId,
        name: typedYUser.get('name') as string,
        avatar: typedYUser.get('avatar') as string | undefined,
        isHost: typedYUser.get('isHost') as boolean,
        isOnline: typedYUser.get('isOnline') as boolean,
        lastSeen: typedYUser.get('lastSeen') as number,
      })
    })

    return {
      id: cartId,
      hostId: yMeta.get('hostId') as string,
      users,
      items: yItems as Y.Map<Y.Array<Y.Map<unknown>>>,
      status: yMeta.get('status') as CollaborativeCart['status'],
      createdAt: yMeta.get('createdAt') as number,
      expiresAt: yMeta.get('expiresAt') as number,
    }
  }

  subscribe(callback: (cart: CollaborativeCart) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  private notifySubscribers() {
    const cart = this.getCartData()
    if (cart) {
      this.callbacks.forEach(cb => cb(cart))
    }
  }

  destroy() {
    this.provider?.destroy()
    this.persistence?.destroy()
    this.doc.destroy()
  }
}

// ============================================
// React Hook
// ============================================
// eslint-disable-next-line react-refresh/only-export-components
export function useCollaborativeCart(_cartId?: string) {
  const { user } = useAuthStore()
  const [cart, setCart] = useState<CollaborativeCart | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState<CollaborativeUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const managerRef = useRef<CollaborativeCartManager | null>(null)

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = new CollaborativeCartManager()
    }

    const unsubscribe = managerRef.current.subscribe((newCart) => {
      setCart(newCart)
      setConnectedUsers(Array.from(newCart.users.values()))
      setIsHost(newCart.hostId === user?.id)
      setIsConnected(true)
    })

    return () => {
      unsubscribe()
    }
  }, [user?.id])

  const createCart = useCallback(async (): Promise<string | null> => {
    if (!user || !managerRef.current) return null

    const newCartId = await managerRef.current.createCart(user.id, user.displayName)
    return newCartId
  }, [user])

  const joinCart = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !managerRef.current) return false

    return managerRef.current.joinCart(id, user.id, user.displayName)
  }, [user])

  const addItem = useCallback((item: CartItem) => {
    if (!user || !managerRef.current) return

    managerRef.current.addItem(user.id, item)
  }, [user])

  const removeItem = useCallback((itemId: string) => {
    if (!user || !managerRef.current) return

    managerRef.current.removeItem(user.id, itemId)
  }, [user])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (!user || !managerRef.current) return

    managerRef.current.updateItemQuantity(user.id, itemId, quantity)
  }, [user])

  const getShareLink = useCallback((): string => {
    if (!cart) return ''
    return `${window.location.origin}/cart/join/${cart.id}`
  }, [cart])

  return useMemo(() => ({
    cart,
    isHost,
    connectedUsers,
    isConnected,
    createCart,
    joinCart,
    addItem,
    removeItem,
    updateQuantity,
    getShareLink,
  }), [
    cart,
    isHost,
    connectedUsers,
    isConnected,
    createCart,
    joinCart,
    addItem,
    removeItem,
    updateQuantity,
    getShareLink,
  ])
}

// ============================================
// UI Components
// ============================================
export function CollaborativeCartBadge({ count }: { count: number }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full"
    >
      <Users className="w-3 h-3" />
      <span>{count}</span>
    </motion.div>
  )
}

export function UserAvatar({ user }: { user: CollaborativeUser }) {
  return (
    <div className="relative">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
        {user.name.charAt(0).toUpperCase()}
      </div>
      {user.isHost && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <Crown className="w-2 h-2 text-yellow-800" />
        </div>
      )}
      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`} />
    </div>
  )
}

export function ShareCartButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium"
    >
      <Share2 className="w-4 h-4" />
      แชร์ตะกร้า
    </motion.button>
  )
}

export { CollaborativeCartManager }
export type { CollaborativeUser, CollaborativeCart }
