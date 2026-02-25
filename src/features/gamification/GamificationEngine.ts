/**
 * ============================================================================
 * Kaprao52 - Advanced Gamification Engine
 * ============================================================================
 * AAA-level gamification system
 */
type Listener = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, Listener[]> = {};

  on(event: string, listener: Listener): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: Listener): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

// ============================================
// Types
// ============================================
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  condition: { type: string; target: number }
  reward: { points: number; badge?: string }
  progress: number
  maxProgress: number
  unlockedAt?: number
}

export interface UserGamificationState {
  level: number
  xp: number
  xpToNextLevel: number
  totalXp: number
  achievements: Achievement[]
  currentStreak: number
  longestStreak: number
  badges: string[]
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500]

// ============================================
// Gamification Engine
// ============================================
export class GamificationEngine extends EventEmitter {
  private state: UserGamificationState
  constructor(_userId: string) {
    super()
    this.state = {
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_THRESHOLDS[1],
      totalXp: 0,
      achievements: this.initializeAchievements(),
      currentStreak: 0,
      longestStreak: 0,
      badges: [],
    }
  }

  private initializeAchievements(): Achievement[] {
    return [
      {
        id: 'first_order',
        name: 'ครั้งแรกไม่มีวันลืม',
        description: 'สั่งอาหารครั้งแรก',
        icon: '🎉',
        rarity: 'common',
        condition: { type: 'orders_count', target: 1 },
        reward: { points: 50 },
        maxProgress: 1,
        progress: 0,
      },
      {
        id: 'regular_customer',
        name: 'ขาประจำ',
        description: 'สั่งอาหาร 10 ครั้ง',
        icon: '🏆',
        rarity: 'common',
        condition: { type: 'orders_count', target: 10 },
        reward: { points: 200, badge: 'regular' },
        maxProgress: 10,
        progress: 0,
      },
      {
        id: 'week_warrior',
        name: 'นักรบ 7 วัน',
        description: 'สั่งติดต่อกัน 7 วัน',
        icon: '🔥',
        rarity: 'rare',
        condition: { type: 'streak_days', target: 7 },
        reward: { points: 500, badge: 'streak7' },
        maxProgress: 7,
        progress: 0,
      },
    ]
  }

  addXp(amount: number, reason: string): void {
    this.state.xp += amount
    this.state.totalXp += amount

    while (this.state.xp >= this.state.xpToNextLevel && this.state.level < LEVEL_THRESHOLDS.length - 1) {
      this.state.xp -= this.state.xpToNextLevel
      this.state.level++
      this.state.xpToNextLevel = LEVEL_THRESHOLDS[this.state.level] - LEVEL_THRESHOLDS[this.state.level - 1]
      this.emit('levelUp', { level: this.state.level })
    }

    this.emit('xpGained', { amount, reason, total: this.state.totalXp })
  }

  recordOrder(): void {
    this.state.currentStreak++
    if (this.state.currentStreak > this.state.longestStreak) {
      this.state.longestStreak = this.state.currentStreak
    }

    const streakBonus = Math.min(this.state.currentStreak * 10, 100)
    this.addXp(50 + streakBonus, 'Order completed')

    this.checkAchievements('orders_count')
  }

  private checkAchievements(type: string): void {
    this.state.achievements.forEach(achievement => {
      if (achievement.unlockedAt || achievement.condition.type !== type) return

      achievement.progress++

      if (achievement.progress >= achievement.maxProgress) {
        achievement.unlockedAt = Date.now()
        this.addXp(achievement.reward.points, `Achievement: ${achievement.name}`)
        if (achievement.reward.badge) {
          this.state.badges.push(achievement.reward.badge)
        }
        this.emit('achievementUnlocked', achievement)
      }
    })
  }

  getState(): UserGamificationState {
    return { ...this.state }
  }
}

export const gamificationManager = new Map<string, GamificationEngine>()

export function getUserGamification(userId: string): GamificationEngine {
  if (!gamificationManager.has(userId)) {
    gamificationManager.set(userId, new GamificationEngine(userId))
  }
  return gamificationManager.get(userId)!
}
