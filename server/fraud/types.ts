import { Customer, FraudRule, Transaction, TriggeredRuleDetail } from '../types';

export interface FraudEvaluationContext {
  transaction: Omit<Transaction, 'id' | 'risk_score' | 'risk_level' | 'is_suspicious' | 'created_at'> & { id?: string };
  customer: Customer;
  activeRules: FraudRule[];
  recentCustomerTransactions: Transaction[];
  velocityCount: number;
}

export interface RuleEvaluationResult {
  triggered: boolean;
  ruleCode: string;
  ruleName: string;
  score: number;
  description: string;
  metricValue?: string | number;
  thresholdValue?: string | number;
}

export interface FraudAssessment {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSuspicious: boolean;
  triggeredRules: TriggeredRuleDetail[];
  explanation: string;
}
