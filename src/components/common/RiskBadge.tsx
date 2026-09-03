import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, showScore = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] font-bold rounded-full',
    md: 'px-3 py-0.5 text-xs font-bold rounded-full',
    lg: 'px-3.5 py-1 text-xs font-extrabold rounded-full',
  }[size];

  const config = {
    LOW: {
      bg: 'bg-[#DDE5B6] text-[#2C3327] border border-[#8BA888]/40',
      dot: 'bg-[#8BA888]',
      label: 'LOW',
    },
    MEDIUM: {
      bg: 'bg-[#F4EBE1] text-[#8C5E32] border border-[#CB997E]/50',
      dot: 'bg-[#A68A64]',
      label: 'MEDIUM',
    },
    HIGH: {
      bg: 'bg-[#F7E7E0] text-[#B25032] border border-[#CB997E]',
      dot: 'bg-[#CB997E]',
      label: 'HIGH',
    },
    CRITICAL: {
      bg: 'bg-[#F5DFDC] text-[#7A1E1E] border border-[#9E2A2B]/50 animate-pulse',
      dot: 'bg-[#9E2A2B]',
      label: 'CRITICAL',
    },
  }[level] || {
    bg: 'bg-[#F3F1EB] text-[#6B705C] border border-[#EBE7DF]',
    dot: 'bg-[#B7B7A4]',
    label: level,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap tracking-wider uppercase ${sizeClasses} ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 pl-1.5 border-l border-current opacity-85 font-mono">
          {score}
        </span>
      )}
    </span>
  );
};
