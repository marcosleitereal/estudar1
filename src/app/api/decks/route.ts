import { NextRequest, NextResponse } from 'next/server'
import { DeckManager } from '../../../../lib/srs/flashcard-system'

// GET /api/decks - Get user's decks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || 'demo_user'
    const subject = searchParams.get('subject')
    
    // Empty decks for clean platform
    const mockDecks = []
    
    // Filter by subject if specified
    const decks = subject 
      ? mockDecks.filter(deck => deck.subject.toLowerCase().includes(subject.toLowerCase()))
      : mockDecks
    
    return NextResponse.json({
      decks,
      total: decks.length
    })
    
  } catch (error) {
    console.error('Decks API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/decks - Create new deck
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      subject, 
      isPublic = false, 
      tags = [], 
      difficulty = 'intermediate',
      estimatedTime = 30
    } = body
    
    if (!name || !description || !subject) {
      return NextResponse.json(
        { error: 'Name, description, and subject are required' },
        { status: 400 }
      )
    }
    
    // Create new deck
    const newDeck = DeckManager.createDeck({
      name,
      description,
      subject,
      isPublic,
      tags,
      difficulty,
      estimatedTime,
      createdBy: 'demo_user'
    })
    
    return NextResponse.json({
      deck: {
        ...newDeck,
        subscribers: 0,
        stats: {
          total: 0,
          new: 0,
          learning: 0,
          review: 0,
          mastered: 0,
          averageEF: 2.5
        }
      },
      message: 'Deck created successfully'
    })
    
  } catch (error) {
    console.error('Create deck error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

