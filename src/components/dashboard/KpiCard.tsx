import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  isPositive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'default' | 'danger' | 'warning' | 'success';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  trend,
  isPositive,
  subtext,
  icon: Icon,
  variant = 'default',
}) => {
  const variantStyles = {
    default: 'text-[#2C3327] bg-[#F3F1EB] border-[#EBE7DF]',
    danger: 'text-[#9E2A2B] bg-[#F5DFDC] border-[#9E2A2B]/30',
    warning: 'text-[#B25032] bg-[#F7E7E0] border-[#CB997E]/40',
    success: 'text-[#2C3327] bg-[#DDE5B6] border-[#8BA888]/40',
  }[variant];

  return (
    <div className="bg-white rounded-2xl border border-[#EBE7DF] p-5 shadow-xs hover:border-[#B7B7A4] transition flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#6B705C] uppercase tracking-[0.15em]">
          {title}
        </span>
        <div className={`p-2 rounded-full border ${variantStyles}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
          {value}
        </span>
        {trend && (
          <span className={`text-xs font-semibold flex items-center ${
            isPositive ? 'text-[#8BA888]' : 'text-[#9E2A2B]'
          }`}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-[#B7B7A4] font-medium truncate">
          {subtext}
        </p>
      )}
    </div>
  );
};
