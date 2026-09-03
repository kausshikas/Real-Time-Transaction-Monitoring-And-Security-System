import React from 'react';
import { Transaction } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { 
  X, AlertTriangle, ShieldCheck, User, Smartphone, 
  MapPin, Clock, CreditCard, ChevronRight, Hash, Terminal
} from 'lucide-react';

interface DrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onInvestigate?: (txn: Transaction) => void;
  onViewCustomer?: (customerId: string) => void;
}

export const TransactionDetailDrawer: React.FC<DrawerProps> = ({
  transaction,
  onClose,
  onInvestigate,
  onViewCustomer,
}) => {
  if (!transaction) return null;

  const isSuspicious = transaction.is_suspicious || transaction.risk_score >= 60;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#2C3327]/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-[#FAF9F6] h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#2C3327] text-[#FAF9F6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              transaction.risk_level === 'CRITICAL' ? 'bg-[#9E2A2B]/30 text-[#FAF9F6]' : 'bg-[#8BA888]/30 text-[#FAF9F6]'
            }`}>
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-[#FAF9F6]">{transaction.transaction_reference}</span>
                <StatusBadge status={transaction.status} />
              </div>
              <p className="text-xs text-[#B7B7A4] font-mono">
                Logged: {transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#B7B7A4] hover:text-[#FAF9F6] rounded-full hover:bg-[#3D4035] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Section 1: Fraud Engine Risk Assessment */}
          <div className={`p-5 rounded-2xl border ${
            transaction.risk_level === 'CRITICAL'
              ? 'bg-[#F5DFDC] border-[#9E2A2B]/40 text-[#7A1E1E]'
              : transaction.risk_level === 'HIGH'
              ? 'bg-[#F7E7E0] border-[#CB997E] text-[#783D2A]'
              : 'bg-white border-[#EBE7DF] text-[#3D4035]'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${
                  transaction.risk_level === 'CRITICAL' ? 'text-[#9E2A2B]' : 'text-[#CB997E]'
                }`} />
                <h4 className="font-serif font-bold text-sm uppercase tracking-wide">
                  Surveillance Engine Assessment
                </h4>
              </div>
              <RiskBadge level={transaction.risk_level} score={transaction.risk_score} showScore={true} size="lg" />
            </div>

            {/* Score Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs font-mono font-bold mb-1.5">
                <span className="text-[#6B705C]">Calculated Risk Score</span>
                <span className="text-[#2C3327]">{transaction.risk_score} / 100</span>
              </div>
              <div className="w-full bg-[#E5E1D8] rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    transaction.risk_score >= 80 ? 'bg-[#9E2A2B]' :
                    transaction.risk_score >= 60 ? 'bg-[#CB997E]' :
                    transaction.risk_score >= 30 ? 'bg-[#A68A64]' : 'bg-[#8BA888]'
                  }`}
                  style={{ width: `${transaction.risk_score}%` }}
                />
              </div>
            </div>

            {transaction.fraud_reason && (
              <p className="text-xs leading-relaxed font-medium mt-2 bg-white/80 p-3 rounded-xl border border-[#EBE7DF]">
                {transaction.fraud_reason}
              </p>
            )}

            {/* Triggered Rules Breakdown */}
            {transaction.triggered_rules && transaction.triggered_rules.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#EBE7DF] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B705C]">
                  Triggered Fraud Surveillance Rules:
                </span>
                {transaction.triggered_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-white p-2.5 rounded-xl border border-[#EBE7DF] text-xs">
                    <div>
                      <span className="font-bold text-[#2C3327]">{rule.rule_code}: {rule.rule_name}</span>
                      <p className="text-[11px] text-[#6B705C] mt-0.5">{rule.description}</p>
                    </div>
                    <span className="font-mono font-bold text-[#9E2A2B] shrink-0 ml-2">
                      +{rule.score_contribution} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Transaction Overview */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF]">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#6B705C] mb-3 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#8BA888]" />
              Transaction Overview
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Amount & Currency</span>
                <span className="font-mono font-bold text-base text-[#2C3327]">
                  ₹{(transaction.amount != null ? transaction.amount : 0).toLocaleString('en-IN')} {transaction.currency || 'INR'}
                </span>
              </div>

              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Payment Type</span>
                <span className="font-semibold text-[#2C3327]">{transaction.transaction_type}</span>
              </div>

              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Merchant Name</span>
                <span className="font-semibold text-[#2C3327]">{transaction.merchant}</span>
              </div>

              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Merchant Category</span>
                <span className="font-semibold text-[#2C3327]">{transaction.merchant_category}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Customer Information */}
          <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#6B705C] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#8BA888]" />
                Customer Profile
              </h4>

              {onViewCustomer && (
                <button
                  onClick={() => onViewCustomer(transaction.customer_id)}
                  className="text-xs font-semibold text-[#8BA888] hover:text-[#2C3327] flex items-center gap-1"
                >
                  View Full Profile <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Customer Name</span>
                <span className="font-bold text-[#2C3327]">{transaction.customer_name}</span>
              </div>

              <div>
                <span className="text-[#B7B7A4] block mb-0.5">Account / Customer ID</span>
                <span className="font-mono text-[#6B705C]">{transaction.customer_id}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Device & Origin Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Device Info */}
            <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] text-xs">
              <h4 className="font-serif font-bold uppercase tracking-wider text-[#6B705C] mb-2.5 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#8BA888]" />
                Device Telemetry
              </h4>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[#B7B7A4] block">Device Identifier:</span>
                  <span className="font-mono text-[11px] text-[#2C3327] break-all">{transaction.device_id}</span>
                </div>
                <div>
                  <span className="text-[#B7B7A4] block">Client Environment:</span>
                  <span className="text-[#3D4035]">{transaction.device_browser} • {transaction.device_os}</span>
                </div>
                <div>
                  <span className="text-[#B7B7A4] block">IP Address:</span>
                  <span className="font-mono text-[#2C3327]">{transaction.ip_address}</span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-white p-5 rounded-2xl border border-[#EBE7DF] text-xs">
              <h4 className="font-serif font-bold uppercase tracking-wider text-[#6B705C] mb-2.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8BA888]" />
                Origin Geolocation
              </h4>
              <div className="space-y-1.5">
                <div>
                  <span className="text-[#B7B7A4] block">Country:</span>
                  <span className="font-bold text-[#2C3327]">{transaction.country}</span>
                </div>
                <div>
                  <span className="text-[#B7B7A4] block">City:</span>
                  <span className="font-semibold text-[#2C3327]">{transaction.city}</span>
                </div>
                <div>
                  <span className="text-[#B7B7A4] block">Timestamp:</span>
                  <span className="font-mono text-[#6B705C]">{transaction.timestamp}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F3F1EB] border-t border-[#EBE7DF] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-[#EBE7DF] text-[#3D4035] font-bold text-xs bg-white hover:bg-[#FAF9F6] transition"
          >
            Close
          </button>

          {onInvestigate && isSuspicious && (
            <button
              onClick={() => onInvestigate(transaction)}
              className="px-6 py-2.5 rounded-full bg-[#9E2A2B] text-[#FAF9F6] font-bold text-xs hover:bg-[#852221] transition shadow-md shadow-[#9E2A2B]/20 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              Open Fraud Investigation
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
