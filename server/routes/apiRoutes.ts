import { Router, Request, Response } from 'express';
import { storage } from '../db/storage';
import { redis } from '../redis/redisClient';
import { transactionService } from '../services/transactionService';
import { simulatorService } from '../simulator/simulatorService';
import { sseManager } from '../events/sseManager';

export const apiRouter = Router();

// ==========================================
// 1. SSE REAL-TIME STREAM
// ==========================================
apiRouter.get('/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseManager.addClient(res);
});

// ==========================================
// 2. AUTHENTICATION & RBAC
// ==========================================
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = storage.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (user.status !== 'ACTIVE') {
    return res.status(403).json({ error: 'User account is inactive or suspended.' });
  }

  // Password verification (for demo, checks demo hash / plain demo match)
  const isMatch = password === 'DemoPass2026!' || password === user.password_hash;
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
  }

  // Log successful login audit
  storage.addAuditLog({
    user_id: user.id,
    user_name: user.name,
    action: 'USER_LOGIN',
    entity: 'AUTH',
    entity_id: user.id,
    description: `User ${user.name} logged in with role ${user.role}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  const { password_hash, ...safeUser } = user;
  return res.json({
    user: safeUser,
    token: `demo-jwt-${user.id}-${Date.now()}`,
  });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (userId) {
    const user = storage.getUserById(userId);
    if (user) {
      storage.addAuditLog({
        user_id: user.id,
        user_name: user.name,
        action: 'USER_LOGOUT',
        entity: 'AUTH',
        entity_id: user.id,
        description: `User ${user.name} logged out.`,
        ip_address: req.ip || '127.0.0.1',
      });
    }
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // Default to admin for seamless review if no header
    const defaultUser = storage.getUserByEmail('admin@fraudguard.demo');
    if (defaultUser) {
      const { password_hash, ...safe } = defaultUser;
      return res.json({ user: safe });
    }
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Parse token
  const tokenParts = authHeader.replace('Bearer ', '').split('-');
  const userId = tokenParts.length >= 3 ? tokenParts[2] : 'usr-admin-01';
  const user = storage.getUserById(userId) || storage.getUserByEmail('admin@fraudguard.demo');

  if (!user) return res.status(401).json({ error: 'User not found' });
  const { password_hash, ...safe } = user;
  return res.json({ user: safe });
});

// ==========================================
// 3. DASHBOARD ANALYTICS & KPIS
// ==========================================
apiRouter.get('/dashboard/summary', (req: Request, res: Response) => {
  const range = (req.query.range as string) || '30d';
  const summary = storage.getDashboardSummary(range);
  return res.json(summary);
});

apiRouter.get('/dashboard/trends', (req: Request, res: Response) => {
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
  const trends = storage.getDashboardTrends(days);
  return res.json(trends);
});

apiRouter.get('/dashboard/risk-distribution', (req: Request, res: Response) => {
  const distribution = storage.getRiskDistribution();
  return res.json(distribution);
});

apiRouter.get('/dashboard/analytics', (req: Request, res: Response) => {
  const breakdown = storage.getAnalyticsBreakdown();
  return res.json(breakdown);
});

// ==========================================
// 4. TRANSACTIONS MODULE
// ==========================================
apiRouter.get('/transactions', (req: Request, res: Response) => {
  const {
    search,
    customer_id,
    risk_level,
    status,
    country,
    transaction_type,
    merchant_category,
    min_amount,
    max_amount,
    start_date,
    end_date,
    page,
    limit,
  } = req.query;

  const result = storage.getTransactions({
    search: search as string,
    customer_id: customer_id as string,
    risk_level: risk_level as string,
    status: status as string,
    country: country as string,
    transaction_type: transaction_type as string,
    merchant_category: merchant_category as string,
    min_amount: min_amount ? parseFloat(min_amount as string) : undefined,
    max_amount: max_amount ? parseFloat(max_amount as string) : undefined,
    start_date: start_date as string,
    end_date: end_date as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });

  return res.json(result);
});

apiRouter.get('/transactions/:id', (req: Request, res: Response) => {
  const txn = storage.getTransactionById(req.params.id);
  if (!txn) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  return res.json(txn);
});

apiRouter.post('/transactions', async (req: Request, res: Response) => {
  try {
    const outcome = await transactionService.processTransaction(req.body);
    return res.status(201).json(outcome);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Transaction processing failed.' });
  }
});

// ==========================================
// 5. CUSTOMERS MODULE
// ==========================================
apiRouter.get('/customers', (req: Request, res: Response) => {
  const { search, risk_level, country, status, page, limit } = req.query;
  const result = storage.getCustomers({
    search: search as string,
    risk_level: risk_level as string,
    country: country as string,
    status: status as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });
  return res.json(result);
});

apiRouter.get('/customers/:id', (req: Request, res: Response) => {
  const customer = storage.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  return res.json(customer);
});

apiRouter.get('/customers/:id/transactions', (req: Request, res: Response) => {
  const limitCount = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;
  const transactions = storage.getRecentCustomerTransactions(req.params.id, limitCount);
  return res.json(transactions);
});

// ==========================================
// 6. FRAUD ALERTS MODULE
// ==========================================
apiRouter.get('/alerts', (req: Request, res: Response) => {
  const { severity, status, assigned_to, search, page, limit } = req.query;
  const result = storage.getAlerts({
    severity: severity as string,
    status: status as string,
    assigned_to: assigned_to as string,
    search: search as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });
  return res.json(result);
});

apiRouter.get('/alerts/:id', (req: Request, res: Response) => {
  const alert = storage.getAlertById(req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Fraud Alert not found' });
  }
  return res.json(alert);
});

apiRouter.patch('/alerts/:id/status', (req: Request, res: Response) => {
  const { status, assigned_to, assigned_name, user_name } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = storage.updateAlertStatus(req.params.id, status, assigned_to, assigned_name);
  if (!updated) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  storage.addAuditLog({
    user_id: assigned_to || 'system',
    user_name: user_name || assigned_name || 'Investigator',
    action: 'ALERT_STATUS_UPDATE',
    entity: 'FRAUD_ALERT',
    entity_id: updated.alert_reference,
    description: `Alert status updated to ${status}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  sseManager.broadcast('alert:updated', updated);
  return res.json(updated);
});

