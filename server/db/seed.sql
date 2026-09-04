-- ============================================================
-- REAL-TIME FRAUD DETECTION PLATFORM: POSTGRESQL SEED SCRIPT
-- PROJECT ID: 41
-- ============================================================

-- 1. Insert Initial System Settings
INSERT INTO system_settings (
    id, large_transaction_threshold, rapid_transaction_window_seconds, 
    rapid_transaction_threshold_count, unusual_amount_multiplier, 
    critical_alert_threshold, high_risk_threshold, medium_risk_threshold,
    simulator_interval_ms, simulator_normal_prob, simulator_suspicious_prob, simulator_critical_prob
) VALUES (
    1, 100000.00, 120, 3, 3.50, 80, 60, 30, 3000, 0.70, 0.20, 0.10
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Default RBAC Users (Demo accounts for review & viva)
INSERT INTO users (id, name, email, password_hash, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin123', 'admin@fraudguard.demo', '$2a$10$wN3T.r38V1bA9c3B5fR1IeC/lC6b5f92a00c73d9e28f3a74b3', 'ADMIN', 'ACTIVE'),
('a0000000-0000-0000-0000-000000000002', 'Priya Sundaram', 'analyst@fraudguard.demo', '$2a$10$wN3T.r38V1bA9c3B5fR1IeC/lC6b5f92a00c73d9e28f3a74b3', 'ANALYST', 'ACTIVE'),
('a0000000-0000-0000-0000-000000000003', 'Marcus Vance', 'investigator@fraudguard.demo', '$2a$10$wN3T.r38V1bA9c3B5fR1IeC/lC6b5f92a00c73d9e28f3a74b3', 'INVESTIGATOR', 'ACTIVE'),
('a0000000-0000-0000-0000-000000000004', 'Ananya Deshmukh', 'viewer@fraudguard.demo', '$2a$10$wN3T.r38V1bA9c3B5fR1IeC/lC6b5f92a00c73d9e28f3a74b3', 'VIEWER', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Core Fraud Rules
INSERT INTO fraud_rules (rule_code, name, description, threshold, risk_score, severity, is_active, category) VALUES
('RULE_01', 'Large Transaction Amount', 'Transaction exceeds standard enterprise single-transaction ceiling threshold.', 100000.00, 25, 'HIGH', TRUE, 'AMOUNT'),
('RULE_02', 'Rapid Transactions Velocity', 'Multiple transactions within 120s window.', 3.00, 20, 'HIGH', TRUE, 'VELOCITY'),
('RULE_03', 'Unusual Amount Deviation', 'Amount deviates more than 3.5x from customer historical moving baseline.', 3.50, 22, 'MEDIUM', TRUE, 'BEHAVIOR'),
('RULE_04', 'Unusual Geolocation', 'Transaction executed from an unverified or new country location.', 1.00, 25, 'HIGH', TRUE, 'LOCATION'),
('RULE_05', 'Multiple Countries in Impossible Timeframe', 'Physical travel velocity impossible (< 60 mins between countries).', 60.00, 30, 'CRITICAL', TRUE, 'LOCATION'),
('RULE_06', 'Unrecognized Device Fingerprint', 'Hardware or browser fingerprint not on customer whitelist.', 1.00, 20, 'MEDIUM', TRUE, 'DEVICE'),
('RULE_07', 'High-Risk Merchant Category', 'Payment routed to Cryptocurrency Exchange, Offshore Casino, or High-Risk Remittance.', 1.00, 15, 'MEDIUM', TRUE, 'MERCHANT'),
('RULE_08', 'Repeated Failed Authorization Attempts', 'Two or more failed authorization attempts within past 10 minutes.', 2.00, 15, 'MEDIUM', TRUE, 'BEHAVIOR'),
('RULE_09', 'Dormant Account Sudden High Surge', 'High-value transaction on account inactive for > 90 days.', 50000.00, 18, 'MEDIUM', TRUE, 'BEHAVIOR'),
('RULE_10', 'Tor or Proxy IP Address Detected', 'Connection IP address matches anonymizing proxy or Tor exit node.', 1.00, 25, 'HIGH', TRUE, 'DEVICE')
ON CONFLICT (rule_code) DO NOTHING;
