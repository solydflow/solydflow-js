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
  active_packages: any[];
  entitlements: Record<string, string>;
}

class SolydDialog {
  private static container: HTMLElement | null = null;

  public static show(instruction: string, virtualAccount?: any, onCancel?: () => void) {
    if (this.container) this.hide(); // Prevent duplicates

    this.container = document.createElement('div');
    this.container.id = 'solydflow-action-dialog';
    
    // Inject CSS styles directly so developers don't need a separate stylesheet
    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0', left: '0', width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '999999',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      opacity: '0',
      transition: 'opacity 0.3s ease'
    });

    let vaHtml = '';
    if (virtualAccount) {
      vaHtml = `
        <div style="margin-top: 20px; background: #000; border: 1px solid #333; border-radius: 12px; padding: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #888; text-transform: uppercase; font-weight: bold;">${virtualAccount.bank_name || 'Bank Transfer'}</p>
          <p style="margin: 0; font-size: 28px; font-weight: 900; color: #fff; letter-spacing: 2px;">${virtualAccount.account_number}</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #666;">${virtualAccount.account_name}</p>
        </div>
      `;
    }

    this.container.innerHTML = `
      <div style="background: #111; border: 1px solid #222; border-radius: 24px; padding: 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); position: relative; transform: translateY(20px); transition: transform 0.3s ease;">
        
        <!-- Animated Pulse Ring -->
        <div style="position: relative; width: 64px; height: 64px; margin: 0 auto 24px auto;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 3px solid #EA580C; border-radius: 50%; border-top-color: transparent; animation: solyd-spin 1s linear infinite;"></div>
          <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; background: rgba(234, 88, 12, 0.1); border-radius: 50%;"></div>
        </div>

        <h3 style="margin: 0 0 12px 0; color: #fff; font-size: 20px; font-weight: 800;">Action Required</h3>
        <p style="margin: 0; color: #aaa; font-size: 14px; line-height: 1.5;">${instruction}</p>
        
        ${vaHtml}

        <p style="margin: 24px 0 0 0; color: #EA580C; font-size: 12px; font-weight: 600; animation: solyd-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;">
          Awaiting confirmation...
        </p>

        <button id="solydflow-cancel-btn" style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: #666; cursor: pointer; padding: 8px; border-radius: 50%;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
        </button>
      </div>

      <style>
        @keyframes solyd-spin { to { transform: rotate(360deg); } }
        @keyframes solyd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    `;

    document.body.appendChild(this.container);

    // Trigger animations
    requestAnimationFrame(() => {
      if (this.container) {
        this.container.style.opacity = '1';
        (this.container.firstElementChild as HTMLElement).style.transform = 'translateY(0)';
      }
    });

    // Handle Cancel
    const cancelBtn = document.getElementById('solydflow-cancel-btn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        this.hide();
        if (onCancel) onCancel();
      };
    }
  }

  public static hide() {
    if (this.container) {
      this.container.style.opacity = '0';
      const el = this.container;
      setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 300); // Wait for fade out
      this.container = null;
    }
  }

  public static showError(title: string, message: string, onClose?: () => void) {
    if (!this.container) {
      // Failsafe in case it was already closed
      this.container = document.createElement('div');
      this.container.id = 'solydflow-action-dialog';
      Object.assign(this.container.style, {
        position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: '999999', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        opacity: '1'
      });
      document.body.appendChild(this.container);
    }

    // 🟢 Inject the Red Error UI
    this.container.innerHTML = `
      <div style="background: #111; border: 1px solid #333; border-radius: 24px; padding: 32px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); position: relative; animation: solyd-shake 0.4s cubic-bezier(.36,.07,.19,.97) both;">
        
        <!-- Red Error Circle -->
        <div style="width: 64px; height: 64px; margin: 0 auto 24px auto; background: rgba(220, 38, 38, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #DC2626;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <h3 style="margin: 0 0 12px 0; color: #fff; font-size: 20px; font-weight: 800;">${title}</h3>
        <p style="margin: 0 0 32px 0; color: #aaa; font-size: 14px; line-height: 1.5;">${message}</p>
        
        <button id="solydflow-close-error-btn" style="background: #fff; color: #000; border: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s ease; font-size: 14px;">
          Close & Try Again
        </button>
      </div>

      <style>
        @keyframes solyd-shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      </style>
    `;

    const closeBtn = document.getElementById('solydflow-close-error-btn');
    if (closeBtn) {
      closeBtn.onclick = () => {
        this.hide();
        if (onClose) onClose();
      };
    }
  }
}

