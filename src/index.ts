export type TransactionStatus = 
  | 'INITIATED' 
  | 'PSP_PENDING' 
  | 'SETTLED_CONSENSUS' 
  | 'DISPUTED_MISMATCH' 
  | 'PSP_FAILED' 
  | 'FAILED_PERMANENT';

export interface VerifyResult {
  success: boolean;
  status: TransactionStatus;
  message?: string;
}

export interface SolydPackage {
  id: number;
  identifier: string;
  entitlement_id: string;
  name: string;
  amount_kobo: number;
  calculated_amount_kobo: number;
  is_upgrade: boolean;
  currency: string;
  duration: string;
  tier_level: number;
  is_variable_price: boolean;
}

export interface CustomerInfo {
  user_id: string;
  active: Record<string, boolean>;
  entitlements: Record<string, string>;
}

class SolydFlowClient {
  private apiKey: string | null = null;
  private userId: string | null = null;
  private baseUrl = "https://api.solydflow.com/api/v1";

  /**
   * Initialize the SDK
   */
  public async configure(apiKey: string, userId: string): Promise<void> {
    this.apiKey = apiKey;
    this.userId = userId;
    
    // Warm-up handshake
    try {
      await this.getCustomerInfo();
    } catch (e) {
      console.warn("SolydFlow Init Warning:", e);
    }
  }

  /**
   * Fetch localized packages based on IP and Proration math
   */
  public async getOfferings(silent: boolean = false): Promise<SolydPackage[]> {
    this.requireConfig();
    
    if (!silent) {
      this.trackEvent("paywall_viewed");
    }

    const res = await fetch(`${this.baseUrl}/offerings?user_id=${this.userId}`, {
      method: "GET",
      headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to fetch offerings");
    
    const data = await res.json();
    return data.offerings || [];
  }

  /**
   * Check access instantly (Note: Web doesn't have secure local storage like mobile, so it fetches fresh)
   */
  public async hasEntitlement(entitlementId: string): Promise<boolean> {
    const info = await this.getCustomerInfo();
    return !!info.active[entitlementId];
  }

  /**
   * Fetch current user status
   */
  public async getCustomerInfo(): Promise<CustomerInfo> {
    this.requireConfig();
    const res = await fetch(`${this.baseUrl}/status?user_id=${this.userId}`, {
      method: "GET",
      headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" }
    });

    if (!res.ok) throw new Error("Failed to fetch customer info");
    return await res.json();
  }

  /**
   * Initialize checkout and redirect the browser
   */
  public async purchasePackage(packageIdentifier: string, userPhone?: string, customAmountKobo?: number): Promise<void> {
    this.requireConfig();
    
    const payload = {
      user_id: this.userId,
      package_identifier: packageIdentifier,
      email: `${this.userId}@solydflow.app`,
      phone: userPhone || "",
      custom_amount_kobo: customAmountKobo || 0,
      telemetry: { 
        network_type: "wifi", // Default for web
        device_os: "web",
        latency_ms: 0,
        device_model: navigator.userAgent.substring(0, 50),
        battery_level: 100
      }
    };

    const res = await fetch(`${this.baseUrl}/pay/initialize`, {
      method: "POST",
      headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    
    // Redirect browser to Paystack/Flutterwave/Stripe hosted checkout
    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      throw new Error(data.error || "Failed to get checkout URL");
    }
  }

  /**
   * Verify a transaction after returning from a hosted checkout redirect.
   * Call this on your success page using the ?reference= URL parameter.
   */
  public async verifyTransaction(reference: string): Promise<VerifyResult> {
    this.requireConfig();

    try {
      const res = await fetch(`${this.baseUrl}/pay/verify`, {
        method: "POST",
        headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" },
        body: JSON.stringify({ reference })
      });

      const data = await res.json();
      const status = data.status as TransactionStatus;

      // 🟢 Absolute Truth
      if (status === 'SETTLED_CONSENSUS') {
        // Refresh customer info to cache new entitlements
        await this.getCustomerInfo();
        return { success: true, status };
      } 
      // 🟡 Manual Review Needed
      else if (status === 'DISPUTED_MISMATCH') {
        return { 
          success: false, 
          status, 
          message: "Payment is under review. Access will be granted shortly." 
        };
      } 
      // 🔴 Hard Fail
      else if (status === 'PSP_FAILED' || status === 'FAILED_PERMANENT') {
        return { success: false, status, message: "Payment failed or was declined." };
      } 
      // ⚪ Still Processing
      else {
        return { success: false, status, message: "Payment is still processing." };
      }

    } catch (e) {
      console.error("Verification error:", e);
      return { success: false, status: 'INITIATED', message: "Network error during verification." };
    }
  }

  /**
   * Generic Event Tracker
   */
  public async trackEvent(eventType: string, metadata: Record<string, any> = {}): Promise<void> {
    if (!this.apiKey || !this.userId) return;
    
    fetch(`${this.baseUrl}/event`, {
        method: "POST",
        headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: this.userId, 
          event_type: eventType, 
          metadata: JSON.stringify(metadata) 
        })
    }).catch(() => {}); // Silent fail
  }

  private requireConfig() {
    if (!this.apiKey || !this.userId) throw new Error("Call SolydFlow.configure() first.");
  }
}

export const SolydFlow = new SolydFlowClient();