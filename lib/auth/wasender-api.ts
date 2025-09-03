/**
 * WasenderAPI Integration Library
 * Biblioteca para integração com a API do WasenderAPI para envio de mensagens WhatsApp
 */

interface WasenderConfig {
  apiKey: string
  baseUrl?: string
}

interface SendMessageRequest {
  to: string
  text: string
}

interface SendMessageResponse {
  success: boolean
  message?: string
  messageId?: string
  error?: string
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}

export class WasenderAPI {
  private apiKey: string
  private baseUrl: string

  constructor(config: WasenderConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://www.wasenderapi.com/api'
  }

  /**
   * Enviar mensagem de texto via WhatsApp
   */
  async sendMessage(to: string, text: string): Promise<SendMessageResponse> {
    try {
      // Formatar número para padrão internacional
      const formattedPhone = this.formatPhoneNumber(to)
      
      console.log(`📱 [WasenderAPI] Enviando mensagem para: ${formattedPhone}`)
      console.log(`📝 [WasenderAPI] Mensagem: ${text.substring(0, 100)}...`)

      const response = await fetch(`${this.baseUrl}/send-message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: formattedPhone,
          text: text
        })
      })

      const result = await response.json()
      
      console.log('📡 [WasenderAPI] Response:', {
        status: response.status,
        ok: response.ok,
        result: result
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Mensagem enviada com sucesso',
          messageId: result.messageId || result.id
        }
      } else {
        return {
          success: false,
          error: result.message || result.error || 'Erro ao enviar mensagem'
        }
      }

    } catch (error) {
      console.error('❌ [WasenderAPI] Erro ao enviar mensagem:', error)
      return {
        success: false,
        error: 'Erro de conexão com a API'
      }
    }
  }

  /**
   * Verificar status da sessão/API
   */
  async checkStatus(): Promise<ApiResponse> {
    try {
      console.log('🔍 [WasenderAPI] Verificando status da API...')

      const response = await fetch(`${this.baseUrl}/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      console.log('📊 [WasenderAPI] Status response:', {
        status: response.status,
        ok: response.ok,
        result: result
      })

      return {
        success: response.ok,
        data: result,
        message: response.ok ? 'API funcionando' : 'Erro na API'
      }

    } catch (error) {
      console.error('❌ [WasenderAPI] Erro ao verificar status:', error)
      return {
        success: false,
        error: 'Erro de conexão com a API'
      }
    }
  }

  /**
   * Testar conectividade da API
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 [WasenderAPI] Testando conectividade...')
      
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const isConnected = response.ok
      console.log(`🔗 [WasenderAPI] Conectividade: ${isConnected ? 'OK' : 'FALHA'}`)
      
      return isConnected

    } catch (error) {
      console.error('❌ [WasenderAPI] Erro de conectividade:', error)
      return false
    }
  }

  /**
   * Formatar número de telefone para padrão internacional
   */
  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se já tem código do país (55), mantém
    if (cleanPhone.startsWith('55')) {
      return cleanPhone
    }
    
    // Se não tem código do país, adiciona 55 (Brasil)
    return `55${cleanPhone}`
  }

  /**
   * Validar formato do número de telefone brasileiro
   */
  static validateBrazilianPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Formato brasileiro: 55 + DDD (2 dígitos) + número (8 ou 9 dígitos)
    // Exemplo: 5511999999999 (11 ou 12 dígitos total)
    const brazilianPhoneRegex = /^55[1-9]{2}[0-9]{8,9}$/
    
    return brazilianPhoneRegex.test(cleanPhone)
  }

  /**
   * Obter informações da API
   */
  getApiInfo(): { provider: string, baseUrl: string, hasApiKey: boolean } {
    return {
      provider: 'WasenderAPI',
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey
    }
  }
}

// Instância singleton para uso global
let wasenderInstance: WasenderAPI | null = null

/**
 * Obter instância configurada do WasenderAPI
 */
export function getWasenderAPI(): WasenderAPI {
  if (!wasenderInstance) {
    const apiKey = process.env.WASENDER_API_KEY || '727778f6c03e2c849103b6c2272c4c647a6ef2ecc2c79c31aaac0d634ad686c8'
    
    if (!apiKey) {
      throw new Error('WASENDER_API_KEY não configurada')
    }

    wasenderInstance = new WasenderAPI({ apiKey })
  }

  return wasenderInstance
}

/**
 * Função utilitária para envio rápido de mensagem
 */
export async function sendWhatsAppMessage(to: string, text: string): Promise<SendMessageResponse> {
  const api = getWasenderAPI()
  return await api.sendMessage(to, text)
}

/**
 * Função utilitária para teste de conectividade
 */
export async function testWasenderConnection(): Promise<boolean> {
  const api = getWasenderAPI()
  return await api.testConnection()
}

