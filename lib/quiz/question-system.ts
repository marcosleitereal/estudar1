// Quiz and Exam Question System for Legal Studies

export interface Question {
  id: string
  type: 'multiple_choice' | 'true_false' | 'essay' | 'case_study'
  subject: string
  topic: string
  subtopic?: string
  difficulty: 'easy' | 'medium' | 'hard'
  question: string
  options?: string[] // For multiple choice
  correctAnswer: string | number // Index for MC, boolean for T/F, text for essay
  explanation: string
  source?: {
    type: 'law' | 'article' | 'sumula' | 'jurisprudence' | 'doctrine'
    reference: string
    url?: string
  }
  tags: string[]
  examBoard?: string // OAB, Concurso, etc.
  year?: number
  points: number
  timeLimit?: number // seconds
  createdAt: Date
  updatedAt: Date
  createdBy: string
  statistics: {
    totalAttempts: number
    correctAttempts: number
    averageTime: number
    difficulty_rating: number // 1-5 based on user performance
  }
}

export interface Quiz {
  id: string
  title: string
  description: string
  type: 'practice' | 'exam' | 'custom'
  subject: string
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard'
  questionIds: string[]
  timeLimit?: number // minutes
  passingScore: number // percentage
  maxAttempts?: number
  isPublic: boolean
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  statistics: {
    totalAttempts: number
    averageScore: number
    averageTime: number
    completionRate: number
  }
}

export interface QuizAttempt {
  id: string
  quizId: string
  userId: string
  startTime: Date
  endTime?: Date
  answers: Array<{
    questionId: string
    selectedAnswer: string | number | boolean
    isCorrect: boolean
    timeSpent: number
    confidence?: number // 1-5 scale
  }>
  score: number
  percentage: number
  passed: boolean
  timeSpent: number // seconds
  completed: boolean
}

export interface ExamSession {
  id: string
  title: string
  description: string
  type: 'oab' | 'concurso' | 'vestibular' | 'custom'
  questionIds: string[]
  timeLimit: number // minutes
  startTime: Date
  endTime?: Date
  userId: string
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
  currentQuestionIndex: number
  answers: Record<string, any>
  flaggedQuestions: string[]
  timeRemaining: number
}

/**
 * Question Generation and Management System
 */
export class QuestionSystem {
  /**
   * Create a new question
   */
  static createQuestion(questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'statistics'>): Question {
    return {
      ...questionData,
      id: this.generateId('question'),
      createdAt: new Date(),
      updatedAt: new Date(),
      statistics: {
        totalAttempts: 0,
        correctAttempts: 0,
        averageTime: 0,
        difficulty_rating: 3 // Default to medium
      }
    }
  }

