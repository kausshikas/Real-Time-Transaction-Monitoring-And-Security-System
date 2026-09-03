import { FraudEvaluationContext, RuleEvaluationResult } from './types';
import { redis } from '../redis/redisClient';

export class RuleEngine {
  /**
   * Evaluates all active fraud detection rules against the incoming transaction context.
   */
  public evaluate(context: FraudEvaluationContext): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = [];
    const { transaction, customer, activeRules, recentCustomerTransactions, velocityCount } = context;

    for (const rule of activeRules) {
      if (!rule.is_active) continue;

      let result: RuleEvaluationResult | null = null;

      switch (rule.rule_code) {
        case 'RULE_01': // Large Transaction
          result = this.evaluateLargeTransaction(transaction, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_02': // Rapid Transactions (Velocity)
          result = this.evaluateRapidTransactions(velocityCount, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_03': // Unusual Transaction Amount vs Customer Baseline
          result = this.evaluateUnusualAmount(transaction, customer, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_04': // Unusual Location
          result = this.evaluateUnusualLocation(transaction, customer, rule.risk_score, rule.name);
          break;

        case 'RULE_05': // Multiple Countries in Impossible Timeframe (<60m)
          result = this.evaluateImpossibleTravel(transaction, recentCustomerTransactions, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_06': // New Device Fingerprint
          result = this.evaluateNewDevice(transaction, customer, rule.risk_score, rule.name);
          break;

        case 'RULE_07': // High-Risk Merchant Category
          result = this.evaluateHighRiskMerchant(transaction, rule.risk_score, rule.name);
          break;

        case 'RULE_08': // Repeated Failed Transactions
          result = this.evaluateRepeatedFailedTransactions(recentCustomerTransactions, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_09': // Dormant Account Sudden High Surge
          result = this.evaluateDormantSurge(transaction, customer, recentCustomerTransactions, rule.threshold, rule.risk_score, rule.name);
          break;

        case 'RULE_10': // Tor or Proxy IP Address
          result = this.evaluateProxyOrTor(transaction, rule.risk_score, rule.name);
          break;

        default:
          break;
      }

      if (result && result.triggered) {
        results.push(result);
      }
    }

    return results;
  }

  // RULE 1: Large Transaction
  private evaluateLargeTransaction(txn: any, threshold: number, score: number, ruleName: string): RuleEvaluationResult {
    const isTriggered = txn.amount >= threshold;
    return {
      triggered: isTriggered,
      ruleCode: 'RULE_01',
      ruleName,
      score,
      description: `Transaction amount ₹${txn.amount.toLocaleString('en-IN')} exceeds enterprise threshold of ₹${threshold.toLocaleString('en-IN')}`,
      metricValue: txn.amount,
      thresholdValue: threshold,
    };
  }

  // RULE 2: Rapid Transactions Velocity
  private evaluateRapidTransactions(velocityCount: number, threshold: number, score: number, ruleName: string): RuleEvaluationResult {
    const isTriggered = velocityCount >= threshold;
    return {
      triggered: isTriggered,
      ruleCode: 'RULE_02',
      ruleName,
      score,
      description: `High velocity detected: ${velocityCount} transactions in sliding 120-second window (threshold: ${threshold})`,
      metricValue: velocityCount,
      thresholdValue: threshold,
    };
  }

  // RULE 3: Unusual Transaction Amount vs Customer Baseline
  private evaluateUnusualAmount(txn: any, customer: any, multiplierThreshold: number, score: number, ruleName: string): RuleEvaluationResult {
    const baseline = customer.historical_avg_amount || 2000;
    const ratio = txn.amount / baseline;
    const isTriggered = ratio >= multiplierThreshold;

    return {
      triggered: isTriggered,
      ruleCode: 'RULE_03',
      ruleName,
      score,
      description: `Transaction amount is ${ratio.toFixed(1)}x greater than customer historical average (₹${baseline.toLocaleString('en-IN')})`,
      metricValue: `${ratio.toFixed(1)}x`,
      thresholdValue: `${multiplierThreshold}x`,
    };
  }

  // RULE 4: Unusual Location
  private evaluateUnusualLocation(txn: any, customer: any, score: number, ruleName: string): RuleEvaluationResult {
    const txnLoc = `${txn.city}, ${txn.country}`.toLowerCase();
    const knownLocs = (customer.known_locations || []).map((l: string) => l.toLowerCase());
    const isDifferentCountry = txn.country !== customer.country;
    const isUnknownCity = !knownLocs.some((loc: string) => loc.includes(txn.city.toLowerCase()) || loc.includes(txn.country.toLowerCase()));

    const isTriggered = isDifferentCountry || isUnknownCity;

    return {
      triggered: isTriggered,
      ruleCode: 'RULE_04',
      ruleName,
      score,
      description: isDifferentCountry 
        ? `Transaction originated outside registered customer country: ${txn.country} (home: ${customer.country})`
        : `Transaction initiated from unverified location: ${txn.city}, ${txn.country}`,
      metricValue: `${txn.city}, ${txn.country}`,
    };
  }

  // RULE 5: Impossible Travel Velocity
  private evaluateImpossibleTravel(txn: any, recentTxns: any[], windowMinutes: number, score: number, ruleName: string): RuleEvaluationResult {
    const txnTime = new Date(txn.timestamp).getTime();
    const windowMs = windowMinutes * 60 * 1000;

    const crossCountryConflict = recentTxns.find(t => {
      const diff = Math.abs(txnTime - new Date(t.timestamp).getTime());
      return diff <= windowMs && t.country !== txn.country;
    });

    const isTriggered = !!crossCountryConflict;

    return {
      triggered: isTriggered,
      ruleCode: 'RULE_05',
      ruleName,
      score,
      description: isTriggered
        ? `Impossible travel: Transaction in ${txn.country} within ${Math.round(Math.abs(txnTime - new Date(crossCountryConflict!.timestamp).getTime()) / 60000)}m of transaction in ${crossCountryConflict!.country}`
        : '',
      metricValue: isTriggered ? `${crossCountryConflict!.country} -> ${txn.country}` : '',
      thresholdValue: `< ${windowMinutes} mins`,
    };
  }

  // RULE 6: New Device Fingerprint
  private evaluateNewDevice(txn: any, customer: any, score: number, ruleName: string): RuleEvaluationResult {
    const knownDevices = customer.known_devices || [];
    const isNew = !knownDevices.includes(txn.device_id);

    return {
      triggered: isNew,
      ruleCode: 'RULE_06',
      ruleName,
      score,
      description: `Unrecognized device fingerprint: ${txn.device_id} (${txn.device_browser} on ${txn.device_os})`,
      metricValue: txn.device_id,
    };
  }

  // RULE 7: High-Risk Merchant Category
  private evaluateHighRiskMerchant(txn: any, score: number, ruleName: string): RuleEvaluationResult {
    const highRiskCategories = [
      'Cryptocurrency Exchange',
      'Gambling & Gaming',
      'Wire Remittance',
      'Luxury Jewelry',
      'Offshore Banking',
      'High-Risk Digital Goods'
    ];

    const isHighRisk = highRiskCategories.some(c => txn.merchant_category.toLowerCase().includes(c.toLowerCase()));

    return {
      triggered: isHighRisk,
      ruleCode: 'RULE_07',
      ruleName,
      score,
      description: `Payment routed to high-vulnerability Merchant Category: ${txn.merchant_category} (${txn.merchant})`,
      metricValue: txn.merchant_category,
    };
  }

  // RULE 8: Repeated Failed Transactions
  private evaluateRepeatedFailedTransactions(recentTxns: any[], threshold: number, score: number, ruleName: string): RuleEvaluationResult {
    const now = Date.now();
    const tenMins = 10 * 60 * 1000;

    const failedCount = recentTxns.filter(t => {
      const time = new Date(t.timestamp).getTime();
      return (now - time) <= tenMins && (t.status === 'FAILED' || t.status === 'BLOCKED');
    }).length;

    const isTriggered = failedCount >= threshold;

    return {
      triggered: isTriggered,
      ruleCode: 'RULE_08',
      ruleName,
      score,
      description: `${failedCount} failed authorization attempts detected in preceding 10 minutes`,
      metricValue: failedCount,
      thresholdValue: threshold,
    };
  }

  // RULE 9: Dormant Surge
  private evaluateDormantSurge(txn: any, customer: any, recentTxns: any[], threshold: number, score: number, ruleName: string): RuleEvaluationResult {
    if (recentTxns.length === 0 && txn.amount >= threshold) {
      return {
        triggered: true,
        ruleCode: 'RULE_09',
        ruleName,
        score,
        description: `Sudden large movement of ₹${txn.amount.toLocaleString('en-IN')} on account with no recent debit history`,
        metricValue: txn.amount,
        thresholdValue: threshold,
      };
    }
    return { triggered: false, ruleCode: 'RULE_09', ruleName, score, description: '' };
  }

  // RULE 10: Tor / Anonymous Proxy IP
  private evaluateProxyOrTor(txn: any, score: number, ruleName: string): RuleEvaluationResult {
    const isSuspiciousIp = txn.ip_address.startsWith('185.220.') || txn.ip_address.startsWith('194.26.') || txn.ip_address.includes('.tor.');
    return {
      triggered: isSuspiciousIp,
      ruleCode: 'RULE_10',
      ruleName,
      score,
      description: `Originating IP address ${txn.ip_address} identified as anonymous VPN or exit node`,
      metricValue: txn.ip_address,
    };
  }
}

export const ruleEngine = new RuleEngine();
