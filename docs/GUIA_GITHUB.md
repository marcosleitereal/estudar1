# Guia: Como Exportar o Projeto Estudar.Pro para o GitHub

## 1. Pré-requisitos

Antes de começar, você precisa:
- Uma conta no GitHub (crie em [github.com](https://github.com) se não tiver)
- Git configurado no seu computador local (ou use este ambiente)

## 2. Criar um Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"New"** ou **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Configure o repositório:
   - **Repository name:** `estudar-pro` (ou o nome que preferir)
   - **Description:** "Plataforma de estudos jurídicos com Next.js e Supabase"
   - **Visibility:** Private ou Public (sua escolha)
   - **NÃO** marque "Add a README file" (já temos um)
   - **NÃO** adicione .gitignore ou license (já temos)
5. Clique em **"Create repository"**

## 3. Configurar o Git Local

No terminal, execute os seguintes comandos:

```bash
# Navegar para o diretório do projeto
cd /home/ubuntu/estudar-pro

# Configurar seu nome e email (substitua pelos seus dados)
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# Adicionar o repositório remoto do GitHub
git remote add origin https://github.com/SEU_USUARIO/estudar-pro.git

# Verificar se foi adicionado corretamente
git remote -v
```

## 4. Preparar os Arquivos para Commit

```bash
# Adicionar todos os arquivos novos e modificados
git add .

# Verificar o que será commitado
git status

# Fazer o commit com uma mensagem descritiva
git commit -m "feat: implementação completa da plataforma Estudar.Pro com autenticação WhatsApp via WasenderAPI"
```

## 5. Enviar para o GitHub

```bash
# Enviar para o GitHub (primeira vez)
git push -u origin branch-3

# Ou se quiser criar uma branch main
git checkout -b main
git push -u origin main
```

## 6. Verificar no GitHub

1. Acesse seu repositório no GitHub
2. Verifique se todos os arquivos foram enviados corretamente
3. O README.md deve aparecer na página principal do repositório

## 7. Comandos para Futuras Atualizações

Quando fizer mudanças no projeto:

```bash
# Adicionar arquivos modificados
git add .

# Fazer commit
git commit -m "Descrição das mudanças"

# Enviar para o GitHub
git push
```

## 8. Arquivo .gitignore

Certifique-se de que o arquivo `.gitignore` está configurado para não enviar informações sensíveis:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
/build
/dist
/.next/
/out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## 9. Importante: Segurança

⚠️ **NUNCA** envie para o GitHub:
- Arquivos `.env` com chaves de API
- Senhas ou tokens de acesso
- Dados sensíveis de usuários

O arquivo `.env.local` já está no `.gitignore` para proteger suas chaves de API.

## 10. Próximos Passos

Após enviar para o GitHub, você pode:
- Usar o repositório para deploy na Vercel (conecta automaticamente)
- Colaborar com outros desenvolvedores
- Manter um histórico de versões do projeto
- Fazer backup seguro do código