  /**
   * Generate questions from legal content
   */
  static generateQuestionsFromContent(
    content: {
      title: string
      text: string
      type: 'article' | 'sumula' | 'law'
      reference: string
      subject: string
    },
    createdBy: string
  ): Question[] {
    const questions: Question[] = []

    // Generate definition question
    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: content.subject,
      topic: content.title,
      difficulty: 'medium',
      question: `Segundo ${content.reference}, qual das alternativas está CORRETA?`,
      options: [
        this.extractKeyPhrase(content.text),
        this.generateDistractor(content.text, 1),
        this.generateDistractor(content.text, 2),
        this.generateDistractor(content.text, 3)
      ],
      correctAnswer: 0,
      explanation: `Conforme estabelecido em ${content.reference}: ${content.text}`,
      source: {
        type: content.type,
        reference: content.reference
      },
      tags: [content.type, content.subject],
      points: 1,
      timeLimit: 120,
      createdBy
    }))

    // Generate application question
    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: content.subject,
      topic: content.title,
      difficulty: 'hard',
      question: `Em uma situação prática, considerando ${content.reference}, qual seria a aplicação CORRETA?`,
      options: [
        'Aplicação direta conforme previsto na norma',
        'Aplicação com interpretação extensiva',
        'Aplicação restritiva apenas aos casos expressos',
        'Não se aplica a casos concretos'
      ],
      correctAnswer: 0,
      explanation: `A aplicação deve seguir o disposto em ${content.reference}, considerando o contexto específico.`,
      source: {
        type: content.type,
        reference: content.reference
      },
      tags: [content.type, content.subject, 'aplicação'],
      points: 2,
      timeLimit: 180,
      createdBy
    }))

    return questions
  }

  /**
   * Extract key phrase from legal text
   */
  private static extractKeyPhrase(text: string): string {
    const sentences = text.split(/[.!?]+/)
    const mainSentence = sentences.find(s => s.length > 20 && s.length < 150) || sentences[0]
    return mainSentence.trim()
  }

  /**
   * Generate distractor options
   */
  private static generateDistractor(text: string, variant: number): string {
    const basePhrase = this.extractKeyPhrase(text)
    
    const distractors = [
      basePhrase.replace(/direito/gi, 'dever'),
      basePhrase.replace(/obrigatório/gi, 'facultativo'),
      basePhrase.replace(/todos/gi, 'alguns'),
      basePhrase.replace(/sempre/gi, 'nunca'),
      basePhrase.replace(/pode/gi, 'deve'),
      basePhrase.replace(/garantia/gi, 'restrição')
    ]
    
    return distractors[variant % distractors.length] || `Alternativa incorreta ${variant}`
  }

  /**
   * Create predefined legal questions
   */
  static createLegalQuestions(createdBy: string): Question[] {
    const questions: Question[] = []

    // Constitutional Law Questions
    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: 'Direito Constitucional',
      topic: 'Direitos Fundamentais',
      difficulty: 'medium',
      question: 'Segundo o Art. 5º da Constituição Federal, todos são iguais perante a lei. Qual princípio está sendo expresso?',
      options: [
        'Princípio da Isonomia',
        'Princípio da Legalidade',
        'Princípio da Moralidade',
        'Princípio da Proporcionalidade'
      ],
      correctAnswer: 0,
      explanation: 'O princípio da isonomia (igualdade) está expresso no caput do Art. 5º da CF/88, estabelecendo que todos são iguais perante a lei.',
      source: {
        type: 'article',
        reference: 'Art. 5º, caput, CF/88'
      },
      tags: ['constituição', 'direitos fundamentais', 'isonomia'],
      points: 1,
      timeLimit: 120,
      createdBy
    }))

    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: 'Direito Constitucional',
      topic: 'Direitos Sociais',
      difficulty: 'easy',
      question: 'Qual dos seguintes NÃO é considerado um direito social segundo o Art. 6º da CF/88?',
      options: [
        'Educação',
        'Saúde',
        'Propriedade privada',
        'Trabalho'
      ],
      correctAnswer: 2,
      explanation: 'A propriedade privada é um direito individual (Art. 5º), não um direito social. Os direitos sociais estão no Art. 6º.',
      source: {
        type: 'article',
        reference: 'Art. 6º, CF/88'
      },
      tags: ['constituição', 'direitos sociais'],
      points: 1,
      timeLimit: 90,
      createdBy
    }))

    // Civil Law Questions
    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: 'Direito Civil',
      topic: 'Personalidade Jurídica',
      difficulty: 'medium',
      question: 'Segundo o Código Civil, a personalidade civil da pessoa natural começa:',
      options: [
        'Com o nascimento com vida',
        'Com a concepção',
        'Com o registro de nascimento',
        'Aos 18 anos de idade'
      ],
      correctAnswer: 0,
      explanation: 'Conforme o Art. 2º do CC, a personalidade civil começa do nascimento com vida, mas a lei põe a salvo os direitos do nascituro.',
      source: {
        type: 'law',
        reference: 'Art. 2º, CC'
      },
      tags: ['código civil', 'personalidade', 'nascimento'],
      points: 1,
      timeLimit: 120,
      createdBy
    }))

    // Criminal Law Questions
    questions.push(this.createQuestion({
      type: 'multiple_choice',
      subject: 'Direito Penal',
      topic: 'Princípios Penais',
      difficulty: 'hard',
      question: 'O princípio "nullum crimen, nulla poena sine lege" expressa:',
      options: [
        'Princípio da Legalidade',
        'Princípio da Anterioridade',
        'Princípio da Reserva Legal',
        'Todas as alternativas estão corretas'
      ],
      correctAnswer: 3,
      explanation: 'O brocardo expressa os princípios da legalidade, anterioridade e reserva legal, todos fundamentais no Direito Penal.',
      source: {
        type: 'law',
        reference: 'Art. 1º, CP'
      },
      tags: ['direito penal', 'princípios', 'legalidade'],
      points: 2,
      timeLimit: 180,
      createdBy
    }))

    // Administrative Law Questions
    questions.push(this.createQuestion({
      type: 'true_false',
      subject: 'Direito Administrativo',
      topic: 'Princípios da Administração',
      difficulty: 'easy',
      question: 'A administração pública está sujeita aos princípios da legalidade, impessoalidade, moralidade, publicidade e eficiência.',
      correctAnswer: true,
      explanation: 'Verdadeiro. Estes são os princípios expressos no Art. 37, caput, da CF/88 (LIMPE).',
      source: {
        type: 'article',
        reference: 'Art. 37, caput, CF/88'
      },
      tags: ['administração pública', 'princípios', 'LIMPE'],
      points: 1,
      timeLimit: 60,
      createdBy
    }))

    return questions
  }

  /**
   * Filter questions by criteria
   */
  static filterQuestions(
    questions: Question[],
    filters: {
      subject?: string
      difficulty?: string
      type?: string
      tags?: string[]
      examBoard?: string
    }
  ): Question[] {
    return questions.filter(question => {
      if (filters.subject && question.subject !== filters.subject) return false
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false
      if (filters.type && question.type !== filters.type) return false
      if (filters.examBoard && question.examBoard !== filters.examBoard) return false
      if (filters.tags && !filters.tags.some(tag => question.tags.includes(tag))) return false
      
      return true
    })
  }

  /**
   * Generate quiz from questions
   */
  static createQuiz(
    title: string,
    description: string,
    questions: Question[],
    options: {
      type?: Quiz['type']
      timeLimit?: number
      passingScore?: number
      isPublic?: boolean
    } = {},
    createdBy: string
  ): Quiz {
    return {
      id: this.generateId('quiz'),
      title,
      description,
      type: options.type || 'practice',
      subject: questions[0]?.subject || 'Mixed',
      difficulty: this.calculateQuizDifficulty(questions),
      questionIds: questions.map(q => q.id),
      timeLimit: options.timeLimit,
      passingScore: options.passingScore || 70,
      isPublic: options.isPublic || false,
      tags: Array.from(new Set(questions.flatMap(q => q.tags))),
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy,
      statistics: {
        totalAttempts: 0,
        averageScore: 0,
        averageTime: 0,
        completionRate: 0
      }
    }
  }

  /**
   * Calculate quiz difficulty based on questions
   */
  private static calculateQuizDifficulty(questions: Question[]): Quiz['difficulty'] {
    const difficulties = questions.map(q => {
      switch (q.difficulty) {
        case 'easy': return 1
        case 'medium': return 2
        case 'hard': return 3
        default: return 2
      }
    })

    const average = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length

    if (average <= 1.3) return 'easy'
    if (average <= 2.3) return 'medium'
    if (average >= 2.7) return 'hard'
    return 'mixed'
  }

  /**
   * Generate unique ID
   */
  private static generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Quiz Session Manager
 */
