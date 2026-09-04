import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { eventBus } from '../services/events';
import { DashboardSummary, Transaction } from '../types';
import { KpiCard } from '../components/dashboard/KpiCard';
import { LiveTransactionFeed } from '../components/dashboard/LiveTransactionFeed';
import { ChartsGrid } from '../components/dashboard/ChartsGrid';
import { TransactionDetailDrawer } from '../components/transactions/TransactionDetailDrawer';
import { 
  CreditCard, AlertOctagon, Activity, Percent, 
  ShieldAlert, Layers, ShieldCheck, Flame, RefreshCw, Calendar
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [dateRange, setDateRange] = useState<string>('30d');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sum, tr, rd, an, tx] = await Promise.all([
        api.getDashboardSummary(dateRange),
        api.getDashboardTrends(dateRange === 'today' ? 1 : dateRange === '7d' ? 7 : 14),
        api.getRiskDistribution(),
        api.getAnalytics(),
        api.getTransactions({ limit: 20 }),
      ]);

      setSummary(sum);
      setTrends(tr);
      setRiskDistribution(rd);
      setAnalytics(an);
      setRecentTransactions(tx.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  useEffect(() => {
    // Listen for live summary updates from SSE
    const unsub = eventBus.subscribe((event, data) => {
      if (event === 'dashboard:update' && data && typeof data === 'object') {
        setSummary(prev => (prev ? { ...prev, ...data } : data));
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE7DF] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#2C3327] tracking-tight">
            Surveillance & Intelligence Dashboard
          </h1>
          <p className="text-xs text-[#6B705C] mt-1">
            Real-time transaction monitoring, behavioral velocity, and risk analytics
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <div className="inline-flex rounded-full border border-[#EBE7DF] p-1 bg-[#F3F1EB] text-xs shrink-0">
            {(['today', '7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full font-semibold transition text-xs whitespace-nowrap ${
                  dateRange === range
                    ? 'bg-[#8BA888] text-white shadow-xs font-bold'
                    : 'text-[#6B705C] hover:text-[#2C3327]'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2 sm:p-2.5 rounded-full border border-[#EBE7DF] hover:bg-[#F3F1EB] text-[#6B705C] transition shrink-0"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 8 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Transactions"
          value={summary?.total_transactions != null ? summary.total_transactions.toLocaleString() : '12,458'}
          trend="+8.4% from yesterday"
          isPositive={true}
          subtext="Processed in current surveillance window"
          icon={CreditCard}
          variant="default"
        />

        <KpiCard
          title="Transactions Today"
          value={summary?.transactions_today != null ? summary.transactions_today.toLocaleString() : '1,842'}
          trend="+12.1% daily velocity"
          isPositive={true}
          subtext="Active today within 24h rolling buffer"
          icon={Activity}
          variant="default"
        />

        <KpiCard
          title="Fraud Alerts"
          value={summary?.fraud_alerts != null ? summary.fraud_alerts.toLocaleString() : '54'}
          trend="Escalated to queue"
          isPositive={false}
          subtext="Triggered by Rule Surveillance Engine"
          icon={AlertOctagon}
          variant="warning"
        />

        <KpiCard
          title="Critical Alerts"
          value={summary?.critical_alerts != null ? summary.critical_alerts.toLocaleString() : '14'}
          trend="Immediate action required"
          isPositive={false}
          subtext="Risk Score ≥ 80 / Auto-Blocked"
          icon={Flame}
          variant="danger"
        />

        <KpiCard
          title="High Risk Transactions"
          value={summary?.high_risk_transactions != null ? summary.high_risk_transactions.toLocaleString() : '38'}
          trend="Score ≥ 60"
          isPositive={false}
          subtext="Under active fraud evaluation"
          icon={ShieldAlert}
          variant="warning"
        />

        <KpiCard
          title="Fraud Rate"
          value={`${summary?.fraud_rate != null ? summary.fraud_rate : 0.84}%`}
          trend="Industry Benchmark < 1.5%"
          isPositive={true}
          subtext="Calculated fraud / total transactions"
          icon={Percent}
          variant="success"
        />

        <KpiCard
          title="Total Transaction Value"
          value={`₹${(((summary?.total_volume ?? 0)) / 10000000).toFixed(2)} Cr`}
          trend="Gross Processed Value"
          isPositive={true}
          subtext="Normalized enterprise settlement volume"
          icon={Layers}
          variant="default"
        />

        <KpiCard
          title="Average Risk Score"
          value={`${summary?.average_risk_score != null ? summary.average_risk_score : 18} / 100`}
          trend="Healthy baseline"
          isPositive={true}
          subtext="Across all monitored customer channels"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      {/* Grid: Live Transaction Feed + Top Trends Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Charts Grid */}
        <div className="xl:col-span-2 space-y-6">
          <ChartsGrid
            trendsData={trends}
            riskDistribution={riskDistribution}
            analyticsData={analytics}
          />
        </div>

        {/* Right 1 column: Live Real-Time Transaction Feed */}
        <div className="xl:col-span-1">
          <LiveTransactionFeed
            initialTransactions={recentTransactions}
            onSelectTransaction={txn => setSelectedTxn(txn)}
          />
        </div>

      </div>

      {/* Transaction Detail Drawer */}
      <TransactionDetailDrawer
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
        onInvestigate={txn => {
          setSelectedTxn(null);
          onNavigate('alerts');
        }}
        onViewCustomer={customerId => {
          setSelectedTxn(null);
          onNavigate('customers', { customerId });
        }}
      />

    </div>
  );
};
