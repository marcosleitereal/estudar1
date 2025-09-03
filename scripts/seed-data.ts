// Seed Data Script for Estudar.Pro Platform
import { QuestionSystem } from '../lib/quiz/question-system'
import { ExamTemplateManager } from '../lib/quiz/exam-system'

/**
 * Constitutional Law Articles (Sample from CF/88)
 */
export const constitutionalArticles = [
  {
    id: 'cf88_art1',
    number: 'Art. 1º',
    title: 'Fundamentos da República',
    content: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',
    items: [
      { number: 'I', content: 'a soberania;' },
      { number: 'II', content: 'a cidadania;' },
      { number: 'III', content: 'a dignidade da pessoa humana;' },
      { number: 'IV', content: 'os valores sociais do trabalho e da livre iniciativa;' },
      { number: 'V', content: 'o pluralismo político.' }
    ],
    paragraphs: [
      {
        number: 'Parágrafo único',
        content: 'Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.'
      }
    ],
    subject: 'Direito Constitucional',
    law: 'Constituição Federal de 1988',
    chapter: 'Dos Princípios Fundamentais',
    tags: ['fundamentos', 'república', 'democracia', 'soberania', 'cidadania']
  },
  {
    id: 'cf88_art2',
    number: 'Art. 2º',
    title: 'Separação dos Poderes',
    content: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
    subject: 'Direito Constitucional',
    law: 'Constituição Federal de 1988',
    chapter: 'Dos Princípios Fundamentais',
    tags: ['poderes', 'separação', 'legislativo', 'executivo', 'judiciário']
  },
  {
    id: 'cf88_art3',
    number: 'Art. 3º',
    title: 'Objetivos Fundamentais',
    content: 'Constituem objetivos fundamentais da República Federativa do Brasil:',
    items: [
      { number: 'I', content: 'construir uma sociedade livre, justa e solidária;' },
      { number: 'II', content: 'garantir o desenvolvimento nacional;' },
      { number: 'III', content: 'erradicar a pobreza e a marginalização e reduzir as desigualdades sociais e regionais;' },
      { number: 'IV', content: 'promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação.' }
    ],
    subject: 'Direito Constitucional',
    law: 'Constituição Federal de 1988',
    chapter: 'Dos Princípios Fundamentais',
    tags: ['objetivos', 'sociedade', 'desenvolvimento', 'igualdade', 'discriminação']
  },
  {
    id: 'cf88_art5_caput',
    number: 'Art. 5º',
    title: 'Direitos e Deveres Individuais e Coletivos',
    content: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
    subject: 'Direito Constitucional',
    law: 'Constituição Federal de 1988',
    chapter: 'Dos Direitos e Deveres Individuais e Coletivos',
    tags: ['igualdade', 'direitos fundamentais', 'vida', 'liberdade', 'propriedade']
  },
  {
    id: 'cf88_art6',
    number: 'Art. 6º',
    title: 'Direitos Sociais',
    content: 'São direitos sociais a educação, a saúde, a alimentação, o trabalho, a moradia, o transporte, o lazer, a segurança, a previdência social, a proteção à maternidade e à infância, a assistência aos desamparados, na forma desta Constituição.',
    subject: 'Direito Constitucional',
    law: 'Constituição Federal de 1988',
    chapter: 'Dos Direitos Sociais',
    tags: ['direitos sociais', 'educação', 'saúde', 'trabalho', 'moradia']
  }
]

/**
 * Civil Code Articles (Sample from CC/02)
 */
