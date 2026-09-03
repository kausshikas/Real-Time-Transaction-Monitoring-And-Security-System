export type UserRole = 'ADMIN' | 'ANALYST' | 'INVESTIGATOR' | 'VIEWER';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED' | 'BLOCKED';
export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type CustomerType = 'INDIVIDUAL' | 'BUSINESS' | 'PREMIUM';
export type AccountStatus = 'ACTIVE' | 'RESTRICTED' | 'FROZEN';

export interface Customer {
  id: string;
  customer_reference: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  customer_type: CustomerType;
  risk_level: RiskLevel;
  account_status: AccountStatus;
  historical_avg_amount: number;
  known_devices: string[];
  known_locations: string[];
  total_transactions: number;
  fraud_alerts_count: number;
  total_spend: number;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  account_number: string;
  customer_id: string;
  currency: string;
  balance: number;
  status: AccountStatus;
  created_at: string;
}

export interface TriggeredRuleDetail {
  rule_id: string;
  rule_code: string;
  rule_name: string;
  score_contribution: number;
  description: string;
  metric_value?: string | number;
  threshold_value?: string | number;
}

export interface Transaction {
  id: string;
  transaction_reference: string;
  customer_id: string;
  customer_name: string;
  account_id: string;
  amount: number;
  currency: string;
  transaction_type: 'PURCHASE' | 'TRANSFER' | 'ATM_WITHDRAWAL' | 'ONLINE_PAYMENT';
  merchant: string;
  merchant_category: string;
  country: string;
  city: string;
  device_id: string;
  device_browser: string;
  device_os: string;
  ip_address: string;
  timestamp: string;
  status: TransactionStatus;
  risk_score: number;
  risk_level: RiskLevel;
  is_suspicious: boolean;
  fraud_reason?: string;
  triggered_rules?: TriggeredRuleDetail[];
  created_at: string;
}

export interface FraudRule {
  id: string;
  rule_code: string;
  name: string;
  description: string;
  threshold: number;
  risk_score: number;
  severity: AlertSeverity;
  is_active: boolean;
  category: 'VELOCITY' | 'AMOUNT' | 'LOCATION' | 'DEVICE' | 'MERCHANT' | 'BEHAVIOR';
  created_at: string;
  updated_at: string;
}

export interface FraudAlert {
  id: string;
  alert_reference: string;
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  transaction_amount: number;
  currency: string;
  rule_ids: string[];
  triggered_rules: TriggeredRuleDetail[];
  risk_score: number;
  severity: AlertSeverity;
  reason: string;
  status: AlertStatus;
  assigned_to?: string;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InvestigationNote {
  id: string;
  investigation_id: string;
  author_id: string;
  author_name: string;
  note: string;
  action_taken: string;
  created_at: string;
}

export interface Investigation {
  id: string;
  alert_id: string;
  alert_reference: string;
  transaction_id: string;
  customer_id: string;
  investigator_id?: string;
  investigator_name?: string;
  status: AlertStatus;
  priority: AlertSeverity;
  conclusion?: string;
  notes: InvestigationNote[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export interface SystemSettings {
  large_transaction_threshold: number;
  rapid_transaction_window_seconds: number;
  rapid_transaction_threshold_count: number;
  unusual_amount_multiplier: number;
  critical_alert_threshold: number;
  high_risk_threshold: number;
  medium_risk_threshold: number;
  simulator_interval_ms: number;
  simulator_normal_prob: number;
  simulator_suspicious_prob: number;
  simulator_critical_prob: number;
  alert_email_notifications: boolean;
  alert_sms_notifications: boolean;
}
