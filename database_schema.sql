-- 数据库表设计脚本 (PostgreSQL版本)
-- 支持用户登录、积分管理和支付系统

-- 1. 用户信息表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    is_paid_user BOOLEAN DEFAULT FALSE,
    price_name VARCHAR(100) DEFAULT NULL,
    price_type VARCHAR(20) DEFAULT 'free' CHECK (price_type IN ('free', 'monthly', 'yearly')),
    credits_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    last_login_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
    avatar_url VARCHAR(500) DEFAULT NULL,
    -- Stripe相关字段
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    subscription_status VARCHAR(50) DEFAULT 'inactive',
    subscription_current_period_start TIMESTAMP NULL,
    subscription_current_period_end TIMESTAMP NULL,
    subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE
);

-- 添加注释
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.is_paid_user IS '是否为付费用户';
COMMENT ON COLUMN users.price_name IS '套餐名称';
COMMENT ON COLUMN users.price_type IS '套餐类型：免费用户/月套餐/年套餐';
COMMENT ON COLUMN users.credits_balance IS '积分余额';
COMMENT ON COLUMN users.created_at IS '创建时间';

COMMENT ON COLUMN users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN users.status IS '用户状态';
COMMENT ON COLUMN users.avatar_url IS '用户头像URL';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe客户ID';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe订阅ID';
COMMENT ON COLUMN users.subscription_status IS '订阅状态';
COMMENT ON COLUMN users.subscription_current_period_start IS '当前订阅周期开始时间';
COMMENT ON COLUMN users.subscription_current_period_end IS '当前订阅周期结束时间';
COMMENT ON COLUMN users.subscription_cancel_at_period_end IS '是否在周期结束时取消订阅';

-- 2. 价格表
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    price_name VARCHAR(100) NOT NULL,
    price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('monthly', 'yearly', 'credits')),
    price_description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    credits_amount INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   
    -- Stripe相关字段
    stripe_price_id VARCHAR(255) UNIQUE,
    stripe_product_id VARCHAR(255)
);

-- 添加注释
COMMENT ON TABLE subscription_plans IS '订阅计划表';
COMMENT ON COLUMN subscription_plans.id IS '套餐ID';
COMMENT ON COLUMN subscription_plans.price_name IS '套餐名称';
COMMENT ON COLUMN subscription_plans.price_type IS '套餐类型：月套餐/年套餐';
COMMENT ON COLUMN subscription_plans.price_description IS '套餐描述';
COMMENT ON COLUMN subscription_plans.price IS '套餐价格';
COMMENT ON COLUMN subscription_plans.currency IS '货币类型';
COMMENT ON COLUMN subscription_plans.credits_amount IS '包含的积分数量';
COMMENT ON COLUMN subscription_plans.created_at IS '创建时间';

COMMENT ON COLUMN subscription_plans.stripe_price_id IS 'Stripe价格ID';
COMMENT ON COLUMN subscription_plans.stripe_product_id IS 'Stripe产品ID';

-- 3. 支付记录表
CREATE TABLE payment_records (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    subscription_id INTEGER NULL,
    payment_type VARCHAR(20) DEFAULT 'one_time' CHECK (payment_type IN ('one_time', 'subscription')),
    order_no VARCHAR(100) UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded')),
    payment_method VARCHAR(50),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Stripe相关字段
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscription_plans(id) ON DELETE SET NULL
);

-- 添加注释
COMMENT ON TABLE payment_records IS '支付记录表';
COMMENT ON COLUMN payment_records.id IS '支付记录ID';
COMMENT ON COLUMN payment_records.user_id IS '用户ID';

COMMENT ON COLUMN payment_records.subscription_id IS '套餐ID';
COMMENT ON COLUMN payment_records.payment_type IS '支付类型：one_time(一次性) 或 subscription(订阅)';
COMMENT ON COLUMN payment_records.order_no IS '订单号';
COMMENT ON COLUMN payment_records.amount IS '支付金额';
COMMENT ON COLUMN payment_records.currency IS '货币类型';
COMMENT ON COLUMN payment_records.payment_status IS '支付状态';
COMMENT ON COLUMN payment_records.payment_method IS '支付方式';
COMMENT ON COLUMN payment_records.paid_at IS '支付时间';
COMMENT ON COLUMN payment_records.created_at IS '创建时间';
COMMENT ON COLUMN payment_records.updated_at IS '更新时间';
COMMENT ON COLUMN payment_records.stripe_payment_intent_id IS 'Stripe支付意图ID';
COMMENT ON COLUMN payment_records.stripe_invoice_id IS 'Stripe发票ID';
COMMENT ON COLUMN payment_records.stripe_subscription_id IS 'Stripe订阅ID';

