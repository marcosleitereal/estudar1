// SM-2 Algorithm Implementation for Spaced Repetition System
// Based on SuperMemo SM-2 algorithm by Piotr Wozniak

export interface SM2Result {
  easinessFactor: number
  repetition: number
  interval: number
  nextReviewDate: Date
}

export interface CardReview {
  cardId: string
  quality: number // 0-5 scale (0=complete blackout, 5=perfect response)
  reviewDate: Date
  responseTime?: number // in milliseconds
}

export interface CardStats {
  id: string
  easinessFactor: number
  repetition: number
  interval: number
  nextReviewDate: Date
  totalReviews: number
  correctReviews: number
  averageQuality: number
  lastReviewDate?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * SM-2 Algorithm Implementation
 * 
 * The SM-2 algorithm calculates the optimal intervals between reviews
 * based on the difficulty of the material and the quality of recall.
 */
export class SM2Algorithm {
  /**
   * Calculate next review parameters based on quality of recall
   * 
   * @param currentStats Current card statistics
   * @param quality Quality of recall (0-5)
   * @returns Updated SM-2 parameters
   */
  static calculateNext(currentStats: Partial<CardStats>, quality: number): SM2Result {
    // Validate quality (must be 0-5)
    quality = Math.max(0, Math.min(5, Math.round(quality)))
    
    // Initialize default values for new cards
    let easinessFactor = currentStats.easinessFactor ?? 2.5
    let repetition = currentStats.repetition ?? 0
    let interval = currentStats.interval ?? 1
    
    // SM-2 Algorithm Logic
    if (quality >= 3) {
      // Correct response
      if (repetition === 0) {
        interval = 1
      } else if (repetition === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * easinessFactor)
      }
      repetition += 1
    } else {
      // Incorrect response - reset repetition
      repetition = 0
      interval = 1
    }
    
    // Update easiness factor
    easinessFactor = easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    // Ensure easiness factor doesn't go below 1.3
    easinessFactor = Math.max(1.3, easinessFactor)
    
    // Calculate next review date
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval)
    
    return {
      easinessFactor: Math.round(easinessFactor * 100) / 100, // Round to 2 decimal places
      repetition,
      interval,
      nextReviewDate
    }
  }
  
  /**
   * Determine if a card is due for review
   */
  static isDue(cardStats: CardStats): boolean {
    return new Date() >= cardStats.nextReviewDate
  }
  
  /**
   * Get cards due for review
   */
  static getDueCards(cards: CardStats[]): CardStats[] {
    return cards.filter(card => this.isDue(card))
      .sort((a, b) => a.nextReviewDate.getTime() - b.nextReviewDate.getTime())
  }
  
  /**
   * Calculate retention rate for a card
   */
  static getRetentionRate(cardStats: CardStats): number {
    if (cardStats.totalReviews === 0) return 0
    return (cardStats.correctReviews / cardStats.totalReviews) * 100
  }
  
  /**
   * Get difficulty level based on easiness factor
   */
  static getDifficultyLevel(easinessFactor: number): 'very-easy' | 'easy' | 'normal' | 'hard' | 'very-hard' {
    if (easinessFactor >= 2.8) return 'very-easy'
    if (easinessFactor >= 2.5) return 'easy'
    if (easinessFactor >= 2.2) return 'normal'
    if (easinessFactor >= 1.8) return 'hard'
    return 'very-hard'
  }
  
  /**
   * Predict next few review dates
   */
  static predictReviewDates(cardStats: CardStats, count: number = 5): Date[] {
    const dates: Date[] = []
    let currentInterval = cardStats.interval
    let currentEF = cardStats.easinessFactor
    let currentDate = new Date(cardStats.nextReviewDate)
    
    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate))
      
      // Simulate perfect recall (quality = 4) for prediction
      const nextParams = this.calculateNext({
        easinessFactor: currentEF,
        repetition: cardStats.repetition + i + 1,
        interval: currentInterval
      }, 4)
      
      currentInterval = nextParams.interval
      currentEF = nextParams.easinessFactor
      currentDate = new Date(currentDate)
      currentDate.setDate(currentDate.getDate() + currentInterval)
    }
    
    return dates
  }
}

/**
 * SRS Scheduler - Manages review scheduling
 */
export class SRSScheduler {
  /**
   * Get optimal study session size
   */
  static getOptimalSessionSize(totalDue: number, availableTime: number): number {
    // Assume 30 seconds per card on average
    const avgTimePerCard = 30
    const maxByTime = Math.floor(availableTime / avgTimePerCard)
    
    // Optimal session size is between 10-50 cards
    const optimal = Math.min(50, Math.max(10, totalDue))
    
    return Math.min(optimal, maxByTime)
  }
  
  /**
   * Prioritize cards for review session
   */
  static prioritizeCards(dueCards: CardStats[]): CardStats[] {
    return dueCards.sort((a, b) => {
      // Priority factors:
      // 1. How overdue the card is
      const overdueA = Math.max(0, Date.now() - a.nextReviewDate.getTime())
      const overdueB = Math.max(0, Date.now() - b.nextReviewDate.getTime())
      
      if (overdueA !== overdueB) {
        return overdueB - overdueA // More overdue first
      }
      
      // 2. Difficulty (harder cards first)
      if (a.easinessFactor !== b.easinessFactor) {
        return a.easinessFactor - b.easinessFactor // Lower EF (harder) first
      }
      
      // 3. Retention rate (lower retention first)
      const retentionA = SM2Algorithm.getRetentionRate(a)
      const retentionB = SM2Algorithm.getRetentionRate(b)
      
      return retentionA - retentionB
    })
  }
  
  /**
   * Calculate study streak
   */
  static calculateStreak(reviewHistory: Date[]): number {
    if (reviewHistory.length === 0) return 0
    
    const sortedDates = reviewHistory
      .map(date => new Date(date.getFullYear(), date.getMonth(), date.getDate()))
      .sort((a, b) => b.getTime() - a.getTime())
    
    let streak = 0
    let currentDate = new Date()
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
    
    for (const reviewDate of sortedDates) {
      const daysDiff = Math.floor((currentDate.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff === streak + 1) {
        // Allow for one day gap (review might be from yesterday)
        streak++
      } else {
        break
      }
      
      currentDate = new Date(reviewDate)
    }
    
    return streak
  }
  
  /**
   * Generate study plan for the week
   */
  static generateWeeklyPlan(allCards: CardStats[]): Array<{
    date: Date
    dueCount: number
    newCount: number
    reviewCount: number
  }> {
    const plan = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dueCards = allCards.filter(card => {
        const cardDate = new Date(card.nextReviewDate)
        return cardDate.toDateString() === date.toDateString()
      })
      
      const newCards = dueCards.filter(card => card.repetition === 0)
      const reviewCards = dueCards.filter(card => card.repetition > 0)
      
      plan.push({
        date,
        dueCount: dueCards.length,
        newCount: newCards.length,
        reviewCount: reviewCards.length
      })
    }
    
    return plan
  }
}

