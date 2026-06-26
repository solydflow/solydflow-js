"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolydFlow = void 0;
class SolydFlowClient {
    constructor() {
        this.apiKey = null;
        this.userId = null;
        this.baseUrl = "https://api.solydflow.com/api/v1";
    }
    /**
     * Initialize the SDK
     */
    async configure(apiKey, userId) {
        this.apiKey = apiKey;
        this.userId = userId;
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
    async purchasePackage(packageIdentifier, userPhone, customAmountKobo) {
        this.requireConfig();
        // FETCH REAL TELEMETRY
        const telemetryData = await this.collectTelemetry();
        const payload = {
            user_id: this.userId,
            package_identifier: packageIdentifier,
            email: `${this.userId}@solydflow.app`,
            phone: userPhone || "",
            custom_amount_kobo: customAmountKobo || 0,
            telemetry: telemetryData
        };
        const res = await fetch(`${this.baseUrl}/pay/initialize`, {
            method: "POST",
            headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        // Redirect browser to Paystack/Flutterwave/Stripe hosted checkout
        // 1. Check for Standard Redirect (Paystack/Stripe/Monnify Fallback)
        if (data.authorization_url) {
            window.location.href = data.authorization_url;
            return;
        }
        // 2. Check for Local Rails Instruction (M-Pesa STK Push)
        else if (data.display_instruction) {
            // In a real app, you would render this instruction in your UI.
            // For the lightweight SDK, we trigger a browser alert or emit an event.
            alert(data.display_instruction);
            // If Virtual Account data is attached (Monnify fallback)
            if (data.virtual_account) {
                console.log(`Transfer to: ${data.virtual_account.bank_name} - ${data.virtual_account.account_number}`);
            }
            // Automatically begin polling the verification endpoint in the background
            this.pollVerification(data.reference);
            return;
        }
        throw new Error(data.error || "Failed to get checkout URL or instructions");
    }
    // Helper to poll Daraja/M-Pesa transactions in the browser
    async pollVerification(reference) {
        let attempts = 0;
        const interval = setInterval(async () => {
            attempts++;
            const result = await this.verifyTransaction(reference);
            if (result.status === 'SETTLED_CONSENSUS' || result.status === 'PSP_FAILED' || attempts > 15) {
                clearInterval(interval);
                if (result.status === 'SETTLED_CONSENSUS') {
                    window.location.reload(); // Refresh to grant access
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
    requireConfig() {
        if (!this.apiKey || !this.userId)
            throw new Error("Call SolydFlow.configure() first.");
    }
}
exports.SolydFlow = new SolydFlowClient();