export const civilCodeArticles = [
  {
    id: 'cc02_art1',
    number: 'Art. 1º',
    title: 'Fonte do Direito',
    content: 'Salvo disposição contrária, a lei começa a vigorar em todo o país quarenta e cinco dias depois de oficialmente publicada.',
    subject: 'Direito Civil',
    law: 'Código Civil - Lei 10.406/02',
    chapter: 'Da Lei de Introdução às Normas do Direito Brasileiro',
    tags: ['vigência', 'lei', 'publicação', 'vacatio legis']
  },
  {
    id: 'cc02_art2',
    number: 'Art. 2º',
    title: 'Personalidade Civil',
    content: 'A personalidade civil da pessoa começa do nascimento com vida; mas a lei põe a salvo, desde a concepção, os direitos do nascituro.',
    subject: 'Direito Civil',
    law: 'Código Civil - Lei 10.406/02',
    chapter: 'Das Pessoas Naturais',
    tags: ['personalidade', 'nascimento', 'nascituro', 'pessoa natural']
  },
  {
    id: 'cc02_art3',
    number: 'Art. 3º',
    title: 'Incapacidade Absoluta',
    content: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil os menores de 16 (dezesseis) anos.',
    subject: 'Direito Civil',
    law: 'Código Civil - Lei 10.406/02',
    chapter: 'Das Pessoas Naturais',
    tags: ['incapacidade', 'menor', 'atos civis', 'representação']
  },
  {
    id: 'cc02_art4',
    number: 'Art. 4º',
    title: 'Incapacidade Relativa',
    content: 'São incapazes, relativamente a certos atos ou à maneira de os exercer:',
    items: [
      { number: 'I', content: 'os maiores de dezesseis e menores de dezoito anos;' },
      { number: 'II', content: 'os ébrios habituais e os viciados em tóxico;' },
      { number: 'III', content: 'aqueles que, por causa transitória ou permanente, não puderem exprimir sua vontade;' },
      { number: 'IV', content: 'os pródigos.' }
    ],
    paragraphs: [
      {
        number: 'Parágrafo único',
        content: 'A capacidade dos indígenas será regulada por legislação especial.'
      }
    ],
    subject: 'Direito Civil',
    law: 'Código Civil - Lei 10.406/02',
    chapter: 'Das Pessoas Naturais',
    tags: ['incapacidade relativa', 'assistência', 'menor', 'pródigo']
  }
]

/**
 * Sample Legal Questions
 */
export const sampleQuestions = [
  // Constitutional Law Questions
  {
    type: 'multiple_choice' as const,
    subject: 'Direito Constitucional',
    topic: 'Princípios Fundamentais',
    difficulty: 'medium' as const,
    question: 'Segundo o Art. 1º da Constituição Federal, são fundamentos da República Federativa do Brasil, EXCETO:',
    options: [
      'A soberania',
      'A cidadania',
      'A dignidade da pessoa humana',
      'A separação dos poderes'
    ],
    correctAnswer: 3,
    explanation: 'A separação dos poderes está prevista no Art. 2º da CF/88, não sendo um dos fundamentos listados no Art. 1º. Os fundamentos são: soberania, cidadania, dignidade da pessoa humana, valores sociais do trabalho e da livre iniciativa, e pluralismo político.',
    source: {
      type: 'article' as const,
      reference: 'Art. 1º, CF/88'
    },
    tags: ['fundamentos', 'república', 'constituição'],
    points: 1,
    timeLimit: 120,
    createdBy: 'system'
  },
  {
    type: 'multiple_choice' as const,
    subject: 'Direito Constitucional',
    topic: 'Direitos Sociais',
    difficulty: 'easy' as const,
    question: 'Qual dos seguintes NÃO é considerado um direito social segundo o Art. 6º da CF/88?',
    options: [
      'Educação',
      'Saúde',
      'Propriedade privada',
      'Trabalho'
    ],
    correctAnswer: 2,
    explanation: 'A propriedade privada é um direito individual previsto no Art. 5º da CF/88, não um direito social. Os direitos sociais estão elencados no Art. 6º.',
    source: {
      type: 'article' as const,
      reference: 'Art. 6º, CF/88'
    },
    tags: ['direitos sociais', 'constituição'],
    points: 1,
    timeLimit: 90,
    createdBy: 'system'
  },
  {
    type: 'true_false' as const,
    subject: 'Direito Constitucional',
    topic: 'Separação dos Poderes',
    difficulty: 'easy' as const,
    question: 'Segundo a Constituição Federal, são Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.',
    correctAnswer: true,
    explanation: 'Verdadeiro. Esta é a redação literal do Art. 2º da Constituição Federal de 1988.',
    source: {
      type: 'article' as const,
      reference: 'Art. 2º, CF/88'
    },
    tags: ['separação dos poderes', 'constituição'],
    points: 1,
    timeLimit: 60,
    createdBy: 'system'
  },

  // Civil Law Questions
  {
    type: 'multiple_choice' as const,
    subject: 'Direito Civil',
    topic: 'Personalidade Jurídica',
    difficulty: 'medium' as const,
    question: 'Segundo o Código Civil, a personalidade civil da pessoa natural:',
    options: [
      'Começa com a concepção',
      'Começa do nascimento com vida',
      'Começa com o registro de nascimento',
      'Começa aos 18 anos de idade'
    ],
    correctAnswer: 1,
    explanation: 'Conforme o Art. 2º do Código Civil, a personalidade civil começa do nascimento com vida, mas a lei põe a salvo os direitos do nascituro desde a concepção.',
    source: {
      type: 'law' as const,
      reference: 'Art. 2º, CC'
    },
    tags: ['personalidade', 'nascimento', 'código civil'],
    points: 1,
    timeLimit: 120,
    createdBy: 'system'
  },
  {
    type: 'multiple_choice' as const,
    subject: 'Direito Civil',
    topic: 'Capacidade Civil',
    difficulty: 'hard' as const,
    question: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil:',
    options: [
      'Os maiores de 16 e menores de 18 anos',
      'Os menores de 16 anos',
      'Os ébrios habituais',
      'Os pródigos'
    ],
    correctAnswer: 1,
    explanation: 'Segundo o Art. 3º do Código Civil, são absolutamente incapazes apenas os menores de 16 anos. As demais opções referem-se à incapacidade relativa (Art. 4º).',
    source: {
      type: 'law' as const,
      reference: 'Art. 3º, CC'
    },
    tags: ['incapacidade', 'menor', 'código civil'],
    points: 2,
    timeLimit: 150,
    createdBy: 'system'
  }
]

