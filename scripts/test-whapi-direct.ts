const WHAPI_URL = 'https://gate.whapi.cloud'
const WHAPI_TOKEN = '8ddZoI3lEfcDn6NQ2tMGdxDtjKRY0Unt'

async function testWhapiConnection() {
  console.log('🔍 Testando conexão com whapi.cloud...')
  
  try {
    // Teste 1: Verificar status da API
    console.log('\n1. Verificando status da API...')
    const statusResponse = await fetch(`${WHAPI_URL}/status`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Status Response:', statusResponse.status)
    const statusData = await statusResponse.text()
    console.log('Status Data:', statusData)
    
    // Teste 2: Tentar enviar mensagem de teste
    console.log('\n2. Testando envio de mensagem...')
    const testPhone = '5553991301991' // Número de teste
    const testMessage = {
      to: testPhone,
      body: `🔐 Código de verificação Estudar.Pro: 123456\n\n⏰ Este código expira em 5 minutos.\n🔒 Não compartilhe com ninguém.`
    }
    
    const messageResponse = await fetch(`${WHAPI_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testMessage)
    })
    
    console.log('Message Response Status:', messageResponse.status)
    const messageData = await messageResponse.text()
    console.log('Message Response:', messageData)
    
  } catch (error) {
    console.error('❌ Erro ao testar whapi.cloud:', error)
  }
}

testWhapiConnection()

