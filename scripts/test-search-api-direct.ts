import fetch from 'node-fetch'

async function testSearchAPI() {
  console.log('🔍 Testando API de busca diretamente...\n')

  const baseUrl = 'http://localhost:3000'
  const query = 'art. 5º CF/88'

  try {
    // Teste 1: GET request
    console.log('📡 Teste 1 - GET /api/search')
    const getUrl = `${baseUrl}/api/search?q=${encodeURIComponent(query)}`
    console.log('URL:', getUrl)
    
    const getResponse = await fetch(getUrl)
    console.log('Status:', getResponse.status)
    console.log('Headers:', Object.fromEntries(getResponse.headers.entries()))
    
    const getResult = await getResponse.text()
    console.log('Response:', getResult)
    
    // Teste 2: POST request
    console.log('\n📡 Teste 2 - POST /api/search')
    const postUrl = `${baseUrl}/api/search`
    console.log('URL:', postUrl)
    
    const postResponse = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
        type: 'smart',
        limit: 15
      })
    })
    
    console.log('Status:', postResponse.status)
    console.log('Headers:', Object.fromEntries(postResponse.headers.entries()))
    
    const postResult = await postResponse.text()
    console.log('Response:', postResult)

    // Teste 3: Verificar se a rota existe
    console.log('\n📡 Teste 3 - Verificar rotas disponíveis')
    const routesResponse = await fetch(`${baseUrl}/api/`)
    console.log('API root status:', routesResponse.status)

  } catch (error) {
    console.error('❌ Erro ao testar API:', error)
  }
}

testSearchAPI()

