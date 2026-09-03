import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Customer, Transaction } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { 
  Users, Search, ChevronLeft, ChevronRight, UserCheck, 
  MapPin, Phone, Mail, Calendar, ShieldAlert, CreditCard, 
  Smartphone, ArrowLeft, RefreshCw
} from 'lucide-react';

interface CustomersProps {
  initialCustomerId?: string | null;
  onNavigate: (page: string, params?: any) => void;
}

export const CustomersPage: React.FC<CustomersProps> = ({ initialCustomerId, onNavigate }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers({ search, page, limit: 12 });
      setCustomers(res.data);
      setTotalPages(res.totalPages);

      if (initialCustomerId) {
        const found = res.data.find(c => c.id === initialCustomerId);
        if (found) {
          handleSelectCustomer(found);
        } else {
          api.getCustomerById(initialCustomerId).then(handleSelectCustomer).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    try {
      const txns = await api.getCustomerTransactions(cust.id);
      setCustomerTransactions(txns);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  // If a single customer is selected, render the detailed Customer Profile page
  if (selectedCustomer) {
    return (
      <div className="space-y-6 pb-12">
        {/* Back navigation */}
        <button
          onClick={() => setSelectedCustomer(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </button>

        {/* Customer Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-600/20">
              {selectedCustomer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{selectedCustomer.name}</h1>
                <RiskBadge level={selectedCustomer.risk_level} size="md" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="font-mono text-slate-700 font-medium">ID: {selectedCustomer.id}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedCustomer.country}</span>
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">RISK SCORE</span>
              <span className={`text-2xl font-mono font-black ${
                selectedCustomer.risk_score >= 70 ? 'text-rose-600' :
                selectedCustomer.risk_score >= 40 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {selectedCustomer.risk_score} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Analytics 4-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Transactions</span>
            <div className="text-2xl font-mono font-black text-slate-900 mt-1">
              {selectedCustomer.total_transactions}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Lifetime surveillance history</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Spent</span>
            <div className="text-2xl font-mono font-black text-slate-900 mt-1">
              ₹{(selectedCustomer.total_spent != null ? selectedCustomer.total_spent : 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Aggregated purchase volume</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase">Avg Transaction Size</span>
            <div className="text-2xl font-mono font-black text-slate-900 mt-1">
              ₹{(selectedCustomer.avg_transaction_amount != null ? selectedCustomer.avg_transaction_amount : 0).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Customer behavioral baseline</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-400 uppercase">Fraud Alerts Flagged</span>
            <div className={`text-2xl font-mono font-black mt-1 ${
              selectedCustomer.fraud_alerts_count > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {selectedCustomer.fraud_alerts_count}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Active AML/Risk alerts</p>
          </div>
        </div>

        {/* Behavioral Baseline & Device Footprint */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-600" />
              Behavioral & Velocity Baseline
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Typical Active Hours:</span>
                <span className="font-semibold text-slate-800">09:00 - 22:00 IST</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Max Historical Single Txn:</span>
                <span className="font-mono font-bold text-slate-800">₹{((selectedCustomer.avg_transaction_amount != null ? selectedCustomer.avg_transaction_amount : 0) * 3.5).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Frequent Merchant Categories:</span>
                <span className="font-semibold text-slate-800">Electronics, Airlines, Dining</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Primary Account Origin:</span>
                <span className="font-semibold text-slate-800">{selectedCustomer.country} (Domestic)</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Authorized Device Footprint
            </h4>
            <div className="text-xs space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Primary Mobile Device</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">TRUSTED</span>
                </div>
                <p className="font-mono text-[11px] text-slate-500">Apple iPhone 15 Pro • iOS 18 • Chrome Mobile</p>
                <p className="text-[10px] text-slate-400 font-mono">Last IP: 103.21.144.92 (Mumbai, IN)</p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>Desktop Workstation</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 rounded">TRUSTED</span>
                </div>
                <p className="font-mono text-[11px] text-slate-500">MacBook Pro • macOS 15 • Safari</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Transaction History */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-800">
              Customer Transaction Ledger ({customerTransactions.length} items)
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 font-mono">Reference</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Merchant</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerTransactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800">{txn.transaction_reference}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">₹{(txn.amount != null ? txn.amount : 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{txn.merchant}</td>
                    <td className="px-4 py-2.5 text-slate-600">{txn.city}, {txn.country}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-400">
                      {txn.timestamp ? new Date(txn.timestamp).toLocaleString() : 'N/A'}
                    </td>
                    <td className="px-4 py-2.5"><StatusBadge status={txn.status} /></td>
                    <td className="px-4 py-2.5">
                      <RiskBadge level={txn.risk_level} score={txn.risk_score} showScore={true} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // Otherwise render full Customer Directory Table
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Customer Risk Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accounts under active surveillance and behavioral baseline monitoring
          </p>
        </div>

        <button
          onClick={fetchCustomers}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search customer by name, email, or country..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-mono">Account ID</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Risk Assessment</th>
                <th className="px-4 py-3">Txn Count</th>
                <th className="px-4 py-3">Total Spend</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">Loading customer profiles...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">No customers found.</td>
                </tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-600">{c.email}</td>
                    <td className="px-4 py-3 text-slate-700">{c.country}</td>
                    <td className="px-4 py-3">
                      <RiskBadge level={c.risk_level} score={c.risk_score} showScore={true} size="sm" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{c.total_transactions}</td>
                    <td className="px-4 py-3 font-mono font-extrabold text-slate-900">
                      ₹{(c.total_spent != null ? c.total_spent : 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSelectCustomer(c)}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-bold text-[11px] transition"
                      >
                        View Profile
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

    </div>
  );
};
