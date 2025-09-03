# Guia de Deploy da Plataforma Estudar.Pro

## 1. Introdução

Este guia apresenta diferentes opções para publicar a plataforma Estudar.Pro em seu próprio domínio. Abordaremos desde soluções simplificadas como a Vercel até configurações mais avançadas em um servidor VPS (Virtual Private Server).

## 2. Opções de Deploy

A escolha da plataforma de deploy depende de suas necessidades de escalabilidade, custo e nível de controle desejado. Abaixo, comparamos as principais opções:

### 2.1. Vercel (Recomendado)

- **Prós:**
  - Plataforma oficial da Next.js, com integração perfeita.
  - Deploy contínuo a partir de um repositório Git (GitHub, GitLab, Bitbucket).
  - Configuração zero para a maioria dos projetos Next.js.
  - HTTPS e domínio personalizado gratuitos.
  - Escalabilidade automática.
- **Contras:**
  - Menos controle sobre a infraestrutura.
  - Limites no plano gratuito.

### 2.2. Netlify

- **Prós:**
  - Similar à Vercel, com deploy contínuo e fácil configuração.
  - Excelente para sites estáticos e aplicações Jamstack.
  - HTTPS e domínio personalizado gratuitos.
- **Contras:**
  - Pode exigir mais configuração para funcionalidades avançadas do Next.js (Server Components, etc.).

### 2.3. Servidor VPS (DigitalOcean, AWS, etc.)

- **Prós:**
  - Controle total sobre a infraestrutura.
  - Custo potencialmente menor em larga escala.
  - Flexibilidade para instalar outras aplicações no mesmo servidor.
- **Contras:**
  - Exige mais conhecimento técnico para configurar e manter.
  - Responsabilidade pela segurança, atualizações e escalabilidade.

## 3. Pré-requisitos

Antes de iniciar o deploy, certifique-se de que você possui:

- **Conta em um provedor Git:** GitHub, GitLab ou Bitbucket.
- **Código-fonte do projeto:** O projeto Estudar.Pro completo em seu repositório Git.
- **Domínio próprio:** Um nome de domínio registrado (ex: `seusite.com`).
- **Variáveis de ambiente:** Todas as chaves de API e configurações do arquivo `.env.local`.

---

*Este guia continuará com as seções de deploy para Vercel, VPS e configuração de domínio.*




## 4. Deploy na Vercel (Recomendado)

A Vercel é a forma mais simples e rápida de publicar sua aplicação Next.js. Siga os passos abaixo:

### 4.1. Crie uma conta na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta, preferencialmente utilizando sua conta do GitHub para facilitar a integração.

### 4.2. Importe seu projeto

1. No dashboard da Vercel, clique em **"Add New..."** e selecione **"Project"**.
2. Conecte sua conta Git (GitHub, GitLab ou Bitbucket) e selecione o repositório do projeto Estudar.Pro.
3. A Vercel detectará automaticamente que é um projeto Next.js e preencherá as configurações de build.

### 4.3. Configure as variáveis de ambiente

1. Na tela de configuração do projeto, expanda a seção **"Environment Variables"**.
2. Adicione todas as variáveis de ambiente do seu arquivo `.env.local`. Estas são as mesmas que configuramos anteriormente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `WASENDER_API_KEY`
   - `DATABASE_URL`
   - etc.

### 4.4. Faça o deploy

1. Clique no botão **"Deploy"**.
2. A Vercel irá construir e publicar sua aplicação. Em poucos minutos, você receberá uma URL pública para acessar seu projeto.

### 4.5. Adicione seu domínio personalizado

1. No dashboard do seu projeto na Vercel, vá para a aba **"Domains"**.
2. Adicione seu domínio personalizado e siga as instruções para configurar os registros DNS em seu provedor de domínio.

---




## 5. Deploy em Servidor VPS (DigitalOcean)

Esta opção oferece mais controle, mas exige mais configuração manual. Usaremos a DigitalOcean como exemplo.

### 5.1. Crie um Droplet na DigitalOcean

