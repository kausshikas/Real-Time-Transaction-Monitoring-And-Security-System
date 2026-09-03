import { 
  User, Customer, Transaction, FraudAlert, Investigation, 
  FraudRule, AuditLog, SystemSettings, DashboardSummary 
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('fraudguard_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // --- AUTH ---
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Authentication error');
    }
    return res.json();
  }

  async logout(userId?: string): Promise<void> {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ userId }),
    });
    localStorage.removeItem('fraudguard_token');
    localStorage.removeItem('fraudguard_user');
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve user profile');
    return res.json();
  }

  // --- DASHBOARD ---
  async getDashboardSummary(range = '30d'): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary?range=${range}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getDashboardTrends(days = 7): Promise<{ date: string; volume: number; fraudAlerts: number; avgRisk: number }[]> {
    const res = await fetch(`${API_BASE}/dashboard/trends?days=${days}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getRiskDistribution(): Promise<{ name: string; value: number; color: string }[]> {
    const res = await fetch(`${API_BASE}/dashboard/risk-distribution`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getAnalytics(): Promise<{
    topCountries: { country: string; total: number; fraudulent: number }[];
    topCategories: { category: string; alerts: number; totalVolume: number }[];
    fraudByHour: { hour: string; count: number }[];
  }> {
    const res = await fetch(`${API_BASE}/dashboard/analytics`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- TRANSACTIONS ---
  async getTransactions(params?: Record<string, any>): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/transactions?${searchParams.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Transaction not found');
    return res.json();
  }

  async createTransaction(payload: any): Promise<{ transaction: Transaction; alert?: FraudAlert }> {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Transaction failed' }));
      throw new Error(err.error || 'Failed to submit transaction');
    }
    return res.json();
  }

  // --- CUSTOMERS ---
  async getCustomers(params?: Record<string, any>): Promise<{
    data: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/customers?${searchParams.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getCustomerById(id: string): Promise<Customer> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Customer not found');
    return res.json();
  }

  async getCustomerTransactions(id: string, limit = 15): Promise<Transaction[]> {
    const res = await fetch(`${API_BASE}/customers/${id}/transactions?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- ALERTS ---
  async getAlerts(params?: Record<string, any>): Promise<{
    data: FraudAlert[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/alerts?${searchParams.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getAlertById(id: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/alerts/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Alert not found');
    return res.json();
  }

  async updateAlertStatus(id: string, status: string, assignedTo?: string, assignedName?: string, userName?: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/alerts/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, assigned_to: assignedTo, assigned_name: assignedName, user_name: userName }),
    });
    return res.json();
  }

  async assignAlert(id: string, investigatorId: string, investigatorName: string): Promise<FraudAlert> {
    const res = await fetch(`${API_BASE}/alerts/${id}/assign`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ investigator_id: investigatorId, investigator_name: investigatorName }),
    });
    return res.json();
  }

  // --- INVESTIGATIONS ---
  async getInvestigations(params?: Record<string, any>): Promise<{
    data: Investigation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_BASE}/investigations?${searchParams.toString()}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async getInvestigationById(id: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Investigation not found');
    return res.json();
  }

  async addInvestigationNote(id: string, note: string, actionTaken: string, authorId: string, authorName: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}/notes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ note, action_taken: actionTaken, author_id: authorId, author_name: authorName }),
    });
    return res.json();
  }

  async updateInvestigationStatus(id: string, status: string, conclusion?: string, userName?: string, userId?: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, conclusion, user_name: userName, user_id: userId }),
    });
    return res.json();
  }

  // --- FRAUD RULES ---
  async getFraudRules(): Promise<FraudRule[]> {
    const res = await fetch(`${API_BASE}/fraud-rules`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async createFraudRule(rule: Partial<FraudRule>): Promise<FraudRule> {
    const res = await fetch(`${API_BASE}/fraud-rules`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(rule),
    });
    return res.json();
  }

  async updateFraudRule(id: string, updates: Partial<FraudRule>): Promise<FraudRule> {
    const res = await fetch(`${API_BASE}/fraud-rules/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  }

  async deleteFraudRule(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/fraud-rules/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- SIMULATOR ---
  async getSimulatorStatus(): Promise<{ isRunning: boolean; intervalMs: number; generatedCount: number }> {
    const res = await fetch(`${API_BASE}/simulator/status`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async startSimulator(intervalMs?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/start`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ interval_ms: intervalMs }),
    });
    return res.json();
  }

  async stopSimulator(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/stop`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async setSimulatorInterval(intervalMs: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/interval`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ interval_ms: intervalMs }),
    });
    return res.json();
  }

  async generateScenario(scenario: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL'): Promise<any> {
    const res = await fetch(`${API_BASE}/simulator/generate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ scenario }),
    });
    return res.json();
  }

  // --- USERS ---
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async createUser(user: Partial<User> & { password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(user),
    });
    return res.json();
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(limit = 50): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  // --- SETTINGS ---
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });
    return res.json();
  }
}

export const api = new ApiService();
