import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemSettings } from '../types';
import { 
  Settings as SettingsIcon, Save, RefreshCw, ShieldAlert, 
  Cpu, Sliders, CheckCircle, Flame
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setLoading(true);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Loading system parameters...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Surveillance Engine Configuration & Thresholds
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global risk score brackets, velocity sliding-window parameters, and automated block policies
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Parameters Synchronized with Engine
          </div>
        )}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core Detection Parameters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Velocity & Amount Surveillance Thresholds
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Large Transaction Cutoff (₹)
              </label>
              <input
                type="number"
                value={settings.large_transaction_threshold}
                onChange={e => setSettings({ ...settings, large_transaction_threshold: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Single payments above this amount trigger Rule 01
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Velocity Sliding Window (Seconds)
              </label>
              <input
                type="number"
                value={settings.velocity_window_seconds}
                onChange={e => setSettings({ ...settings, velocity_window_seconds: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Rolling temporal window stored in Redis cache
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Max Transactions per Rolling Window
              </label>
              <input
                type="number"
                value={settings.max_transactions_per_minute}
                onChange={e => setSettings({ ...settings, max_transactions_per_minute: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Surpassing this frequency triggers Rule 02
              </span>
            </div>
          </div>
        </div>

        {/* Risk Score Brackets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            Risk Classification Score Brackets (0 - 100 Scale)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
              <span className="font-bold text-emerald-800 block mb-1">LOW RISK (Normal)</span>
              <span className="font-mono text-xs text-emerald-900 font-semibold">
                0 to {settings.low_risk_max} points
              </span>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-800 block mb-1">MEDIUM RISK</span>
              <span className="font-mono text-xs text-amber-900 font-semibold">
                {settings.low_risk_max + 1} to {settings.medium_risk_max} points
              </span>
            </div>

            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200">
              <span className="font-bold text-orange-800 block mb-1">HIGH RISK (Alert)</span>
              <span className="font-mono text-xs text-orange-900 font-semibold">
                {settings.medium_risk_max + 1} to {settings.high_risk_max} points
              </span>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200">
              <span className="font-bold text-rose-800 block mb-1">CRITICAL RISK</span>
              <span className="font-mono text-xs text-rose-900 font-semibold">
                {settings.critical_risk_min} to 100 points
              </span>
            </div>
          </div>
        </div>

        {/* Automated Interventions & Simulator Default */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            Automated Enforcement Policies
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  Automated Block of Critical Transactions
                </span>
                <span className="text-[11px] text-slate-500">
                  When risk score reaches {settings.critical_risk_min}+, automatically set transaction status to BLOCKED.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.auto_block_critical}
                onChange={e => setSettings({ ...settings, auto_block_critical: e.target.checked })}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">
                  Automated Case Creation for High & Critical Alerts
                </span>
                <span className="text-[11px] text-slate-500">
                  Instantly initialize an investigator forensic case dossier when an alert is flagged.
                </span>
              </div>
              <input
                type="checkbox"
                checked={true}
                readOnly
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Committing Changes...' : 'Save & Deploy Parameters'}
          </button>
        </div>

      </form>
    </div>
  );
};
