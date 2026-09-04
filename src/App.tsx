import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { CustomersPage } from './pages/CustomersPage';
import { AlertsPage } from './pages/AlertsPage';
import { InvestigationsPage } from './pages/InvestigationsPage';
import { FraudRulesPage } from './pages/FraudRulesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulatorPage } from './pages/SimulatorPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { 
  AlertOctagon, X, LayoutDashboard, ArrowLeftRight, 
  AlertTriangle, Cpu, Menu 
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const { activeToast, dismissToast } = useNotifications();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2C3327] flex flex-col items-center justify-center text-[#FAF9F6] font-mono px-4 text-center">
        <div className="w-10 h-10 border-4 border-[#8BA888] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs tracking-wider text-[#B7B7A4]">INITIALIZING FINANCIAL TRANSACTION MONITORING AND FRAUD DETECTION SYSTEM...</p>
      </div>
    );
  }

  if (!user || currentPage === 'login') {
    return <LoginPage onLoginSuccess={() => setCurrentPage('dashboard')} />;
  }

  const navigateTo = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || null);
    setMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigateTo} />;
      case 'transactions':
        return <TransactionsPage onNavigate={navigateTo} />;
      case 'customers':
        return <CustomersPage initialCustomerId={pageParams?.customerId} onNavigate={navigateTo} />;
      case 'alerts':
        return <AlertsPage onNavigate={navigateTo} />;
      case 'investigations':
        return <InvestigationsPage />;
      case 'fraud-rules':
        return <FraudRulesPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'simulator':
        return <SimulatorPage />;
      case 'users':
        return <UsersPage />;
      case 'audit-logs':
        return <AuditLogsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col text-[#3D4035]">
      {/* Real-time Toast Banner for Critical Alerts */}
      {activeToast && (
        <div className="fixed top-18 sm:top-20 right-3 sm:right-6 left-3 sm:left-auto z-50 max-w-md bg-[#9E2A2B] text-[#FAF9F6] p-4 rounded-2xl shadow-xl shadow-[#9E2A2B]/25 border border-[#9E2A2B]/40 flex items-start gap-3 animate-in slide-in-from-top duration-300">
          <AlertOctagon className="w-6 h-6 text-[#FAF9F6] shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider">{activeToast.title}</span>
              <button
                onClick={dismissToast}
                className="text-[#FAF9F6]/80 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs mt-1 text-[#FAF9F6]/90 leading-relaxed">
              {activeToast.message}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  dismissToast();
                  navigateTo('alerts');
                }}
                className="px-3 py-1.5 bg-[#FAF9F6] text-[#9E2A2B] rounded-full font-bold text-[11px] hover:bg-white transition shadow-xs"
              >
                Inspect Alert Immediately
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Navigation Bar */}
      <Navbar 
        onNavigate={navigateTo} 
        activePage={currentPage} 
        onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={mobileMenuOpen}
      />

      {/* Main App Canvas */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
        {/* Sidebar: hidden on mobile (<md), slide-over drawer when open */}
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={navigateTo} 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Content Viewport: full width on mobile with safe bottom padding for the mobile bar */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 overflow-y-auto max-w-full min-w-0 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on mobile < md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-t border-[#EBE7DF] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentPage === 'dashboard' ? 'text-[#8BA888] font-bold' : 'text-[#6B705C] hover:text-[#2C3327]'
          }`}
          id="mobile-bottom-nav-dashboard"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>

        <button
          onClick={() => navigateTo('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentPage === 'transactions' ? 'text-[#8BA888] font-bold' : 'text-[#6B705C] hover:text-[#2C3327]'
          }`}
          id="mobile-bottom-nav-transactions"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Txns</span>
        </button>

        <button
          onClick={() => navigateTo('alerts')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl relative transition ${
            currentPage === 'alerts' ? 'text-[#8BA888] font-bold' : 'text-[#6B705C] hover:text-[#2C3327]'
          }`}
          id="mobile-bottom-nav-alerts"
        >
          <AlertTriangle className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Alerts</span>
          <span className="absolute top-1 right-2.5 w-1.5 h-1.5 rounded-full bg-[#9E2A2B]" />
        </button>

        <button
          onClick={() => navigateTo('simulator')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            currentPage === 'simulator' ? 'text-[#8BA888] font-bold' : 'text-[#6B705C] hover:text-[#2C3327]'
          }`}
          id="mobile-bottom-nav-simulator"
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Simulator</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
            mobileMenuOpen ? 'text-[#8BA888] font-bold' : 'text-[#6B705C] hover:text-[#2C3327]'
          }`}
          id="mobile-bottom-nav-menu"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
