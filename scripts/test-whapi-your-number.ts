const WHAPI_URL = 'https://gate.whapi.cloud'
const WHAPI_TOKEN = '8ddZoI3lEfcDn6NQ2tMGdxDtjKRY0Unt'

async function testYourNumber() {
  console.log('📱 Testando envio para seu número...')
  
  const yourPhone = '5553991301991' // Seu número formatado
  const testMessage = {
    to: yourPhone,
    body: `🔐 Teste Estudar.Pro\n\nSeu código: 123456\n\n⏰ Expira em 5 min\n🔒 Não compartilhe`
  }
  
  try {
    console.log('📤 Enviando para:', yourPhone)
    
    const response = await fetch(`${WHAPI_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    })
    
    console.log('📊 Status:', response.status)
    const data = await response.json()
    console.log('📋 Resposta completa:', JSON.stringify(data, null, 2))
    
    if (data.sent) {
      console.log('✅ Mensagem enviada com sucesso!')
      console.log('🆔 ID da mensagem:', data.message.id)
      console.log('📱 Status:', data.message.status)
      console.log('🕐 Timestamp:', new Date(data.message.timestamp * 1000).toLocaleString())
    } else {
      console.log('❌ Falha no envio')
    }
    
  } catch (error) {
    console.error('💥 Erro:', error)
  }
}

testYourNumber()

