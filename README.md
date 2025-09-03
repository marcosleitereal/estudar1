# Estudar.Pro - Plataforma de Estudos Jurídicos

## 🚀 Visão Geral

**Estudar.Pro** é uma plataforma web completa para estudantes de Direito, OAB e concursos públicos. A aplicação oferece um ambiente de estudos integrado com ferramentas de ingestão de conteúdo legal, flashcards com SRS (Spaced Repetition System), Q&A com RAG (Retrieval-Augmented Generation), quizzes, simulados e um painel administrativo completo.

Construída com as tecnologias mais modernas, a plataforma é otimizada para performance, escalabilidade e uma experiência de usuário excepcional.

## ✨ Funcionalidades Principais

### 1. **📖 Estudar Lei Seca**
- **Interface Split-View:** Leitura otimizada com navegação hierárquica.
- **Conteúdo Completo:** Constituição Federal, códigos e leis atualizadas.
- **Recursos de Estudo:** Sistema de notas, destaques e favoritos.

### 2. **🧠 Flashcards com SRS**
- **Algoritmo SM-2:** Revisão espaçada para memorização de longo prazo.
- **Criação Automática:** Geração de flashcards a partir de conteúdo legal.
- **Decks Personalizados:** Organização por matéria e dificuldade.

### 3. **🔍 Busca Inteligente (RAG)**
- **Busca Híbrida:** Combinação de busca full-text e vetorial.
- **Q&A com IA:** Respostas contextualizadas com citações de fontes.
- **Embeddings:** Busca semântica para resultados mais precisos.

### 4. **🎯 Quiz e Simulados**
- **Questões Geradas por IA:** Múltipla escolha e verdadeiro/falso.
- **Templates de Provas:** Simulação de OAB, concursos e vestibulares.
- **Análise de Performance:** Relatórios detalhados e estatísticas.

### 5. **🛡️ Painel Administrativo**
- **Dashboard Completo:** Métricas de usuários, conteúdo e sistema.
- **Gestão de Conteúdo:** Controle sobre leis, questões e flashcards.
- **Monitoramento em Tempo Real:** Logs de atividade e status do sistema.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase (PostgreSQL)
- **Banco de Dados:** Supabase (PostgreSQL com pgvector)
- **IA e NLP:** OpenAI (GPT-4/3.5-turbo), Embeddings
- **Deploy:** Vercel (com GitHub Actions para CI/CD)

## 🚀 Começando

### Pré-requisitos

- Node.js (v20.x ou superior)
- npm ou yarn
- Conta no Supabase
- Chave da API da OpenAI

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/estudar-pro.git
   cd estudar-pro
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   - Renomeie `.env.example` para `.env.local`
   - Preencha as variáveis com suas chaves do Supabase e OpenAI.

4. **Execute as migrações do banco:**
   ```bash
   npm run db:migrate
   ```

5. **Popule o banco com dados de exemplo:**
   ```bash
   npm run seed
   ```

6. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

   Acesse `http://localhost:3000` no seu navegador.

## 📜 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Compila a aplicação para produção.
- `npm run start`: Inicia o servidor de produção.
- `npm run lint`: Executa o linter.
- `npm run db:migrate`: Executa as migrações do banco.
- `npm run db:reset`: Reseta o banco de dados.
- `npm run seed`: Popula o banco com dados de exemplo.
- `npm run etl:import`: Executa os scripts de ETL.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

