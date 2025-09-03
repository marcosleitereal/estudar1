// Flashcard System for Legal Studies
import { SM2Algorithm, SM2Result, CardStats, CardReview } from './sm2-algorithm'

export interface Flashcard {
  id: string
  deckId: string
  front: string
  back: string
  type: 'basic' | 'cloze' | 'image' | 'audio'
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  source?: {
    type: 'article' | 'sumula' | 'law' | 'custom'
    reference: string
    url?: string
  }
  metadata: {
    subject: string
    topic: string
    subtopic?: string
    keywords: string[]
  }
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface Deck {
  id: string
  name: string
  description: string
  subject: string
  isPublic: boolean
  cardCount: number
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes to complete
  createdAt: Date
  updatedAt: Date
  createdBy: string
  subscribers?: number
}

export interface StudySession {
  id: string
  userId: string
  deckId: string
  startTime: Date
  endTime?: Date
  cardsStudied: number
  cardsCorrect: number
  averageResponseTime: number
  sessionType: 'review' | 'new' | 'mixed'
  completed: boolean
}

export interface StudyStats {
  userId: string
  totalCards: number
  cardsLearned: number
  cardsMastered: number
  currentStreak: number
  longestStreak: number
  totalStudyTime: number // minutes
  averageAccuracy: number
  lastStudyDate?: Date
  weeklyGoal: number
  weeklyProgress: number
}

/**
 * Flashcard Management System
 */
export class FlashcardSystem {
  /**
   * Create a new flashcard
   */
  static createCard(cardData: Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>): Flashcard {
    return {
      ...cardData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  /**
   * Create flashcards from legal content
   */
  static createCardsFromLegalContent(
    content: {
      title: string
      text: string
      type: 'article' | 'sumula' | 'law'
      reference: string
      subject: string
    },
    deckId: string,
    createdBy: string
  ): Flashcard[] {
    const cards: Flashcard[] = []
    
    // Create basic definition card
    cards.push(this.createCard({
      deckId,
      front: `O que estabelece ${content.reference}?`,
      back: content.text,
      type: 'basic',
      tags: [content.type, content.subject],
      difficulty: 'medium',
      source: {
        type: content.type,
        reference: content.reference
      },
      metadata: {
        subject: content.subject,
        topic: content.title,
        keywords: this.extractKeywords(content.text)
      },
      createdBy
    }))
    
    // Create cloze deletion cards for key terms
    const clozeCards = this.generateClozeCards(content.text, {
      deckId,
      reference: content.reference,
      subject: content.subject,
      topic: content.title,
      createdBy
    })
    
    cards.push(...clozeCards)
    
    return cards
  }
  
  /**
   * Generate cloze deletion cards
   */
  private static generateClozeCards(
    text: string,
    context: {
      deckId: string
      reference: string
      subject: string
      topic: string
      createdBy: string
    }
  ): Flashcard[] {
    const cards: Flashcard[] = []
    
    // Find key legal terms to create cloze deletions
    const legalTerms = [
      'direito', 'dever', 'obrigação', 'responsabilidade',
      'princípio', 'garantia', 'proteção', 'vedação',
      'competência', 'atribuição', 'prerrogativa'
    ]
    
    legalTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      if (regex.test(text)) {
        const clozeText = text.replace(regex, `{{c1::${term}}}`)
        
        cards.push(this.createCard({
          deckId: context.deckId,
          front: clozeText,
          back: text,
          type: 'cloze',
          tags: ['cloze', context.subject],
          difficulty: 'medium',
          source: {
            type: 'article',
            reference: context.reference
          },
          metadata: {
            subject: context.subject,
            topic: context.topic,
            keywords: [term]
          },
          createdBy: context.createdBy
        }))
      }
    })
    
    return cards
  }
  
  /**
   * Extract keywords from text
   */
  private static extractKeywords(text: string): string[] {
    const commonLegalTerms = [
      'direito', 'lei', 'artigo', 'parágrafo', 'inciso',
      'constituição', 'código', 'súmula', 'jurisprudência',
      'princípio', 'garantia', 'proteção', 'vedação',
      'competência', 'atribuição', 'responsabilidade'
    ]
    
    const words = text.toLowerCase().split(/\W+/)
    return commonLegalTerms.filter(term => words.includes(term))
  }
  