/**
 * Sample Flashcards
 */
export const sampleFlashcards = [
  // Constitutional Law Flashcards
  {
    id: 'fc_cf_fundamentos',
    deckId: 'deck_direito_constitucional',
    type: 'basic' as const,
    front: 'Quais são os 5 fundamentos da República Federativa do Brasil segundo o Art. 1º da CF/88?',
    back: `1. Soberania
2. Cidadania  
3. Dignidade da pessoa humana
4. Valores sociais do trabalho e da livre iniciativa
5. Pluralismo político`,
    subject: 'Direito Constitucional',
    topic: 'Princípios Fundamentais',
    difficulty: 'medium' as const,
    tags: ['fundamentos', 'república', 'CF88'],
    source: {
      type: 'article' as const,
      reference: 'Art. 1º, CF/88'
    },
    createdBy: 'system'
  },
  {
    id: 'fc_cf_poderes',
    deckId: 'deck_direito_constitucional',
    type: 'basic' as const,
    front: 'Segundo o Art. 2º da CF/88, quais são os Poderes da União?',
    back: 'Legislativo, Executivo e Judiciário - independentes e harmônicos entre si.',
    subject: 'Direito Constitucional',
    topic: 'Separação dos Poderes',
    difficulty: 'easy' as const,
    tags: ['poderes', 'separação', 'CF88'],
    source: {
      type: 'article' as const,
      reference: 'Art. 2º, CF/88'
    },
    createdBy: 'system'
  },
  {
    id: 'fc_cf_objetivos',
    deckId: 'deck_direito_constitucional',
    type: 'cloze' as const,
    front: 'Os objetivos fundamentais da República são: construir uma {{c1::sociedade livre, justa e solidária}}, garantir o {{c2::desenvolvimento nacional}}, erradicar a {{c3::pobreza e a marginalização}} e promover o {{c4::bem de todos}}.',
    back: 'Art. 3º da CF/88 - Objetivos fundamentais da República',
    subject: 'Direito Constitucional',
    topic: 'Princípios Fundamentais',
    difficulty: 'medium' as const,
    tags: ['objetivos', 'república', 'CF88'],
    source: {
      type: 'article' as const,
      reference: 'Art. 3º, CF/88'
    },
    createdBy: 'system'
  },

  // Civil Law Flashcards
  {
    id: 'fc_cc_personalidade',
    deckId: 'deck_direito_civil',
    type: 'basic' as const,
    front: 'Quando começa a personalidade civil da pessoa natural?',
    back: 'Do nascimento com vida (Art. 2º, CC). Mas a lei põe a salvo os direitos do nascituro desde a concepção.',
    subject: 'Direito Civil',
    topic: 'Personalidade Jurídica',
    difficulty: 'easy' as const,
    tags: ['personalidade', 'nascimento', 'nascituro'],
    source: {
      type: 'law' as const,
      reference: 'Art. 2º, CC'
    },
    createdBy: 'system'
  },
  {
    id: 'fc_cc_incapacidade_absoluta',
    deckId: 'deck_direito_civil',
    type: 'cloze' as const,
    front: 'São absolutamente incapazes de exercer pessoalmente os atos da vida civil os {{c1::menores de 16 anos}}.',
    back: 'Art. 3º do Código Civil - Incapacidade absoluta',
    subject: 'Direito Civil',
    topic: 'Capacidade Civil',
    difficulty: 'easy' as const,
    tags: ['incapacidade', 'menor', 'absoluta'],
    source: {
      type: 'law' as const,
      reference: 'Art. 3º, CC'
    },
    createdBy: 'system'
  },
  {
    id: 'fc_cc_incapacidade_relativa',
    deckId: 'deck_direito_civil',
    type: 'basic' as const,
    front: 'Quem são os relativamente incapazes segundo o Art. 4º do CC?',
    back: `1. Maiores de 16 e menores de 18 anos
2. Ébrios habituais e viciados em tóxico
3. Aqueles que não puderem exprimir sua vontade
4. Os pródigos`,
    subject: 'Direito Civil',
    topic: 'Capacidade Civil',
    difficulty: 'medium' as const,
    tags: ['incapacidade', 'relativa', 'assistência'],
    source: {
      type: 'law' as const,
      reference: 'Art. 4º, CC'
    },
    createdBy: 'system'
  }
]

