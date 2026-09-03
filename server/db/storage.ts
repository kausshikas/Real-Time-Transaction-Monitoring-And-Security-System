import { 
  User, Customer, Account, Transaction, FraudAlert, Investigation, 
  FraudRule, AuditLog, SystemSettings, RiskLevel, TransactionStatus, AlertStatus, AlertSeverity
} from '../types';
import { generateSeedData, INITIAL_SETTINGS, INITIAL_USERS, INITIAL_FRAUD_RULES } from './seedData';

class StorageRepository {
  private users: User[] = [];
  private customers: Customer[] = [];
  private accounts: Account[] = [];
  private transactions: Transaction[] = [];
  private alerts: FraudAlert[] = [];
  private investigations: Investigation[] = [];
  private fraudRules: FraudRule[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: SystemSettings = { ...INITIAL_SETTINGS };

  constructor() {
    this.initializeData();
  }

  public initializeData() {
    const seed = generateSeedData();
    this.users = seed.users;
    this.customers = seed.customers;
    this.accounts = seed.accounts;
    this.transactions = seed.transactions;
    this.alerts = seed.alerts;
    this.investigations = seed.investigations;
    this.fraudRules = seed.fraudRules;
    this.auditLogs = seed.auditLogs;
    this.settings = seed.settings;
    console.log(`[Storage] Database initialized: ${this.customers.length} customers, ${this.transactions.length} transactions, ${this.alerts.length} alerts.`);
  }

  // --- SETTINGS ---
  public getSettings(): SystemSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<SystemSettings>): SystemSettings {
    this.settings = { ...this.settings, ...partial };
    return { ...this.settings };
  }

