import { NextRequest, NextResponse } from 'next/server'
import { ExamTemplateManager, ExamSessionManager } from '../../../../lib/quiz/exam-system'

// GET /api/exams - Get available exam templates and sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'templates' or 'sessions'
    const examType = searchParams.get('examType') // 'oab', 'concurso', etc.

    if (type === 'templates') {
      // Empty exam templates for clean platform
      const mockTemplates = []

      // Filter by exam type if specified
      const templates = examType 
        ? mockTemplates.filter(template => template.type === examType)
        : mockTemplates

      return NextResponse.json({
        templates,
        total: templates.length
      })

    } else if (type === 'sessions') {
      // Empty sessions for clean platform
      const mockSessions = []

      return NextResponse.json({
        sessions: mockSessions,
        total: mockSessions.length
      })
    }

    return NextResponse.json({
      templates: [],
      sessions: [],
      total: 0
    })

  } catch (error) {
    console.error('Exams API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/exams - Start new exam session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, templateId, sessionId, answers } = body

    if (action === 'start_exam') {
      if (!templateId) {
        return NextResponse.json(
          { error: 'Template ID is required' },
          { status: 400 }
        )
      }

      // Create new exam session
      const session = ExamSessionManager.startSession(templateId, 'demo_user')
      
      return NextResponse.json({
        session,
        message: 'Exam session started successfully'
      })

    } else if (action === 'submit_answers') {
      if (!sessionId || !answers) {
        return NextResponse.json(
          { error: 'Session ID and answers are required' },
          { status: 400 }
        )
      }

      // Submit answers and get results
      const results = ExamSessionManager.submitAnswers(sessionId, answers)
      
      return NextResponse.json({
        results,
        message: 'Answers submitted successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Exam action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

