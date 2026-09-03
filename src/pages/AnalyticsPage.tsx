import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  BarChart3, RefreshCw, Globe, ShoppingBag, 
  Clock, ShieldCheck, Percent, Zap
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Fraud Analytics & Pattern Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Forensic risk metrics, geographic distributions, and merchant category attack vectors
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      {/* Top 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Detection Accuracy</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-slate-900">97.8%</div>
          <p className="text-[11px] text-slate-400 mt-1">Rule correlation validation benchmark</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">False Positive Rate</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-slate-900">2.1%</div>
          <p className="text-[11px] text-slate-400 mt-1">Lowest false-alarm ratio recorded</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Average Investigation Time</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-slate-900">14.2 min</div>
          <p className="text-[11px] text-slate-400 mt-1">From alert trigger to case disposition</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Protected Volume</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-mono font-black text-slate-900">₹4.82 Cr</div>
          <p className="text-[11px] text-slate-400 mt-1">Preempted fraud losses saved</p>
        </div>
      </div>

      {/* Row 1: Hourly Distribution of Fraud Incidents */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Hourly Distribution of Fraud Incidents</h3>
            <p className="text-xs text-slate-500">24-hour diurnality chart identifying nocturnal syndicate attack bursts</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded">
            Diurnal Profile
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics?.fraudByHour || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
              <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2.5} fillOpacity={1} fill="url(#hourGrad)" name="Alert Count" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Geographic & Merchant Category vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Country Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Geographic Attack Vectors</h3>
              <p className="text-xs text-slate-500">Total vs Fraudulent transactions by international origin</p>
            </div>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topCountries || []} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="country" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="total" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Total Transactions" />
                <Bar dataKey="fraudulent" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Fraud Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Merchant Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Vulnerable Merchant Categories</h3>
              <p className="text-xs text-slate-500">Merchant segments triggering highest frequency of rule violations</p>
            </div>
            <ShoppingBag className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.topCategories || []}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={100} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="alerts" fill="#6366f1" radius={[0, 4, 4, 0]} name="Triggered Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