/**
 * Sample Decks
 */
export const sampleDecks = [
  {
    id: 'deck_direito_constitucional',
    name: 'Direito Constitucional - Fundamentos',
    description: 'Flashcards sobre princípios fundamentais, direitos e garantias constitucionais',
    subject: 'Direito Constitucional',
    isPublic: true,
    tags: ['constituição', 'direitos fundamentais', 'princípios'],
    createdBy: 'system',
    cardCount: 15,
    studyCount: 0,
    averageRating: 0
  },
  {
    id: 'deck_direito_civil',
    name: 'Direito Civil - Parte Geral',
    description: 'Flashcards sobre personalidade, capacidade e direitos da personalidade',
    subject: 'Direito Civil',
    isPublic: true,
    tags: ['código civil', 'personalidade', 'capacidade'],
    createdBy: 'system',
    cardCount: 12,
    studyCount: 0,
    averageRating: 0
  },
  {
    id: 'deck_direito_penal',
    name: 'Direito Penal - Princípios',
    description: 'Flashcards sobre princípios penais e teoria geral do crime',
    subject: 'Direito Penal',
    isPublic: true,
    tags: ['direito penal', 'princípios', 'crime'],
    createdBy: 'system',
    cardCount: 18,
    studyCount: 0,
    averageRating: 0
  }
]

/**
 * Sample Users (for testing)
 */
export const sampleUsers = [
  {
    id: 'user_admin',
    email: 'admin@estudar.pro',
    name: 'Administrador',
    role: 'admin' as const,
    isPremium: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
    stats: {
      quizzesCompleted: 45,
      studyTime: 2400, // minutes
      averageScore: 85,
      streak: 12
    }
  },
  {
    id: 'user_student1',
    email: 'joao@email.com',
    name: 'João Silva',
    role: 'student' as const,
    isPremium: false,
    createdAt: new Date('2024-02-15'),
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    stats: {
      quizzesCompleted: 23,
      studyTime: 1200,
      averageScore: 78,
      streak: 5
    }
  },
  {
    id: 'user_student2',
    email: 'maria@email.com',
    name: 'Maria Santos',
    role: 'student' as const,
    isPremium: true,
    createdAt: new Date('2024-03-10'),
    lastLogin: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    stats: {
      quizzesCompleted: 67,
      studyTime: 3600,
      averageScore: 92,
      streak: 18
    }
  }
]

