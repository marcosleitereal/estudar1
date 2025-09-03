/**
 * Teste real de envio de mensagem via WasenderAPI
 */

import { WasenderAPI } from '../lib/auth/wasender-api'

async function testRealMessage() {
  console.log('📱 Teste real de envio de mensagem WasenderAPI...\n')

  try {
    const apiKey = '727778f6c03e2c849103b6c2272c4c647a6ef2ecc2c79c31aaac0d634ad686c8'
    const api = new WasenderAPI({ apiKey })

    const phone = '5553991778537'
    const message = `🧪 *Teste WasenderAPI - Estudar.Pro*

✅ Migração concluída com sucesso!

🔄 Sistema migrado de whapi.cloud para wasenderapi.com
📱 Número de teste: ${phone}
⏰ Data/Hora: ${new Date().toLocaleString('pt-BR')}

🎉 A plataforma Estudar.Pro agora usa WasenderAPI!`

    console.log(`📞 Enviando para: ${phone}`)
    console.log(`📝 Mensagem: ${message.substring(0, 100)}...`)
    console.log()

    const result = await api.sendMessage(phone, message)
    
    console.log('📊 Resultado do envio:')
    console.log('Success:', result.success)
    console.log('Message:', result.message)
    if (result.messageId) console.log('Message ID:', result.messageId)
    if (result.error) console.log('Error:', result.error)

    if (result.success) {
      console.log('\n🎉 Mensagem enviada com sucesso!')
      console.log('✅ WasenderAPI está funcionando corretamente')
    } else {
      console.log('\n❌ Falha no envio da mensagem')
      console.log('⚠️ Verificar configurações da API')
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    process.exit(1)
  }
}

// Executar teste
testRealMessage()
  .then(() => {
    console.log('\n✅ Teste de envio real finalizado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Teste de envio real falhou:', error)
    process.exit(1)
  })

