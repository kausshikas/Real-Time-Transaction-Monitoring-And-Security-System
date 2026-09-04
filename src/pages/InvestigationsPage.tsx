import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Investigation, FraudAlert } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertDetailModal } from '../components/alerts/AlertDetailModal';
import { 
  SearchCode, Search, RefreshCw, FileText, ChevronLeft, 
  ChevronRight, ArrowUpRight, User, CheckCircle
} from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);

  const fetchInvestigations = async () => {
    setLoading(true);
    try {
      const res = await api.getInvestigations({ search, page, limit: 15 });
      setInvestigations(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestigations();
  }, [page]);

  const handleOpenCase = async (inv: Investigation) => {
    try {
      const alert = await api.getAlertById(inv.alert_id);
      setSelectedAlert(alert);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Case Management & Investigations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track forensic audit logs, investigator case notes, and regulatory escalation workflows
          </p>
        </div>

        <button
          onClick={fetchInvestigations}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Cases
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-mono">Case ID</th>
                <th className="px-4 py-3">Alert Ref</th>
                <th className="px-4 py-3">Customer Target</th>
                <th className="px-4 py-3">Lead Investigator</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3">Notes Logged</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading cases dossier...</td>
                </tr>
              ) : investigations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No active investigation cases.</td>
                </tr>
              ) : (
                investigations.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">{inv.alert_reference}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{inv.customer_name || 'Customer'}</td>
                    <td className="px-4 py-3 text-slate-700">{inv.investigator_name || 'Unassigned'}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">
                      {inv.notes?.length || 0} entries
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {inv.updated_at ? new Date(inv.updated_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenCase(inv)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded transition"
                      >
                        Inspect Case
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Alert / Investigation Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onAlertUpdated={updated => {
          setSelectedAlert(updated);
          fetchInvestigations();
        }}
      />
    </div>
  );
};
