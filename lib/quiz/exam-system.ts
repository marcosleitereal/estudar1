// Exam Simulation System for Legal Studies
import { Question, Quiz, QuizAttempt } from './question-system'

export interface ExamTemplate {
  id: string
  name: string
  description: string
  type: 'oab' | 'concurso' | 'vestibular' | 'custom'
  totalQuestions: number
  timeLimit: number // minutes
  passingScore: number
  subjectDistribution: Array<{
    subject: string
    questionCount: number
    weight?: number
  }>
  difficultyDistribution: {
    easy: number
    medium: number
    hard: number
  }
  questionTypes: Array<{
    type: 'multiple_choice' | 'true_false' | 'essay'
    count: number
  }>
  instructions: string[]
  rules: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SimulatedExam {
  id: string
  templateId: string
  title: string
  description: string
  questions: Question[]
  timeLimit: number
  passingScore: number
  instructions: string[]
  rules: string[]
  createdAt: Date
  isActive: boolean
}

export interface ExamSession {
  id: string
  examId: string
  userId: string
  startTime: Date
  endTime?: Date
  timeLimit: number
  currentQuestionIndex: number
  answers: Record<string, {
    selectedAnswer: any
    flagged: boolean
    timeSpent: number
    visitCount: number
  }>
  flaggedQuestions: string[]
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'time_expired'
  timeRemaining: number
  lastActivity: Date
  warnings: Array<{
    type: 'time_warning' | 'navigation_warning' | 'focus_lost'
    timestamp: Date
    message: string
  }>
}

export interface ExamResult {
  id: string
  sessionId: string
  examId: string
  userId: string
  score: number
  percentage: number
  passed: boolean
  timeSpent: number
  completedAt: Date
  answers: Array<{
    questionId: string
    selectedAnswer: any
    correctAnswer: any
    isCorrect: boolean
    points: number
    timeSpent: number
  }>
  subjectScores: Array<{
    subject: string
    score: number
    maxScore: number
    percentage: number
  }>
  ranking?: {
    position: number
    totalParticipants: number
    percentile: number
  }
}

/**
 * Exam Template Management
 */
export class ExamTemplateManager {
  /**
   * Create predefined exam templates
   */
  static createLegalExamTemplates(): ExamTemplate[] {
    const templates: ExamTemplate[] = []

    // OAB Template
    templates.push({
      id: 'template_oab_primeira_fase',
      name: 'OAB - Primeira Fase',
      description: 'Simulado baseado no padrão da primeira fase do Exame da OAB',
      type: 'oab',
      totalQuestions: 80,
      timeLimit: 300, // 5 hours
      passingScore: 50, // 40 questions correct
      subjectDistribution: [
        { subject: 'Direito Constitucional', questionCount: 8 },
        { subject: 'Direito Administrativo', questionCount: 8 },
        { subject: 'Direito Civil', questionCount: 10 },
        { subject: 'Direito Processual Civil', questionCount: 8 },
        { subject: 'Direito Penal', questionCount: 8 },
        { subject: 'Direito Processual Penal', questionCount: 8 },
        { subject: 'Direito do Trabalho', questionCount: 8 },
        { subject: 'Direito Empresarial', questionCount: 6 },
        { subject: 'Direito Tributário', questionCount: 6 },
        { subject: 'Ética Profissional', questionCount: 10 }
      ],
      difficultyDistribution: {
        easy: 20,
        medium: 45,
        hard: 15
      },
      questionTypes: [
        { type: 'multiple_choice', count: 80 }
      ],
      instructions: [
        'Leia atentamente cada questão antes de responder',
        'Marque apenas uma alternativa por questão',
        'Você pode voltar e alterar suas respostas',
        'Gerencie bem seu tempo - 5 horas para 80 questões',
        'É necessário acertar pelo menos 40 questões para aprovação'
      ],
      rules: [
        'É vedado o uso de material de consulta',
        'Não é permitido comunicação com outros candidatos',
        'O candidato deve permanecer na sala por no mínimo 2 horas',
        'Questões anuladas serão consideradas corretas para todos'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Concurso Público Template
    templates.push({
      id: 'template_concurso_publico',
      name: 'Concurso Público - Área Jurídica',
      description: 'Simulado baseado em concursos públicos para cargos jurídicos',
      type: 'concurso',
      totalQuestions: 60,
      timeLimit: 240, // 4 hours
      passingScore: 60,
      subjectDistribution: [
        { subject: 'Direito Constitucional', questionCount: 15, weight: 2 },
        { subject: 'Direito Administrativo', questionCount: 15, weight: 2 },
        { subject: 'Direito Civil', questionCount: 10, weight: 1.5 },
        { subject: 'Direito Penal', questionCount: 10, weight: 1.5 },
        { subject: 'Português', questionCount: 5, weight: 1 },
        { subject: 'Conhecimentos Gerais', questionCount: 5, weight: 1 }
      ],
      difficultyDistribution: {
        easy: 15,
        medium: 30,
        hard: 15
      },
      questionTypes: [
        { type: 'multiple_choice', count: 55 },
        { type: 'true_false', count: 5 }
      ],
      instructions: [
        'Prova objetiva com questões de múltipla escolha',
        'Cada questão tem peso diferente conforme a matéria',
        'Leia com atenção os enunciados',
        'Marque apenas uma alternativa por questão'
      ],
      rules: [
        'Tempo máximo de 4 horas',
        'Nota mínima de 60% para aprovação',
        'Questões anuladas não contam para o total',
        'Não há desconto por questões erradas'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Vestibular Direito Template
    templates.push({
      id: 'template_vestibular_direito',
      name: 'Vestibular - Curso de Direito',
      description: 'Simulado para ingresso em cursos de Direito',
      type: 'vestibular',
      totalQuestions: 40,
      timeLimit: 180, // 3 hours
      passingScore: 70,
      subjectDistribution: [
        { subject: 'Português', questionCount: 10 },
        { subject: 'História', questionCount: 8 },
        { subject: 'Geografia', questionCount: 6 },
        { subject: 'Filosofia', questionCount: 6 },
        { subject: 'Sociologia', questionCount: 5 },
        { subject: 'Conhecimentos Gerais', questionCount: 5 }
      ],
      difficultyDistribution: {
        easy: 10,
        medium: 20,
        hard: 10
      },
      questionTypes: [
        { type: 'multiple_choice', count: 35 },
        { type: 'essay', count: 5 }
      ],
      instructions: [
        'Prova mista com questões objetivas e dissertativas',
        'Questões dissertativas têm peso maior',
        'Demonstre raciocínio lógico e conhecimento geral',
        'Redação clara e objetiva nas questões dissertativas'
      ],
      rules: [
        'Tempo máximo de 3 horas',
        'Nota mínima de 70% para aprovação',
        'Questões dissertativas serão avaliadas por critérios específicos',
        'É obrigatório responder todas as questões'
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return templates
  }

  /**
   * Generate exam from template
   */
  static generateExamFromTemplate(
    template: ExamTemplate,
    availableQuestions: Question[]
  ): SimulatedExam {
    const selectedQuestions: Question[] = []

    // Select questions based on subject distribution
    for (const subjectReq of template.subjectDistribution) {
      const subjectQuestions = availableQuestions.filter(q => 
        q.subject === subjectReq.subject
      )

      // Sort by difficulty and statistics for better selection
      const sortedQuestions = subjectQuestions.sort((a, b) => {
        // Prefer questions with good statistics
        const scoreA = (a.statistics.correctAttempts / Math.max(a.statistics.totalAttempts, 1))
        const scoreB = (b.statistics.correctAttempts / Math.max(b.statistics.totalAttempts, 1))
        return Math.abs(scoreB - 0.7) - Math.abs(scoreA - 0.7) // Target 70% success rate
      })

      // Select required number of questions
      const selected = sortedQuestions.slice(0, subjectReq.questionCount)
      selectedQuestions.push(...selected)
    }

    // Shuffle questions to randomize order
    const shuffledQuestions = this.shuffleArray([...selectedQuestions])

    return {
      id: `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      templateId: template.id,
      title: `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`,
      description: template.description,
      questions: shuffledQuestions,
      timeLimit: template.timeLimit,
      passingScore: template.passingScore,
      instructions: template.instructions,
      rules: template.rules,
      createdAt: new Date(),
      isActive: true
    }
  }

  /**
   * Shuffle array utility
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

/**
 * Exam Session Management
 */
export class ExamSessionManager {
  /**
   * Start exam session
   */
  static startExamSession(examId: string, userId: string, timeLimit: number): ExamSession {
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      examId,
      userId,
      startTime: new Date(),
      timeLimit,
      currentQuestionIndex: 0,
      answers: {},
      flaggedQuestions: [],
      status: 'in_progress',
      timeRemaining: timeLimit * 60, // Convert to seconds
      lastActivity: new Date(),
      warnings: []
    }
  }

  /**
   * Update session answer
   */
  static updateAnswer(
    session: ExamSession,
    questionId: string,
    selectedAnswer: any,
    timeSpent: number
  ): ExamSession {
    const currentAnswer = session.answers[questionId] || {
      selectedAnswer: null,
      flagged: false,
      timeSpent: 0,
      visitCount: 0
    }

    return {
      ...session,
      answers: {
        ...session.answers,
        [questionId]: {
          ...currentAnswer,
          selectedAnswer,
          timeSpent: currentAnswer.timeSpent + timeSpent,
          visitCount: currentAnswer.visitCount + 1
        }
      },
      lastActivity: new Date()
    }
  }

  /**
   * Toggle question flag
   */
  static toggleQuestionFlag(session: ExamSession, questionId: string): ExamSession {
    const isFlagged = session.flaggedQuestions.includes(questionId)
    const flaggedQuestions = isFlagged
      ? session.flaggedQuestions.filter(id => id !== questionId)
      : [...session.flaggedQuestions, questionId]

    const answers = {
      ...session.answers,
      [questionId]: {
        ...session.answers[questionId],
        flagged: !isFlagged
      }
    }

    return {
      ...session,
      flaggedQuestions,
      answers,
      lastActivity: new Date()
    }
  }

  /**
   * Navigate to question
   */
  static navigateToQuestion(session: ExamSession, questionIndex: number): ExamSession {
    return {
      ...session,
      currentQuestionIndex: questionIndex,
      lastActivity: new Date()
    }
  }

  /**
   * Add warning to session
   */
  static addWarning(
    session: ExamSession,
    type: ExamSession['warnings'][0]['type'],
    message: string
  ): ExamSession {
    return {
      ...session,
      warnings: [
        ...session.warnings,
        {
          type,
          timestamp: new Date(),
          message
        }
      ]
    }
  }

  /**
   * Update time remaining
   */
  static updateTimeRemaining(session: ExamSession): ExamSession {
    const elapsed = (Date.now() - session.startTime.getTime()) / 1000
    const timeRemaining = Math.max(0, (session.timeLimit * 60) - elapsed)

    let status = session.status
    if (timeRemaining <= 0 && status === 'in_progress') {
      status = 'time_expired'
    }

    return {
      ...session,
      timeRemaining,
      status
    }
  }

  /**
   * Complete exam session
   */
  static completeExamSession(session: ExamSession): ExamSession {
    return {
      ...session,
      endTime: new Date(),
      status: 'completed'
    }
  }

  /**
   * Calculate exam results
   */
  static calculateExamResults(
    session: ExamSession,
    exam: SimulatedExam
  ): ExamResult {
    const answers = Object.entries(session.answers).map(([questionId, answer]) => {
      const question = exam.questions.find(q => q.id === questionId)
      if (!question) {
        return {
          questionId,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: null,
          isCorrect: false,
          points: 0,
          timeSpent: answer.timeSpent
        }
      }

      const isCorrect = this.checkAnswer(question, answer.selectedAnswer)
      return {
        questionId,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: isCorrect ? question.points : 0,
        timeSpent: answer.timeSpent
      }
    })

    const totalScore = answers.reduce((sum, a) => sum + a.points, 0)
    const maxScore = exam.questions.reduce((sum, q) => sum + q.points, 0)
    const percentage = Math.round((totalScore / maxScore) * 100)

    // Calculate subject scores
    const subjectScores = this.calculateSubjectScores(answers, exam.questions)

    // Calculate time spent
    const timeSpent = session.endTime
      ? (session.endTime.getTime() - session.startTime.getTime()) / 1000
      : session.timeLimit * 60

    return {
      id: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: session.id,
      examId: session.examId,
      userId: session.userId,
      score: totalScore,
      percentage,
      passed: percentage >= exam.passingScore,
      timeSpent,
      completedAt: session.endTime || new Date(),
      answers,
      subjectScores
    }
  }

  /**
   * Check if answer is correct
   */
  private static checkAnswer(question: Question, selectedAnswer: any): boolean {
    if (question.type === 'multiple_choice') {
      return selectedAnswer === question.correctAnswer
    }
    if (question.type === 'true_false') {
      return selectedAnswer === question.correctAnswer
    }
    // For essay questions, manual grading would be required
    return false
  }

  /**
   * Calculate scores by subject
   */
  private static calculateSubjectScores(
    answers: ExamResult['answers'],
    questions: Question[]
  ): ExamResult['subjectScores'] {
    const subjectMap = new Map<string, { score: number, maxScore: number }>()

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId)
      if (question) {
        const current = subjectMap.get(question.subject) || { score: 0, maxScore: 0 }
        subjectMap.set(question.subject, {
          score: current.score + answer.points,
          maxScore: current.maxScore + question.points
        })
      }
    })

    return Array.from(subjectMap.entries()).map(([subject, scores]) => ({
      subject,
      score: scores.score,
      maxScore: scores.maxScore,
      percentage: Math.round((scores.score / scores.maxScore) * 100)
    }))
  }
}

/**
 * Exam Analytics and Reporting
 */
export class ExamAnalytics {
  /**
   * Generate performance report
   */
  static generatePerformanceReport(result: ExamResult): {
    summary: {
      grade: string
      performance: 'excellent' | 'good' | 'average' | 'poor'
      timeEfficiency: 'fast' | 'normal' | 'slow'
    }
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    nextSteps: string[]
  } {
    // Grade calculation
    let grade = 'F'
    if (result.percentage >= 90) grade = 'A+'
    else if (result.percentage >= 85) grade = 'A'
    else if (result.percentage >= 80) grade = 'B+'
    else if (result.percentage >= 75) grade = 'B'
    else if (result.percentage >= 70) grade = 'C+'
    else if (result.percentage >= 65) grade = 'C'
    else if (result.percentage >= 60) grade = 'D'

    // Performance level
    let performance: 'excellent' | 'good' | 'average' | 'poor'
    if (result.percentage >= 85) performance = 'excellent'
    else if (result.percentage >= 75) performance = 'good'
    else if (result.percentage >= 60) performance = 'average'
    else performance = 'poor'

    // Time efficiency
    const avgTimePerQuestion = result.timeSpent / result.answers.length
    let timeEfficiency: 'fast' | 'normal' | 'slow'
    if (avgTimePerQuestion < 120) timeEfficiency = 'fast' // < 2 min per question
    else if (avgTimePerQuestion < 240) timeEfficiency = 'normal' // 2-4 min
    else timeEfficiency = 'slow' // > 4 min

    // Identify strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []

    result.subjectScores.forEach(subject => {
      if (subject.percentage >= 80) {
        strengths.push(`Excelente desempenho em ${subject.subject}`)
      } else if (subject.percentage < 60) {
        weaknesses.push(`Necessita melhorar em ${subject.subject}`)
      }
    })

    // Generate recommendations
    const recommendations: string[] = []
    if (performance === 'poor') {
      recommendations.push('Revise os conceitos fundamentais antes de tentar novamente')
      recommendations.push('Considere estudar com flashcards para fixar o conteúdo')
    } else if (performance === 'average') {
      recommendations.push('Foque nas matérias com menor desempenho')
      recommendations.push('Pratique mais questões similares')
    }

    if (timeEfficiency === 'slow') {
      recommendations.push('Pratique gerenciamento de tempo durante os estudos')
      recommendations.push('Faça simulados cronometrados regularmente')
    }

    // Next steps
    const nextSteps: string[] = []
    if (result.passed) {
      nextSteps.push('Parabéns! Continue praticando para manter o nível')
      nextSteps.push('Considere simulados mais avançados')
    } else {
      nextSteps.push('Revise as questões que errou')
      nextSteps.push('Estude as matérias com menor desempenho')
      nextSteps.push('Refaça o simulado em uma semana')
    }

    return {
      summary: { grade, performance, timeEfficiency },
      strengths,
      weaknesses,
      recommendations,
      nextSteps
    }
  }

  /**
   * Compare with historical performance
   */
  static compareWithHistory(
    currentResult: ExamResult,
    historicalResults: ExamResult[]
  ): {
    trend: 'improving' | 'stable' | 'declining'
    averageScore: number
    bestScore: number
    improvement: number
  } {
    if (historicalResults.length === 0) {
      return {
        trend: 'stable',
        averageScore: currentResult.percentage,
        bestScore: currentResult.percentage,
        improvement: 0
      }
    }

    const scores = historicalResults.map(r => r.percentage)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const bestScore = Math.max(...scores)
    const lastThreeScores = scores.slice(-3)
    const improvement = currentResult.percentage - averageScore

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining'
    if (lastThreeScores.length >= 2) {
      const recentAvg = lastThreeScores.reduce((sum, score) => sum + score, 0) / lastThreeScores.length
      if (currentResult.percentage > recentAvg + 5) trend = 'improving'
      else if (currentResult.percentage < recentAvg - 5) trend = 'declining'
      else trend = 'stable'
    } else {
      trend = 'stable'
    }

    return {
      trend,
      averageScore: Math.round(averageScore),
      bestScore,
      improvement: Math.round(improvement)
    }
  }
}

