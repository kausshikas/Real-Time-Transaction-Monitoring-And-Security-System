import { transactionService } from '../services/transactionService';
import { storage } from '../db/storage';
import { sseManager } from '../events/sseManager';

class SimulatorService {
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private intervalMs: number = 3000;
  private generatedCount: number = 0;

  constructor() {
    // Default config from storage settings
    const settings = storage.getSettings();
    this.intervalMs = settings.simulator_interval_ms || 3000;
  }

  public getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      generatedCount: this.generatedCount,
    };
  }

  public start(intervalMs?: number): { success: boolean; message: string; status: any } {
    if (this.isRunning) {
      return { success: true, message: 'Simulator already active.', status: this.getStatus() };
    }

    if (intervalMs && intervalMs >= 500) {
      this.intervalMs = intervalMs;
    }

    this.isRunning = true;
    this.timer = setInterval(async () => {
      try {
        await this.generateRandomTransaction();
      } catch (err) {
        console.error('[Simulator] Error emitting auto-generated transaction:', err);
      }
    }, this.intervalMs);

    sseManager.broadcast('simulator:status', this.getStatus());
    return { success: true, message: 'Simulator started.', status: this.getStatus() };
  }

  public stop(): { success: boolean; message: string; status: any } {
    if (!this.isRunning) {
      return { success: true, message: 'Simulator already stopped.', status: this.getStatus() };
    }

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    sseManager.broadcast('simulator:status', this.getStatus());
    return { success: true, message: 'Simulator stopped.', status: this.getStatus() };
  }

  public setIntervalTime(ms: number) {
    this.intervalMs = Math.max(500, ms);
    if (this.isRunning) {
      this.stop();
      this.start(this.intervalMs);
    }
    sseManager.broadcast('simulator:status', this.getStatus());
  }

  /**
   * Generates a realistic transaction based on scenario probabilities
   */
  public async generateRandomTransaction() {
    const rand = Math.random();
    const settings = storage.getSettings();

    if (rand < settings.simulator_normal_prob) {
      return this.generateScenario('NORMAL');
    } else if (rand < settings.simulator_normal_prob + settings.simulator_suspicious_prob) {
      return this.generateScenario('SUSPICIOUS');
    } else {
      return this.generateScenario('CRITICAL');
    }
  }

  /**
   * Generates targeted scenario transactions for review & viva demonstrations
   */
  public async generateScenario(type: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL') {
    const customersRes = storage.getCustomers({ limit: 40 });
    const customers = customersRes.data;
    if (customers.length === 0) throw new Error('No customers found');

    const cust = customers[Math.floor(Math.random() * customers.length)];
    this.generatedCount += 1;

    let payload: any;

    if (type === 'NORMAL') {
      // Small/medium amount, familiar merchant, verified device, home city
      const normalMerchants = [
        { name: 'Amazon India', category: 'E-Commerce Retail' },
        { name: 'Zomato Food Delivery', category: 'Food & Dining' },
        { name: 'Swiggy Instamart', category: 'Grocery & Essentials' },
        { name: 'Apollo Pharmacy', category: 'Healthcare & Pharma' },
        { name: 'IndiGo Airlines', category: 'Travel & Aviation' },
      ];
      const m = normalMerchants[Math.floor(Math.random() * normalMerchants.length)];
      const amount = Math.round(350 + Math.random() * (cust.historical_avg_amount * 0.9));

      payload = {
        customer_id: cust.id,
        amount,
        currency: 'INR',
        transaction_type: 'PURCHASE',
        merchant: m.name,
        merchant_category: m.category,
        country: cust.country,
        city: cust.city,
        device_id: cust.known_devices[0] || 'dev-registered-01',
        device_browser: 'Chrome 122.0',
        device_os: 'Android 14',
        ip_address: `49.37.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      };
    } else if (type === 'SUSPICIOUS') {
      // Deviates from average, high risk merchant or new device
      const suspiciousMerchants = [
        { name: 'Bet365 Casino Services', category: 'Gambling & Gaming' },
        { name: 'Binance Global P2P', category: 'Cryptocurrency Exchange' },
        { name: 'Malabar Gold & Diamonds', category: 'Luxury Jewelry' },
        { name: 'Global Wire Remittance Inc', category: 'Wire Remittance' },
      ];
      const m = suspiciousMerchants[Math.floor(Math.random() * suspiciousMerchants.length)];
      const amount = Math.round(cust.historical_avg_amount * (3.8 + Math.random() * 2));

      payload = {
        customer_id: cust.id,
        amount,
        currency: 'INR',
        transaction_type: 'ONLINE_PAYMENT',
        merchant: m.name,
        merchant_category: m.category,
        country: cust.country,
        city: cust.city,
        device_id: `unverified-device-${Math.floor(1000 + Math.random() * 9000)}`,
        device_browser: 'Safari 17.2',
        device_os: 'iOS 17.3',
        ip_address: `103.21.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      };
    } else {
      // CRITICAL: Massive amount > ₹1,00,000 + impossible location (Lagos / Kyiv / Dubai) + botnet device + TOR IP
      const criticalForeign = [
        { city: 'Lagos', country: 'Nigeria' },
        { city: 'Kyiv', country: 'Ukraine' },
        { city: 'Dubai', country: 'United Arab Emirates' },
        { city: 'Frankfurt', country: 'Germany' }
      ];
      const loc = criticalForeign[Math.floor(Math.random() * criticalForeign.length)];
      const amount = Math.round(135000 + Math.random() * 350000);

      payload = {
        customer_id: cust.id,
        amount,
        currency: 'INR',
        transaction_type: 'TRANSFER',
        merchant: 'Bitstamp Crypto Corp Remit',
        merchant_category: 'Cryptocurrency Exchange',
        country: loc.country,
        city: loc.city,
        device_id: `botnet-emulation-node-${Math.floor(10000 + Math.random() * 90000)}`,
        device_browser: 'Headless Chrome / Tor Browser',
        device_os: 'Linux x86_64',
        ip_address: `185.220.101.${Math.floor(10 + Math.random() * 200)}`, // Known Tor exit pattern
      };
    }

    const result = await transactionService.processTransaction(payload);
    sseManager.broadcast('simulator:status', this.getStatus());
    return result;
  }
}

export const simulatorService = new SimulatorService();