apiRouter.patch('/alerts/:id/assign', (req: Request, res: Response) => {
  const { investigator_id, investigator_name } = req.body;
  if (!investigator_id) {
    return res.status(400).json({ error: 'investigator_id is required' });
  }

  const updated = storage.updateAlertStatus(req.params.id, 'INVESTIGATING', investigator_id, investigator_name);
  if (!updated) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  storage.addAuditLog({
    user_id: investigator_id,
    user_name: investigator_name || 'Investigator',
    action: 'ALERT_ASSIGNED',
    entity: 'FRAUD_ALERT',
    entity_id: updated.alert_reference,
    description: `Alert assigned to ${investigator_name}. Status changed to INVESTIGATING.`,
    ip_address: req.ip || '127.0.0.1',
  });

  sseManager.broadcast('alert:updated', updated);
  return res.json(updated);
});

// ==========================================
// 7. INVESTIGATIONS MODULE
// ==========================================
apiRouter.get('/investigations', (req: Request, res: Response) => {
  const { status, priority, investigator_id, search, page, limit } = req.query;
  const result = storage.getInvestigations({
    status: status as string,
    priority: priority as string,
    investigator_id: investigator_id as string,
    search: search as string,
    page: page ? parseInt(page as string, 10) : 1,
    limit: limit ? parseInt(limit as string, 10) : 20,
  });
  return res.json(result);
});

apiRouter.get('/investigations/:id', (req: Request, res: Response) => {
  const inv = storage.getInvestigationById(req.params.id);
  if (!inv) {
    return res.status(404).json({ error: 'Investigation record not found' });
  }
  return res.json(inv);
});

apiRouter.post('/investigations/:id/notes', (req: Request, res: Response) => {
  const { author_id, author_name, note, action_taken } = req.body;
  if (!note) {
    return res.status(400).json({ error: 'Note text is required.' });
  }

  const updated = storage.addInvestigationNote(req.params.id, {
    author_id: author_id || 'usr-investigator-01',
    author_name: author_name || 'Investigator',
    note,
    action_taken: action_taken || 'Investigation Note Added',
  });

  if (!updated) {
    return res.status(404).json({ error: 'Investigation not found' });
  }

  storage.addAuditLog({
    user_id: author_id || 'usr-investigator-01',
    user_name: author_name || 'Investigator',
    action: 'INVESTIGATION_NOTE_ADDED',
    entity: 'INVESTIGATION',
    entity_id: updated.alert_reference,
    description: `Note added: "${note.slice(0, 80)}..."`,
    ip_address: req.ip || '127.0.0.1',
  });

  sseManager.broadcast('investigation:updated', updated);
  return res.json(updated);
});

apiRouter.patch('/investigations/:id/status', (req: Request, res: Response) => {
  const { status, conclusion, user_name, user_id } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  const updated = storage.updateInvestigationStatus(req.params.id, status, conclusion);
  if (!updated) {
    return res.status(404).json({ error: 'Investigation not found' });
  }

  storage.addAuditLog({
    user_id: user_id || 'usr-investigator-01',
    user_name: user_name || 'Investigator',
    action: 'INVESTIGATION_STATUS_CHANGED',
    entity: 'INVESTIGATION',
    entity_id: updated.alert_reference,
    description: `Investigation status changed to ${status}. Conclusion: ${conclusion || 'N/A'}`,
    ip_address: req.ip || '127.0.0.1',
  });

  sseManager.broadcast('investigation:updated', updated);
  return res.json(updated);
});

// ==========================================
// 8. FRAUD RULES MANAGEMENT (ADMIN)
// ==========================================
apiRouter.get('/fraud-rules', (req: Request, res: Response) => {
  const rules = storage.getFraudRules();
  return res.json(rules);
});