1. Crie uma conta na [DigitalOcean](https://www.digitalocean.com/).
2. No painel, clique em **"Create"** e selecione **"Droplets"**.
3. Escolha uma imagem (Ubuntu 22.04 LTS é uma boa opção) e um plano.
4. Adicione sua chave SSH para acesso seguro e crie o Droplet.

### 5.2. Configure o servidor

1. Acesse seu Droplet via SSH: `ssh root@SEU_IP_DO_DROPLET`
2. Atualize os pacotes: `apt update && apt upgrade -y`
3. Instale o Node.js e o npm: `curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && apt-get install -y nodejs`
4. Instale o Nginx: `apt install nginx -y`
5. Instale o PM2, um gerenciador de processos para Node.js: `npm install pm2 -g`

### 5.3. Faça o deploy da aplicação

1. Clone seu projeto do Git: `git clone SEU_REPOSITORIO.git`
2. Entre no diretório do projeto: `cd nome-do-projeto`
3. Crie o arquivo `.env.local` e adicione suas variáveis de ambiente.
4. Instale as dependências: `npm install`
5. Faça o build da aplicação: `npm run build`
6. Inicie a aplicação com o PM2: `pm2 start npm --name "estudar-pro" -- start`

### 5.4. Configure o Nginx como proxy reverso

1. Crie um arquivo de configuração para seu site: `nano /etc/nginx/sites-available/estudar-pro`
2. Adicione a seguinte configuração, substituindo `seusite.com` pelo seu domínio:

   ```nginx
   server {
       listen 80;
       server_name seusite.com www.seusite.com;

       location / {
           proxy_pass http://localhost:3000; # A porta padrão do Next.js
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. Ative a configuração: `ln -s /etc/nginx/sites-available/estudar-pro /etc/nginx/sites-enabled/`
4. Teste a configuração do Nginx: `nginx -t`
5. Reinicie o Nginx: `systemctl restart nginx`

### 5.5. Configure o firewall

1. Permita o tráfego HTTP e HTTPS: `ufw allow 'Nginx Full'`
2. Habilite o firewall: `ufw enable`

---




## 6. Configuração de Domínio e DNS

Depois de fazer o deploy, o último passo é apontar seu domínio para a aplicação.

### 6.1. Apontando para a Vercel

1. Siga as instruções na aba **"Domains"** do seu projeto na Vercel.
2. Geralmente, você precisará adicionar um registro `A` ou `CNAME` em seu provedor de domínio (GoDaddy, Namecheap, etc.).

### 6.2. Apontando para uma VPS

1. Em seu provedor de domínio, crie um registro `A` que aponte para o endereço IP do seu Droplet.
   - **Host/Name:** `@` (para o domínio raiz)
   - **Value/Points to:** `SEU_IP_DO_DROPLET`
2. Crie também um registro `CNAME` para o subdomínio `www`.
   - **Host/Name:** `www`
   - **Value/Points to:** `seusite.com`

### 6.3. Configurando SSL/TLS com Let's Encrypt (para VPS)

1. Instale o Certbot para obter um certificado SSL gratuito:
   ```bash
   apt install certbot python3-certbot-nginx -y
   ```
2. Obtenha e instale o certificado para seu domínio:
   ```bash
   certbot --nginx -d seusite.com -d www.seusite.com
   ```
3. O Certbot renovará automaticamente o certificado quando ele estiver prestes a expirar.

---




## 7. Solução de Problemas Comuns

- **Erro 502 Bad Gateway (VPS):** Verifique se sua aplicação Next.js está rodando corretamente com `pm2 status` e se a porta no proxy reverso do Nginx está correta.
- **Erro de Build na Vercel:** Verifique os logs de build na Vercel para identificar o problema. Geralmente, são erros de dependências ou configuração.
- **Domínio não aponta corretamente:** Verifique as configurações de DNS e aguarde a propagação, que pode levar algumas horas.

## 8. Conclusão

Este guia apresentou as principais formas de publicar a plataforma Estudar.Pro. A Vercel é a opção recomendada para a maioria dos casos, mas uma VPS oferece maior flexibilidade para usuários avançados. Se precisar de mais ajuda, consulte a documentação oficial da Next.js, Vercel e DigitalOcean.