  /**
   * Generate unique ID
   */
  private static generateId(): string {
    return 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

/**
 * Study Session Manager
 */
export class StudySessionManager {
  /**
   * Start a new study session
   */
  static startSession(
    userId: string,
    deckId: string,
    sessionType: StudySession['sessionType'] = 'mixed'
  ): StudySession {
    return {
      id: this.generateSessionId(),
      userId,
      deckId,
      startTime: new Date(),
      cardsStudied: 0,
      cardsCorrect: 0,
      averageResponseTime: 0,
      sessionType,
      completed: false
    }
  }
  
  /**
   * End study session
   */
  static endSession(
    session: StudySession,
    finalStats: {
      cardsStudied: number
      cardsCorrect: number
      averageResponseTime: number
    }
  ): StudySession {
    return {
      ...session,
      ...finalStats,
      endTime: new Date(),
      completed: true
    }
  }
  
  /**
   * Calculate session performance
   */
  static calculatePerformance(session: StudySession): {
    accuracy: number
    duration: number
    cardsPerMinute: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
  } {
    const accuracy = session.cardsStudied > 0 
      ? (session.cardsCorrect / session.cardsStudied) * 100 
      : 0
    
    const duration = session.endTime && session.startTime
      ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      : 0
    
    const cardsPerMinute = duration > 0 ? session.cardsStudied / duration : 0
    
    let grade: 'A' | 'B' | 'C' | 'D' | 'F'
    if (accuracy >= 90) grade = 'A'
    else if (accuracy >= 80) grade = 'B'
    else if (accuracy >= 70) grade = 'C'
    else if (accuracy >= 60) grade = 'D'
    else grade = 'F'
    
    return {
      accuracy: Math.round(accuracy),
      duration: Math.round(duration),
      cardsPerMinute: Math.round(cardsPerMinute * 100) / 100,
      grade
    }
  }
  
  private static generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

/**
 * Deck Management System
 */
export class DeckManager {
  /**
   * Create a new deck
   */
  static createDeck(deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'cardCount'>): Deck {
    return {
      ...deckData,
      id: this.generateDeckId(),
      cardCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  
  /**
   * Create predefined legal decks
   */
  static createLegalDecks(createdBy: string): Deck[] {
    const decks: Deck[] = []
    
    // Constitutional Law Deck
    decks.push(this.createDeck({
      name: 'Direito Constitucional - Fundamentos',
      description: 'Princípios fundamentais, direitos e garantias constitucionais',
      subject: 'Direito Constitucional',
      isPublic: true,
      tags: ['constituição', 'direitos fundamentais', 'princípios'],
      difficulty: 'intermediate',
      estimatedTime: 45,
      createdBy
    }))
    
    // Civil Law Deck
    decks.push(this.createDeck({
      name: 'Código Civil - Parte Geral',
      description: 'Pessoas, bens, fatos jurídicos e negócios jurídicos',
      subject: 'Direito Civil',
      isPublic: true,
      tags: ['código civil', 'personalidade', 'capacidade'],
      difficulty: 'intermediate',
      estimatedTime: 60,
      createdBy
    }))
    
    // Criminal Law Deck
    decks.push(this.createDeck({
      name: 'Direito Penal - Parte Geral',
      description: 'Princípios penais, teoria do crime, penas e medidas de segurança',
      subject: 'Direito Penal',
      isPublic: true,
      tags: ['direito penal', 'crime', 'pena'],
      difficulty: 'advanced',
      estimatedTime: 50,
      createdBy
    }))
    
    // Administrative Law Deck
    decks.push(this.createDeck({
      name: 'Direito Administrativo - Princípios',
      description: 'Princípios da administração pública e atos administrativos',
      subject: 'Direito Administrativo',
      isPublic: true,
      tags: ['administração pública', 'princípios', 'atos administrativos'],
      difficulty: 'intermediate',
      estimatedTime: 40,
      createdBy
    }))
    
    return decks
  }
  
  /**
   * Calculate deck statistics
   */
  static calculateDeckStats(cards: CardStats[]): {
    total: number
    new: number
    learning: number
    review: number
    mastered: number
    averageEF: number
  } {
    const total = cards.length
    const new_ = cards.filter(c => c.repetition === 0).length
    const learning = cards.filter(c => c.repetition > 0 && c.repetition < 3).length
    const review = cards.filter(c => c.repetition >= 3 && c.easinessFactor < 2.5).length
    const mastered = cards.filter(c => c.repetition >= 3 && c.easinessFactor >= 2.5).length
    
    const averageEF = total > 0 
      ? cards.reduce((sum, c) => sum + c.easinessFactor, 0) / total
      : 2.5
    
    return {
      total,
      new: new_,
      learning,
      review,
      mastered,
      averageEF: Math.round(averageEF * 100) / 100
    }
  }
  
  private static generateDeckId(): string {
    return 'deck_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
}

/**
 * Progress Tracking System
 */
export class ProgressTracker {
  /**
   * Update study statistics
   */
  static updateStats(
    currentStats: StudyStats,
    session: StudySession,
    cardReviews: CardReview[]
  ): StudyStats {
    const sessionAccuracy = session.cardsStudied > 0 
      ? (session.cardsCorrect / session.cardsStudied) * 100 
      : 0
    
    const sessionDuration = session.endTime && session.startTime
      ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      : 0
    
    return {
      ...currentStats,
      totalStudyTime: currentStats.totalStudyTime + sessionDuration,
      averageAccuracy: this.calculateRunningAverage(
        currentStats.averageAccuracy,
        sessionAccuracy,
        currentStats.totalCards
      ),
      lastStudyDate: new Date(),
      weeklyProgress: currentStats.weeklyProgress + session.cardsStudied
    }
  }
  
  /**
   * Calculate running average
   */
  private static calculateRunningAverage(
    currentAverage: number,
    newValue: number,
    count: number
  ): number {
    if (count === 0) return newValue
    return (currentAverage * count + newValue) / (count + 1)
  }
  
  /**
   * Generate progress report
   */
  static generateReport(
    stats: StudyStats,
    recentSessions: StudySession[]
  ): {
    summary: string
    recommendations: string[]
    achievements: string[]
  } {
    const recommendations: string[] = []
    const achievements: string[] = []
    
    // Analyze performance
    if (stats.averageAccuracy < 70) {
      recommendations.push('Considere revisar o material antes de estudar os flashcards')
      recommendations.push('Foque em decks de dificuldade menor primeiro')
    }
    
    if (stats.currentStreak >= 7) {
      achievements.push(`Parabéns! Você mantém uma sequência de ${stats.currentStreak} dias`)
    }
    
    if (stats.weeklyProgress >= stats.weeklyGoal) {
      achievements.push('Meta semanal alcançada!')
    }
    
    const summary = `Você estudou ${stats.totalCards} cartões com ${stats.averageAccuracy}% de precisão média. Sequência atual: ${stats.currentStreak} dias.`
    
    return {
      summary,
      recommendations,
      achievements
    }
  }
}

