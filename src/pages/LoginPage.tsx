import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, Eye, EyeOff, CheckCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@fraudguard.demo');
  const [password, setPassword] = useState('DemoPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (role: UserRole) => {
    const creds: Record<UserRole, { email: string; pass: string }> = {
      ADMIN: { email: 'admin@fraudguard.demo', pass: 'DemoPass2026!' },
      ANALYST: { email: 'analyst@fraudguard.demo', pass: 'DemoPass2026!' },
      INVESTIGATOR: { email: 'investigator@fraudguard.demo', pass: 'DemoPass2026!' },
      VIEWER: { email: 'viewer@fraudguard.demo', pass: 'DemoPass2026!' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-center text-lg sm:text-2xl font-black tracking-tight text-white uppercase">
          Financial Transaction Monitoring and Fraud Detection System
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-mono uppercase tracking-wider">
          Enterprise Digital Transaction Surveillance & Fraud Prevention
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-800">
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Security Operator Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@fraudguard.demo"
                  className="block w-full pl-9 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Access Token / Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-700 rounded bg-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                  Remember session credentials
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {loading ? 'Authenticating Operator...' : 'Authenticate & Enter Surveillance Console'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Demonstration Accounts Quick-Selector for Project Viva */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Demonstration Role Accounts (Viva Quick Access)
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoSelect('ADMIN')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-xs text-indigo-400">ADMIN</div>
                <div className="text-[10px] text-slate-400 truncate">Full System Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('ANALYST')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-xs text-cyan-400">ANALYST</div>
                <div className="text-[10px] text-slate-400 truncate">Dashboard & Metrics</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('INVESTIGATOR')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-xs text-amber-400">INVESTIGATOR</div>
                <div className="text-[10px] text-slate-400 truncate">Alerts & Cases</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoSelect('VIEWER')}
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition"
              >
                <div className="font-bold text-xs text-slate-400">VIEWER</div>
                <div className="text-[10px] text-slate-400 truncate">Read-Only Telemetry</div>
              </button>
            </div>
          </div>

        </div>

        <div className="text-center mt-4 text-slate-500 text-[11px] font-mono">
          Final Year Engineering Project ID #41 • Real-Time Fraud Detection Platform
        </div>
      </div>
    </div>
  );
};
