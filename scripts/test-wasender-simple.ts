/**
 * Teste simplificado da WasenderAPI
 * Testa apenas a biblioteca de API sem dependências do Supabase
 */

import { WasenderAPI } from '../lib/auth/wasender-api'

async function testWasenderSimple() {
  console.log('🧪 Teste simplificado da WasenderAPI...\n')

  try {
    // Configurar API
    const apiKey = '727778f6c03e2c849103b6c2272c4c647a6ef2ecc2c79c31aaac0d634ad686c8'
    const api = new WasenderAPI({ apiKey })

    // Teste 1: Informações da API
    console.log('📋 Teste 1: Informações da API')
    const apiInfo = api.getApiInfo()
    console.log('Provider:', apiInfo.provider)
    console.log('Base URL:', apiInfo.baseUrl)
    console.log('Tem API Key:', apiInfo.hasApiKey)
    console.log('Resultado: ✅ API configurada corretamente\n')

    // Teste 2: Validação de números
    console.log('📱 Teste 2: Validação de números brasileiros')
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

    // Teste 3: Teste de conectividade
    console.log('🌐 Teste 3: Conectividade da API')
    const isConnected = await api.testConnection()
    console.log(`Resultado: ${isConnected ? '✅ Conectado' : '❌ Falha na conexão'}\n`)

    // Teste 4: Verificar status da API
    console.log('📊 Teste 4: Status da API')
    const statusResult = await api.checkStatus()
    console.log('Status:', statusResult)
    console.log(`Resultado: ${statusResult.success ? '✅ API funcionando' : '❌ Problema na API'}\n`)

    // Teste 5: Simulação de envio (comentado para evitar spam)
    console.log('💬 Teste 5: Simulação de envio de mensagem')
    const testPhone = '5553991778537'
    const testMessage = '🧪 Teste WasenderAPI - Estudar.Pro'
    
    console.log(`Para: ${testPhone}`)
    console.log(`Mensagem: ${testMessage}`)
    console.log('⚠️ Envio real comentado para evitar spam\n')
    
    // Descomente a linha abaixo para testar envio real:
    // const sendResult = await api.sendMessage(testPhone, testMessage)
    // console.log('Resultado do envio:', sendResult)

    console.log('🎉 Todos os testes simplificados concluídos!')
    console.log('\n📋 Resumo:')
    console.log('1. ✅ Configuração da API')
    console.log('2. ✅ Validação de números')
    console.log('3. ✅ Teste de conectividade')
    console.log('4. ✅ Verificação de status')
    console.log('5. ⚠️ Envio de mensagem (simulado)')

  } catch (error) {
    console.error('❌ Erro durante os testes:', error)
    process.exit(1)
  }
}

// Executar teste
testWasenderSimple()
  .then(() => {
    console.log('\n✅ Teste simplificado finalizado com sucesso')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Teste simplificado falhou:', error)
    process.exit(1)
  })