export class QuizSessionManager {
  /**
   * Start quiz attempt
   */
  static startQuizAttempt(quizId: string, userId: string): QuizAttempt {
    return {
      id: QuestionSystem.generateId('attempt'),
      quizId,
      userId,
      startTime: new Date(),
      answers: [],
      score: 0,
      percentage: 0,
      passed: false,
      timeSpent: 0,
      completed: false
    }
  }

  /**
   * Submit answer
   */
  static submitAnswer(
    attempt: QuizAttempt,
    questionId: string,
    selectedAnswer: any,
    isCorrect: boolean,
    timeSpent: number,
    confidence?: number
  ): QuizAttempt {
    const updatedAnswers = [...attempt.answers, {
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      confidence
    }]

    const correctAnswers = updatedAnswers.filter(a => a.isCorrect).length
    const score = correctAnswers
    const percentage = (correctAnswers / updatedAnswers.length) * 100

    return {
      ...attempt,
      answers: updatedAnswers,
      score,
      percentage: Math.round(percentage)
    }
  }

  /**
   * Complete quiz attempt
   */
  static completeQuizAttempt(attempt: QuizAttempt, passingScore: number): QuizAttempt {
    const totalTimeSpent = attempt.answers.reduce((sum, a) => sum + a.timeSpent, 0)

    return {
      ...attempt,
      endTime: new Date(),
      timeSpent: totalTimeSpent,
      passed: attempt.percentage >= passingScore,
      completed: true
    }
  }

