-- Migration: Trial and Payment System
-- Description: Add trial period, subscription plans, and payment tracking

-- 1. Add trial and subscription fields to whatsapp_users
ALTER TABLE whatsapp_users 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '3 days'),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20) DEFAULT NULL CHECK (subscription_plan IN ('monthly', 'annual')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS is_trial_expired BOOLEAN DEFAULT FALSE;

-- 2. Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    plan_name VARCHAR(50) NOT NULL,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    price_cents INTEGER NOT NULL, -- Price in cents (1990 = R$ 19.90)
    currency VARCHAR(3) DEFAULT 'BRL',
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES whatsapp_users(id) ON DELETE CASCADE,
    transaction_id VARCHAR(255) UNIQUE NOT NULL, -- Mercado Pago transaction ID
    payment_method VARCHAR(50),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded')),
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    mercado_pago_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES whatsapp_users(id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('monthly', 'annual')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    transaction_id VARCHAR(255) REFERENCES transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('trial_period_days', '3', 'number', 'Number of days for trial period'),
('monthly_plan_price_cents', '1990', 'number', 'Monthly plan price in cents (R$ 19.90)'),
('annual_plan_price_cents', '19900', 'number', 'Annual plan price in cents (R$ 199.00)'),
('mercado_pago_access_token', '', 'string', 'Mercado Pago access token'),
('mercado_pago_public_key', '', 'string', 'Mercado Pago public key'),
('payment_webhook_url', '', 'string', 'Webhook URL for payment notifications'),
('trial_enabled', 'true', 'boolean', 'Enable trial period for new users')
ON CONFLICT (setting_key) DO NOTHING;

-- 7. Insert default subscription plans
INSERT INTO subscription_plans (plan_name, plan_type, price_cents, features) VALUES
('Plano Mensal', 'monthly', 1990, '["Acesso completo", "Suporte via WhatsApp", "Atualizações automáticas"]'),
('Plano Anual', 'annual', 19900, '["Acesso completo", "Suporte via WhatsApp", "Atualizações automáticas", "2 meses grátis"]')
ON CONFLICT DO NOTHING;

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_subscription_status ON whatsapp_users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_trial_end_date ON whatsapp_users(trial_end_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- 9. Create function to check if user trial is expired
CREATE OR REPLACE FUNCTION check_trial_expiration()
RETURNS TRIGGER AS $$
BEGIN
    -- Update is_trial_expired based on trial_end_date
    IF NEW.trial_end_date <= NOW() AND NEW.subscription_status = 'trial' THEN
        NEW.is_trial_expired = TRUE;
        NEW.subscription_status = 'expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically check trial expiration
DROP TRIGGER IF EXISTS trigger_check_trial_expiration ON whatsapp_users;
CREATE TRIGGER trigger_check_trial_expiration
    BEFORE UPDATE ON whatsapp_users
    FOR EACH ROW
    EXECUTE FUNCTION check_trial_expiration();

-- 11. Update existing users to have trial period
UPDATE whatsapp_users 
SET 
    trial_start_date = created_at,
    trial_end_date = created_at + INTERVAL '3 days',
    subscription_status = CASE 
        WHEN created_at + INTERVAL '3 days' > NOW() THEN 'trial'
        ELSE 'expired'
    END,
    is_trial_expired = CASE 
        WHEN created_at + INTERVAL '3 days' <= NOW() THEN TRUE
        ELSE FALSE
    END
WHERE trial_start_date IS NULL;

