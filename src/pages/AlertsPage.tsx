import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FraudAlert } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertDetailModal } from '../components/alerts/AlertDetailModal';
import { 
  AlertTriangle, Filter, ChevronLeft, ChevronRight, 
  Search, RefreshCw, Eye, CheckCircle2, ShieldX
} from 'lucide-react';

export const AlertsPage: React.FC<{ onNavigate: (page: string, params?: any) => void }> = () => {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getAlerts({
        status: statusFilter,
        severity: severityFilter,
        search,
        page,
        limit: 15,
      });
      setAlerts(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [page, statusFilter, severityFilter]);

  const handleQuickStatus = async (alertId: string, status: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await api.updateAlertStatus(alertId, status);
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C3327] tracking-tight">
            Fraud Alerts Escalation Queue
          </h1>
          <p className="text-xs text-[#6B705C] mt-1">
            Investigate, escalate, and resolve suspicious activities flagged by surveillance rules
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-2 px-4 py-2 border border-[#EBE7DF] rounded-full text-xs font-semibold text-[#2C3327] bg-[#F3F1EB] hover:bg-[#EBE7DF] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Queue
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-3">
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchAlerts(); }} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#B7B7A4] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search alert by reference, customer name, or reason..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#EBE7DF] rounded-full text-xs bg-[#FAF9F6] text-[#2C3327] placeholder:text-[#B7B7A4] focus:ring-2 focus:ring-[#8BA888] focus:border-[#8BA888] focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#3D4035] text-[#FAF9F6] font-bold text-xs rounded-full hover:bg-[#2C3327] transition shadow-xs"
          >
            Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-[#EBE7DF] text-xs">
          <span className="font-semibold text-[#6B705C] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#8BA888]" /> Filters:
          </span>

          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#F3F1EB] font-medium text-[#2C3327] text-xs focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN (Unassigned)</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
          </select>

          <select
            value={severityFilter}
            onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#F3F1EB] font-medium text-[#2C3327] text-xs focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-white rounded-2xl border border-[#EBE7DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D4035]">
            <thead className="bg-[#F3F1EB] border-b border-[#EBE7DF] text-[11px] font-bold text-[#6B705C] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 font-mono">Alert Ref</th>
                <th className="px-4 py-3.5">Customer & Amount</th>
                <th className="px-4 py-3.5">Surveillance Reason</th>
                <th className="px-4 py-3.5">Risk Assessment</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Investigator</th>
                <th className="px-4 py-3.5">Logged</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DF]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#B7B7A4]">Loading alerts queue...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#B7B7A4]">No fraud alerts in this filter view.</td>
                </tr>
              ) : (
                alerts.map(alert => (
                  <tr
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="hover:bg-[#FAF9F6] transition cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-[#2C3327]">
                      {alert.alert_reference}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#2C3327]">{alert.customer_name}</div>
                      <div className="font-mono text-[#6B705C] text-[11px]">
                        ₹{(alert.transaction_amount != null ? alert.transaction_amount : 0).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <p className="line-clamp-2 text-[#3D4035] font-medium">{alert.reason}</p>
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={alert.severity} score={alert.risk_score} showScore={true} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={alert.status} />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2C3327]">
                      {alert.assigned_name || (
                        <span className="text-[#B7B7A4] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#B7B7A4]">
                      {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedAlert(alert);
                        }}
                        className="px-3.5 py-1 rounded-full bg-[#8BA888]/20 hover:bg-[#8BA888]/30 text-[#2C3327] font-bold text-[11px] transition border border-[#8BA888]/40"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3.5 bg-[#F3F1EB] border-t border-[#EBE7DF] flex items-center justify-between text-xs text-[#6B705C]">
          <span>Page <span className="font-bold text-[#2C3327]">{page}</span> of <span className="font-bold text-[#2C3327]">{totalPages}</span></span>
          <div className="flex gap-1.5">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-full border border-[#EBE7DF] bg-white disabled:opacity-40 hover:bg-[#FAF9F6] text-[#2C3327] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-full border border-[#EBE7DF] bg-white disabled:opacity-40 hover:bg-[#FAF9F6] text-[#2C3327] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAlertUpdated={updated => {
          setSelectedAlert(updated);
          setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
        }}
      />
    </div>
  );
};
