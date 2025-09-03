-- Tabela de usuários WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Tabela de códigos de verificação temporários
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  is_new_user BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de login (usuários WhatsApp)
CREATE TABLE IF NOT EXISTS login_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES whatsapp_users(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

-- Tabela de sessões admin (login tradicional)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  device_id TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_phone ON whatsapp_users(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_login_sessions_device ON login_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);

-- Função para limpar códigos expirados automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para limpar sessões inativas (mais de 30 dias)
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM login_sessions 
  WHERE last_activity < NOW() - INTERVAL '30 days';
  
  DELETE FROM admin_sessions 
  WHERE last_activity < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) - Opcional
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários só veem seus próprios dados)
CREATE POLICY "Users can view own data" ON whatsapp_users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON whatsapp_users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Comentários para documentação
COMMENT ON TABLE whatsapp_users IS 'Usuários autenticados via WhatsApp';
COMMENT ON TABLE verification_codes IS 'Códigos de verificação temporários para login';
COMMENT ON TABLE login_sessions IS 'Sessões ativas de usuários WhatsApp';
COMMENT ON TABLE admin_sessions IS 'Sessões ativas de administradores';

COMMENT ON COLUMN whatsapp_users.phone IS 'Número do WhatsApp no formato internacional';
COMMENT ON COLUMN verification_codes.expires_at IS 'Data/hora de expiração do código (5 minutos)';
COMMENT ON COLUMN login_sessions.device_id IS 'Identificador único do dispositivo/navegador';
COMMENT ON COLUMN login_sessions.session_token IS 'Token único da sessão para autenticação';

