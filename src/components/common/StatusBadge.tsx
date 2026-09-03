import React from 'react';
import { TransactionStatus, AlertStatus } from '../../types';

export const StatusBadge: React.FC<{ status: TransactionStatus | AlertStatus }> = ({ status }) => {
  const configs: Record<string, { bg: string; label: string }> = {
    COMPLETED: { bg: 'bg-[#DDE5B6] text-[#2C3327] border-[#8BA888]/40', label: 'Completed' },
    PENDING: { bg: 'bg-[#F4EBE1] text-[#8C5E32] border-[#CB997E]/40', label: 'Pending Review' },
    FAILED: { bg: 'bg-[#EBE7DF] text-[#6B705C] border-[#B7B7A4]/50', label: 'Failed' },
    BLOCKED: { bg: 'bg-[#F5DFDC] text-[#7A1E1E] border-[#9E2A2B]/40 font-bold', label: 'BLOCKED' },
    OPEN: { bg: 'bg-[#F7E7E0] text-[#B25032] border-[#CB997E]/50 font-semibold', label: 'Open Alert' },
    INVESTIGATING: { bg: 'bg-[#E9EDC9] text-[#2C3327] border-[#8BA888]/40 font-semibold', label: 'Investigating' },
    ESCALATED: { bg: 'bg-[#EEDFD5] text-[#783D2A] border-[#CB997E]/50 font-semibold', label: 'Escalated' },
    RESOLVED: { bg: 'bg-[#DDE5B6] text-[#2C3327] border-[#8BA888]/40 font-medium', label: 'Resolved' },
    FALSE_POSITIVE: { bg: 'bg-[#F3F1EB] text-[#6B705C] border-[#EBE7DF]', label: 'False Positive' },
  };

  const c = configs[status] || { bg: 'bg-[#F3F1EB] text-[#6B705C] border-[#EBE7DF]', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${c.bg}`}>
      {c.label}
    </span>
  );
};
