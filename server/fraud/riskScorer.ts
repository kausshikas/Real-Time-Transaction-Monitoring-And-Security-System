import { FraudAssessment, RuleEvaluationResult } from './types';
import { TriggeredRuleDetail } from '../types';

export class RiskScorer {
  /**
   * Aggregates rule weights into a normalized 0-100 score and builds a human-readable explanation.
   */
  public calculateRisk(triggeredResults: RuleEvaluationResult[]): FraudAssessment {
    if (triggeredResults.length === 0) {
      return {
        riskScore: 5,
        riskLevel: 'LOW',
        isSuspicious: false,
        triggeredRules: [],
        explanation: 'Transaction validated against all fraud surveillance rules. Zero risk anomalies identified.',
      };
    }

    // Sum up score contributions
    let totalScore = triggeredResults.reduce((sum, r) => sum + r.score, 0);

    // Normalize score to maximum 100
    const finalScore = Math.min(100, Math.max(0, totalScore));

    // Determine Risk Level according to project specifications
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (finalScore >= 80) {
      riskLevel = 'CRITICAL';
    } else if (finalScore >= 60) {
      riskLevel = 'HIGH';
    } else if (finalScore >= 30) {
      riskLevel = 'MEDIUM';
    } else {
      riskLevel = 'LOW';
    }

    const isSuspicious = finalScore >= 60;

    // Transform into TriggeredRuleDetail
    const triggeredRules: TriggeredRuleDetail[] = triggeredResults.map(r => ({
      rule_id: r.ruleCode.toLowerCase(),
      rule_code: r.ruleCode,
      rule_name: r.ruleName,
      score_contribution: r.score,
      description: r.description,
      metric_value: r.metricValue,
      threshold_value: r.thresholdValue,
    }));

    // Generate explainable narrative
    const ruleNamesJoined = triggeredResults.map(r => r.ruleName.toLowerCase()).join(' + ');
    const explanation = `${riskLevel} risk generated because of: ${ruleNamesJoined}. Total risk score: ${finalScore}/100.`;

    return {
      riskScore: finalScore,
      riskLevel,
      isSuspicious,
      triggeredRules,
      explanation,
    };
  }
}

export const riskScorer = new RiskScorer();
