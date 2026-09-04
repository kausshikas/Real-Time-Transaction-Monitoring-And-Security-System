import { User, Customer, Account, FraudRule, Transaction, FraudAlert, Investigation, AuditLog, SystemSettings } from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  large_transaction_threshold: 100000,
  rapid_transaction_window_seconds: 120,
  rapid_transaction_threshold_count: 3,
  unusual_amount_multiplier: 3.5,
  critical_alert_threshold: 80,
  high_risk_threshold: 60,
  medium_risk_threshold: 30,
  simulator_interval_ms: 3000,
  simulator_normal_prob: 0.70,
  simulator_suspicious_prob: 0.20,
  simulator_critical_prob: 0.10,
  alert_email_notifications: true,
  alert_sms_notifications: false,
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-01',
    name: 'admin123',
    email: 'admin@fraudguard.demo',
    password_hash: 'DemoPass2026!',
    role: 'ADMIN',
    status: 'ACTIVE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr-analyst-01',
    name: 'Priya Sundaram',
    email: 'analyst@fraudguard.demo',
    password_hash: 'DemoPass2026!',
    role: 'ANALYST',
    status: 'ACTIVE',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'usr-investigator-01',
    name: 'Marcus Vance',
    email: 'investigator@fraudguard.demo',
    password_hash: 'DemoPass2026!',
    role: 'INVESTIGATOR',
    status: 'ACTIVE',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'usr-viewer-01',
    name: 'Ananya Deshmukh',
    email: 'viewer@fraudguard.demo',
    password_hash: 'DemoPass2026!',
    role: 'VIEWER',
    status: 'ACTIVE',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
  },
];

export const INITIAL_FRAUD_RULES: FraudRule[] = [
  {
    id: 'rule-01',
    rule_code: 'RULE_01',
    name: 'Large Transaction Amount',
    description: 'Transaction exceeds standard enterprise single-transaction ceiling threshold (₹1,00,000 / $10,000).',
    threshold: 100000,
    risk_score: 25,
    severity: 'HIGH',
    is_active: true,
    category: 'AMOUNT',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-02',
    rule_code: 'RULE_02',
    name: 'Rapid Transactions Velocity',
    description: 'Multiple high-velocity transactions detected within rolling 120-second window on customer account.',
    threshold: 3,
    risk_score: 20,
    severity: 'HIGH',
    is_active: true,
    category: 'VELOCITY',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-03',
    rule_code: 'RULE_03',
    name: 'Unusual Amount Deviation',
    description: 'Current transaction amount exceeds customer historical moving baseline average by more than 3.5x.',
    threshold: 3.5,
    risk_score: 22,
    severity: 'MEDIUM',
    is_active: true,
    category: 'BEHAVIOR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-04',
    rule_code: 'RULE_04',
    name: 'Unusual Geolocation',
    description: 'Transaction originated from an unrecognized country or international location outside customer profile history.',
    threshold: 1,
    risk_score: 25,
    severity: 'HIGH',
    is_active: true,
    category: 'LOCATION',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-05',
    rule_code: 'RULE_05',
    name: 'Multiple Countries in Impossible Timeframe',
    description: 'Physical travel velocity anomaly: transactions recorded in geographically distant nations within under 60 minutes.',
    threshold: 60,
    risk_score: 30,
    severity: 'CRITICAL',
    is_active: true,
    category: 'LOCATION',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-06',
    rule_code: 'RULE_06',
    name: 'Unrecognized Device Fingerprint',
    description: 'Transaction initiated from a hardware fingerprint or browser device never previously bound to customer account.',
    threshold: 1,
    risk_score: 20,
    severity: 'MEDIUM',
    is_active: true,
    category: 'DEVICE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-07',
    rule_code: 'RULE_07',
    name: 'High-Risk Merchant Category',
    description: 'Payment routing to high-vulnerability MCCs (Cryptocurrency Exchange, Offshore Gaming, Unregulated Wire Remittance).',
    threshold: 1,
    risk_score: 15,
    severity: 'MEDIUM',
    is_active: true,
    category: 'MERCHANT',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-08',
    rule_code: 'RULE_08',
    name: 'Repeated Failed Authorization Attempts',
    description: 'Two or more failed PIN or CVV authorization attempts preceding the current transaction execution within 10 minutes.',
    threshold: 2,
    risk_score: 15,
    severity: 'MEDIUM',
    is_active: true,
    category: 'BEHAVIOR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-09',
    rule_code: 'RULE_09',
    name: 'Dormant Account Sudden High Surge',
    description: 'Significant financial movement exceeding ₹50,000 on an account with zero debit activity for > 90 days.',
    threshold: 50000,
    risk_score: 18,
    severity: 'MEDIUM',
    is_active: true,
    category: 'BEHAVIOR',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'rule-10',
    rule_code: 'RULE_10',
    name: 'Tor or Proxy IP Address Detected',
    description: 'Connection IP address belongs to known commercial VPN, Tor exit node, or anonymous hosting provider.',
    threshold: 1,
    risk_score: 25,
    severity: 'HIGH',
    is_active: true,
    category: 'DEVICE',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  }
];