  /**
   * Calculate detailed results
   */
  static calculateResults(attempt: QuizAttempt, questions: Question[]): {
    summary: {
      totalQuestions: number
      correctAnswers: number
      incorrectAnswers: number
      percentage: number
      grade: string
      timeSpent: string
      passed: boolean
    }
    bySubject: Array<{
      subject: string
      total: number
      correct: number
      percentage: number
    }>
    byDifficulty: Array<{
      difficulty: string
      total: number
      correct: number
      percentage: number
    }>
    recommendations: string[]
  } {
    const totalQuestions = attempt.answers.length
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length
    const incorrectAnswers = totalQuestions - correctAnswers

    // Grade calculation
    let grade = 'F'
    if (attempt.percentage >= 90) grade = 'A'
    else if (attempt.percentage >= 80) grade = 'B'
    else if (attempt.percentage >= 70) grade = 'C'
    else if (attempt.percentage >= 60) grade = 'D'

    // Time formatting
    const minutes = Math.floor(attempt.timeSpent / 60)
    const seconds = attempt.timeSpent % 60
    const timeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`

    // Subject analysis
    const subjectMap = new Map<string, { total: number, correct: number }>()
    attempt.answers.forEach((answer, index) => {
      const question = questions[index]
      if (question) {
        const current = subjectMap.get(question.subject) || { total: 0, correct: 0 }
        subjectMap.set(question.subject, {
          total: current.total + 1,
          correct: current.correct + (answer.isCorrect ? 1 : 0)
        })
      }
    })

    const bySubject = Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))

    // Difficulty analysis
    const difficultyMap = new Map<string, { total: number, correct: number }>()
    attempt.answers.forEach((answer, index) => {
      const question = questions[index]
      if (question) {
        const current = difficultyMap.get(question.difficulty) || { total: 0, correct: 0 }
        difficultyMap.set(question.difficulty, {
          total: current.total + 1,
          correct: current.correct + (answer.isCorrect ? 1 : 0)
        })
      }
    })

    const byDifficulty = Array.from(difficultyMap.entries()).map(([difficulty, stats]) => ({
      difficulty,
      total: stats.total,
      correct: stats.correct,
      percentage: Math.round((stats.correct / stats.total) * 100)
    }))

    // Recommendations
    const recommendations: string[] = []
    if (attempt.percentage < 70) {
      recommendations.push('Considere revisar o material antes de tentar novamente')
    }
    
    bySubject.forEach(subject => {
      if (subject.percentage < 60) {
        recommendations.push(`Foque mais em estudar ${subject.subject}`)
      }
    })

    if (attempt.timeSpent < 60) {
      recommendations.push('Tente dedicar mais tempo para ler as questões com atenção')
    }

    return {
      summary: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        percentage: attempt.percentage,
        grade,
        timeSpent,
        passed: attempt.passed
      },
      bySubject,
      byDifficulty,
      recommendations
    }
  }
}

