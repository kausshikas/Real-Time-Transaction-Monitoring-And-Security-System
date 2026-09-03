import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { eventBus } from '../../services/events';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { Radio, AlertOctagon, ArrowUpRight, ShieldCheck, MapPin, Smartphone } from 'lucide-react';

interface LiveFeedProps {
  initialTransactions: Transaction[];
  onSelectTransaction: (txn: Transaction) => void;
}

export const LiveTransactionFeed: React.FC<LiveFeedProps> = ({ initialTransactions, onSelectTransaction }) => {
  const [feed, setFeed] = useState<Transaction[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    setFeed(initialTransactions.slice(0, 15));
  }, [initialTransactions]);

  useEffect(() => {
    const unsub = eventBus.subscribe((event, data) => {
      if (event === 'transaction:new') {
        const txn = data as Transaction;
        setFeed(prev => [txn, ...prev.slice(0, 19)]);
        setHighlightId(txn.id);

        // Clear highlight pulse after 3 seconds
        setTimeout(() => {
          setHighlightId(curr => curr === txn.id ? null : curr);
        }, 3000);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#EBE7DF] shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-[#F3F1EB] border-b border-[#EBE7DF] text-[#2C3327] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BA888] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#8BA888]" />
          </span>
          <h3 className="font-serif font-bold text-sm text-[#2C3327] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#8BA888]" />
            Live Surveillance Feed
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B705C] bg-[#FAF9F6] px-2.5 py-0.5 rounded-full border border-[#EBE7DF]">
          Real-time Stream
        </span>
      </div>

      {/* Feed List */}
      <div className="divide-y divide-[#EBE7DF] max-h-[460px] overflow-y-auto">
        {feed.length === 0 ? (
          <div className="p-8 text-center text-[#B7B7A4] text-xs">
            Waiting for live transactions stream...
          </div>
        ) : (
          feed.map(txn => {
            const isNew = highlightId === txn.id;
            const isCritical = txn.risk_level === 'CRITICAL';
            const isSuspicious = txn.is_suspicious || txn.risk_level === 'HIGH';

            return (
              <div
                key={txn.id}
                onClick={() => onSelectTransaction(txn)}
                className={`p-3.5 transition cursor-pointer flex items-center justify-between hover:bg-[#FAF9F6] ${
                  isNew
                    ? isCritical
                      ? 'bg-[#F5DFDC] border-l-4 border-[#9E2A2B] animate-pulse'
                      : isSuspicious
                      ? 'bg-[#F7E7E0] border-l-4 border-[#CB997E]'
                      : 'bg-[#DDE5B6]/50 border-l-4 border-[#8BA888]'
                    : isCritical
                    ? 'bg-[#F5DFDC]/40 border-l-3 border-[#9E2A2B]'
                    : ''
                }`}
              >
                {/* Left info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-full mt-0.5 shrink-0 ${
                    isCritical
                      ? 'bg-[#F5DFDC] text-[#9E2A2B]'
                      : isSuspicious
                      ? 'bg-[#F7E7E0] text-[#B25032]'
                      : 'bg-[#F3F1EB] text-[#6B705C]'
                  }`}>
                    {isCritical ? (
                      <AlertOctagon className="w-4 h-4 text-[#9E2A2B]" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 text-[#8BA888]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#2C3327]">
                        {txn.transaction_reference}
                      </span>
                      <span className="text-[11px] text-[#6B705C] font-medium truncate">
                        {txn.customer_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B705C]">
                      <span className="font-semibold text-[#3D4035]">{txn.merchant}</span>
                      <span className="text-[#B7B7A4]">•</span>
                      <span className="flex items-center gap-0.5 text-[#6B705C]">
                        <MapPin className="w-3 h-3 text-[#B7B7A4]" />
                        {txn.city}, {txn.country}
                      </span>
                    </div>

                    {txn.fraud_reason && isSuspicious && (
                      <p className="mt-1 text-[10px] text-[#9E2A2B] font-medium line-clamp-1">
                        ⚠️ {txn.fraud_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right metrics */}
                <div className="text-right shrink-0 ml-3 flex flex-col items-end">
                  <div className="font-mono font-bold text-sm text-[#2C3327]">
                    ₹{(txn.amount != null ? txn.amount : 0).toLocaleString('en-IN')}
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1">
                    <RiskBadge level={txn.risk_level} score={txn.risk_score} showScore={true} size="sm" />
                    <StatusBadge status={txn.status} />
                  </div>

                  <span className="text-[10px] text-[#B7B7A4] font-mono mt-1">
                    {txn.timestamp ? new Date(txn.timestamp).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
