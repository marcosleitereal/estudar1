import { NextRequest, NextResponse } from 'next/server'
import { QuestionSystem, QuizSessionManager } from '../../../../lib/quiz/question-system'

// GET /api/quiz - Get available quizzes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subject = searchParams.get('subject')
    const difficulty = searchParams.get('difficulty')
    const type = searchParams.get('type')

    // Empty quizzes for clean platform
    const mockQuizzes = []

    // Apply filters
    let filteredQuizzes = mockQuizzes
    
    if (subject && subject !== 'all') {
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.subject.toLowerCase().includes(subject.toLowerCase())
      )
    }
    
    if (difficulty && difficulty !== 'all') {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === difficulty)
    }
    
    if (type && type !== 'all') {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.type === type)
    }

    return NextResponse.json({
      quizzes: filteredQuizzes,
      total: filteredQuizzes.length,
      filters: {
        subjects: Array.from(new Set(mockQuizzes.map(q => q.subject))),
        difficulties: ['easy', 'medium', 'hard', 'mixed'],
        types: ['practice', 'exam', 'custom']
      }
    })

  } catch (error) {
    console.error('Quiz API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/quiz - Start quiz or submit answer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, quizId, questionId, selectedAnswer, confidence } = body

    if (action === 'start') {
      if (!quizId) {
        return NextResponse.json(
          { error: 'Quiz ID is required' },
          { status: 400 }
        )
      }

      // Mock quiz questions
      const mockQuestions = [
        {
          id: 'q1',
          type: 'multiple_choice',
          subject: 'Direito Constitucional',
          question: 'Segundo o Art. 5º da Constituição Federal, todos são iguais perante a lei. Qual princípio está sendo expresso?',
          options: [
            'Princípio da Isonomia',
            'Princípio da Legalidade', 
            'Princípio da Moralidade',
            'Princípio da Proporcionalidade'
          ],
          correctAnswer: 0,
          explanation: 'O princípio da isonomia (igualdade) está expresso no caput do Art. 5º da CF/88.',
          points: 1,
          timeLimit: 120
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          subject: 'Direito Constitucional',
          question: 'Qual dos seguintes NÃO é considerado um direito social segundo o Art. 6º da CF/88?',
          options: [
            'Educação',
            'Saúde',
            'Propriedade privada',
            'Trabalho'
          ],
          correctAnswer: 2,
          explanation: 'A propriedade privada é um direito individual (Art. 5º), não um direito social.',
          points: 1,
          timeLimit: 90
        },
        {
          id: 'q3',
          type: 'true_false',
          subject: 'Direito Administrativo',
          question: 'A administração pública está sujeita aos princípios da legalidade, impessoalidade, moralidade, publicidade e eficiência.',
          correctAnswer: true,
          explanation: 'Verdadeiro. Estes são os princípios expressos no Art. 37, caput, da CF/88 (LIMPE).',
          points: 1,
          timeLimit: 60
        }
      ]

      const attempt = QuizSessionManager.startQuizAttempt(quizId, 'demo_user')

      return NextResponse.json({
        attempt,
        questions: mockQuestions,
        quiz: {
          id: quizId,
          title: 'Quiz de Demonstração',
          timeLimit: 30,
          passingScore: 70
        }
      })
    }

    if (action === 'submit_answer') {
      if (!questionId || selectedAnswer === undefined) {
        return NextResponse.json(
          { error: 'Question ID and selected answer are required' },
          { status: 400 }
        )
      }

      // Mock correct answer check
      const isCorrect = Math.random() > 0.3 // 70% chance of being correct for demo

      return NextResponse.json({
        isCorrect,
        feedback: isCorrect 
          ? 'Resposta correta! Parabéns.' 
          : 'Resposta incorreta. Revise o conteúdo.',
        explanation: 'Esta é uma explicação detalhada da resposta correta.',
        nextAction: 'continue' // or 'complete' for last question
      })
    }

    if (action === 'complete') {
      // Mock quiz completion
      const results = {
        score: 8,
        totalQuestions: 10,
        percentage: 80,
        passed: true,
        timeSpent: 1200, // seconds
        grade: 'B',
        subjectScores: [
          { subject: 'Direito Constitucional', score: 5, total: 6, percentage: 83 },
          { subject: 'Direito Administrativo', score: 3, total: 4, percentage: 75 }
        ]
      }

      return NextResponse.json({
        results,
        message: 'Quiz concluído com sucesso!',
        recommendations: [
          'Excelente desempenho em Direito Constitucional',
          'Continue praticando questões de Direito Administrativo'
        ]
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Quiz action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

