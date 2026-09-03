import { storage } from '../db/storage';
import { redis } from '../redis/redisClient';
import { ruleEngine } from '../fraud/ruleEngine';
import { riskScorer } from '../fraud/riskScorer';
import { sseManager } from '../events/sseManager';
import { Transaction, FraudAlert, TransactionStatus } from '../types';

export interface CreateTransactionInput {
  customer_id: string;
  amount: number;
  currency?: string;
  transaction_type?: 'PURCHASE' | 'TRANSFER' | 'ATM_WITHDRAWAL' | 'ONLINE_PAYMENT';
  merchant: string;
  merchant_category: string;
  country: string;
  city: string;
  device_id: string;
  device_browser?: string;
  device_os?: string;
  ip_address?: string;
}

export class TransactionService {
  /**
   * Complete 11-step transaction surveillance workflow
   */
  public async processTransaction(input: CreateTransactionInput): Promise<{
    transaction: Transaction;
    alert?: FraudAlert;
  }> {
    // 1. VALIDATE TRANSACTION
    if (!input.customer_id || !input.amount || input.amount <= 0) {
      throw new Error('Invalid transaction payload: customer_id and positive amount are required.');
    }

    const customer = storage.getCustomerById(input.customer_id);
    if (!customer) {
      throw new Error(`Customer ${input.customer_id} not found in database.`);
    }

    const now = Date.now();
    const timestampStr = new Date(now).toISOString();

    // 2. FETCH CUSTOMER HISTORY & VELOCITY FROM REDIS
    const settings = storage.getSettings();
    const velocityCount = redis.recordTransactionVelocity(
      customer.id,
      now,
      settings.rapid_transaction_window_seconds
    );

    redis.recordLocation(customer.id, input.city, input.country, now);
    const recentTxns = storage.getRecentCustomerTransactions(customer.id, 15);
    const activeRules = storage.getFraudRules();

    // 3. RUN FRAUD RULES THROUGH RULE ENGINE
    const preliminaryTxn = {
      transaction_reference: `TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
      customer_id: customer.id,
      customer_name: customer.name,
      account_id: 'acc-default',
      amount: input.amount,
      currency: input.currency || 'INR',
      transaction_type: input.transaction_type || 'PURCHASE',
      merchant: input.merchant,
      merchant_category: input.merchant_category,
      country: input.country,
      city: input.city,
      device_id: input.device_id,
      device_browser: input.device_browser || 'Chrome 122.0',
      device_os: input.device_os || 'Windows 11',
      ip_address: input.ip_address || '49.37.100.12',
      timestamp: timestampStr,
      status: 'COMPLETED' as TransactionStatus,
    };

    const evaluationResults = ruleEngine.evaluate({
      transaction: preliminaryTxn,
      customer,
      activeRules,
      recentCustomerTransactions: recentTxns,
      velocityCount,
    });

    // 4. CALCULATE RISK SCORE & DETERMINE RISK LEVEL
    const assessment = riskScorer.calculateRisk(evaluationResults);

    // 5. DETERMINE EXECUTION STATUS BASED ON RISK SEVERITY
    let status: TransactionStatus = 'COMPLETED';
    if (assessment.riskLevel === 'CRITICAL') {
      status = 'BLOCKED'; // Auto-block critical fraud attempts
    } else if (assessment.riskLevel === 'HIGH' && assessment.riskScore >= 75) {
      status = 'PENDING'; // Route to manual review queue
    }

    // 6. STORE TRANSACTION
    const txnId = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullTxn: Transaction = {
      ...preliminaryTxn,
      id: txnId,
      transaction_reference: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status,
      risk_score: assessment.riskScore,
      risk_level: assessment.riskLevel,
      is_suspicious: assessment.isSuspicious,
      fraud_reason: assessment.explanation,
      triggered_rules: assessment.triggeredRules,
      created_at: timestampStr,
    };

    storage.addTransaction(fullTxn);

    // 7. IF SUSPICIOUS -> CREATE FRAUD ALERT & INVESTIGATION
    let alert: FraudAlert | undefined;
    if (assessment.isSuspicious || assessment.riskScore >= settings.high_risk_threshold) {
      const alertId = `alt-${Date.now()}`;
      alert = {
        id: alertId,
        alert_reference: `ALT-${Math.floor(50000 + Math.random() * 50000)}`,
        transaction_id: fullTxn.id,
        customer_id: customer.id,
        customer_name: customer.name,
        transaction_amount: fullTxn.amount,
        currency: fullTxn.currency,
        rule_ids: assessment.triggeredRules.map(r => r.rule_id),
        triggered_rules: assessment.triggeredRules,
        risk_score: assessment.riskScore,
        severity: assessment.riskLevel,
        reason: assessment.explanation,
        status: 'OPEN',
        created_at: timestampStr,
        updated_at: timestampStr,
      };

      storage.addAlert(alert);

      // Audit log alert generation
      storage.addAuditLog({
        user_id: 'sys-engine',
        user_name: 'Fraud Detection Engine',
        action: 'FRAUD_ALERT_GENERATED',
        entity: 'FRAUD_ALERT',
        entity_id: alert.alert_reference,
        description: `Alert generated for txn ${fullTxn.transaction_reference} (Score: ${alert.risk_score} - ${alert.severity}): ${alert.reason}`,
        ip_address: fullTxn.ip_address,
      });
    }

    // 8. SEND REAL-TIME EVENT VIA SSE TO DASHBOARD & FEED
    sseManager.broadcast('transaction:new', fullTxn);

    if (alert) {
      sseManager.broadcast('alert:new', alert);
      sseManager.broadcast('transaction:risk', {
        transaction: fullTxn,
        alert,
      });
    }

    // 9. BROADCAST DASHBOARD UPDATE
    const summary = storage.getDashboardSummary('today');
    sseManager.broadcast('dashboard:update', summary);

    return {
      transaction: fullTxn,
      alert,
    };
  }
}

export const transactionService = new TransactionService();
