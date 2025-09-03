const WHAPI_URL = 'https://gate.whapi.cloud'
const WHAPI_TOKEN = '8ddZoI3lEfcDn6NQ2tMGdxDtjKRY0Unt'

async function checkChannelStatus() {
  console.log('🔍 Verificando status do canal whapi.cloud...')
  
  try {
    // 1. Verificar health do canal
    console.log('\n1. Verificando health do canal...')
    const healthResponse = await fetch(`${WHAPI_URL}/health`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Health Status:', healthResponse.status)
    const healthData = await healthResponse.text()
    console.log('Health Response:', healthData)
    
    // 2. Verificar configurações do canal
    console.log('\n2. Verificando configurações do canal...')
    const settingsResponse = await fetch(`${WHAPI_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Settings Status:', settingsResponse.status)
    const settingsData = await settingsResponse.text()
    console.log('Settings Response:', settingsData)
    
    // 3. Verificar perfil do usuário (se logado)
    console.log('\n3. Verificando perfil do usuário...')
    const profileResponse = await fetch(`${WHAPI_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Profile Status:', profileResponse.status)
    const profileData = await profileResponse.text()
    console.log('Profile Response:', profileData)
    
    // 4. Verificar limites
    console.log('\n4. Verificando limites...')
    const limitsResponse = await fetch(`${WHAPI_URL}/limits`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('Limits Status:', limitsResponse.status)
    const limitsData = await limitsResponse.text()
    console.log('Limits Response:', limitsData)
    
  } catch (error) {
    console.error('❌ Erro ao verificar canal:', error)
  }
}

checkChannelStatus()

