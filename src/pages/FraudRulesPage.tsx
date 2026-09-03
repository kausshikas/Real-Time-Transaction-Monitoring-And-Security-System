import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FraudRule } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { RuleModal } from '../components/rules/RuleModal';
import { 
  Sliders, Plus, Edit2, Trash2, Power, RefreshCw, 
  CheckCircle, AlertCircle, ShieldAlert
} from 'lucide-react';

export const FraudRulesPage: React.FC = () => {
  const [rules, setRules] = useState<FraudRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<FraudRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const data = await api.getFraudRules();
      setRules(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleActive = async (rule: FraudRule) => {
    try {
      const updated = await api.updateFraudRule(rule.id, { is_active: !rule.is_active });
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm('Are you sure you want to retire this surveillance rule?')) return;
    try {
      await api.deleteFraudRule(id);
      setRules(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRule = async (formData: any) => {
    if (selectedRule) {
      const updated = await api.updateFraudRule(selectedRule.id, formData);
      setRules(prev => prev.map(r => r.id === selectedRule.id ? updated : r));
    } else {
      const created = await api.createFraudRule(formData);
      setRules(prev => [...prev, created]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Fraud Rule Engine Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic surveillance algorithms, score contribution thresholds, and velocity parameters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setSelectedRule(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Create Rule
          </button>

          <button
            onClick={fetchRules}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Rules"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-mono">Code</th>
                <th className="px-4 py-3">Rule Name</th>
                <th className="px-4 py-3">AML Rationale & Description</th>
                <th className="px-4 py-3">Threshold</th>
                <th className="px-4 py-3">Score Weight</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Engine Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading rule algorithms...</td>
                </tr>
              ) : rules.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No surveillance rules configured.</td>
                </tr>
              ) : (
                rules.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {rule.rule_code}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {rule.name}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-sm">
                      <p className="line-clamp-2">{rule.description}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800 font-semibold">
                      {rule.category === 'AMOUNT' && rule.threshold != null ? `₹${Number(rule.threshold).toLocaleString('en-IN')}` : (rule.threshold ?? 'N/A')}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-rose-600">
                      +{rule.risk_score} pts
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={rule.severity} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          rule.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        <Power className="w-3 h-3" />
                        {rule.is_active ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => { setSelectedRule(rule); setIsModalOpen(true); }}
                        className="p-1.5 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                        title="Edit Rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                        title="Retire Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Rule Modal */}
      <RuleModal
        rule={selectedRule}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedRule(null); }}
        onSave={handleSaveRule}
      />
    </div>
  );
};