  // --- USERS ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.users[idx];
  }

  // --- CUSTOMERS ---
  public getCustomers(params?: {
    search?: string;
    risk_level?: string;
    country?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.customers];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.customer_reference.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }

    if (params?.risk_level && params.risk_level !== 'ALL') {
      result = result.filter(c => c.risk_level === params.risk_level);
    }

    if (params?.country && params.country !== 'ALL') {
      result = result.filter(c => c.country === params.country);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter(c => c.account_status === params.status);
    }

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 20);
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id || c.customer_reference === id);
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.customers[idx] = {
      ...this.customers[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.customers[idx];
  }

  // --- TRANSACTIONS ---
  public getTransactions(params?: {
    search?: string;
    customer_id?: string;
    risk_level?: string;
    status?: string;
    country?: string;
    transaction_type?: string;
    merchant_category?: string;
    min_amount?: number;
    max_amount?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.transactions];

    if (params?.customer_id) {
      result = result.filter(t => t.customer_id === params.customer_id);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(t =>
        t.transaction_reference.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        t.merchant.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
      );
    }

    if (params?.risk_level && params.risk_level !== 'ALL') {
      result = result.filter(t => t.risk_level === params.risk_level);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter(t => t.status === params.status);
    }

    if (params?.country && params.country !== 'ALL') {
      result = result.filter(t => t.country === params.country);
    }

    if (params?.transaction_type && params.transaction_type !== 'ALL') {
      result = result.filter(t => t.transaction_type === params.transaction_type);
    }

    if (params?.merchant_category && params.merchant_category !== 'ALL') {
      result = result.filter(t => t.merchant_category === params.merchant_category);
    }

    if (params?.min_amount !== undefined) {
      result = result.filter(t => t.amount >= params.min_amount!);
    }

    if (params?.max_amount !== undefined) {
      result = result.filter(t => t.amount <= params.max_amount!);
    }

    if (params?.start_date) {
      const start = new Date(params.start_date).getTime();
      result = result.filter(t => new Date(t.timestamp).getTime() >= start);
    }

    if (params?.end_date) {
      const end = new Date(params.end_date).getTime();
      result = result.filter(t => new Date(t.timestamp).getTime() <= end);
    }

    // Sort descending by timestamp
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 20);
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find(t => t.id === id || t.transaction_reference === id);
  }

  public getRecentCustomerTransactions(customerId: string, limitCount = 10): Transaction[] {
    return this.transactions
      .filter(t => t.customer_id === customerId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limitCount);
  }

  public addTransaction(txn: Transaction): Transaction {
    this.transactions.unshift(txn);

    // Update customer summary
    const cust = this.getCustomerById(txn.customer_id);
    if (cust) {
      cust.total_transactions += 1;
      cust.total_spend += txn.amount;
      if (txn.risk_score >= 60) {
        cust.fraud_alerts_count += 1;
        if (txn.risk_level === 'CRITICAL') cust.risk_level = 'CRITICAL';
        else if (txn.risk_level === 'HIGH' && cust.risk_level !== 'CRITICAL') cust.risk_level = 'HIGH';
      }
    }

    return txn;
  }

  // --- FRAUD RULES ---
  public getFraudRules(): FraudRule[] {
    return [...this.fraudRules];
  }

  public getFraudRuleById(id: string): FraudRule | undefined {
    return this.fraudRules.find(r => r.id === id || r.rule_code === id);
  }

  public createFraudRule(ruleData: Omit<FraudRule, 'id' | 'created_at' | 'updated_at'>): FraudRule {
    const newRule: FraudRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.fraudRules.push(newRule);
    return newRule;
  }

  public updateFraudRule(id: string, updates: Partial<FraudRule>): FraudRule | null {
    const idx = this.fraudRules.findIndex(r => r.id === id || r.rule_code === id);
    if (idx === -1) return null;
    this.fraudRules[idx] = {
      ...this.fraudRules[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.fraudRules[idx];
  }

  public deleteFraudRule(id: string): boolean {
    const idx = this.fraudRules.findIndex(r => r.id === id || r.rule_code === id);
    if (idx === -1) return false;
    this.fraudRules.splice(idx, 1);
    return true;
  }

  // --- FRAUD ALERTS ---
  public getAlerts(params?: {
    severity?: string;
    status?: string;
    assigned_to?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.alerts];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(a =>
        a.alert_reference.toLowerCase().includes(q) ||
        a.customer_name.toLowerCase().includes(q) ||
        a.reason.toLowerCase().includes(q)
      );
    }

    if (params?.severity && params.severity !== 'ALL') {
      result = result.filter(a => a.severity === params.severity);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter(a => a.status === params.status);
    }

    if (params?.assigned_to && params.assigned_to !== 'ALL') {
      result = result.filter(a => a.assigned_to === params.assigned_to);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 20);
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getAlertById(id: string): FraudAlert | undefined {
    return this.alerts.find(a => a.id === id || a.alert_reference === id);
  }

  public addAlert(alert: FraudAlert): FraudAlert {
    this.alerts.unshift(alert);

    // Automatically create or link an investigation record
    const inv: Investigation = {
      id: `inv-${Date.now()}`,
      alert_id: alert.id,
      alert_reference: alert.alert_reference,
      transaction_id: alert.transaction_id,
      customer_id: alert.customer_id,
      status: alert.status,
      priority: alert.severity,
      notes: [
        {
          id: `note-${Date.now()}-1`,
          investigation_id: `inv-${Date.now()}`,
          author_id: 'system',
          author_name: 'Fraud Detection Engine',
          note: `Automated alert triggered: ${alert.reason}`,
          action_taken: 'Alert Registered',
          created_at: alert.created_at,
        }
      ],
      created_at: alert.created_at,
      updated_at: alert.updated_at,
    };
    this.investigations.unshift(inv);

    return alert;
  }

  public updateAlertStatus(id: string, status: AlertStatus, assignedTo?: string, assignedName?: string): FraudAlert | null {
    const alert = this.alerts.find(a => a.id === id || a.alert_reference === id);
    if (!alert) return null;

    alert.status = status;
    if (assignedTo) {
      alert.assigned_to = assignedTo;
      alert.assigned_name = assignedName;
    }
    alert.updated_at = new Date().toISOString();

    // Synchronize linked investigation
    const inv = this.investigations.find(i => i.alert_id === alert.id);
    if (inv) {
      inv.status = status;
      if (assignedTo) {
        inv.investigator_id = assignedTo;
        inv.investigator_name = assignedName;
      }
      inv.updated_at = alert.updated_at;
    }

    return alert;
  }

  // --- INVESTIGATIONS ---
  public getInvestigations(params?: {
    status?: string;
    priority?: string;
    investigator_id?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    let result = [...this.investigations];

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(i =>
        i.alert_reference.toLowerCase().includes(q) ||
        (i.investigator_name && i.investigator_name.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter(i => i.status === params.status);
    }

    if (params?.priority && params.priority !== 'ALL') {
      result = result.filter(i => i.priority === params.priority);
    }

    if (params?.investigator_id && params.investigator_id !== 'ALL') {
      result = result.filter(i => i.investigator_id === params.investigator_id);
    }

    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = result.length;
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, params?.limit || 20);
    const totalPages = Math.ceil(total / limit);
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      data: paginated,
      total,
      page,
      limit,
      totalPages,
    };
  }

  public getInvestigationById(id: string): Investigation | undefined {
    return this.investigations.find(i => i.id === id || i.alert_id === id || i.alert_reference === id);
  }

  public addInvestigationNote(investigationId: string, noteData: { author_id: string; author_name: string; note: string; action_taken: string }): Investigation | null {
    const inv = this.getInvestigationById(investigationId);
    if (!inv) return null;

    const newNote: any = {
      id: `note-${Date.now()}`,
      investigation_id: inv.id,
      ...noteData,
      created_at: new Date().toISOString(),
    };
    inv.notes.unshift(newNote);
    inv.updated_at = newNote.created_at;

    return inv;
  }

  public updateInvestigationStatus(investigationId: string, status: AlertStatus, conclusion?: string): Investigation | null {
    const inv = this.getInvestigationById(investigationId);
    if (!inv) return null;

    inv.status = status;
    if (conclusion) inv.conclusion = conclusion;
    inv.updated_at = new Date().toISOString();

    // Sync with alert
    const alert = this.alerts.find(a => a.id === inv.alert_id);
    if (alert) {
      alert.status = status;
      alert.updated_at = inv.updated_at;
    }

    return inv;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(limitCount = 50): AuditLog[] {
    return this.auditLogs
      .slice()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limitCount);
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): AuditLog {
    const entry: AuditLog = {
      ...log,
      id: `aud-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  // --- ANALYTICS & KPIS ---
  public getDashboardSummary(dateRange: string = '30d') {
    const now = Date.now();
    let cutoff = now - 30 * 86400000;
    if (dateRange === 'today') cutoff = now - 86400000;
    else if (dateRange === '7d') cutoff = now - 7 * 86400000;
    else if (dateRange === '90d') cutoff = now - 90 * 86400000;

    const filteredTxns = this.transactions.filter(t => new Date(t.timestamp).getTime() >= cutoff);
    const todayTxns = this.transactions.filter(t => new Date(t.timestamp).getTime() >= now - 86400000);

    const totalCount = filteredTxns.length;
    const todayCount = todayTxns.length;
    const totalVolume = filteredTxns.reduce((sum, t) => sum + t.amount, 0);
    const avgRiskScore = totalCount > 0 ? Math.round(filteredTxns.reduce((s, t) => s + t.risk_score, 0) / totalCount) : 0;

    const highRiskTxns = filteredTxns.filter(t => t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL').length;
    const criticalTxns = filteredTxns.filter(t => t.risk_level === 'CRITICAL').length;
    const fraudRate = totalCount > 0 ? +((highRiskTxns / totalCount) * 100).toFixed(2) : 0;

    const alertsCount = this.alerts.filter(a => new Date(a.created_at).getTime() >= cutoff).length;
    const criticalAlertsCount = this.alerts.filter(a => a.severity === 'CRITICAL' && new Date(a.created_at).getTime() >= cutoff).length;

    return {
      total_transactions: totalCount,
      transactions_today: todayCount,
      total_volume: totalVolume,
      average_risk_score: avgRiskScore,
      fraud_alerts: alertsCount,
      critical_alerts: criticalAlertsCount,
      high_risk_transactions: highRiskTxns,
      fraud_rate: fraudRate,
    };
  }

  public getDashboardTrends(daysCount = 7) {
    const now = Date.now();
    const result: { date: string; volume: number; fraudAlerts: number; avgRisk: number }[] = [];

    for (let d = daysCount - 1; d >= 0; d--) {
      const dayStart = new Date(now - d * 86400000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const dayTxns = this.transactions.filter(t => {
        const time = new Date(t.timestamp).getTime();
        return time >= dayStart.getTime() && time < dayEnd.getTime();
      });

      const dayAlerts = this.alerts.filter(a => {
        const time = new Date(a.created_at).getTime();
        return time >= dayStart.getTime() && time < dayEnd.getTime();
      });

      const avgRisk = dayTxns.length > 0
        ? Math.round(dayTxns.reduce((sum, t) => sum + t.risk_score, 0) / dayTxns.length)
        : 15;

      const dateLabel = dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      result.push({
        date: dateLabel,
        volume: dayTxns.length,
        fraudAlerts: dayAlerts.length,
        avgRisk,
      });
    }

    return result;
  }

  public getRiskDistribution() {
    const counts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const t of this.transactions) {
      counts[t.risk_level] = (counts[t.risk_level] || 0) + 1;
    }

    return [
      { name: 'Low Risk (0-29)', value: counts.LOW, color: '#10b981' },
      { name: 'Medium Risk (30-59)', value: counts.MEDIUM, color: '#f59e0b' },
      { name: 'High Risk (60-79)', value: counts.HIGH, color: '#f97316' },
      { name: 'Critical Risk (80-100)', value: counts.CRITICAL, color: '#ef4444' },
    ];
  }

  public getAnalyticsBreakdown() {
    // Top Fraud Countries
    const countryMap = new Map<string, { country: string; total: number; fraudulent: number }>();
    for (const t of this.transactions) {
      const entry = countryMap.get(t.country) || { country: t.country, total: 0, fraudulent: 0 };
      entry.total += 1;
      if (t.risk_level === 'HIGH' || t.risk_level === 'CRITICAL') {
        entry.fraudulent += 1;
      }
      countryMap.set(t.country, entry);
    }
    const topCountries = Array.from(countryMap.values())
      .sort((a, b) => b.fraudulent - a.fraudulent)
      .slice(0, 6);

    // Fraud by Merchant Category
    const categoryMap = new Map<string, { category: string; alerts: number; totalVolume: number }>();
    for (const a of this.alerts) {
      const txn = this.getTransactionById(a.transaction_id);
      const cat = txn ? txn.merchant_category : 'Other';
      const entry = categoryMap.get(cat) || { category: cat, alerts: 0, totalVolume: 0 };
      entry.alerts += 1;
      entry.totalVolume += a.transaction_amount;
      categoryMap.set(cat, entry);
    }
    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.alerts - a.alerts)
      .slice(0, 6);

    // Fraud by Hour of Day (0 - 23)
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: 0,
    }));
    for (const a of this.alerts) {
      const h = new Date(a.created_at).getHours();
      hours[h].count += 1;
    }

    return {
      topCountries,
      topCategories,
      fraudByHour: hours,
    };
  }
}

export const storage = new StorageRepository();
