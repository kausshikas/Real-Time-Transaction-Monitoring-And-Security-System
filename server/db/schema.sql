-- ============================================================
-- REAL-TIME FRAUD DETECTION AND TRANSACTION MONITORING PLATFORM
-- DATABASE SCHEMA: PostgreSQL 15+
-- PROJECT ID: 41
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean up existing tables if dropping
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS investigation_notes CASCADE;
DROP TABLE IF EXISTS investigations CASCADE;
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS fraud_rules CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- 1. USERS TABLE (RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. CUSTOMERS TABLE
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_reference VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    country VARCHAR(60) NOT NULL,
    city VARCHAR(80) NOT NULL,
    customer_type VARCHAR(30) NOT NULL DEFAULT 'INDIVIDUAL' CHECK (customer_type IN ('INDIVIDUAL', 'BUSINESS', 'PREMIUM')),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'RESTRICTED', 'FROZEN')),
    historical_avg_amount NUMERIC(15, 2) DEFAULT 0.00,
    known_devices TEXT[] DEFAULT '{}',
    known_locations TEXT[] DEFAULT '{}',
    total_transactions INT DEFAULT 0,
    fraud_alerts_count INT DEFAULT 0,
    total_spend NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_reference ON customers(customer_reference);
CREATE INDEX idx_customers_risk ON customers(risk_level);
CREATE INDEX idx_customers_country ON customers(country);

-- 3. ACCOUNTS TABLE
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESTRICTED', 'FROZEN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_customer ON accounts(customer_id);

-- 4. FRAUD RULES TABLE
CREATE TABLE fraud_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    threshold NUMERIC(15, 2) NOT NULL,
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 1 AND 100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    category VARCHAR(30) NOT NULL CHECK (category IN ('VELOCITY', 'AMOUNT', 'LOCATION', 'DEVICE', 'MERCHANT', 'BEHAVIOR')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rules_code ON fraud_rules(rule_code);
CREATE INDEX idx_rules_active ON fraud_rules(is_active);

-- 5. TRANSACTIONS TABLE
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_reference VARCHAR(60) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT_FOREVER,
    customer_name VARCHAR(150) NOT NULL,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    transaction_type VARCHAR(40) NOT NULL CHECK (transaction_type IN ('PURCHASE', 'TRANSFER', 'ATM_WITHDRAWAL', 'ONLINE_PAYMENT')),
    merchant VARCHAR(120) NOT NULL,
    merchant_category VARCHAR(60) NOT NULL,
    country VARCHAR(60) NOT NULL,
    city VARCHAR(80) NOT NULL,
    device_id VARCHAR(100) NOT NULL,
    device_browser VARCHAR(60) NOT NULL,
    device_os VARCHAR(60) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'BLOCKED')),
    risk_score INT NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_suspicious BOOLEAN NOT NULL DEFAULT FALSE,
    fraud_reason TEXT,
    triggered_rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_customer ON transactions(customer_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX idx_transactions_risk_level ON transactions(risk_level);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_suspicious ON transactions(is_suspicious);

-- 6. FRAUD ALERTS TABLE
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_reference VARCHAR(60) UNIQUE NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name VARCHAR(150) NOT NULL,
    transaction_amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    rule_ids TEXT[] DEFAULT '{}',
    triggered_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
    risk_score INT NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reason TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alerts_transaction ON fraud_alerts(transaction_id);
CREATE INDEX idx_alerts_customer ON fraud_alerts(customer_id);
CREATE INDEX idx_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_alerts_severity ON fraud_alerts(severity);
CREATE INDEX idx_alerts_created_at ON fraud_alerts(created_at DESC);

-- 7. INVESTIGATIONS TABLE
CREATE TABLE investigations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID UNIQUE NOT NULL REFERENCES fraud_alerts(id) ON DELETE CASCADE,
    alert_reference VARCHAR(60) NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    investigator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'INVESTIGATING', 'ESCALATED', 'RESOLVED', 'FALSE_POSITIVE')),
    priority VARCHAR(20) NOT NULL DEFAULT 'HIGH' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    conclusion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_investigations_alert ON investigations(alert_id);
CREATE INDEX idx_investigations_investigator ON investigations(investigator_id);
CREATE INDEX idx_investigations_status ON investigations(status);

-- 8. INVESTIGATION NOTES TABLE
CREATE TABLE investigation_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id UUID NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    note TEXT NOT NULL,
    action_taken VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_investigation ON investigation_notes(investigation_id);

-- 9. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(80) NOT NULL,
    entity VARCHAR(60) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id);

-- 10. SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    id INT PRIMARY KEY DEFAULT 1,
    large_transaction_threshold NUMERIC(15, 2) NOT NULL DEFAULT 100000.00,
    rapid_transaction_window_seconds INT NOT NULL DEFAULT 120,
    rapid_transaction_threshold_count INT NOT NULL DEFAULT 3,
    unusual_amount_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 3.5,
    critical_alert_threshold INT NOT NULL DEFAULT 80,
    high_risk_threshold INT NOT NULL DEFAULT 60,
    medium_risk_threshold INT NOT NULL DEFAULT 30,
    simulator_interval_ms INT NOT NULL DEFAULT 3000,
    simulator_normal_prob NUMERIC(5, 2) NOT NULL DEFAULT 0.70,
    simulator_suspicious_prob NUMERIC(5, 2) NOT NULL DEFAULT 0.20,
    simulator_critical_prob NUMERIC(5, 2) NOT NULL DEFAULT 0.10,
    alert_email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    alert_sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