class SolydFlowClient {
  private apiKey: string | null = null;
  private userId: string | null = null;
  private userEmail: string | null = null;
  private baseUrl = "https://api.solydflow.com/api/v1";
  private pollingInterval: any = null;

  /**
   * Initialize the SDK
   */
  public async configure(apiKey: string, userId: string, userEmail?: string): Promise<void> {
    this.apiKey = apiKey;
    this.userId = userId;
    this.userEmail = userEmail || null;
    
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
   * Gather Real-Time Web Telemetry for AI Training
   */
  private async collectTelemetry(): Promise<Record<string, any>> {
    let latency_ms = 0;
    let network_type = "wifi"; // Default fallback
    let battery_level = 100;
    let device_os = "web";
    let device_model = "browser";

    try {
      // 1. LATENCY PING: Measure actual round-trip time to our server
      const start = performance.now();
      // Using a lightweight endpoint or root to measure speed
      await fetch("https://api.solydflow.com/api/admin/health", { method: "HEAD", mode: "no-cors" }).catch(() => {});
      latency_ms = Math.round(performance.now() - start);
    } catch (e) {
      latency_ms = -1; // Indication of network failure
    }

    // 2. NETWORK TYPE: Use the HTML5 Network Information API
    // Returns "4g", "3g", "2g", or "slow-2g"
    const nav = navigator as any; // Cast to any to bypass TS strict checking for experimental APIs
    if (nav.connection && nav.connection.effectiveType) {
      network_type = nav.connection.effectiveType;
    }

    // 3. BATTERY LEVEL: Use the HTML5 Battery Status API
    try {
      if (nav.getBattery) {
        const battery = await nav.getBattery();
        battery_level = Math.round(battery.level * 100);
      }
    } catch (e) {}

    // 4. DEVICE OS & MODEL: Parse User Agent
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("android")) device_os = "android";
    else if (ua.includes("iphone") || ua.includes("ipad")) device_os = "ios";
    else if (ua.includes("mac")) device_os = "macos";
    else if (ua.includes("windows")) device_os = "windows";

    if (ua.includes("edg/")) device_model = "Edge";
    else if (ua.includes("chrome/")) device_model = "Chrome";
    else if (ua.includes("safari/") && !ua.includes("chrome/")) device_model = "Safari";
    else if (ua.includes("firefox/")) device_model = "Firefox";

    return {
      network_type,
      latency_ms,
      device_os,
      device_model,
      battery_level
    };
  }

