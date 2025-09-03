import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, context } = body
    
    console.log('Ask API - POST request:', { question, hasContext: !!context })
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        answer: 'Sistema de IA não configurado. Por favor, configure a chave da OpenAI.',
        sources: [],
        confidence: 0
      })
    }

    // Preparar prompt melhorado
    const systemPrompt = `Você é um assistente jurídico especializado em direito brasileiro. 
Sua função é responder perguntas sobre leis, jurisprudência e doutrina brasileira de forma precisa e didática.

INSTRUÇÕES:
1. Base suas respostas no contexto fornecido quando disponível
2. Use linguagem clara e acessível
3. Estruture a resposta de forma organizada
4. Cite fontes quando possível

CONTEXTO JURÍDICO:
${context || 'Contexto geral sobre direito brasileiro.'}

Responda de forma completa mas concisa.`

    const userPrompt = `Pergunta: ${question}

Por favor, responda com base no contexto jurídico.`

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const answer = completion.choices[0]?.message?.content || 'Não foi possível gerar uma resposta.'
    
    return NextResponse.json({
      answer,
      sources: [],
      confidence: 80,
      query: question,
      citations: '',
      timestamp: new Date().toISOString(),
      metadata: {
        model: 'gpt-4o-mini',
        context_length: (context || '').length,
        sources_count: 0,
        search_type: context ? 'provided' : 'general'
      }
    })
    
  } catch (error) {
    console.error('Ask API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate answer', 
        details: error instanceof Error ? error.message : 'Unknown error',
        answer: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        sources: [],
        confidence: 0
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  
  if (!q) {
    return NextResponse.json(
      { error: 'Question parameter (q) is required' },
      { status: 400 }
    )
  }
  
  // Convert GET to POST format
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ question: q })
  }))
}