// Helper to generate 105 realistic customers with accounts, histories, and baseline data
export function generateSeedData() {
  const firstNames = [
    'Arun', 'Pooja', 'Rohan', 'Sneha', 'Deepak', 'Kavita', 'Aditya', 'Nisha',
    'Rajesh', 'Sunita', 'Amit', 'Meera', 'Karthik', 'Divya', 'Sanjay', 'Geeta',
    'Manish', 'Anjali', 'Gaurav', 'Swati', 'Harish', 'Ritu', 'Naveen', 'Shilpa',
    'Siddharth', 'Pallavi', 'Vivek', 'Neha', 'Alok', 'Rashmi', 'Manoj', 'Preeti',
    'Abhishek', 'Tanvi', 'Varun', 'Bhavna', 'Rahul', 'Sapna', 'Sameer', 'Monika',
    'Kunal', 'Reena', 'Mohit', 'Shruti', 'Praveen', 'Aparna', 'Tarun', 'Archana'
  ];

  const lastNames = [
    'Kumar', 'Sharma', 'Patel', 'Sundaram', 'Iyer', 'Reddy', 'Gupta', 'Verma',
    'Singh', 'Nair', 'Menon', 'Rao', 'Bose', 'Chatterjee', 'Deshmukh', 'Jadhav',
    'Mehta', 'Shah', 'Agarwal', 'Chopra', 'Malhotra', 'Bhat', 'Pillai', 'Murthy'
  ];

  const citiesIndia = [
    { city: 'Chennai', country: 'India' },
    { city: 'Mumbai', country: 'India' },
    { city: 'Bengaluru', country: 'India' },
    { city: 'Hyderabad', country: 'India' },
    { city: 'Delhi', country: 'India' },
    { city: 'Kolkata', country: 'India' },
    { city: 'Pune', country: 'India' },
    { city: 'Ahmedabad', country: 'India' },
  ];

  const foreignLocations = [
    { city: 'Dubai', country: 'United Arab Emirates' },
    { city: 'Singapore', country: 'Singapore' },
    { city: 'London', country: 'United Kingdom' },
    { city: 'New York', country: 'United States' },
    { city: 'Sydney', country: 'Australia' },
    { city: 'Frankfurt', country: 'Germany' },
    { city: 'Lagos', country: 'Nigeria' },
    { city: 'Kyiv', country: 'Ukraine' },
  ];

  const merchants = [
    { name: 'Amazon India', category: 'E-Commerce Retail' },
    { name: 'Flipkart Online', category: 'E-Commerce Retail' },
    { name: 'Apple Store Regent St', category: 'Electronics & Gadgets' },
    { name: 'Croma Megastore', category: 'Electronics & Gadgets' },
    { name: 'Apollo Pharmacy', category: 'Healthcare & Pharma' },
    { name: 'Taj Hotels & Resorts', category: 'Hospitality & Luxury' },
    { name: 'IndiGo Airlines', category: 'Travel & Aviation' },
    { name: 'MakeMyTrip Bookings', category: 'Travel & Aviation' },
    { name: 'Binance Global P2P', category: 'Cryptocurrency Exchange' },
    { name: 'Bitstamp Crypto Corp', category: 'Cryptocurrency Exchange' },
    { name: 'Bet365 Casino Services', category: 'Gambling & Gaming' },
    { name: 'Global Wire Remittance Inc', category: 'Wire Remittance' },
    { name: 'Malabar Gold & Diamonds', category: 'Luxury Jewelry' },
    { name: 'Zomato Food Delivery', category: 'Food & Dining' },
    { name: 'Swiggy Instamart', category: 'Grocery & Essentials' },
    { name: 'Reliance Digital', category: 'Electronics & Gadgets' }
  ];

  const customers: Customer[] = [];
  const accounts: Account[] = [];

  // Generate 105 Customers
  for (let i = 1; i <= 105; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const name = `${fn} ${ln}`;
    const ref = `CUST-${1000 + i}`;
    const baseLoc = citiesIndia[i % citiesIndia.length];
    const isHighRisk = i % 14 === 0;
    const isMediumRisk = i % 5 === 0 && !isHighRisk;
    const riskLevel = isHighRisk ? 'CRITICAL' : isMediumRisk ? 'HIGH' : i % 3 === 0 ? 'MEDIUM' : 'LOW';
    const custType = i % 8 === 0 ? 'BUSINESS' : i % 5 === 0 ? 'PREMIUM' : 'INDIVIDUAL';
    const baseAvg = (1500 + (i * 280) % 25000);

    const custId = `cst-${i.toString().padStart(3, '0')}`;
    const primaryDeviceId = `dev-hw-${1000 + i}`;
    const knownDevices = [primaryDeviceId];
    if (i % 2 === 0) knownDevices.push(`dev-mobile-${2000 + i}`);

    const customer: Customer = {
      id: custId,
      customer_reference: ref,
      name,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@demo-bank.in`,
      phone: `+91 9840${(100000 + i * 73).toString().slice(0, 6)}`,
      country: baseLoc.country,
      city: baseLoc.city,
      customer_type: custType,
      risk_level: riskLevel,
      account_status: isHighRisk && i % 28 === 0 ? 'RESTRICTED' : 'ACTIVE',
      historical_avg_amount: baseAvg,
      known_devices: knownDevices,
      known_locations: [`${baseLoc.city}, ${baseLoc.country}`],
      total_transactions: 0,
      fraud_alerts_count: 0,
      total_spend: 0,
      created_at: new Date(Date.now() - (180 - i) * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    customers.push(customer);

    // Account 1
    const accId = `acc-${i.toString().padStart(3, '0')}-A`;
    accounts.push({
      id: accId,
      account_number: `623400${(1000000 + i * 49).toString()}`,
      customer_id: custId,
      currency: 'INR',
      balance: Math.round(50000 + (i * 12340) % 850000),
      status: 'ACTIVE',
      created_at: customer.created_at,
    });

    // Account 2 for premium / business
    if (custType !== 'INDIVIDUAL') {
      accounts.push({
        id: `acc-${i.toString().padStart(3, '0')}-B`,
        account_number: `789100${(2000000 + i * 31).toString()}`,
        customer_id: custId,
        currency: 'INR',
        balance: Math.round(150000 + (i * 45000) % 2500000),
        status: 'ACTIVE',
        created_at: customer.created_at,
      });
    }
  }

  // Generate 520 Historical Transactions
  const transactions: Transaction[] = [];
  const alerts: FraudAlert[] = [];
  const investigations: Investigation[] = [];
  const auditLogs: AuditLog[] = [];

  const browsers = ['Chrome 122.0', 'Safari 17.3', 'Firefox 124.0', 'Edge 122.0'];
  const osList = ['macOS Sonoma', 'Windows 11 Pro', 'iOS 17.4', 'Android 14'];
  const types: ('PURCHASE' | 'TRANSFER' | 'ATM_WITHDRAWAL' | 'ONLINE_PAYMENT')[] = ['PURCHASE', 'TRANSFER', 'ATM_WITHDRAWAL', 'ONLINE_PAYMENT'];

  const now = Date.now();

  for (let t = 1; t <= 520; t++) {
    const cust = customers[t % customers.length];
    const acc = accounts.find(a => a.customer_id === cust.id) || accounts[0];
    const m = merchants[t % merchants.length];
    const txnType = types[t % types.length];

    // Determine if this transaction will trigger fraud rules
    const isCritical = t % 15 === 0;
    const isHigh = t % 7 === 0 && !isCritical;
    const isSuspicious = isCritical || isHigh || (t % 11 === 0);

    let amount = Math.round(500 + ((t * 89) % (cust.historical_avg_amount * 1.5)));
    let country = cust.country;
    let city = cust.city;
    let deviceId = cust.known_devices[0];
    let ip = `49.37.${(t % 250)}.${(t % 240) + 10}`;
    const triggeredRules: any[] = [];
    let riskScore = 8 + (t % 18);
    let fraudReason = '';

    // Create realistic fraud scenarios
    if (isCritical) {
      // Massive transaction + high risk merchant + foreign country + new device
      amount = 145000 + ((t * 430) % 450000);
      const foreignLoc = foreignLocations[t % foreignLocations.length];
      country = foreignLoc.country;
      city = foreignLoc.city;
      deviceId = `unrecognized-botnet-node-${9000 + t}`;
      ip = `185.220.101.${(t % 200) + 1}`; // known suspicious proxy range

      triggeredRules.push({
        rule_id: 'rule-01',
        rule_code: 'RULE_01',
        rule_name: 'Large Transaction Amount',
        score_contribution: 25,
        description: `Amount ₹${amount.toLocaleString('en-IN')} exceeds threshold ₹1,00,000`,
        metric_value: amount,
        threshold_value: 100000,
      });

      triggeredRules.push({
        rule_id: 'rule-03',
        rule_code: 'RULE_03',
        rule_name: 'Unusual Amount Deviation',
        score_contribution: 22,
        description: `Amount is ${(amount / cust.historical_avg_amount).toFixed(1)}x higher than customer average (₹${cust.historical_avg_amount.toFixed(0)})`,
        metric_value: (amount / cust.historical_avg_amount).toFixed(1),
        threshold_value: 3.5,
      });

      triggeredRules.push({
        rule_id: 'rule-04',
        rule_code: 'RULE_04',
        rule_name: 'Unusual Geolocation',
        score_contribution: 25,
        description: `Transaction initiated from unrecognized jurisdiction: ${city}, ${country}`,
        metric_value: `${city}, ${country}`,
      });

      triggeredRules.push({
        rule_id: 'rule-06',
        rule_code: 'RULE_06',
        rule_name: 'Unrecognized Device Fingerprint',
        score_contribution: 20,
        description: `Hardware signature ${deviceId} has never been verified for customer ${cust.customer_reference}`,
        metric_value: deviceId,
      });

      riskScore = Math.min(100, 25 + 22 + 25 + 20); // 92
      fraudReason = `Critical risk: Transaction of ₹${amount.toLocaleString('en-IN')} exceeds threshold, deviates ${(amount / cust.historical_avg_amount).toFixed(1)}x from customer average, originates from unrecognized location (${city}, ${country}) and uses an unregistered device signature.`;
    } else if (isHigh) {
      // Large amount or high risk merchant + unusual amount
      amount = 88000 + ((t * 220) % 95000);
      deviceId = `new-mobile-device-${8000 + t}`;

      triggeredRules.push({
        rule_id: 'rule-03',
        rule_code: 'RULE_03',
        rule_name: 'Unusual Amount Deviation',
        score_contribution: 22,
        description: `Amount ₹${amount.toLocaleString('en-IN')} deviates significantly from historical baseline`,
        metric_value: (amount / cust.historical_avg_amount).toFixed(1),
        threshold_value: 3.5,
      });

      triggeredRules.push({
        rule_id: 'rule-06',
        rule_code: 'RULE_06',
        rule_name: 'Unrecognized Device Fingerprint',
        score_contribution: 20,
        description: `New device detected: ${deviceId}`,
        metric_value: deviceId,
      });

      if (m.category.includes('Cryptocurrency') || m.category.includes('Wire') || m.category.includes('Gambling')) {
        triggeredRules.push({
          rule_id: 'rule-07',
          rule_code: 'RULE_07',
          rule_name: 'High-Risk Merchant Category',
          score_contribution: 15,
          description: `Transaction targeted high-vulnerability category: ${m.category}`,
          metric_value: m.category,
        });
      }

      riskScore = Math.min(79, 22 + 20 + (triggeredRules.length > 2 ? 15 : 20));
      fraudReason = `High risk flagged due to ${triggeredRules.map(r => r.rule_name).join(' + ')}.`;
    }

    const riskLevel: any = riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : riskScore >= 30 ? 'MEDIUM' : 'LOW';
    const status: any = isCritical ? 'BLOCKED' : isHigh && t % 2 === 0 ? 'FAILED' : 'COMPLETED';

    // Timestamp spread over the last 14 days, with recent ones in the last 2 hours
    const timeOffset = t > 480 
      ? (520 - t) * 120000 // Last 80 mins
      : (520 - t) * 45 * 60000; // Last 14 days
    const txnTime = new Date(now - timeOffset).toISOString();

    const txnId = `txn-${(100000 + t).toString()}`;
    const txn: Transaction = {
      id: txnId,
      transaction_reference: `TXN-${100000 + t}`,
      customer_id: cust.id,
      customer_name: cust.name,
      account_id: acc.id,
      amount,
      currency: 'INR',
      transaction_type: txnType,
      merchant: m.name,
      merchant_category: m.category,
      country,
      city,
      device_id: deviceId,
      device_browser: browsers[t % browsers.length],
      device_os: osList[t % osList.length],
      ip_address: ip,
      timestamp: txnTime,
      status,
      risk_score: riskScore,
      risk_level: riskLevel,
      is_suspicious: isSuspicious,
      fraud_reason: fraudReason || undefined,
      triggered_rules: triggeredRules.length > 0 ? triggeredRules : undefined,
      created_at: txnTime,
    };
    transactions.push(txn);

    // Update customer stats
    cust.total_transactions += 1;
    cust.total_spend += amount;

    // Create Fraud Alert if score >= 60
    if (riskScore >= 60) {
      cust.fraud_alerts_count += 1;
      const alertId = `alt-${alerts.length + 1}`;
      const alertRef = `ALT-${(50000 + alerts.length + 1).toString()}`;
      const alertStatus: any = alerts.length % 5 === 0 
        ? 'RESOLVED' 
        : alerts.length % 4 === 0 
        ? 'INVESTIGATING' 
        : alerts.length % 7 === 0 
        ? 'FALSE_POSITIVE' 
        : alerts.length % 6 === 0 
        ? 'ESCALATED' 
        : 'OPEN';

      const alert: FraudAlert = {
        id: alertId,
        alert_reference: alertRef,
        transaction_id: txn.id,
        customer_id: cust.id,
        customer_name: cust.name,
        transaction_amount: amount,
        currency: 'INR',
        rule_ids: triggeredRules.map(r => r.rule_id),
        triggered_rules: triggeredRules,
        risk_score: riskScore,
        severity: riskLevel,
        reason: fraudReason,
        status: alertStatus,
        assigned_to: alertStatus !== 'OPEN' ? 'usr-investigator-01' : undefined,
        assigned_name: alertStatus !== 'OPEN' ? 'Marcus Vance' : undefined,
        created_at: txnTime,
        updated_at: new Date(new Date(txnTime).getTime() + 15 * 60000).toISOString(),
      };
      alerts.push(alert);

      // Create Investigation record
      const invId = `inv-${investigations.length + 1}`;
      const inv: Investigation = {
        id: invId,
        alert_id: alert.id,
        alert_reference: alert.alert_reference,
        transaction_id: txn.id,
        customer_id: cust.id,
        customer_name: cust.name,
        investigator_id: alertStatus !== 'OPEN' ? 'usr-investigator-01' : undefined,
        investigator_name: alertStatus !== 'OPEN' ? 'Marcus Vance' : undefined,
        status: alertStatus,
        priority: riskLevel,
        conclusion: alertStatus === 'RESOLVED' 
          ? 'Card compromised via unauthorized offshore POS terminal. Customer verified fraudulent charge; card frozen and refund initiated.' 
          : alertStatus === 'FALSE_POSITIVE'
          ? 'Customer verified travel to location and authentic authorization via mobile banking biometrics.'
          : undefined,
        notes: [
          {
            id: `note-${invId}-1`,
            investigation_id: invId,
            author_id: 'system',
            author_name: 'Fraud Engine Bot',
            note: `Automated alert triggered: ${fraudReason}`,
            action_taken: 'Alert Registered',
            created_at: txnTime,
          }
        ],
        created_at: txnTime,
        updated_at: alert.updated_at,
      };

      if (alertStatus === 'INVESTIGATING' || alertStatus === 'RESOLVED' || alertStatus === 'ESCALATED') {
        inv.notes.push({
          id: `note-${invId}-2`,
          investigation_id: invId,
          author_id: 'usr-investigator-01',
          author_name: 'Marcus Vance',
          note: 'Customer contacted through registered communication channel. Verified recent travel & transaction intent.',
          action_taken: 'Customer Contacted',
          created_at: new Date(new Date(txnTime).getTime() + 10 * 60000).toISOString(),
        });
      }

      investigations.push(inv);
    }
  }

  // Seed Audit Logs
  auditLogs.push(
    {
      id: 'aud-001',
      user_id: 'usr-admin-01',
      user_name: 'admin123',
      action: 'SYSTEM_INITIALIZATION',
      entity: 'SYSTEM',
      entity_id: 'SYS-CORE',
      description: 'FraudGuard Enterprise Rule Engine booted with 10 standard financial surveillance rules.',
      ip_address: '10.0.4.12',
      created_at: new Date(now - 7 * 86400000).toISOString(),
    },
    {
      id: 'aud-002',
      user_id: 'usr-admin-01',
      user_name: 'admin123',
      action: 'RULE_THRESHOLD_UPDATE',
      entity: 'FRAUD_RULE',
      entity_id: 'RULE_01',
      description: 'Updated large transaction ceiling threshold to ₹1,00,000 based on Q1 AML risk directives.',
      ip_address: '10.0.4.12',
      created_at: new Date(now - 4 * 86400000).toISOString(),
    },
    {
      id: 'aud-003',
      user_id: 'usr-investigator-01',
      user_name: 'Marcus Vance',
      action: 'INVESTIGATION_STATUS_CHANGED',
      entity: 'INVESTIGATION',
      entity_id: 'ALT-50005',
      description: 'Marked alert ALT-50005 as RESOLVED after customer confirmed unauthorized card usage.',
      ip_address: '10.0.8.44',
      created_at: new Date(now - 1 * 86400000).toISOString(),
    },
    {
      id: 'aud-004',
      user_id: 'usr-analyst-01',
      user_name: 'Priya Sundaram',
      action: 'TRANSACTION_SIMULATOR_EXECUTION',
      entity: 'SIMULATOR',
      entity_id: 'SIM-BATCH-01',
      description: 'Executed synthetic transaction stream for high-velocity stress test.',
      ip_address: '10.0.9.15',
      created_at: new Date(now - 2 * 3600000).toISOString(),
    }
  );

  return {
    users: INITIAL_USERS,
    customers,
    accounts,
    fraudRules: INITIAL_FRAUD_RULES,
    transactions,
    alerts,
    investigations,
    auditLogs,
    settings: INITIAL_SETTINGS,
  };
}
