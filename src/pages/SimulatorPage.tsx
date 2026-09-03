import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { eventBus } from '../services/events';
import { Transaction, FraudAlert } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { 
  Cpu, Play, Square, Zap, ShieldAlert, ShieldCheck, 
  Clock, RefreshCw, Terminal, CheckCircle2, AlertTriangle, Flame
} from 'lucide-react';

interface SimulatedLogItem {
  id: string;
  timestamp: string;
  reference: string;
  customerName: string;
  amount: number;
  merchant: string;
  riskScore: number;
  riskLevel: any;
  status: string;
  triggeredAlert?: boolean;
  reason?: string;
}

export const SimulatorPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [logs, setLogs] = useState<SimulatedLogItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch initial status
    api.getSimulatorStatus().then(status => {
      setIsRunning(status.isRunning);
      setIntervalMs(status.intervalMs);
      setGeneratedCount(status.generatedCount);
    }).catch(() => {});

    // Listen to live events
    const unsub = eventBus.subscribe((event, data) => {
      if (event === 'simulator:status') {
        setIsRunning(data.isRunning);
        setIntervalMs(data.intervalMs);
        setGeneratedCount(data.generatedCount);
      } else if (event === 'transaction:new') {
        const txn = data as Transaction;
        const logItem: SimulatedLogItem = {
          id: txn.id,
          timestamp: new Date().toLocaleTimeString(),
          reference: txn.transaction_reference,
          customerName: txn.customer_name,
          amount: txn.amount,
          merchant: txn.merchant,
          riskScore: txn.risk_score,
          riskLevel: txn.risk_level,
          status: txn.status,
          triggeredAlert: txn.risk_score >= 60,
          reason: txn.fraud_reason,
        };
        setLogs(prev => [logItem, ...prev.slice(0, 39)]);
      }
    });

    return () => unsub();
  }, []);

  const handleToggle = async () => {
    try {
      if (isRunning) {
        await api.stopSimulator();
      } else {
        await api.startSimulator(intervalMs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleIntervalChange = async (ms: number) => {
    setIntervalMs(ms);
    try {
      await api.setSimulatorInterval(ms);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateScenario = async (scenario: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL') => {
    setIsGenerating(true);
    try {
      await api.generateScenario(scenario);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Synthetic Transaction Simulator
            </h1>
            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              VIVA TEST BENCH
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate realistic customer payment traffic, velocity surges, cross-border anomalies, and critical fraud vectors
          </p>
        </div>

        {/* Start / Stop Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition ${
              isRunning
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 fill-current animate-pulse" />
                <span>Stop Live Stream</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Stream Generation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Console */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stream Velocity Settings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Automated Stream Cadence
            </h3>
            <span className="text-xs font-mono font-bold text-indigo-600">
              {intervalMs / 1000}s per transaction
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1000, 2000, 3000, 5000].map(ms => (
              <button
                key={ms}
                onClick={() => handleIntervalChange(ms)}
                className={`py-2 px-3 rounded-lg text-xs font-bold font-mono transition border ${
                  intervalMs === ms
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {ms / 1000} Sec
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Total Generated Transactions:</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {generatedCount}
            </span>
          </div>
        </div>

        {/* Manual One-Click Scenario Triggers (For Viva Demonstrations) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Direct Test Scenario Triggers
          </h3>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleGenerateScenario('NORMAL')}
              disabled={isGenerating}
              className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition flex flex-col justify-between"
            >
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
              <div>
                <div className="font-bold text-xs text-emerald-900">Normal</div>
                <div className="text-[10px] text-emerald-700">Low Risk (Score &lt; 30)</div>
              </div>
            </button>

            <button
              onClick={() => handleGenerateScenario('SUSPICIOUS')}
              disabled={isGenerating}
              className="p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition flex flex-col justify-between"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <div>
                <div className="font-bold text-xs text-amber-900">Suspicious</div>
                <div className="text-[10px] text-amber-700">Medium/High (Score 60-79)</div>
              </div>
            </button>

            <button
              onClick={() => handleGenerateScenario('CRITICAL')}
              disabled={isGenerating}
              className="p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-left transition flex flex-col justify-between"
            >
              <Flame className="w-5 h-5 text-rose-600 mb-2" />
              <div>
                <div className="font-bold text-xs text-rose-900">Critical</div>
                <div className="text-[10px] text-rose-700">Auto-Blocked (Score 80+)</div>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Live Terminal / Telemetry Console */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono">
        {/* Terminal Header */}
        <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <span className="ml-2 font-bold text-slate-300">
              SIMULATOR_TELEMETRY_LOG.STREAM
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Auto-scrolling stream buffer
          </span>
        </div>

        {/* Console Log Rows */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2 text-xs divide-y divide-slate-900">
          {logs.length === 0 ? (
            <div className="text-slate-600 py-8 text-center">
              Simulator output idle. Click "Start Stream Generation" or trigger a scenario above.
            </div>
          ) : (
            logs.map((item, idx) => (
              <div key={item.id || idx} className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">{item.timestamp}</span>
                  <span className="text-cyan-400 font-bold">{item.reference}</span>
                  <span className="text-slate-300">{item.customerName}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-300">{item.merchant}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white font-bold">₹{(item.amount != null ? item.amount : 0).toLocaleString('en-IN')}</span>
                  <RiskBadge level={item.riskLevel} score={item.riskScore} showScore={true} size="sm" />
                  {item.triggeredAlert ? (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/30">
                      ALERT TRIGGERED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                      PASSED
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