/**
 * Sample Summaries (Súmulas)
 */
export const sampleSummaries = [
  {
    id: 'sumula_stf_1',
    number: 'Súmula 1',
    court: 'STF',
    content: 'É vedado ao Poder Judiciário, que não tem função legislativa, aumentar vencimentos de servidores públicos sob fundamento de isonomia.',
    subject: 'Direito Administrativo',
    tags: ['servidor público', 'vencimentos', 'isonomia', 'judiciário'],
    year: 1963,
    status: 'vigente' as const
  },
  {
    id: 'sumula_stj_1',
    number: 'Súmula 1',
    court: 'STJ',
    content: 'O foro do domicílio ou da residência do alimentando é o competente para a ação de investigação de paternidade, quando cumulada com a de alimentos.',
    subject: 'Direito Civil',
    tags: ['alimentos', 'paternidade', 'competência', 'foro'],
    year: 1990,
    status: 'vigente' as const
  },
  {
    id: 'sumula_vinculante_1',
    number: 'Súmula Vinculante 1',
    court: 'STF',
    content: 'Ofende o princípio da moralidade administrativa a nomeação de cônjuge, companheiro ou parente em linha reta, colateral ou por afinidade, até o terceiro grau, inclusive, da autoridade nomeante ou de servidor da mesma pessoa jurídica, investido em cargo de direção, chefia ou assessoramento, para o exercício de cargo em comissão ou de confiança, ou, ainda, de função gratificada na Administração Pública direta e indireta, em qualquer dos Poderes da União, dos Estados, do Distrito Federal e dos Municípios, compreendido o ajuste mediante designações recíprocas, exceto os cargos de natureza política, considerados apenas aqueles que integram o primeiro escalão da Administração, seus secretários e assessores imediatos, bem como os cargos de natureza jurídica cujo provimento seja atribuído privativamente ao Chefe do Executivo.',
    subject: 'Direito Administrativo',
    tags: ['nepotismo', 'moralidade', 'administração pública', 'nomeação'],
    year: 2007,
    status: 'vigente' as const
  }
]

/**
 * Main seed function
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create sample questions
    console.log('📝 Creating sample questions...')
    const questions = sampleQuestions.map(q => QuestionSystem.createQuestion(q))
    console.log(`✅ Created ${questions.length} questions`)

    // Create sample flashcards and decks
    console.log('🃏 Creating sample flashcards and decks...')
    console.log(`✅ Created ${sampleDecks.length} decks`)
    console.log(`✅ Created ${sampleFlashcards.length} flashcards`)

    // Create sample legal content
    console.log('⚖️ Creating sample legal content...')
    console.log(`✅ Created ${constitutionalArticles.length} constitutional articles`)
    console.log(`✅ Created ${civilCodeArticles.length} civil code articles`)
    console.log(`✅ Created ${sampleSummaries.length} court summaries`)

    // Create sample users
    console.log('👥 Creating sample users...')
    console.log(`✅ Created ${sampleUsers.length} test users`)

    console.log('🎉 Database seeding completed successfully!')
    
    return {
      questions,
      flashcards: sampleFlashcards,
      decks: sampleDecks,
      articles: [...constitutionalArticles, ...civilCodeArticles],
      summaries: sampleSummaries,
      users: sampleUsers
    }

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

/**
 * Export all sample data for use in components
 */
export const seedData = {
  questions: sampleQuestions,
  flashcards: sampleFlashcards,
  decks: sampleDecks,
  articles: [...constitutionalArticles, ...civilCodeArticles],
  summaries: sampleSummaries,
  users: sampleUsers
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}

