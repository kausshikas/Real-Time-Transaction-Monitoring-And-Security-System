import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, ArrowLeftRight, Users, AlertTriangle, 
  SearchCode, Sliders, BarChart3, Cpu, UserCog, 
  FileClock, Settings as SettingsIcon, LogOut, X, ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPage, 
  onNavigate,
  isOpen = false,
  onClose,
}) => {
  const { user, logout, canAccess } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'] as const,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: ArrowLeftRight,
      roles: ['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'] as const,
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      roles: ['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'] as const,
    },
    {
      id: 'alerts',
      label: 'Fraud Alerts',
      icon: AlertTriangle,
      roles: ['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'] as const,
      badge: 'Live',
    },
    {
      id: 'investigations',
      label: 'Investigations',
      icon: SearchCode,
      roles: ['ADMIN', 'INVESTIGATOR'] as const,
    },
    {
      id: 'fraud-rules',
      label: 'Fraud Rules',
      icon: Sliders,
      roles: ['ADMIN'] as const,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'ANALYST', 'VIEWER'] as const,
    },
    {
      id: 'simulator',
      label: 'Simulator',
      icon: Cpu,
      roles: ['ADMIN', 'ANALYST'] as const,
      badge: 'Test',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCog,
      roles: ['ADMIN'] as const,
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: FileClock,
      roles: ['ADMIN'] as const,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      roles: ['ADMIN'] as const,
    },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onClose) {
      onClose();
    }
  };

  const renderNavList = () => (
    <div className="flex-1 py-4 px-3.5 space-y-1 overflow-y-auto">
      <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#B7B7A4]">
        Surveillance Modules
      </div>

      {menuItems.map(item => {
        const isAllowed = canAccess(item.roles as any);
        if (!isAllowed) return null;

        const isActive = currentPage === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
              isActive
                ? 'bg-[#8BA888] text-white shadow-md shadow-[#8BA888]/25 font-bold'
                : 'text-[#6B705C] hover:text-[#2C3327] hover:bg-[#F3F1EB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 transition ${isActive ? 'text-white' : 'text-[#8BA888] group-hover:text-[#2C3327]'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${
                isActive ? 'bg-white/90 text-[#2C3327]' : 'bg-[#DDE5B6] text-[#6B705C] border border-[#B7B7A4]/40'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderUserProfile = () => (
    <div className="p-3.5 border-t border-[#EBE7DF] bg-[#FAF9F6]">
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F3F1EB] border border-[#EBE7DF]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#8BA888] flex items-center justify-center text-[#FAF9F6] font-bold text-xs shrink-0 shadow-xs">
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#2C3327] truncate leading-tight">
              {user?.name || 'Operator'}
            </p>
            <p className="text-[10px] text-[#6B705C] font-mono uppercase">
              {user?.role || 'VIEWER'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleItemClick('login')}
          className="p-1.5 text-[#B7B7A4] hover:text-[#9E2A2B] rounded-full hover:bg-[#FAF9F6] transition"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-[#FAF9F6] border-r border-[#EBE7DF] text-[#6B705C] flex-col shrink-0 min-h-[calc(100vh-4.5rem)] select-none">
        {renderNavList()}
        {renderUserProfile()}
      </aside>

      {/* Mobile Navigation Drawer (slide-over with backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-[#2C3327]/60 backdrop-blur-xs flex">
          {/* Backdrop click area */}
          <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] bg-[#FAF9F6] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200 select-none">
            {/* Drawer Header */}
            <div className="p-4 bg-white border-b border-[#EBE7DF] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#8BA888] flex items-center justify-center text-[#FAF9F6] shrink-0 shadow-xs">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-serif text-xs sm:text-sm font-bold text-[#2C3327] leading-snug">
                    Financial Transaction Monitoring
                  </div>
                  <div className="text-[10px] text-[#6B705C] font-mono mt-0.5">
                    & Fraud Detection System
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[#F3F1EB] text-[#6B705C] transition"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            {renderNavList()}

            {/* Bottom user profile */}
            {renderUserProfile()}
          </div>
        </div>
      )}
    </>
  );
};
