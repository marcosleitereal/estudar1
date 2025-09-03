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
  device_id?: string
  session_token?: string
}

interface LoginSession {
  user_id: string
  device_id: string
  session_token: string
  created_at: string
  last_activity: string
  user_agent: string
  ip_address: string
}

export class WhatsAppAuth {
  
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
      console.log('WhatsApp API response:', result)
      
      return response.ok
    } catch (error) {
      console.error('Erro ao enviar WhatsApp:', error)
      return false
    }
  }

  // Iniciar processo de login/cadastro
  async initiateLogin(name: string, phone: string): Promise<{ success: boolean, message: string, verification_id?: string }> {
    try {
      const code = this.generateVerificationCode()
      const verificationId = crypto.randomUUID()
      
      // Verificar se usuário já existe
      const { data: existingUser } = await supabase
        .from('whatsapp_users')
        .select('*')
        .eq('phone', phone)
        .single()

      const isNewUser = !existingUser
      const userName = existingUser?.name || name

      // Salvar código de verificação temporário
      await supabase
        .from('verification_codes')
        .upsert({
          id: verificationId,
          phone: phone,
          code: code,
          name: userName,
          is_new_user: isNewUser,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutos
          created_at: new Date().toISOString()
        })

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
      console.error('Erro no initiate login:', error)
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
      // Buscar código de verificação
      const { data: verification, error: verificationError } = await supabase
        .from('verification_codes')
        .select('*')
        .eq('id', verificationId)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (verificationError || !verification) {
        return { success: false, message: 'Código inválido ou expirado' }
      }

      const deviceId = this.generateDeviceId(userAgent, ipAddress)
      const sessionToken = this.generateSessionToken()

      let user: WhatsAppUser

      if (verification.is_new_user) {
        // Criar novo usuário
        const { data: newUser, error: createError } = await supabase
          .from('whatsapp_users')
          .insert({
            name: verification.name,
            phone: verification.phone,
            role: 'user',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar usuário:', createError)
          return { success: false, message: 'Erro ao criar conta' }
        }

        user = newUser
      } else {
        // Atualizar usuário existente
        const { data: updatedUser, error: updateError } = await supabase
          .from('whatsapp_users')
          .update({ 
            last_login: new Date().toISOString(),
            name: verification.name // Atualizar nome se mudou
          })
          .eq('phone', verification.phone)
          .select()
          .single()

        if (updateError) {
          console.error('Erro ao atualizar usuário:', updateError)
          return { success: false, message: 'Erro ao fazer login' }
        }

        user = updatedUser
      }

      // Verificar sessões ativas e deslogar dispositivos antigos
      await this.handleMultipleDevices(user.id, deviceId, userAgent, ipAddress)

      // Criar nova sessão
      await supabase
        .from('login_sessions')
        .insert({
          user_id: user.id,
          device_id: deviceId,
          session_token: sessionToken,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress
        })

      // Limpar código de verificação usado
      await supabase
        .from('verification_codes')
        .delete()
        .eq('id', verificationId)

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
      console.error('Erro na verificação:', error)
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  // Gerenciar múltiplos dispositivos
  private async handleMultipleDevices(userId: string, newDeviceId: string, userAgent: string, ipAddress: string) {
    try {
      // Buscar sessões ativas do usuário
      const { data: activeSessions } = await supabase
        .from('login_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity', { ascending: false })

      if (activeSessions && activeSessions.length > 0) {
        // Se já existe uma sessão no mesmo dispositivo, apenas atualizar
        const sameDeviceSession = activeSessions.find(session => session.device_id === newDeviceId)
        
        if (sameDeviceSession) {
          await supabase
            .from('login_sessions')
            .update({
              last_activity: new Date().toISOString(),
              user_agent: userAgent,
              ip_address: ipAddress
            })
            .eq('id', sameDeviceSession.id)
          return
        }

        // Se há sessões em outros dispositivos, deslogar o mais antigo
        if (activeSessions.length >= 1) {
          const oldestSession = activeSessions[activeSessions.length - 1]
          
          await supabase
            .from('login_sessions')
            .delete()
            .eq('id', oldestSession.id)

          // Notificar sobre logout em outro dispositivo
          const { data: user } = await supabase
            .from('whatsapp_users')
            .select('name, phone')
            .eq('id', userId)
            .single()

          if (user) {
            const logoutMessage = `🔐 *Estudar.Pro - Novo Login Detectado*

Olá ${user.name}!

Detectamos um novo login em outro dispositivo.
Por segurança, deslogamos seu dispositivo anterior.

🕐 ${new Date().toLocaleString('pt-BR')}
📱 Dispositivo: ${userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}

Se não foi você, entre em contato conosco.`

            await this.sendWhatsAppMessage(user.phone, logoutMessage)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao gerenciar dispositivos:', error)
    }
  }

  // Validar sessão ativa
  async validateSession(sessionToken: string): Promise<{ valid: boolean, user?: WhatsAppUser }> {
    try {
      const { data: session } = await supabase
        .from('login_sessions')
        .select(`
          *,
          whatsapp_users (*)
        `)
        .eq('session_token', sessionToken)
        .single()

      if (!session) {
        return { valid: false }
      }

      // Atualizar última atividade
      await supabase
        .from('login_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken)

      return { 
        valid: true, 
        user: session.whatsapp_users as WhatsAppUser
      }
    } catch (error) {
      console.error('Erro ao validar sessão:', error)
      return { valid: false }
    }
  }

  // Logout
  async logout(sessionToken: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('login_sessions')
        .delete()
        .eq('session_token', sessionToken)

      return !error
    } catch (error) {
      console.error('Erro no logout:', error)
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

      const deviceId = this.generateDeviceId(userAgent, ipAddress)
      const sessionToken = this.generateSessionToken()

      // Criar sessão admin
      await supabase
        .from('admin_sessions')
        .insert({
          email: email,
          device_id: deviceId,
          session_token: sessionToken,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          user_agent: userAgent,
          ip_address: ipAddress
        })

      const adminUser = {
        id: 'admin',
        name: 'Administrador Sonnik',
        email: email,
        role: 'admin'
      }

      return {
        success: true,
        message: 'Login admin realizado com sucesso',
        user: adminUser,
        session_token: sessionToken
      }
    } catch (error) {
      console.error('Erro no login admin:', error)
      return { success: false, message: 'Erro interno do servidor' }
    }
  }

  // Validar sessão admin
  async validateAdminSession(sessionToken: string): Promise<{ valid: boolean, user?: any }> {
    try {
      const { data: session } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .single()

      if (!session) {
        return { valid: false }
      }

      // Atualizar última atividade
      await supabase
        .from('admin_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_token', sessionToken)

      return { 
        valid: true, 
        user: {
          id: 'admin',
          name: 'Administrador Sonnik',
          email: session.email,
          role: 'admin'
        }
      }
    } catch (error) {
      console.error('Erro ao validar sessão admin:', error)
      return { valid: false }
    }
  }
}

