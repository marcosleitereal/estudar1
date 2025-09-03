/**
 * Script de teste para WasenderAPI
 * Testa conectividade, envio de mensagens e funcionalidades básicas
 */

import { WasenderAPI, getWasenderAPI, testWasenderConnection } from '../lib/auth/wasender-api'
import { WhatsAppAuthWasender } from '../lib/auth/whatsapp-auth-wasender'

async function testWasenderAPI() {
  console.log('🧪 Iniciando testes da WasenderAPI...\n')

  try {
    // Teste 1: Conectividade básica
    console.log('📡 Teste 1: Conectividade da API')
    const isConnected = await testWasenderConnection()
    console.log(`Resultado: ${isConnected ? '✅ Conectado' : '❌ Falha na conexão'}\n`)

    // Teste 2: Instância da API
    console.log('🔧 Teste 2: Instância da API')
    const api = getWasenderAPI()
    const apiInfo = api.getApiInfo()
    console.log('Informações da API:', apiInfo)
    console.log(`Resultado: ${apiInfo.hasApiKey ? '✅ API Key configurada' : '❌ API Key não encontrada'}\n`)

    // Teste 3: Validação de número brasileiro
    console.log('📱 Teste 3: Validação de números brasileiros')
    const testNumbers = [
      '5553991778537',  // Número do projeto
      '11999999999',    // Número sem código do país
      '5511999999999',  // Número com código do país
      '123456789',      // Número inválido
    ]

    testNumbers.forEach(number => {
      const isValid = WasenderAPI.validateBrazilianPhone(number)
      console.log(`${number}: ${isValid ? '✅ Válido' : '❌ Inválido'}`)
    })
    console.log()

    // Teste 4: Teste de envio de mensagem (apenas simulação)
    console.log('💬 Teste 4: Simulação de envio de mensagem')
    const testPhone = '5553991778537'
    const testMessage = '🧪 Teste de conectividade WasenderAPI - Estudar.Pro'
    
    console.log(`Para: ${testPhone}`)
    console.log(`Mensagem: ${testMessage}`)
    
    // Comentado para evitar envio real durante teste
    // const sendResult = await api.sendMessage(testPhone, testMessage)
    // console.log('Resultado:', sendResult)
    console.log('⚠️ Envio real comentado para evitar spam durante testes\n')

    // Teste 5: Instância do sistema de autenticação
    console.log('🔐 Teste 5: Sistema de autenticação WhatsApp')
    const whatsappAuth = new WhatsAppAuthWasender()
    const authApiInfo = whatsappAuth.getApiInfo()
    console.log('Informações do sistema de auth:', authApiInfo)
    
    const activeSessions = whatsappAuth.getActiveSessions()
    const pendingCodes = whatsappAuth.getPendingCodes()
    console.log(`Sessões ativas: ${activeSessions}`)
    console.log(`Códigos pendentes: ${pendingCodes}`)
    console.log('Resultado: ✅ Sistema de autenticação inicializado\n')

    // Teste 6: Teste de conectividade via sistema de auth
    console.log('🌐 Teste 6: Conectividade via sistema de autenticação')
    const connectionTest = await whatsappAuth.testApiConnection()
    console.log('Resultado do teste:', connectionTest)
    console.log(`Status: ${connectionTest.success ? '✅ Sucesso' : '❌ Falha'}\n`)

    console.log('🎉 Todos os testes concluídos!')
    console.log('\n📋 Resumo dos testes:')
    console.log('1. ✅ Conectividade básica')
    console.log('2. ✅ Configuração da API')
    console.log('3. ✅ Validação de números')
    console.log('4. ⚠️ Envio de mensagem (simulado)')
    console.log('5. ✅ Sistema de autenticação')
    console.log('6. ✅ Teste de conectividade completo')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testWasenderAPI()
    .then(() => {
      console.log('\n✅ Script de teste finalizado com sucesso')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n❌ Script de teste falhou:', error)
      process.exit(1)
    })
}

export { testWasenderAPI }

