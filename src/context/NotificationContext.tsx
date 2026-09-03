import React, { createContext, useContext, useState, useEffect } from 'react';
import { eventBus } from '../services/events';
import { FraudAlert, Transaction } from '../types';

export interface AppNotification {
  id: string;
  type: 'CRITICAL_ALERT' | 'HIGH_RISK_TXN' | 'ALERT_UPDATED' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: any;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  activeToast: AppNotification | null;
  dismissToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'init-notif-1',
      type: 'INFO',
      title: 'Fraud Surveillance Engine Online',
      message: 'Rule engine initialized with 10 real-time security rules and Redis sliding-window velocity tracking.',
      timestamp: new Date().toISOString(),
      read: false,
    }
  ]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event, data) => {
      if (event === 'alert:new' && data) {
        const alert = data as FraudAlert;
        const amount = alert.transaction_amount != null ? alert.transaction_amount.toLocaleString('en-IN') : '0';
        const newNotif: AppNotification = {
          id: `notif-${Date.now()}-${Math.random()}`,
          type: alert.severity === 'CRITICAL' ? 'CRITICAL_ALERT' : 'HIGH_RISK_TXN',
          title: `${alert.severity || 'HIGH'} Fraud Alert: ${alert.alert_reference || 'Ref'}`,
          message: `${alert.customer_name || 'Customer'} - ₹${amount}: ${alert.reason || 'Suspicious activity'}`,
          timestamp: new Date().toISOString(),
          read: false,
          metadata: { alertId: alert.id, transactionId: alert.transaction_id },
        };

        setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
        setActiveToast(newNotif);

        // Auto-dismiss toast after 6 seconds
        setTimeout(() => {
          setActiveToast(curr => curr?.id === newNotif.id ? null : curr);
        }, 6000);
      } else if (event === 'transaction:risk' && data && !data.alert) {
        const txn = (data.transaction || data) as Transaction;
        if (txn && (txn.risk_level === 'HIGH' || txn.risk_level === 'CRITICAL')) {
          const amount = txn.amount != null ? txn.amount.toLocaleString('en-IN') : '0';
          const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            type: 'HIGH_RISK_TXN',
            title: `High Risk Transaction Flagged`,
            message: `${txn.transaction_reference || 'Txn'} - ₹${amount} (Risk: ${txn.risk_score ?? 0})`,
            timestamp: new Date().toISOString(),
            read: false,
            metadata: { transactionId: txn.id },
          };
          setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      activeToast,
      dismissToast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
