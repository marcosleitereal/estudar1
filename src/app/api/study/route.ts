import { NextRequest, NextResponse } from 'next/server'
import { StudySessionManager } from '../../../../lib/srs/flashcard-system'
import { SM2Algorithm } from '../../../../lib/srs/sm2-algorithm'

// POST /api/study - Start or update study session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, sessionId, deckId, cardId, quality, responseTime } = body
    
    if (action === 'start') {
      // Start new study session
      if (!deckId) {
        return NextResponse.json(
          { error: 'Deck ID is required to start session' },
          { status: 400 }
        )
      }
      
      const session = StudySessionManager.startSession('demo_user', deckId, 'mixed')
      
      // Mock due cards for the session
      const mockDueCards = [
        {
          id: 'card_1',
          front: 'O que estabelece o Art. 5º da Constituição Federal?',
          back: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
          type: 'basic',
          easinessFactor: 2.5,
          repetition: 0,
          interval: 1,
          nextReviewDate: new Date(),
          totalReviews: 0,
          correctReviews: 0,
          averageQuality: 0
        },
        {
          id: 'card_2',
          front: 'Quais são os direitos sociais previstos no Art. 6º da CF/88?',
          back: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados.',
          type: 'basic',
          easinessFactor: 2.3,
          repetition: 1,
          interval: 6,
          nextReviewDate: new Date(),
          totalReviews: 3,
          correctReviews: 2,
          averageQuality: 3.5
        }
      ]
      
      return NextResponse.json({
        session,
        dueCards: mockDueCards,
        totalDue: mockDueCards.length
      })
    }
    
    if (action === 'review') {
      // Process card review
      if (!cardId || quality === undefined) {
        return NextResponse.json(
          { error: 'Card ID and quality are required for review' },
          { status: 400 }
        )
      }
      
      // Mock current card stats
      const currentStats = {
        easinessFactor: 2.5,
        repetition: 0,
        interval: 1,
        totalReviews: 0,
        correctReviews: 0
      }
      
      // Calculate next review parameters using SM-2
      const sm2Result = SM2Algorithm.calculateNext(currentStats, quality)
      
      // Mock updated session stats
      const updatedSession = {
        id: sessionId,
        cardsStudied: 1,
        cardsCorrect: quality >= 3 ? 1 : 0,
        averageResponseTime: responseTime || 3000
      }
      
      return NextResponse.json({
        sm2Result,
        session: updatedSession,
        feedback: this.generateFeedback(quality, sm2Result)
      })
    }
    
    if (action === 'end') {
      // End study session
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Session ID is required to end session' },
          { status: 400 }
        )
      }
      
      // Mock session performance
      const performance = {
        accuracy: 85,
        duration: 15,
        cardsPerMinute: 2.5,
        grade: 'B' as const
      }
      
      const achievements = [
        'Primeira sessão do dia completada!',
        'Manteve foco por mais de 10 minutos'
      ]
      
      return NextResponse.json({
        performance,
        achievements,
        message: 'Sessão finalizada com sucesso!'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Study API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/study - Get study statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo_user'
    const period = searchParams.get('period') || 'week'
    
    // Mock study statistics
    const mockStats = {
      userId,
      totalCards: 145,
      cardsLearned: 89,
      cardsMastered: 34,
      currentStreak: 7,
      longestStreak: 15,
      totalStudyTime: 420, // minutes
      averageAccuracy: 82,
      lastStudyDate: new Date(),
      weeklyGoal: 50,
      weeklyProgress: 38,
      
      // Weekly breakdown
      weeklyData: [
        { date: '2024-09-01', cardsStudied: 8, accuracy: 85, timeSpent: 25 },
        { date: '2024-09-02', cardsStudied: 12, accuracy: 78, timeSpent: 35 },
        { date: '2024-09-03', cardsStudied: 6, accuracy: 90, timeSpent: 18 },
        { date: '2024-09-04', cardsStudied: 0, accuracy: 0, timeSpent: 0 },
        { date: '2024-09-05', cardsStudied: 15, accuracy: 88, timeSpent: 45 },
        { date: '2024-09-06', cardsStudied: 9, accuracy: 82, timeSpent: 28 },
        { date: '2024-09-07', cardsStudied: 11, accuracy: 86, timeSpent: 32 }
      ],
      
      // Subject breakdown
      subjectStats: [
        { subject: 'Direito Constitucional', cardsStudied: 45, accuracy: 88 },
        { subject: 'Direito Civil', cardsStudied: 32, accuracy: 85 },
        { subject: 'Direito Penal', cardsStudied: 28, accuracy: 78 },
        { subject: 'Direito Administrativo', cardsStudied: 25, accuracy: 82 },
        { subject: 'Jurisprudência', cardsStudied: 15, accuracy: 75 }
      ],
      
      // Upcoming reviews
      upcomingReviews: [
        { date: new Date(), count: 12 },
        { date: new Date(Date.now() + 24 * 60 * 60 * 1000), count: 8 },
        { date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), count: 15 },
        { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), count: 6 }
      ]
    }
    
    return NextResponse.json(mockStats)
    
  } catch (error) {
    console.error('Study stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to generate feedback
function generateFeedback(quality: number, sm2Result: any): string {
  if (quality >= 4) {
    return `Excelente! Próxima revisão em ${sm2Result.interval} dias.`
  } else if (quality === 3) {
    return `Bom trabalho! Continue praticando. Próxima revisão em ${sm2Result.interval} dias.`
  } else if (quality === 2) {
    return `Quase lá! Revise o material novamente. Próxima revisão em ${sm2Result.interval} dias.`
  } else {
    return `Não desista! Este cartão será revisado novamente em breve para reforçar o aprendizado.`
  }
}

