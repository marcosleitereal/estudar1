import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const WHAPI_URL = 'https://gate.whapi.cloud'
const WHAPI_TOKEN = '8ddZoI3lEfcDn6NQ2tMGdxDtjKRY0Unt'

interface WhatsAppUser {
  id: string
  name: string
  phone: string
  role: 'user' | 'admin'
  created_at: string
  last_login: string
}

interface VerificationCode {
  id: string
  phone: string
  code: string
  name: string
  is_new_user: boolean
  expires_at: string
  created_at: string
}

export class WhatsAppAuthAdapted {
  
  // Armazenamento temporário em memória para códigos de verificação
  private static verificationCodes: Map<string, VerificationCode> = new Map()
  private static userSessions: Map<string, { user: WhatsAppUser, device_id: string, last_activity: string }> = new Map()

  // Gerar código de verificação de 6 dígitos
  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Gerar token de sessão único
  private generateSessionToken(): string {
    return crypto.randomUUID() + '-' + Date.now().toString(36)
  }

  // Gerar device ID baseado no navegador
  private generateDeviceId(userAgent: string, ip: string): string {
    const hash = btoa(userAgent + ip + Date.now()).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16)
    return `device_${hash}`
  }

  // Enviar mensagem via WhatsApp
  async sendWhatsAppMessage(phone: string, message: string): Promise<boolean> {
    try {
      // Formatar número para padrão internacional
      const formattedPhone = phone.replace(/\D/g, '')
      const internationalPhone = formattedPhone.startsWith('55') ? formattedPhone : `55${formattedPhone}`

      console.log(`📱 Enviando WhatsApp para: ${internationalPhone}`)
      console.log(`📝 Mensagem: ${message.substring(0, 100)}...`)

      const response = await fetch(`${WHAPI_URL}/messages/text`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHAPI_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: `${internationalPhone}@s.whatsapp.net`,
          body: message
        })
      })

      const result = await response.json()
      console.log('📡 WhatsApp API response:', result)
      
      return response.ok
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error)
      return false
    }
  }

  // Limpar códigos expirados
  private cleanExpiredCodes() {
    const now = new Date()
    for (const [id, code] of WhatsAppAuthAdapted.verificationCodes.entries()) {
      if (new Date(code.expires_at) < now) {
        WhatsAppAuthAdapted.verificationCodes.delete(id)
      }
    }
  }

  // Iniciar processo de login/cadastro
  async initiateLogin(name: string, phone: string): Promise<{ success: boolean, message: string, verification_id?: string }> {
    try {
      this.cleanExpiredCodes()
      
      const code = this.generateVerificationCode()
      const verificationId = crypto.randomUUID()
      
      // Verificar se usuário já existe no Supabase Auth
      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find(user => 
        user.user_metadata?.phone === phone || user.email === `${phone}@whatsapp.estudar.pro`
      )

      const isNewUser = !existingUser
      const userName = existingUser?.user_metadata?.name || name

      // Salvar código de verificação em memória
      const verification: VerificationCode = {
        id: verificationId,
        phone: phone,
        code: code,
        name: userName,
        is_new_user: isNewUser,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos
        created_at: new Date().toISOString()
      }

      WhatsAppAuthAdapted.verificationCodes.set(verificationId, verification)

      // Enviar código via WhatsApp
      const message = `🔐 *Estudar.Pro - Código de Verificação*

Olá ${userName}! 

Seu código de verificação é: *${code}*

⏰ Este código expira em 5 minutos.
🔒 Não compartilhe este código com ninguém.

${isNewUser ? '🎉 Bem-vindo(a) à plataforma Estudar.Pro!' : '👋 Que bom te ver novamente!'}`

      const sent = await this.sendWhatsAppMessage(phone, message)
      
      if (!sent) {
        return { success: false, message: 'Erro ao enviar código via WhatsApp' }
      }

      return { 
        success: true, 
        message: isNewUser ? 'Código enviado! Bem-vindo ao Estudar.Pro' : 'Código enviado via WhatsApp',
        verification_id: verificationId
      }

    } catch (error) {
      console.error('❌ Erro no initiate login:', error)
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  // Verificar código e fazer login
  async verifyCodeAndLogin(
    verificationId: string, 
    code: string, 
    userAgent: string, 
    ipAddress: string
  ): Promise<{ success: boolean, message: string, user?: WhatsAppUser, session_token?: string }> {
    try {
      this.cleanExpiredCodes()

      // Buscar código de verificação
      const verification = WhatsAppAuthAdapted.verificationCodes.get(verificationId)
      
      if (!verification || verification.code !== code) {
        return { success: false, message: 'Código inválido ou expirado' }
      }

      if (new Date(verification.expires_at) < new Date()) {
        WhatsAppAuthAdapted.verificationCodes.delete(verificationId)
        return { success: false, message: 'Código expirado' }
      }

      const deviceId = this.generateDeviceId(userAgent, ipAddress)
      const sessionToken = this.generateSessionToken()

      let user: WhatsAppUser

      if (verification.is_new_user) {
        // Criar novo usuário no Supabase Auth
        const email = `${verification.phone}@whatsapp.estudar.pro`
        const password = crypto.randomUUID() // Senha aleatória (não será usada)

        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          user_metadata: {
            name: verification.name,
            phone: verification.phone,
            role: 'user',
            auth_method: 'whatsapp',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          },
          email_confirm: true
        })

        if (createError) {
          console.error('❌ Erro ao criar usuário:', createError)
          return { success: false, message: 'Erro ao criar conta' }
        }

        user = {
          id: authData.user.id,
          name: verification.name,
          phone: verification.phone,
          role: 'user',
          created_at: authData.user.created_at,
          last_login: new Date().toISOString()
        }
      } else {
        // Atualizar usuário existente
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers.users.find(u => 
          u.user_metadata?.phone === verification.phone || u.email === `${verification.phone}@whatsapp.estudar.pro`
        )

        if (!existingUser) {
          return { success: false, message: 'Usuário não encontrado' }
        }

        // Atualizar metadados
        await supabase.auth.admin.updateUserById(existingUser.id, {
          user_metadata: {
            ...existingUser.user_metadata,
            name: verification.name,
            last_login: new Date().toISOString()
          }
        })

        user = {
          id: existingUser.id,
          name: verification.name,
          phone: verification.phone,
          role: existingUser.user_metadata?.role || 'user',
          created_at: existingUser.created_at,
          last_login: new Date().toISOString()
        }
      }

      // Gerenciar múltiplos dispositivos
      this.handleMultipleDevices(user.id, deviceId)

      // Criar nova sessão
      WhatsAppAuthAdapted.userSessions.set(sessionToken, {
        user: user,
        device_id: deviceId,
        last_activity: new Date().toISOString()
      })

      // Limpar código de verificação usado
      WhatsAppAuthAdapted.verificationCodes.delete(verificationId)

      // Enviar mensagem de boas-vindas
      const welcomeMessage = verification.is_new_user 
        ? `🎉 *Bem-vindo(a) ao Estudar.Pro!*

Olá ${user.name}! 

Sua conta foi criada com sucesso. Agora você tem acesso a:

📚 Busca inteligente de leis
⚖️ Jurisprudência atualizada  
🎯 Sistema de flashcards
📝 Simulados e questões
📊 Acompanhamento de progresso

Bons estudos! 🚀`
        : `✅ *Login realizado com sucesso!*

Olá ${user.name}! 

Você está logado no Estudar.Pro.
Continue seus estudos de onde parou! 📚⚖️`

      await this.sendWhatsAppMessage(user.phone, welcomeMessage)

      return { 
        success: true, 
        message: 'Login realizado com sucesso',
        user,
        session_token: sessionToken
      }

    } catch (error) {
      console.error('❌ Erro na verificação:', error)
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  // Gerenciar múltiplos dispositivos
  private handleMultipleDevices(userId: string, newDeviceId: string) {
    // Encontrar sessões do mesmo usuário
    const userSessions = Array.from(WhatsAppAuthAdapted.userSessions.entries())
      .filter(([_, session]) => session.user.id === userId)

    // Se há mais de uma sessão, remover a mais antiga
    if (userSessions.length > 0) {
      const oldestSession = userSessions
        .sort((a, b) => new Date(a[1].last_activity).getTime() - new Date(b[1].last_activity).getTime())[0]
      
      if (oldestSession[1].device_id !== newDeviceId) {
        WhatsAppAuthAdapted.userSessions.delete(oldestSession[0])
        
        // Notificar sobre logout (opcional)
        console.log(`🔐 Dispositivo antigo deslogado para usuário ${userId}`)
      }
    }
  }

  // Validar sessão ativa
  async validateSession(sessionToken: string): Promise<{ valid: boolean, user?: WhatsAppUser }> {
    try {
      const session = WhatsAppAuthAdapted.userSessions.get(sessionToken)
      
      if (!session) {
        return { valid: false }
      }

      // Atualizar última atividade
      session.last_activity = new Date().toISOString()
      WhatsAppAuthAdapted.userSessions.set(sessionToken, session)

      return { 
        valid: true, 
        user: session.user
      }
    } catch (error) {
      console.error('❌ Erro ao validar sessão:', error)
      return { valid: false }
    }
  }

  // Logout
  async logout(sessionToken: string): Promise<boolean> {
    try {
      const deleted = WhatsAppAuthAdapted.userSessions.delete(sessionToken)
      return deleted
    } catch (error) {
      console.error('❌ Erro no logout:', error)
      return false
    }
  }

  // Login admin (tradicional)
  async adminLogin(email: string, password: string, userAgent: string, ipAddress: string): Promise<{ success: boolean, message: string, user?: any, session_token?: string }> {
    try {
      // Verificar credenciais admin
      if (email !== 'dev@sonnik.com.br' || password !== 'admin123456') {
        return { success: false, message: 'Credenciais inválidas' }
      }

      const sessionToken = this.generateSessionToken()

      const adminUser = {
        id: 'admin',
        name: 'Administrador Sonnik',
        email: email,
        role: 'admin'
      }

      // Salvar sessão admin
      WhatsAppAuthAdapted.userSessions.set(sessionToken, {
        user: adminUser as any,
        device_id: this.generateDeviceId(userAgent, ipAddress),
        last_activity: new Date().toISOString()
      })

      return {
        success: true,
        message: 'Login admin realizado com sucesso',
        user: adminUser,
        session_token: sessionToken
      }
    } catch (error) {
      console.error('❌ Erro no login admin:', error)
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  // Validar sessão admin
  async validateAdminSession(sessionToken: string): Promise<{ valid: boolean, user?: any }> {
    try {
      const session = WhatsAppAuthAdapted.userSessions.get(sessionToken)
      
      if (!session || session.user.role !== 'admin') {
        return { valid: false }
      }

      // Atualizar última atividade
      session.last_activity = new Date().toISOString()
      WhatsAppAuthAdapted.userSessions.set(sessionToken, session)

      return { 
        valid: true, 
        user: session.user
      }
    } catch (error) {
      console.error('❌ Erro ao validar sessão admin:', error)
      return { valid: false }
    }
  }

  // Método para debug - listar sessões ativas
  getActiveSessions(): number {
    return WhatsAppAuthAdapted.userSessions.size
  }

  // Método para debug - listar códigos pendentes
  getPendingCodes(): number {
    this.cleanExpiredCodes()
    return WhatsAppAuthAdapted.verificationCodes.size
  }
}

