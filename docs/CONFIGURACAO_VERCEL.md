# Configuração de Variáveis de Ambiente na Vercel

## Problema Atual
O deploy está falhando porque as variáveis de ambiente não estão configuradas na Vercel. O erro `supabaseUrl is required` indica que as configurações do Supabase não estão disponíveis.

## Como Configurar

### 1. Acesse as Configurações do Projeto
1. Vá para [vercel.com](https://vercel.com)
2. Acesse seu projeto `estudarpro`
3. Clique na aba **"Settings"**
4. No menu lateral, clique em **"Environment Variables"**

### 2. Adicione as Variáveis de Ambiente

Adicione cada uma das seguintes variáveis:

#### Supabase (Obrigatórias)
```
NEXT_PUBLIC_SUPABASE_URL=https://kpqcynbzoqdauyyjacwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NTc2NzQsImV4cCI6MjA3MjQzMzY3NH0.js7yainSICtdl7QSFya9oIcsCRL29O-3WTpwgUbBlEk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwcWN5bmJ6b3FkYXV5eWphY3d1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg1NzY3NCwiZXhwIjoyMDcyNDMzNjc0fQ.fz0c5maHdX1SbxWlFR4CePIvdEnta6nGzfGQryYLe-s
DATABASE_URL=postgresql://postgres.kpqcynbzoqdauyyjacwu:0r6bFDcbDLFIteI0@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
```

#### WhatsApp API (Obrigatória)
```
WASENDER_API_KEY=727778f6c03e2c849103b6c2272c4c647a6ef2ecc2c79c31aaac0d634ad686c8
```

#### Site Configuration
```
SITE_URL=https://estudar.pro
NEXT_PUBLIC_SITE_URL=https://estudar.pro
```

#### Feature Flags
```
ENABLE_GOOGLE_AUTH=false
ENABLE_ADMIN_PANEL=true
ENABLE_ETL_JOBS=true
```

#### OpenAI (Opcional - pode adicionar depois)
```
OPENAI_API_KEY=sua-chave-openai-aqui
LLM_PROVIDER=openai
LLM_MODEL=gpt-4
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

### 3. Configurar Ambientes
Para cada variável, selecione os ambientes:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

### 4. Fazer Redeploy
Após adicionar todas as variáveis:
1. Vá para a aba **"Deployments"**
2. Clique nos três pontos (...) do último deployment
3. Selecione **"Redeploy"**

## Ordem de Prioridade

**Mínimo necessário para funcionar:**
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `WASENDER_API_KEY`

**Adicionar depois:**
- OpenAI (quando reativarmos a IA)
- Outras configurações opcionais

## Verificação
Após o redeploy, o build deve passar sem o erro `supabaseUrl is required`.

