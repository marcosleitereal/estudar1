# Documentação do Sistema de Autenticação - Estudar.Pro

## Visão Geral

O sistema de autenticação foi completamente refatorado para oferecer um fluxo de cadastro e login profissional, robusto e seguro. A autenticação principal é baseada no número de WhatsApp do usuário, garantindo uma experiência de login sem senha (passwordless).

## Fluxo de Autenticação

### 1. Cadastro de Novo Usuário

- **Página Inicial:** O usuário é direcionado para a página de autenticação via WhatsApp.
- **Formulário de Cadastro:** Se o número de WhatsApp não estiver cadastrado, o usuário é apresentado a um formulário para inserir nome, email e WhatsApp.
- **Verificação:** Um código de 6 dígitos é enviado para o WhatsApp do usuário.
- **Conclusão:** Após inserir o código, o usuário é cadastrado e logado automaticamente.

### 2. Login de Usuário Existente

- **Página Inicial:** O usuário insere o número de WhatsApp.
- **Verificação:** Um código de 6 dígitos é enviado para o WhatsApp.
- **Login:** Após inserir o código, o usuário é logado e redirecionado para o dashboard.

## Tecnologias e Segurança

- **Tokens de Sessão:** UUIDs seguros gerados para cada sessão.
- **Cookies:** Sessões gerenciadas com cookies HTTPOnly, seguros contra XSS.
- **Códigos de Verificação:** Expiram em 10 minutos para maior segurança.
- **Validação:** Validação de dados no frontend e backend.

## APIs

- `/api/auth/register`: Cadastro de novos usuários.
- `/api/auth/verify-registration`: Verificação de código de cadastro.
- `/api/auth/whatsapp/initiate`: Iniciação de login para usuários existentes.
- `/api/auth/whatsapp/verify`: Verificação de código de login.
- `/api/auth/me`: Validação de sessão e obtenção de dados do usuário.
- `/api/user/update-profile`: Atualização de dados do perfil.

## Componentes Frontend

- **`useAuth` (Hook):** Gerencia todo o estado de autenticação.
- **`AuthProvider` (Context):** Fornece o estado de autenticação para toda a aplicação.
- **`ProtectedRoute` (HOC):** Protege rotas que exigem autenticação.
- **`RegisterForm`:** Formulário de cadastro completo.
- **`WhatsappLogin`:** Formulário de login via WhatsApp.

## Banco de Dados

- **Tabela `users`:** Armazena dados dos usuários, incluindo trial e status de assinatura.
- **Tabela `whatsapp_sessions`:** Gerencia sessões de verificação de WhatsApp.

## Melhorias Futuras

- Implementar autenticação via Google e outros provedores.
- Adicionar opção de reenvio de código.
- Implementar two-factor authentication (2FA).