-- 4. 用户使用记录表
CREATE TABLE user_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    generations_used INTEGER DEFAULT 1,
    duration_used INTEGER NOT NULL,
    credits_consumed INTEGER NOT NULL,
    video_duration INTEGER,
    resolution VARCHAR(20),
    price_name VARCHAR(100) DEFAULT NULL,
    price_type VARCHAR(20) DEFAULT 'free' CHECK (price_type IN ('free', 'monthly', 'yearly')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 添加注释
COMMENT ON TABLE user_usage IS '用户使用记录表';
COMMENT ON COLUMN user_usage.id IS '使用记录ID';
COMMENT ON COLUMN user_usage.user_id IS '用户ID';
COMMENT ON COLUMN user_usage.generations_used IS '本次使用的次数';
COMMENT ON COLUMN user_usage.duration_used IS '本次使用的时长（秒）';
COMMENT ON COLUMN user_usage.credits_consumed IS '消耗的积分';
COMMENT ON COLUMN user_usage.video_duration IS '视频时长（秒）';
COMMENT ON COLUMN user_usage.resolution IS '输出分辨率';
COMMENT ON COLUMN user_usage.price_name IS '套餐名称';
COMMENT ON COLUMN user_usage.price_type IS '套餐类型：免费用户/月套餐/年套餐';
COMMENT ON COLUMN user_usage.created_at IS '创建时间';


-- 5. Stripe Webhook事件表
CREATE TABLE stripe_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加注释
COMMENT ON TABLE stripe_webhook_events IS 'Stripe Webhook事件表';
COMMENT ON COLUMN stripe_webhook_events.id IS '事件ID';
COMMENT ON COLUMN stripe_webhook_events.stripe_event_id IS 'Stripe事件ID';
COMMENT ON COLUMN stripe_webhook_events.event_type IS '事件类型';
COMMENT ON COLUMN stripe_webhook_events.event_data IS '事件数据';
COMMENT ON COLUMN stripe_webhook_events.processed IS '是否已处理';
COMMENT ON COLUMN stripe_webhook_events.processed_at IS '处理时间';
COMMENT ON COLUMN stripe_webhook_events.created_at IS '创建时间';

-- 创建索引（优化查询性能）
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_credits ON users(credits_balance);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

CREATE INDEX idx_subscription_plans_type ON subscription_plans(price_type);
CREATE INDEX idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);

CREATE INDEX idx_payment_records_user_id ON payment_records(user_id);

CREATE INDEX idx_payment_records_status ON payment_records(payment_status);
CREATE INDEX idx_payment_records_stripe_payment_intent_id ON payment_records(stripe_payment_intent_id);

CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_user_usage_price_type ON user_usage(price_type);
CREATE INDEX idx_user_usage_created_at ON user_usage(created_at);

CREATE INDEX idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- 插入默认订阅计划
INSERT INTO subscription_plans (price_name, price_type, price_description, price, credits_amount) VALUES
-- 月订阅
('月订阅1', 'monthly', '适合个人创作者，每月1300积分', 39.90, 1300),
('月订阅2', 'monthly', '适合专业创作者和小型团队，每月4000积分', 99.90, 4000),
-- 年订阅
('年订阅1', 'yearly', '适合个人创作者，每年2万积分（年付优惠）', 442.00, 20000),
('年订阅2', 'yearly', '适合专业创作者和团队，每年5万积分（年付优惠）', 838.00, 50000),
-- 积分包
('积分包1', 'credits', '积分包1，1000积分', 39.90, 1000),
('积分包2', 'credits', '积分包2，2000积分', 69.90, 2000),
('积分包3', 'credits', '积分包3，3600积分', 99.90, 3600);

-- ========================================
-- 如果表已经存在，执行以下ALTER TABLE语句
-- ========================================

-- 为users表添加Stripe相关字段
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_start TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT NULL;

-- 为subscription_plans表添加Stripe相关字段
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255) UNIQUE;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

-- 为payment_records表添加Stripe相关字段
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255) UNIQUE;
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255);
ALTER TABLE payment_records ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- 创建stripe_webhook_events表（如果不存在）
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 添加新索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_payment_intent_id ON payment_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);

-- 添加注释（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'stripe_customer_id')) THEN
        COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe客户ID';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'stripe_subscription_id')) THEN
        COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe订阅ID';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'subscription_status')) THEN
        COMMENT ON COLUMN users.subscription_status IS '订阅状态';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'subscription_current_period_start')) THEN
        COMMENT ON COLUMN users.subscription_current_period_start IS '当前订阅周期开始时间';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'subscription_current_period_end')) THEN
        COMMENT ON COLUMN users.subscription_current_period_end IS '当前订阅周期结束时间';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'users'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attrelid = 'users'::regclass AND attname = 'subscription_cancel_at_period_end')) THEN
        COMMENT ON COLUMN users.subscription_cancel_at_period_end IS '是否在周期结束时取消订阅';
    END IF;
END $$; 






