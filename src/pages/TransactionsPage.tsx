import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Transaction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Eye, 
  ShieldAlert, RefreshCw, ArrowUpDown, User
} from 'lucide-react';

export const TransactionsPage: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        search,
        risk_level: riskFilter,
        status: statusFilter,
        transaction_type: typeFilter,
        page,
        limit: 15,
      });
      setTransactions(res.data);
      setTotalPages(res.totalPages);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, riskFilter, statusFilter, typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE7DF] shadow-xs">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2C3327] tracking-tight">
            Transaction Surveillance Registry
          </h1>
          <p className="text-xs text-[#6B705C] mt-1">
            Browse, filter, and inspect audited digital financial transactions ({totalCount} records)
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="flex items-center gap-2 px-4 py-2 border border-[#EBE7DF] rounded-full text-xs font-semibold text-[#2C3327] bg-[#F3F1EB] hover:bg-[#EBE7DF] transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#B7B7A4] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Txn reference, customer name, merchant, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#EBE7DF] rounded-full text-xs bg-[#FAF9F6] text-[#2C3327] placeholder:text-[#B7B7A4] focus:ring-2 focus:ring-[#8BA888] focus:border-[#8BA888] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#3D4035] text-[#FAF9F6] font-bold text-xs rounded-full hover:bg-[#2C3327] transition shadow-xs"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-[#EBE7DF] text-xs">
          <div className="flex items-center gap-1.5 text-[#6B705C] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#8BA888]" /> Filters:
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#F3F1EB] font-medium text-[#2C3327] text-xs focus:outline-hidden"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="CRITICAL">Critical Risk</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#F3F1EB] font-medium text-[#2C3327] text-xs focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="BLOCKED">Blocked</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded-full border border-[#EBE7DF] bg-[#F3F1EB] font-medium text-[#2C3327] text-xs focus:outline-hidden"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="PURCHASE">Purchase</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ATM_WITHDRAWAL">ATM Withdrawal</option>
            <option value="ONLINE_PAYMENT">Online Payment</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#EBE7DF] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#3D4035]">
            <thead className="bg-[#F3F1EB] border-b border-[#EBE7DF] text-[11px] font-bold text-[#6B705C] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 font-mono">Reference</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Amount</th>
                <th className="px-4 py-3.5">Merchant / MCC</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Risk Assessment</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE7DF]">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#B7B7A4]">
                    Loading transactions registry...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#B7B7A4]">
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-[#FAF9F6] transition">
                    <td className="px-4 py-3 font-mono font-bold text-[#2C3327]">
                      {txn.transaction_reference}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2C3327]">
                      {txn.customer_name}
                    </td>
                    <td className="px-4 py-3 font-mono font-extrabold text-[#2C3327]">
                      ₹{(txn.amount != null ? txn.amount : 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#2C3327] truncate max-w-[150px]">{txn.merchant}</div>
                      <div className="text-[10px] text-[#B7B7A4] truncate max-w-[150px]">{txn.merchant_category}</div>
                    </td>
                    <td className="px-4 py-3 text-[#6B705C]">
                      {txn.city}, {txn.country}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#B7B7A4]">
                      {txn.timestamp ? new Date(txn.timestamp).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} showScore={true} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="px-3 py-1 rounded-full bg-[#F3F1EB] hover:bg-[#EBE7DF] text-[#2C3327] font-semibold text-[11px] transition"
                        title="View Details"
                      >
                        Inspect
                      </button>
                      {txn.risk_score >= 60 && (
                        <button
                          onClick={() => onNavigate('alerts')}
                          className="px-3 py-1 rounded-full bg-[#F5DFDC] hover:bg-[#F2CECA] text-[#9E2A2B] font-semibold text-[11px] transition border border-[#9E2A2B]/30"
                        >
                          Alert
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3.5 bg-[#F3F1EB] border-t border-[#EBE7DF] flex items-center justify-between text-xs text-[#6B705C]">
          <span>
            Showing Page <span className="font-bold text-[#2C3327]">{page}</span> of{' '}
            <span className="font-bold text-[#2C3327]">{totalPages}</span> ({totalCount} total transactions)
          </span>

          <div className="flex items-center gap-1.5">
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

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onInvestigate={() => {
          setSelectedTxn(null);
          onNavigate('alerts');
        }}
        onViewCustomer={cId => {
          setSelectedTxn(null);
          onNavigate('customers', { customerId: cId });
        }}
      />

    </div>
  );
};
