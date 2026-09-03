import React, { useState, useEffect } from 'react';
import { FraudAlert, Investigation } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  X, AlertTriangle, CheckCircle2, ShieldX, Clock, 
  Send, User, FileText, ArrowUpRight, Check, History
} from 'lucide-react';

interface AlertModalProps {
  alert: FraudAlert | null;
  onClose: () => void;
  onAlertUpdated: (updated: FraudAlert) => void;
}

export const AlertDetailModal: React.FC<AlertModalProps> = ({ alert, onClose, onAlertUpdated }) => {
  const { user } = useAuth();
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');
  const [actionType, setActionType] = useState<string>('Customer Contacted');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  useEffect(() => {
    if (alert) {
      setLoading(true);
      api.getInvestigationById(alert.id)
        .then(inv => setInvestigation(inv))
        .catch(() => setInvestigation(null))
        .finally(() => setLoading(false));
    }
  }, [alert]);

  if (!alert) return null;

  const handleStatusChange = async (newStatus: any) => {
    try {
      const updated = await api.updateAlertStatus(
        alert.id,
        newStatus,
        user?.id,
        user?.name,
        user?.name
      );
      onAlertUpdated(updated);

      if (investigation) {
        const updatedInv = await api.getInvestigationById(alert.id);
        setInvestigation(updatedInv);
      }
    } catch (err) {
      console.error('Status update failed', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !investigation) return;

    setIsSubmittingNote(true);
    try {
      const updatedInv = await api.addInvestigationNote(
        investigation.id,
        noteText.trim(),
        actionType,
        user?.id || 'usr-investigator-01',
        user?.name || 'Marcus Vance'
      );
      setInvestigation(updatedInv);
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono font-bold text-lg text-white">{alert.alert_reference}</h3>
                <StatusBadge status={alert.status} />
              </div>
              <p className="text-xs text-slate-400">
                Created: {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'} • Assigned: {alert.assigned_name || 'Unassigned'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Risk Scoring & Reason Header */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Target Customer & Transaction
                </span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
                {alert.customer_name} • ₹{(alert.transaction_amount != null ? alert.transaction_amount : 0).toLocaleString('en-IN')} {alert.currency || 'INR'}
              </h4>
              <p className="text-xs text-slate-600 font-mono mt-0.5">
                Txn ID: {alert.transaction_id}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500 font-bold block">FINAL RISK SCORE</span>
                <span className="font-mono font-black text-2xl text-rose-600">
                  {alert.risk_score} / 100
                </span>
              </div>
              <RiskBadge level={alert.severity} size="lg" />
            </div>
          </div>

          {/* Explainable Reasoning */}
          <div className="bg-rose-50/70 border border-rose-200 p-4 rounded-xl">
            <h5 className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-rose-600" />
              Explainable Rule Engine Reason
            </h5>
            <p className="text-xs text-rose-950 font-medium leading-relaxed">
              "{alert.reason}"
            </p>
          </div>

          {/* Triggered Rules Matrix */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Triggered Surveillance Rules
            </h5>
            <div className="space-y-2">
              {alert.triggered_rules && alert.triggered_rules.length > 0 ? (
                alert.triggered_rules.map((rule, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
                          {rule.rule_code}
                        </span>
                        <span className="font-bold text-slate-900">{rule.rule_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">{rule.description}</p>
                    </div>
                    <span className="font-mono font-extrabold text-sm text-rose-600 shrink-0 ml-4">
                      +{rule.score_contribution} pts
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded">
                  No individual rules attached.
                </div>
              )}
            </div>
          </div>

          {/* Workflow Action Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xl">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Investigation Workflow Actions
            </h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange('INVESTIGATING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  alert.status === 'INVESTIGATING'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Start / Assign Investigation
              </button>

              <button
                onClick={() => handleStatusChange('ESCALATED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  alert.status === 'ESCALATED'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" /> Escalate Alert
              </button>

              <button
                onClick={() => handleStatusChange('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  alert.status === 'RESOLVED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirm Fraud & Resolve
              </button>

              <button
                onClick={() => handleStatusChange('FALSE_POSITIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  alert.status === 'FALSE_POSITIVE'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <ShieldX className="w-3.5 h-3.5 text-slate-400" /> Mark False Positive
              </button>
            </div>
          </div>

          {/* Investigation Notes & Timeline */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-indigo-600" />
              Investigation Timeline & Case Notes
            </h5>

            {/* Note form */}
            <form onSubmit={handleAddNote} className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex gap-2 mb-2">
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700"
                >
                  <option value="Customer Contacted">Customer Contacted</option>
                  <option value="Card Frozen / Blocked">Card Frozen / Blocked</option>
                  <option value="Biometric Verification Requested">Biometric Verification</option>
                  <option value="Merchant Inquiry Sent">Merchant Inquiry Sent</option>
                  <option value="Supervisor Escalation">Supervisor Escalation</option>
                </select>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Record case findings, customer responses, or action notes..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNote || !noteText.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  Add Note
                </button>
              </div>
            </form>

            {/* Timeline Notes list */}
            <div className="space-y-3">
              {investigation && investigation.notes && investigation.notes.length > 0 ? (
                investigation.notes.map(note => (
                  <div key={note.id} className="p-3 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{note.author_name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {note.action_taken}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {note.created_at ? new Date(note.created_at).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed mt-1">{note.note}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-lg">
                  No case notes logged yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Close Investigation View
          </button>
        </div>

      </div>
    </div>
  );
};