apiRouter.post('/fraud-rules', (req: Request, res: Response) => {
  const { rule_code, name, description, threshold, risk_score, severity, category, is_active } = req.body;
  if (!rule_code || !name || threshold === undefined || !risk_score) {
    return res.status(400).json({ error: 'Missing required rule parameters' });
  }

  const created = storage.createFraudRule({
    rule_code,
    name,
    description: description || '',
    threshold: parseFloat(threshold),
    risk_score: parseInt(risk_score, 10),
    severity: severity || 'MEDIUM',
    category: category || 'BEHAVIOR',
    is_active: is_active !== false,
  });

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'FRAUD_RULE_CREATED',
    entity: 'FRAUD_RULE',
    entity_id: created.rule_code,
    description: `New fraud rule ${created.name} (${created.rule_code}) created with score ${created.risk_score}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  return res.status(201).json(created);
});

apiRouter.patch('/fraud-rules/:id', (req: Request, res: Response) => {
  const updated = storage.updateFraudRule(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Fraud Rule not found' });
  }

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'FRAUD_RULE_MODIFIED',
    entity: 'FRAUD_RULE',
    entity_id: updated.rule_code,
    description: `Rule ${updated.rule_code} modified: Active=${updated.is_active}, Threshold=${updated.threshold}, Score=${updated.risk_score}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  return res.json(updated);
});

apiRouter.delete('/fraud-rules/:id', (req: Request, res: Response) => {
  const success = storage.deleteFraudRule(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Fraud Rule not found' });
  }

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'FRAUD_RULE_DELETED',
    entity: 'FRAUD_RULE',
    entity_id: req.params.id,
    description: `Fraud rule ${req.params.id} was deleted.`,
    ip_address: req.ip || '127.0.0.1',
  });

  return res.json({ success: true, message: 'Rule deleted.' });
});

// ==========================================
// 9. TRANSACTION SIMULATOR
// ==========================================
apiRouter.get('/simulator/status', (req: Request, res: Response) => {
  return res.json(simulatorService.getStatus());
});

apiRouter.post('/simulator/start', (req: Request, res: Response) => {
  const intervalMs = req.body.interval_ms ? parseInt(req.body.interval_ms, 10) : undefined;
  const result = simulatorService.start(intervalMs);
  return res.json(result);
});

apiRouter.post('/simulator/stop', (req: Request, res: Response) => {
  const result = simulatorService.stop();
  return res.json(result);
});

apiRouter.post('/simulator/interval', (req: Request, res: Response) => {
  const ms = parseInt(req.body.interval_ms, 10);
  if (!ms || ms < 500) {
    return res.status(400).json({ error: 'Interval must be >= 500ms' });
  }
  simulatorService.setIntervalTime(ms);
  return res.json(simulatorService.getStatus());
});

apiRouter.post('/simulator/generate', async (req: Request, res: Response) => {
  const scenario = (req.body.scenario as 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL') || 'NORMAL';
  try {
    const outcome = await simulatorService.generateScenario(scenario);
    return res.json({
      success: true,
      scenario,
      outcome,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// ==========================================
// 10. USER MANAGEMENT (ADMIN)
// ==========================================
apiRouter.get('/users', (req: Request, res: Response) => {
  const users = storage.getUsers().map(u => {
    const { password_hash, ...safe } = u;
    return safe;
  });
  return res.json(users);
});

apiRouter.post('/users', (req: Request, res: Response) => {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const existing = storage.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const created = storage.createUser({
    name,
    email,
    password_hash: password || 'DemoPass2026!',
    role,
    status: 'ACTIVE',
  });

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'USER_CREATED',
    entity: 'USER',
    entity_id: created.id,
    description: `Created new user ${created.name} (${created.email}) with role ${created.role}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  const { password_hash, ...safe } = created;
  return res.status(201).json(safe);
});

apiRouter.patch('/users/:id', (req: Request, res: Response) => {
  const updated = storage.updateUser(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'USER_UPDATED',
    entity: 'USER',
    entity_id: updated.id,
    description: `User ${updated.name} updated: role=${updated.role}, status=${updated.status}.`,
    ip_address: req.ip || '127.0.0.1',
  });

  const { password_hash, ...safe } = updated;
  return res.json(safe);
});

// ==========================================
// 11. AUDIT LOGS MODULE
// ==========================================
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const logs = storage.getAuditLogs(limit);
  return res.json(logs);
});

// ==========================================
// 12. PLATFORM SETTINGS
// ==========================================
apiRouter.get('/settings', (req: Request, res: Response) => {
  return res.json(storage.getSettings());
});

apiRouter.patch('/settings', (req: Request, res: Response) => {
  const updated = storage.updateSettings(req.body);

  storage.addAuditLog({
    user_id: 'admin',
    user_name: 'Administrator',
    action: 'SYSTEM_SETTINGS_MODIFIED',
    entity: 'SETTINGS',
    entity_id: 'SYS_CFG',
    description: `System surveillance thresholds updated. Large txn threshold: ${updated.large_transaction_threshold}`,
    ip_address: req.ip || '127.0.0.1',
  });

  return res.json(updated);
});
