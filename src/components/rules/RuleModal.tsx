import React, { useState, useEffect } from 'react';
import { FraudRule, AlertSeverity } from '../../types';
import { X, Sliders } from 'lucide-react';

interface RuleModalProps {
  rule: FraudRule | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ruleData: any) => Promise<void>;
}

export const RuleModal: React.FC<RuleModalProps> = ({ rule, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [description, setDescription] = useState('');
  const [threshold, setThreshold] = useState<number>(100000);
  const [riskScore, setRiskScore] = useState<number>(25);
  const [severity, setSeverity] = useState<AlertSeverity>('HIGH');
  const [category, setCategory] = useState<any>('AMOUNT');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setName(rule.name);
      setRuleCode(rule.rule_code);
      setDescription(rule.description);
      setThreshold(rule.threshold);
      setRiskScore(rule.risk_score);
      setSeverity(rule.severity);
      setCategory(rule.category);
      setIsActive(rule.is_active);
    } else {
      setName('');
      setRuleCode(`RULE_${Math.floor(10 + Math.random() * 90)}`);
      setDescription('');
      setThreshold(100000);
      setRiskScore(20);
      setSeverity('HIGH');
      setCategory('AMOUNT');
      setIsActive(true);
    }
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        rule_code: ruleCode,
        name,
        description,
        threshold: Number(threshold),
        risk_score: Number(riskScore),
        severity,
        category,
        is_active: isActive,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm">
              {rule ? `Edit Surveillance Rule: ${rule.rule_code}` : 'Configure New Fraud Rule'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Rule Identifier Code</label>
            <input
              type="text"
              required
              disabled={!!rule}
              value={ruleCode}
              onChange={e => setRuleCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-slate-50 uppercase"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Rule Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Velocity Surge Surveillance"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description & AML Justification</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explain how this rule identifies risk behavior..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Threshold Parameter</label>
              <input
                type="number"
                step="any"
                required
                value={threshold}
                onChange={e => setThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Risk Score Weight (1-100)</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={riskScore}
                onChange={e => setRiskScore(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Severity Category</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as AlertSeverity)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rule Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="AMOUNT">AMOUNT</option>
                <option value="VELOCITY">VELOCITY</option>
                <option value="LOCATION">LOCATION</option>
                <option value="DEVICE">DEVICE</option>
                <option value="MERCHANT">MERCHANT</option>
                <option value="BEHAVIOR">BEHAVIOR</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeCheckbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="activeCheckbox" className="font-semibold text-slate-800">
              Active Rule (Evaluated on every incoming transaction)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              {loading ? 'Saving...' : 'Save Surveillance Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
