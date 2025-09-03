import { NextRequest, NextResponse } from 'next/server'
import { DeckManager, FlashcardSystem } from '../../../../lib/srs/flashcard-system'

// GET /api/flashcards - Get user's flashcards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    const userId = searchParams.get('userId') || 'demo_user'
    
    // Mock flashcards for demonstration
    const mockFlashcards = [
      {
        id: 'card_1',
        deckId: deckId || 'deck_constitutional',
        front: 'O que estabelece o Art. 5º da Constituição Federal?',
        back: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade.',
        type: 'basic' as const,
        tags: ['constituição', 'direitos fundamentais'],
        difficulty: 'medium' as const,
        source: {
          type: 'article' as const,
          reference: 'Art. 5º CF/88'
        },
        metadata: {
          subject: 'Direito Constitucional',
          topic: 'Direitos Fundamentais',
          keywords: ['igualdade', 'direitos', 'garantias']
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        createdBy: userId
      },
      {
        id: 'card_2',
        deckId: deckId || 'deck_constitutional',
        front: 'Quais são os direitos sociais previstos no Art. 6º da CF/88?',
        back: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados.',
        type: 'basic' as const,
        tags: ['constituição', 'direitos sociais'],
        difficulty: 'medium' as const,
        source: {
          type: 'article' as const,
          reference: 'Art. 6º CF/88'
        },
        metadata: {
          subject: 'Direito Constitucional',
          topic: 'Direitos Sociais',
          keywords: ['educação', 'saúde', 'trabalho', 'moradia']
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        createdBy: userId
      },
      {
        id: 'card_3',
        deckId: deckId || 'deck_constitutional',
        front: 'O {{c1::princípio da legalidade}} estabelece que ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.',
        back: 'O princípio da legalidade estabelece que ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei.',
        type: 'cloze' as const,
        tags: ['constituição', 'princípios', 'cloze'],
        difficulty: 'medium' as const,
        source: {
          type: 'article' as const,
          reference: 'Art. 5º, II, CF/88'
        },
        metadata: {
          subject: 'Direito Constitucional',
          topic: 'Princípios Constitucionais',
          keywords: ['legalidade']
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        createdBy: userId
      }
    ]
    
    // Filter by deck if specified
    const flashcards = deckId 
      ? mockFlashcards.filter(card => card.deckId === deckId)
      : mockFlashcards
    
    return NextResponse.json({
      flashcards,
      total: flashcards.length
    })
    
  } catch (error) {
    console.error('Flashcards API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/flashcards - Create new flashcard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { front, back, deckId, type = 'basic', tags = [], difficulty = 'medium' } = body
    
    if (!front || !back || !deckId) {
      return NextResponse.json(
        { error: 'Front, back, and deckId are required' },
        { status: 400 }
      )
    }
    
    // Create new flashcard
    const newCard = FlashcardSystem.createCard({
      deckId,
      front,
      back,
      type,
      tags,
      difficulty,
      metadata: {
        subject: 'Custom',
        topic: 'User Created',
        keywords: tags
      },
      createdBy: 'demo_user'
    })
    
    return NextResponse.json({
      flashcard: newCard,
      message: 'Flashcard created successfully'
    })
    
  } catch (error) {
    console.error('Create flashcard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

