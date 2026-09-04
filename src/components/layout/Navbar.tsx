import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { eventBus } from '../../services/events';
import { 
  ShieldAlert, Bell, Play, Square, CheckCheck, 
  ChevronDown, UserCheck, Menu, X 
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  activePage,
  onToggleMobileMenu,
  isMobileMenuOpen,
}) => {
  const { user, logout, switchDemoRole } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [simulatorStatus, setSimulatorStatus] = useState<{ isRunning: boolean; intervalMs: number; generatedCount: number }>({
    isRunning: false,
    intervalMs: 3000,
    generatedCount: 0,
  });
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    // Initial fetch of simulator status
    api.getSimulatorStatus().then(setSimulatorStatus).catch(() => {});

    // Listen to live simulator changes
    const unsub = eventBus.subscribe((event, data) => {
      if (event === 'simulator:status') {
        setSimulatorStatus(data);
      }
    });

    return () => unsub();
  }, []);

  const handleToggleSimulator = async () => {
    try {
      if (simulatorStatus.isRunning) {
        await api.stopSimulator();
      } else {
        await api.startSimulator();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#EBE7DF] text-[#3D4035] select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
        
        {/* Left: Mobile Toggle + Brand Identity */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-[#2C3327] hover:bg-[#F3F1EB] transition shrink-0"
            aria-label="Toggle navigation menu"
            id="mobile-nav-toggle-btn"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#2C3327]" /> : <Menu className="w-5 h-5 text-[#2C3327]" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-2.5 cursor-pointer min-w-0" onClick={() => onNavigate('dashboard')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8BA888] flex items-center justify-center shadow-md shadow-[#8BA888]/20 shrink-0">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-[#FAF9F6]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm sm:text-base md:text-lg font-bold tracking-tight text-[#2C3327] truncate">
                  Financial Transaction Monitoring
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#DDE5B6] text-[#6B705C] border border-[#B7B7A4]/40 shrink-0">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-[#6B705C] tracking-wider uppercase font-medium truncate hidden md:block">
                Financial Transaction Monitoring and Fraud Detection System
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status & Simulator Quick Controller (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3F1EB] border border-[#EBE7DF] text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8BA888] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8BA888]"></span>
            </span>
            <span className="text-[#6B705C] font-medium">Engine:</span>
            <span className="text-[#2C3327] font-bold">ACTIVE</span>
            <span className="text-[#B7B7A4]">|</span>
            <span className="text-[#6B705C] font-mono text-[11px]">Sliding Window 120s</span>
          </div>

          {/* Simulator button */}
          <button
            onClick={handleToggleSimulator}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
              simulatorStatus.isRunning
                ? 'bg-[#9E2A2B]/10 text-[#9E2A2B] border-[#9E2A2B]/30 hover:bg-[#9E2A2B]/20'
                : 'bg-[#8BA888]/15 text-[#2C3327] border-[#8BA888]/40 hover:bg-[#8BA888]/25'
            }`}
            title="Toggle Live Transaction Stream"
          >
            {simulatorStatus.isRunning ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current animate-pulse text-[#9E2A2B]" />
                <span>Sim: STREAMING ({simulatorStatus.generatedCount})</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-[#8BA888]" />
                <span>Sim: IDLE</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Role Switcher & Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Demo Role Switcher for Final Year Viva */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F3F1EB] hover:bg-[#EBE7DF] border border-[#EBE7DF] text-xs text-[#2C3327] font-semibold transition"
              title="Switch demo evaluation roles"
              id="role-switch-menu-btn"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#8BA888]" />
              <span className="text-[11px] sm:text-xs">{user?.role || 'ADMIN'}</span>
              <ChevronDown className="w-3 h-3 text-[#6B705C]" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#FFFFFF] border border-[#EBE7DF] shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3.5 py-1 text-[10px] font-bold text-[#B7B7A4] uppercase tracking-wider border-b border-[#EBE7DF]">
                  Switch Viva Demo Role
                </div>
                {(['ADMIN', 'ANALYST', 'INVESTIGATOR', 'VIEWER'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      switchDemoRole(role);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-[#F3F1EB] transition ${
                      user?.role === role ? 'text-[#8BA888] font-bold bg-[#F3F1EB]' : 'text-[#3D4035]'
                    }`}
                  >
                    <span>{role}</span>
                    {user?.role === role && <span className="w-1.5 h-1.5 rounded-full bg-[#8BA888]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-[#F3F1EB] hover:bg-[#EBE7DF] border border-[#EBE7DF] text-[#3D4035] transition"
              aria-label="Alert Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#CB997E] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFFFF] border border-[#EBE7DF] shadow-2xl z-50 overflow-hidden text-xs animate-in fade-in zoom-in-95">
                <div className="px-4 py-3 bg-[#F3F1EB] border-b border-[#EBE7DF] flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-[#2C3327]">Alert Center</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-[#6B705C] hover:text-[#2C3327] text-[11px] font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#EBE7DF]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-[#B7B7A4]">
                      No notifications recorded.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.metadata?.alertId) {
                            setShowNotifications(false);
                            onNavigate('alerts');
                          }
                        }}
                        className={`p-3.5 transition cursor-pointer hover:bg-[#FAF9F6] ${
                          !n.read ? 'bg-[#F3F1EB]/50 border-l-3 border-[#CB997E]' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-semibold ${
                            n.type === 'CRITICAL_ALERT' ? 'text-[#9E2A2B] font-bold' : 'text-[#2C3327]'
                          }`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-[#B7B7A4] font-mono">
                            {n.timestamp ? new Date(n.timestamp).toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-[#6B705C] text-[11px] line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile & quick logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#EBE7DF]">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#2C3327] leading-none">{user?.name}</div>
              <div className="text-[10px] text-[#6B705C] font-mono uppercase">{user?.role}</div>
            </div>
            <button
              onClick={() => onNavigate('login')}
              className="text-xs text-[#6B705C] hover:text-[#9E2A2B] transition p-1.5 rounded-full hover:bg-[#F3F1EB]"
              title="Logout / Switch Account"
            >
              Sign out
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