  /**
   * Initialize checkout and redirect the browser
   */
  public async purchasePackage(
    packageIdentifier: string, 
    userPhone?: string, 
    customAmountKobo?: number, 
    userEmail?: string,
  ): Promise<void> {
    this.requireConfig();

    // FETCH REAL TELEMETRY
    const telemetryData = await this.collectTelemetry();

    // 🟢 1. IMMEDIATELY open a popup to bypass browser popup blockers.
    // We open it centered on the user's screen.
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    let popupWindow: Window | null = window.open(
      '', 
      'SolydFlowSecureCheckout', 
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
    );

    // Give it a beautiful loading state while we hit the Go backend
    if (popupWindow) {
      popupWindow.document.write(`
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #fafafa; color: #333;">
          <svg style="width: 40px; height: 40px; animation: spin 1s linear infinite; color: #EA580C;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p style="margin-top: 16px; font-weight: 600;">Securing checkout session...</p>
          <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
        </div>
      `);
    }
    
    const payload = {
      user_id: this.userId,
      package_identifier: packageIdentifier,
      email: userEmail || this.userEmail || "",
      phone: userPhone || "",
      custom_amount_kobo: customAmountKobo || 0,
      telemetry: telemetryData
    };

    try {
      const res = await fetch(`${this.baseUrl}/pay/initialize`, {
        method: "POST",
        headers: { "X-API-Key": this.apiKey!, "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      // Redirect browser to Paystack/Flutterwave/Stripe hosted checkout
      // 1. Check for Standard Redirect (Paystack/Stripe/Monnify Fallback)
      if (data.authorization_url) {
        if (popupWindow) {
            // Inject the real URL into the popup
            popupWindow.location.href = data.authorization_url;
            // Start polling, and pass the popup reference so we can monitor/close it
            this.pollVerification(data.reference, popupWindow);
          } else {
            // FALLBACK: If a strict ad-blocker killed the popup, fallback to standard redirect
            window.location.href = data.authorization_url;
          }
        return;
      } 
      // 2. Check for Local Rails Instruction (M-Pesa STK Push)
      else if (data.display_instruction) {
        // // In a real app, you would render this instruction in your UI.
        // // For the lightweight SDK, we trigger a browser alert or emit an event.
        // alert(data.display_instruction);
        
        // // If Virtual Account data is attached (Monnify fallback)
        // if (data.virtual_account) {
        //   console.log(`Transfer to: ${data.virtual_account.bank_name} - ${data.virtual_account.account_number}`);
        // }

        if (popupWindow) popupWindow.close();

        // Show the beautiful custom dialog instead of alert()
        SolydDialog.show(data.display_instruction, data.virtual_account, () => {
          // This callback runs if the user clicks the 'X' button
          if (this.pollingInterval) clearInterval(this.pollingInterval);
        });

        // Automatically begin polling the verification endpoint in the background
        this.pollVerification(data.reference);
        return;
      }
      throw new Error(data.error || "Failed to get checkout URL or instructions");
    } catch (error) {
      if (popupWindow) popupWindow.close();
      throw error;
    }
  }

  // Helper to poll Daraja/M-Pesa transactions in the browser
  // private async pollVerification(reference: string): Promise<void> {
  //     let attempts = 0;
  //     const interval = setInterval(async () => {
  //         attempts++;
  //         const result = await this.verifyTransaction(reference);
          
  //         if (result.status === 'SETTLED_CONSENSUS' || result.status === 'PSP_FAILED' || attempts > 15) {
  //             clearInterval(interval);
  //             SolydDialog.hide();
  //             if (result.status === 'SETTLED_CONSENSUS') {
  //                 window.location.reload(); // Refresh to grant access
  //             }
  //         }
  //     }, 3000); // Poll every 3 seconds
  // }
  private async pollVerification(
    reference: string, 
    popupWindow?: Window | null
  ): Promise<void> {
    let attempts = 0;
    
    if (this.pollingInterval) clearInterval(this.pollingInterval);

    this.pollingInterval = setInterval(async () => {
      attempts++;

      // 🚨 IF USER MANUALLY CLOSES THE POPUP: Stop polling & show error
      if (popupWindow && popupWindow.closed) {
        clearInterval(this.pollingInterval);
        SolydDialog.showError("Checkout Cancelled", "You closed the secure checkout window before the payment completed.");
        return;
      }
      const result = await this.verifyTransaction(reference);
      
      if (result.status === 'SETTLED_CONSENSUS' || result.status === 'PSP_FAILED' || attempts > 20) {
        clearInterval(this.pollingInterval);

        // 🟢 Auto-close the popup when the backend verifies the outcome
        if (popupWindow && !popupWindow.closed) {
          popupWindow.close();
        }
        
        if (result.status === 'SETTLED_CONSENSUS') {
          SolydDialog.hide();
          window.location.reload(); // Refresh to grant access
        } 
        else if (result.status === 'PSP_FAILED') {
          // The payment failed natively
          SolydDialog.showError(
            "Payment Failed", 
            result.message || "Your payment was declined or cancelled. Please try a different payment method."
          );
        } 
        else {
          // Attempts > 20 (Timeout / Zombie state)
          // The user didn't pay in time, but the Sweeper might catch it later
          SolydDialog.showError(
            "Session Timed Out", 
            "We haven't received confirmation yet. If you have been charged, your access will be updated automatically."
          );
        }
      }
    }, 3000); // Poll every 3 seconds
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

      // Absolute Truth
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
      // Hard Fail
      else if (status === 'PSP_FAILED' || status === 'FAILED_PERMANENT') {
        return { success: false, status, message: "Payment failed or was declined." };
      } 
      // Still Processing
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

  /**
   * Fetch the visual Paywall Config and Tier Metadata from the dashboard
   */
  public async getPaywallConfig(): Promise<any> {
    this.requireConfig();
    // Assuming you expose a public GET /paywall endpoint using X-API-Key
    const res = await fetch(`${this.baseUrl}/paywall`, {
      method: "GET",
      headers: { "X-API-Key": this.apiKey! }
    });
    if (!res.ok) throw new Error("Failed to fetch paywall config");
    return await res.json();
  }

  /**
   * Mounts the No-Code Paywall directly into the Developer's webpage
   * @param containerId The ID of the div where the paywall should be injected
   */
  public async renderPaywall(containerId: string): Promise<void> {
    const container = document.getElementById(containerId);
    if (!container) throw new Error(`Container with ID '${containerId}' not found.`);

    container.innerHTML = `<div style="text-align:center; padding: 40px; font-family: sans-serif; color: #888;">
      <svg class="animate-spin" style="width:24px;height:24px;margin:auto;" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4 31.4"></circle></svg>
      <div style="margin-top: 10px; font-size: 12px;">Loading Secure Paywall...</div>
    </div>`;

    try {
      const [offerings, paywallData] = await Promise.all([
        this.getOfferings(true), // silent=true so it doesn't double-log
        this.getPaywallConfig()
      ]);

      const config = paywallData.config;
      const tiers = paywallData.tiers || [];
      const bgColor = config.background_color || "#000000";
      const primaryColor = config.primary_color || "#EA580C";
      const textColor = bgColor.toLowerCase() === "#ffffff" ? "#000000" : "#ffffff";

      // 🟢 THE VIRAL WATERMARK & UI
      let html = `
        <div style="background-color: ${bgColor}; color: ${textColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15); max-width: 420px; margin: 0 auto; border: 1px solid rgba(128,128,128,0.15); position: relative;">
          
          <!-- BRANDING WATERMARK AT THE TOP -->
          <div style="position: absolute; top: 12px; right: 16px; display: flex; align-items: center; gap: 6px; z-index: 10; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 20px; backdrop-filter: blur(4px);">
            <img src="https://www.solydflow.com/logo.png" style="width: 12px; height: 12px; object-fit: contain;" alt="SolydFlow Logo"/>
            <span style="font-size: 9px; font-weight: 700; color: #fff; letter-spacing: 0.5px; text-transform: uppercase;">Powered by SolydFlow</span>
          </div>

          ${config.header_image_url ? `<img src="${config.header_image_url}" style="width: 100%; height: 180px; object-fit: cover;" />` : '<div style="height: 40px;"></div>'}
          
          <div style="padding: 24px;">
            <h2 style="margin: 0 0 6px 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">${config.headline}</h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; opacity: 0.6; line-height: 1.5;">${config.subheading}</p>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
      `;

      offerings.forEach((pkg: any) => {
        const tierMeta = tiers.find((t: any) => t.entitlement_id === pkg.entitlement_id);
        const displayName = tierMeta ? tierMeta.display_name : pkg.name;
        
        let priceHtml = '';
        if (pkg.is_upgrade) {
            priceHtml = `
              <span style="text-decoration: line-through; opacity: 0.4; font-size: 11px;">${pkg.currency} ${(pkg.amount_kobo/100).toLocaleString()}</span>
              <strong style="color: ${primaryColor}; font-size: 22px; display: block; line-height: 1;">${pkg.currency} ${(pkg.calculated_amount_kobo/100).toLocaleString()}</strong>
            `;
        } else {
            priceHtml = `<strong style="font-size: 22px;">${pkg.currency} ${(pkg.amount_kobo/100).toLocaleString()}</strong>`;
        }

        html += `
          <div style="border: 1px solid rgba(128,128,128,0.15); border-radius: 16px; padding: 16px; cursor: pointer; transition: all 0.2s ease;" 
               onmouseover="this.style.borderColor='${primaryColor}'; this.style.transform='translateY(-2px)';" 
               onmouseout="this.style.borderColor='rgba(128,128,128,0.15)'; this.style.transform='translateY(0)';"
               onclick="window.SolydFlow.purchasePackage('${pkg.identifier}')">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 800; font-size: 15px;">${displayName}</div>
                ${pkg.is_upgrade ? `<div style="color: ${primaryColor}; font-size: 9px; font-weight: 900; margin-top: 4px; padding: 2px 6px; background: ${primaryColor}22; border-radius: 4px; display: inline-block;">UPGRADE CREDIT APPLIED</div>` : ''}
              </div>
              <div style="text-align: right;">
                ${priceHtml}
                <div style="font-size: 9px; opacity: 0.5; margin-top: 4px; font-weight: 600;">PER ${pkg.duration.toUpperCase()}</div>
              </div>
            </div>
          </div>
        `;
      });

      html += `
            </div>
            <p style="text-align: center; font-size: 11px; opacity: 0.4; margin-top: 24px; font-weight: 500;">${config.footer_text}</p>
          </div>
        </div>
      `;

      container.innerHTML = html;
      (window as any).SolydFlow = this;

    } catch (error) {
      container.innerHTML = `<div style="color: #EA580C; text-align: center; font-family: sans-serif; padding: 20px; background: #fff0e6; border-radius: 8px;">Error loading paywall. Please check your API keys.</div>`;
    }
  }

  private requireConfig() {
    if (!this.apiKey || !this.userId) throw new Error("Call SolydFlow.configure() first.");
  }
}

export const SolydFlow = new SolydFlowClient();