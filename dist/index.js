"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolydFlow = void 0;
class SolydDialog {
    static show(instruction, virtualAccount, onCancel) {
        if (this.container)
            this.hide(); // Prevent duplicates
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

        <!-- Added cursor: pointer and hover transition -->
        <button id="solydflow-cancel-btn" style="position: absolute; top: 16px; right: 16px; background: transparent; border: none; color: #666; cursor: pointer; padding: 8px; border-radius: 50%; transition: color 0.2s ease;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#666'">
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
                this.container.firstElementChild.style.transform = 'translateY(0)';
            }
        });
        // Handle Cancel
        const cancelBtn = document.getElementById('solydflow-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.hide();
                if (onCancel)
                    onCancel();
            };
        }
    }
    static hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            const el = this.container;
            setTimeout(() => {
                if (el && el.parentNode)
                    el.parentNode.removeChild(el);
            }, 300); // Wait for fade out
            this.container = null;
        }
    }
    static showError(title, message, onClose) {
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
        // Inject the Red Error UI
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
        
        <!-- Added cursor: pointer and hover transition -->
        <button id="solydflow-close-error-btn" style="background: #fff; color: #000; border: none; padding: 14px 24px; border-radius: 12px; font-weight: bold; cursor: pointer; width: 100%; transition: background 0.2s ease; font-size: 14px;" onmouseover="this.style.background='#e5e5e5'" onmouseout="this.style.background='#fff'">
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
                if (onClose)
                    onClose();
            };
        }
    }
}
SolydDialog.container = null;
class SolydDialogOld {
    static show(instruction, virtualAccount, onCancel) {
        if (this.container)
            this.hide(); // Prevent duplicates
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
                this.container.firstElementChild.style.transform = 'translateY(0)';
            }
        });
        // Handle Cancel
        const cancelBtn = document.getElementById('solydflow-cancel-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.hide();
                if (onCancel)
                    onCancel();
            };
        }
    }
    static hide() {
        if (this.container) {
            this.container.style.opacity = '0';
            const el = this.container;
            setTimeout(() => {
                if (el && el.parentNode)
                    el.parentNode.removeChild(el);
            }, 300); // Wait for fade out
            this.container = null;
        }
    }
    static showError(title, message, onClose) {
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
        // Inject the Red Error UI
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
                if (onClose)
                    onClose();
            };
        }
    }
}
SolydDialogOld.container = null;
class SolydFlowClient {
    constructor() {
        this.apiKey = null;
        this.userId = null;
        this.userEmail = null;
        this.baseUrl = "https://api.solydflow.com/api/v1";
        this.pollingInterval = null;
    }
    /**
     * Initialize the SDK
     */
    async configure(apiKey, userId, userEmail) {
        this.apiKey = apiKey;
        this.userId = userId;
        this.userEmail = userEmail || null;
        // Warm-up handshake
        try {
            await this.getCustomerInfo();
        }
        catch (e) {
            console.warn("SolydFlow Init Warning:", e);
        }
    }
    /**
     * Fetch localized packages based on IP and Proration math
     */
    async getOfferings(silent = false) {
        this.requireConfig();
        if (!silent) {
            this.trackEvent("paywall_viewed");
        }
        const res = await fetch(`${this.baseUrl}/offerings?user_id=${this.userId}`, {
            method: "GET",
            headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" }
        });
        if (!res.ok)
            throw new Error("Failed to fetch offerings");
        const data = await res.json();
        return data.offerings || [];
    }
    /**
     * Check access instantly (Note: Web doesn't have secure local storage like mobile, so it fetches fresh)
     */
    async hasEntitlement(entitlementId) {
        const info = await this.getCustomerInfo();
        return !!info.active[entitlementId];
    }
    /**
     * Fetch current user status
     */
    async getCustomerInfo() {
        this.requireConfig();
        const res = await fetch(`${this.baseUrl}/status?user_id=${this.userId}`, {
            method: "GET",
            headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" }
        });
        if (!res.ok)
            throw new Error("Failed to fetch customer info");
        return await res.json();
    }
    /**
     * Gather Real-Time Web Telemetry for AI Training
     */
    async collectTelemetry() {
        let latency_ms = 0;
        let network_type = "wifi"; // Default fallback
        let battery_level = 100;
        let device_os = "web";
        let device_model = "browser";
        try {
            // 1. LATENCY PING: Measure actual round-trip time to our server
            const start = performance.now();
            // Using a lightweight endpoint or root to measure speed
            await fetch("https://api.solydflow.com/api/admin/health", { method: "HEAD", mode: "no-cors" }).catch(() => { });
            latency_ms = Math.round(performance.now() - start);
        }
        catch (e) {
            latency_ms = -1; // Indication of network failure
        }
        // 2. NETWORK TYPE: Use the HTML5 Network Information API
        // Returns "4g", "3g", "2g", or "slow-2g"
        const nav = navigator; // Cast to any to bypass TS strict checking for experimental APIs
        if (nav.connection && nav.connection.effectiveType) {
            network_type = nav.connection.effectiveType;
        }
        // 3. BATTERY LEVEL: Use the HTML5 Battery Status API
        try {
            if (nav.getBattery) {
                const battery = await nav.getBattery();
                battery_level = Math.round(battery.level * 100);
            }
        }
        catch (e) { }
        // 4. DEVICE OS & MODEL: Parse User Agent
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes("android"))
            device_os = "android";
        else if (ua.includes("iphone") || ua.includes("ipad"))
            device_os = "ios";
        else if (ua.includes("mac"))
            device_os = "macos";
        else if (ua.includes("windows"))
            device_os = "windows";
        if (ua.includes("edg/"))
            device_model = "Edge";
        else if (ua.includes("chrome/"))
            device_model = "Chrome";
        else if (ua.includes("safari/") && !ua.includes("chrome/"))
            device_model = "Safari";
        else if (ua.includes("firefox/"))
            device_model = "Firefox";
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
    async purchasePackage(packageIdentifier, userPhone, customAmountKobo, userEmail) {
        this.requireConfig();
        // FETCH REAL TELEMETRY
        const telemetryData = await this.collectTelemetry();
        // 1. IMMEDIATELY open a popup to bypass browser popup blockers.
        // We open it centered on the user's screen.
        const width = 500;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        let popupWindow = window.open('', 'SolydFlowSecureCheckout', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`);
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
                headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" },
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
                }
                else {
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
                if (popupWindow)
                    popupWindow.close();
                // Show the beautiful custom dialog instead of alert()
                SolydDialog.show(data.display_instruction, data.virtual_account, () => {
                    // This callback runs if the user clicks the 'X' button
                    if (this.pollingInterval)
                        clearInterval(this.pollingInterval);
                });
                // Automatically begin polling the verification endpoint in the background
                this.pollVerification(data.reference);
                return;
            }
            throw new Error(data.error || "Failed to get checkout URL or instructions");
        }
        catch (error) {
            if (popupWindow)
                popupWindow.close();
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
    async pollVerification(reference, popupWindow) {
        let attempts = 0;
        if (this.pollingInterval)
            clearInterval(this.pollingInterval);
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
                // Auto-close the popup when the backend verifies the outcome
                if (popupWindow && !popupWindow.closed) {
                    popupWindow.close();
                }
                if (result.status === 'SETTLED_CONSENSUS') {
                    SolydDialog.hide();
                    window.location.reload(); // Refresh to grant access
                }
                else if (result.status === 'PSP_FAILED') {
                    // The payment failed natively
                    SolydDialog.showError("Payment Failed", result.message || "Your payment was declined or cancelled. Please try a different payment method.");
                }
                else {
                    // Attempts > 20 (Timeout / Zombie state)
                    // The user didn't pay in time, but the Sweeper might catch it later
                    SolydDialog.showError("Session Timed Out", "We haven't received confirmation yet. If you have been charged, your access will be updated automatically.");
                }
            }
        }, 3000); // Poll every 3 seconds
    }
    /**
     * Verify a transaction after returning from a hosted checkout redirect.
     * Call this on your success page using the ?reference= URL parameter.
     */
    async verifyTransaction(reference) {
        this.requireConfig();
        try {
            const res = await fetch(`${this.baseUrl}/pay/verify`, {
                method: "POST",
                headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" },
                body: JSON.stringify({ reference })
            });
            const data = await res.json();
            const status = data.status;
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
        }
        catch (e) {
            console.error("Verification error:", e);
            return { success: false, status: 'INITIATED', message: "Network error during verification." };
        }
    }
    /**
     * Generic Event Tracker
     */
    async trackEvent(eventType, metadata = {}) {
        if (!this.apiKey || !this.userId)
            return;
        fetch(`${this.baseUrl}/event`, {
            method: "POST",
            headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: this.userId,
                event_type: eventType,
                metadata: JSON.stringify(metadata)
            })
        }).catch(() => { }); // Silent fail
    }
    /**
     * Fetch the visual Paywall Config and Tier Metadata from the dashboard
     */
    async getPaywallConfig() {
        this.requireConfig();
        // Assuming you expose a public GET /paywall endpoint using X-API-Key
        const res = await fetch(`${this.baseUrl}/paywall`, {
            method: "GET",
            headers: { "X-API-Key": this.apiKey }
        });
        if (!res.ok)
            throw new Error("Failed to fetch paywall config");
        return await res.json();
    }
    /**
     * Mounts the No-Code Paywall directly into the Developer's webpage
     * @param containerId The ID of the div where the paywall should be injected
     */
    async renderPaywall(containerId) {
        const container = document.getElementById(containerId);
        if (!container)
            throw new Error(`Container with ID '${containerId}' not found.`);
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
            // THE VIRAL WATERMARK & UI
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
            offerings.forEach((pkg) => {
                const tierMeta = tiers.find((t) => t.entitlement_id === pkg.entitlement_id);
                const displayName = tierMeta ? tierMeta.display_name : pkg.name;
                let priceHtml = '';
                if (pkg.is_upgrade) {
                    priceHtml = `
              <span style="text-decoration: line-through; opacity: 0.4; font-size: 11px;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</span>
              <strong style="color: ${primaryColor}; font-size: 22px; display: block; line-height: 1;">${pkg.currency} ${(pkg.calculated_amount_kobo / 100).toLocaleString()}</strong>
            `;
                }
                else {
                    priceHtml = `<strong style="font-size: 22px;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</strong>`;
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
            window.SolydFlow = this;
        }
        catch (error) {
            container.innerHTML = `<div style="color: #EA580C; text-align: center; font-family: sans-serif; padding: 20px; background: #fff0e6; border-radius: 8px;">Error loading paywall. Please check your API keys.</div>`;
        }
    }
    async renderWebPaywall(containerId) {
        this.requireConfig();
        const container = document.getElementById(containerId);
        if (!container)
            throw new Error(`Container #${containerId} not found.`);
        // 1. Show loading state
        container.innerHTML = `
      <div style="display:flex; justify-content:center; padding: 40px;">
        <div style="width:30px; height:30px; border:3px solid #333; border-top-color:#EA580C; border-radius:50%; animation:sf-spin 1s linear infinite;"></div>
      </div>
      <style>@keyframes sf-spin { to { transform: rotate(360deg); } }</style>
    `;
        try {
            // 2. Fetch Data in Parallel
            const [offerings, paywallRes] = await Promise.all([
                this.getOfferings(true),
                fetch(`${this.baseUrl}/paywall`, { headers: { "X-API-Key": this.apiKey } }).then(r => r.json())
            ]);
            const config = paywallRes.config || {};
            const tiersMeta = paywallRes.tiers || [];
            // 3. Logic: Extract Durations & Sort
            const durationOrder = { "week": 1, "month": 2, "quarter": 3, "year": 4, "lifetime": 5 };
            const availableDurations = [...new Set(offerings.map(p => p.duration))].sort((a, b) => durationOrder[a] - durationOrder[b]);
            let activeDuration = availableDurations.includes("month") ? "month" : availableDurations[0];
            // 4. Inject CSS
            const primaryColor = config.primary_color || "#EA580C";
            const bgColor = config.background_color || "#000000";
            const isDark = bgColor === "#000000" || bgColor === "#111111" || bgColor === "#050505";
            const textColor = isDark ? "#ffffff" : "#000000";
            const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
            const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            const style = document.createElement('style');
            style.innerHTML = `
        .sf-wrapper { font-family: system-ui, -apple-system, sans-serif; color: ${textColor}; width: 100%; max-width: 900px; margin: 0 auto; }
        .sf-header { text-align: center; margin-bottom: 30px; }
        .sf-headline { font-size: 2.5rem; font-weight: 800; margin: 0 0 10px 0; line-height: 1.2; }
        .sf-subhead { font-size: 1.1rem; opacity: 0.7; margin: 0; }
        .sf-hero-img { width: 100%; height: 200px; object-fit: cover; border-radius: 16px; margin-bottom: 30px; border: 1px solid ${borderColor}; }
        
        /* Toggle */
        .sf-toggle-wrapper { display: flex; justify-content: center; margin-bottom: 40px; }
        .sf-toggle { display: flex; background: ${cardBg}; padding: 4px; border-radius: 99px; border: 1px solid ${borderColor}; }
        .sf-toggle-btn { background: transparent; border: none; color: ${textColor}; padding: 8px 20px; border-radius: 99px; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.3s ease; opacity: 0.6; text-transform: capitalize; }
        .sf-toggle-btn.active { background: ${textColor}; color: ${bgColor}; opacity: 1; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        /* Grid */
        .sf-grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); align-items: stretch; }
        .sf-card { background: ${cardBg}; border: 1px solid ${borderColor}; border-radius: 24px; padding: 32px; display: flex; flex-direction: column; transition: transform 0.2s, border-color 0.2s; position: relative; overflow: hidden; }
        .sf-card:hover { transform: translateY(-4px); }
        .sf-card.popular { border-color: ${primaryColor}; box-shadow: 0 8px 30px ${primaryColor}20; }
        
        .sf-badge { position: absolute; top: 0; right: 0; background: ${primaryColor}; color: #fff; font-size: 10px; font-weight: bold; padding: 6px 16px; border-bottom-left-radius: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .sf-tier-name { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; }
        .sf-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 24px; }
        .sf-price { font-size: 2.5rem; font-weight: 900; }
        .sf-duration { font-size: 0.9rem; opacity: 0.6; }
        
        .sf-features { list-style: none; padding: 0; margin: 0 0 32px 0; flex: 1; }
        .sf-feature-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 0.95rem; opacity: 0.9; }
        .sf-check { color: ${primaryColor}; font-weight: bold; }
        
        .sf-btn { width: 100%; padding: 16px; border-radius: 12px; border: none; font-size: 1rem; font-weight: bold; cursor: pointer; transition: opacity 0.2s; }
        .sf-btn-primary { background: ${primaryColor}; color: #fff; }
        .sf-btn-secondary { background: ${textColor}; color: ${bgColor}; }
        .sf-btn:hover { opacity: 0.9; }
        .sf-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Email Input for Web Guests */
        .sf-email-input { width: 100%; padding: 12px 16px; margin-bottom: 16px; border-radius: 8px; border: 1px solid ${borderColor}; background: ${bgColor}; color: ${textColor}; font-size: 14px; outline: none; }
        .sf-email-input:focus { border-color: ${primaryColor}; }
        
        .sf-footer { text-align: center; margin-top: 32px; font-size: 0.75rem; opacity: 0.5; }
      `;
            document.head.appendChild(style);
            // 5. Render Function
            const renderUI = () => {
                // Filter and Sort: Lowest tier level first, then by price
                const visiblePackages = offerings
                    .filter(p => p.duration === activeDuration)
                    .sort((a, b) => {
                    if (a.tier_level !== b.tier_level)
                        return a.tier_level - b.tier_level;
                    return a.amount_kobo - b.amount_kobo;
                });
                let html = `<div class="sf-wrapper">`;
                // Hero Image
                if (config.header_image_url) {
                    html += `<img src="${config.header_image_url}" class="sf-hero-img" alt="Header" />`;
                }
                // Header
                html += `
          <div class="sf-header">
            <h1 class="sf-headline">${config.headline || "Upgrade to Pro"}</h1>
            <p class="sf-subhead">${config.subheading || "Choose the plan that fits you best."}</p>
          </div>
        `;
                // Email Input (Crucial for Web so they get their receipt!)
                // Only show if the user ID is a generated guest ID
                const isGuest = this.userId?.startsWith("guest_");
                if (isGuest) {
                    html += `
            <div style="max-width: 400px; margin: 0 auto 30px auto; text-align: left;">
              <label style="font-size: 12px; font-weight: bold; opacity: 0.7; margin-bottom: 6px; display: block;">Enter your email to receive access</label>
              <input type="email" id="sf-guest-email" class="sf-email-input" placeholder="you@example.com" />
            </div>
          `;
                }
                // Duration Toggle
                if (availableDurations.length > 1) {
                    html += `<div class="sf-toggle-wrapper"><div class="sf-toggle">`;
                    availableDurations.forEach(dur => {
                        const label = dur === "lifetime" ? "One-Time" : (dur === "quarter" ? "Quarterly" : dur + "ly");
                        html += `<button class="sf-toggle-btn ${activeDuration === dur ? 'active' : ''}" data-dur="${dur}">${label}</button>`;
                    });
                    html += `</div></div>`;
                }
                // Grid
                html += `<div class="sf-grid">`;
                if (visiblePackages.length === 0) {
                    html += `<div style="text-align:center; padding: 40px; width: 100%; opacity: 0.5;">No plans available.</div>`;
                }
                visiblePackages.forEach((pkg, index) => {
                    // 1. DYNAMIC TIER LOGIC
                    const isHighest = index === visiblePackages.length - 1 && visiblePackages.length > 1;
                    const isMiddle = index === visiblePackages.length - 2 && visiblePackages.length > 2;
                    const isHighlighted = isHighest || isMiddle; // Apply border/button highlights to both top tiers
                    const meta = tiersMeta.find((t) => t.entitlement_id === pkg.entitlement_id);
                    const displayName = meta?.display_name || pkg.name;
                    const features = meta?.features || [];
                    // 2. DYNAMIC BADGE HTML
                    let badgeHtml = '';
                    if (isHighest) {
                        // Premium Badge (Inverted Colors for Exclusivity)
                        badgeHtml = `<div class="sf-badge" style="background: ${textColor}; color: ${bgColor};">Premium</div>`;
                    }
                    else if (isMiddle) {
                        // Best Value Badge (Primary Theme Color)
                        badgeHtml = `<div class="sf-badge">Best Value</div>`;
                    }
                    let priceHtml = '';
                    if (pkg.is_upgrade) {
                        priceHtml = `
                <span style="text-decoration: line-through; opacity: 0.4; font-size: 14px;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</span>
                <div style="color: ${primaryColor}; font-size: 36px; font-weight: 900; line-height: 1; margin-top: 4px;">${pkg.currency} ${(pkg.calculated_amount_kobo / 100).toLocaleString()}</div>
                <div style="color: ${primaryColor}; font-size: 10px; font-weight: 900; margin-top: 8px; padding: 4px 8px; background: ${primaryColor}22; border-radius: 6px; display: inline-block;">UPGRADE CREDIT APPLIED</div>
              `;
                    }
                    else {
                        priceHtml = `<div style="font-size: 36px; font-weight: 900; line-height: 1;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</div>`;
                    }
                    html += `
            <div class="sf-card ${isHighlighted ? 'popular' : ''}">
              ${badgeHtml}
              
              <div class="sf-tier-name">${displayName}</div>
              
              <div style="margin-bottom: 24px;">
                ${priceHtml}
                <div style="font-size: 12px; opacity: 0.5; margin-top: 6px; font-weight: 600; text-transform: uppercase;">PER ${pkg.duration}</div>
              </div>

              <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; flex: 1;">
                ${features.map((f) => `
                  <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 14px; opacity: 0.9;">
                    <span style="color: ${primaryColor}; font-weight: bold;">✓</span> <span>${f}</span>
                  </li>
                `).join('')}
              </ul>

              <button class="sf-buy-btn" data-pkg="${pkg.identifier}" style="width: 100%; padding: 16px; border-radius: 12px; border: none; font-size: 16px; font-weight: 800; cursor: pointer; transition: opacity 0.2s; background: ${isHighlighted ? primaryColor : textColor}; color: ${isHighlighted ? '#fff' : bgColor};">
                Get ${displayName}
              </button>
            </div>
          `;
                });
                html += `</div>`;
                if (config.footer_text) {
                    html += `<div class="sf-footer">${config.footer_text}</div>`;
                }
                html += `</div>`;
                container.innerHTML = html;
                // Attach Listeners
                document.querySelectorAll('.sf-toggle-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        activeDuration = e.target.getAttribute('data-dur') || activeDuration;
                        renderUI(); // Re-render on toggle
                    });
                });
                document.querySelectorAll('.sf-buy-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const target = e.target;
                        const pkgId = target.getAttribute('data-pkg');
                        let userEmail = "";
                        if (isGuest) {
                            const emailInput = document.getElementById('sf-guest-email');
                            if (!emailInput.value || !emailInput.value.includes("@")) {
                                // ALERT WITH SOLYD DIALOG
                                SolydDialog.showError("Missing Information", "Please enter a valid email address so we can send your receipt and access link.", () => {
                                    emailInput.focus();
                                });
                                return;
                            }
                            userEmail = emailInput.value;
                        }
                        target.innerHTML = "Processing...";
                        target.disabled = true;
                        // BLOCK SCREEN WITH SOLYD LOADING DIALOG
                        SolydDialog.show("Initializing secure checkout environment...", null);
                        try {
                            // Trigger actual purchase
                            await this.purchasePackage(pkgId, undefined, 0, userEmail);
                        }
                        catch (err) {
                            // ALERT WITH SOLYD DIALOG
                            SolydDialog.showError("Checkout Error", err.message || "Failed to initialize checkout. Please try again.", () => {
                                target.innerHTML = "Try again...";
                                target.disabled = false;
                                target.style.opacity = "1";
                            });
                        }
                    });
                });
            };
            // Initial Render
            renderUI();
            // Track view
            this.trackEvent("hosted_paywall_viewed");
        }
        catch (e) {
            container.innerHTML = `<div style="text-align:center; color:red; padding:40px;">Failed to load paywall.</div>`;
        }
    }
    /**
     * Mounts the No-Code Paywall directly into the Developer's webpage
     * @param containerId The ID of the div where the paywall should be injected
     */
    async renderWebPaywallNew(containerId) {
        this.requireConfig();
        const container = document.getElementById(containerId);
        if (!container)
            throw new Error(`Container with ID '${containerId}' not found.`);
        // 1. Initial Loading State
        container.innerHTML = `
      <div style="text-align:center; padding: 40px; font-family: sans-serif; color: #888;">
        <svg style="width:24px;height:24px;margin:auto;animation:sf-spin 1s linear infinite;" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="31.4 31.4"></circle>
        </svg>
        <div style="margin-top: 10px; font-size: 12px;">Loading Secure Paywall...</div>
      </div>
      <style>@keyframes sf-spin { to { transform: rotate(360deg); } }</style>
    `;
        try {
            // 2. Fetch Data
            const [offerings, paywallData] = await Promise.all([
                this.getOfferings(true), // silent=true
                fetch(`${this.baseUrl}/paywall`, { headers: { "X-API-Key": this.apiKey } }).then(r => r.json())
            ]);
            const config = paywallData.config || {};
            const tiers = paywallData.tiers || [];
            const bgColor = config.background_color || "#000000";
            const primaryColor = config.primary_color || "#EA580C";
            // Smart contrast calculation
            const isDark = bgColor.toLowerCase() === "#000000" || bgColor.toLowerCase() === "#111111" || bgColor.toLowerCase() === "#050505";
            const textColor = isDark ? "#ffffff" : "#000000";
            const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
            const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
            // 3. Extract Durations for the Toggle
            const durationOrder = { "week": 1, "month": 2, "quarter": 3, "year": 4, "lifetime": 5 };
            const availableDurations = [...new Set(offerings.map((p) => p.duration))]
                .sort((a, b) => durationOrder[a] - durationOrder[b]);
            let activeDuration = availableDurations.includes("month") ? "month" : availableDurations[0];
            // Expose to window for inline onclick fallback if needed
            window.SolydFlow = this;
            // 4. The Render Loop (Allows switching tabs without reloading page)
            const renderUI = () => {
                // Filter and Sort: Lowest tier first
                const visiblePackages = offerings
                    .filter((p) => p.duration === activeDuration)
                    .sort((a, b) => (a.tier_level || 1) - (b.tier_level || 1));
                let html = `
          <div style="background-color: ${bgColor}; color: ${textColor}; font-family: system-ui, -apple-system, sans-serif; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2); max-width: 900px; margin: 0 auto; border: 1px solid ${borderColor}; position: relative;">
            
            <!-- WATERMARK -->
            <div style="position: absolute; top: 16px; right: 20px; display: flex; align-items: center; gap: 6px; z-index: 10; background: rgba(0,0,0,0.5); padding: 6px 10px; border-radius: 20px; backdrop-filter: blur(8px);">
              <img src="https://solydflow.com/logo.png" style="width: 14px; height: 14px; object-fit: contain;" alt="SolydFlow"/>
              <span style="font-size: 10px; font-weight: 700; color: #fff; letter-spacing: 0.5px; text-transform: uppercase;">Secured by SolydFlow</span>
            </div>

            ${config.header_image_url ? `<img src="${config.header_image_url}" style="width: 100%; height: 220px; object-fit: cover;" />` : '<div style="height: 60px;"></div>'}
            
            <div style="padding: 32px 40px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 900; letter-spacing: -0.5px;">${config.headline}</h2>
                <p style="margin: 0; font-size: 15px; opacity: 0.6; line-height: 1.5; max-width: 500px; margin: 0 auto;">${config.subheading}</p>
              </div>
        `;
                // GUEST EMAIL INPUT (If user is anonymous)
                const isGuest = this.userId?.startsWith("guest_");
                if (isGuest) {
                    html += `
            <div style="max-width: 400px; margin: 0 auto 30px auto; text-align: center;">
              <label style="font-size: 12px; font-weight: bold; opacity: 0.7; margin-bottom: 8px; display: block;">Enter email to receive your access link</label>
              <input type="email" id="sf-guest-email" placeholder="you@example.com" style="width: 100%; padding: 14px 20px; border-radius: 12px; border: 1px solid ${borderColor}; background: ${cardBg}; color: ${textColor}; font-size: 15px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='${primaryColor}'" onblur="this.style.borderColor='${borderColor}'" />
            </div>
          `;
                }
                // DURATION TOGGLE
                if (availableDurations.length > 1) {
                    html += `
            <div style="display: flex; justify-content: center; margin-bottom: 40px;">
              <div style="display: flex; background: ${cardBg}; padding: 6px; border-radius: 99px; border: 1px solid ${borderColor};">
          `;
                    availableDurations.forEach(dur => {
                        const label = dur === "lifetime" ? "One-Time" : (dur === "quarter" ? "Quarterly" : dur + "ly");
                        const isActive = activeDuration === dur;
                        html += `
                <button class="sf-toggle-btn" data-dur="${dur}" style="background: ${isActive ? textColor : 'transparent'}; color: ${isActive ? bgColor : textColor}; border: none; padding: 10px 24px; border-radius: 99px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.3s ease; opacity: ${isActive ? '1' : '0.6'}; box-shadow: ${isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'};">
                  ${label}
                </button>
            `;
                    });
                    html += `</div></div>`;
                }
                // RESPONSIVE GRID (Side-by-side on Desktop, Stacked on Mobile)
                html += `<div style="display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">`;
                if (visiblePackages.length === 0) {
                    html += `<div style="text-align:center; padding: 40px; opacity: 0.5; grid-column: 1 / -1;">No plans available for this cycle.</div>`;
                }
                visiblePackages.forEach((pkg, index) => {
                    // 1. DYNAMIC TIER LOGIC
                    const isHighest = index === visiblePackages.length - 1 && visiblePackages.length > 1;
                    const isMiddle = index === visiblePackages.length - 2 && visiblePackages.length > 2;
                    const isHighlighted = isHighest || isMiddle; // Apply border/button highlights to both top tiers
                    const meta = tiers.find((t) => t.entitlement_id === pkg.entitlement_id);
                    const displayName = meta?.display_name || pkg.name;
                    const features = meta?.features || [];
                    // 2. DYNAMIC BADGE HTML
                    let badgeHtml = '';
                    if (isHighest) {
                        // Premium Badge (Inverted Colors for Exclusivity)
                        badgeHtml = `<div class="sf-badge" style="background: ${textColor}; color: ${bgColor};">Premium</div>`;
                    }
                    else if (isMiddle) {
                        // Best Value Badge (Primary Theme Color)
                        badgeHtml = `<div class="sf-badge">Best Value</div>`;
                    }
                    let priceHtml = '';
                    if (pkg.is_upgrade) {
                        priceHtml = `
                <span style="text-decoration: line-through; opacity: 0.4; font-size: 14px;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</span>
                <div style="color: ${primaryColor}; font-size: 36px; font-weight: 900; line-height: 1; margin-top: 4px;">${pkg.currency} ${(pkg.calculated_amount_kobo / 100).toLocaleString()}</div>
                <div style="color: ${primaryColor}; font-size: 10px; font-weight: 900; margin-top: 8px; padding: 4px 8px; background: ${primaryColor}22; border-radius: 6px; display: inline-block;">UPGRADE CREDIT APPLIED</div>
              `;
                    }
                    else {
                        priceHtml = `<div style="font-size: 36px; font-weight: 900; line-height: 1;">${pkg.currency} ${(pkg.amount_kobo / 100).toLocaleString()}</div>`;
                    }
                    html += `
            <div class="sf-card ${isHighlighted ? 'popular' : ''}">
              ${badgeHtml}
              
              <div class="sf-tier-name">${displayName}</div>
              
              <div style="margin-bottom: 24px;">
                ${priceHtml}
                <div style="font-size: 12px; opacity: 0.5; margin-top: 6px; font-weight: 600; text-transform: uppercase;">PER ${pkg.duration}</div>
              </div>

              <ul style="list-style: none; padding: 0; margin: 0 0 32px 0; flex: 1;">
                ${features.map((f) => `
                  <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 14px; opacity: 0.9;">
                    <span style="color: ${primaryColor}; font-weight: bold;">✓</span> <span>${f}</span>
                  </li>
                `).join('')}
              </ul>

              <button class="sf-buy-btn" data-pkg="${pkg.identifier}" style="width: 100%; padding: 16px; border-radius: 12px; border: none; font-size: 16px; font-weight: 800; cursor: pointer; transition: opacity 0.2s; background: ${isHighlighted ? primaryColor : textColor}; color: ${isHighlighted ? '#fff' : bgColor};">
                Get ${displayName}
              </button>
            </div>
          `;
                });
                html += `
              </div>
              <p style="text-align: center; font-size: 12px; opacity: 0.4; margin-top: 32px; font-weight: 500;">${config.footer_text}</p>
            </div>
          </div>
        `;
                container.innerHTML = html;
                // --- ATTACH EVENT LISTENERS ---
                // 1. Duration Toggle listeners
                document.querySelectorAll('.sf-toggle-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        activeDuration = e.target.getAttribute('data-dur') || activeDuration;
                        renderUI(); // Re-render the HTML with new duration
                    });
                });
                // 2. Buy Button listeners
                document.querySelectorAll('.sf-buy-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const target = e.currentTarget;
                        const pkgId = target.getAttribute('data-pkg');
                        // Handle Guest Email validation
                        let userEmail = "";
                        if (isGuest) {
                            const emailInput = document.getElementById('sf-guest-email');
                            if (!emailInput.value || !emailInput.value.includes("@")) {
                                // ALERT WITH SOLYD DIALOG
                                SolydDialog.showError("Missing Information", "Please enter a valid email address so we can send your receipt and access link.", () => {
                                    emailInput.focus();
                                });
                                emailInput.focus();
                                return;
                            }
                            userEmail = emailInput.value;
                        }
                        const originalText = target.innerHTML;
                        target.innerHTML = "Processing...";
                        target.disabled = true;
                        target.style.opacity = "0.7";
                        // BLOCK SCREEN WITH SOLYD LOADING DIALOG
                        SolydDialog.show("Initializing secure checkout environment...", null);
                        try {
                            // Call the updated purchasePackage method
                            await this.purchasePackage(pkgId, undefined, 0, userEmail);
                        }
                        catch (err) {
                            // ALERT WITH SOLYD DIALOG
                            SolydDialog.showError("Checkout Error", err.message || "Failed to initialize checkout. Please try again.", () => {
                                target.innerHTML = originalText;
                                target.disabled = false;
                                target.style.opacity = "1";
                            });
                        }
                    });
                });
            };
            // Initial Render
            renderUI();
            this.trackEvent("hosted_paywall_viewed");
        }
        catch (error) {
            container.innerHTML = `<div style="color: #EA580C; text-align: center; font-family: sans-serif; padding: 20px; background: #fff0e6; border-radius: 8px;">Error loading paywall. Please check your API keys or network connection.</div>`;
        }
    }
    requireConfig() {
        if (!this.apiKey || !this.userId)
            throw new Error("Call SolydFlow.configure() first.");
    }
}
exports.SolydFlow = new SolydFlowClient();
