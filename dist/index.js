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
     * Initialize checkout and redirect the browser
     */
    async purchasePackage(packageIdentifier, userPhone, customAmountKobo) {
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
            headers: { "X-API-Key": this.apiKey, "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        // Redirect browser to Paystack/Flutterwave/Stripe hosted checkout
        if (data.authorization_url) {
            window.location.href = data.authorization_url;
        }
        else {
            throw new Error(data.error || "Failed to get checkout URL");
        }
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
    requireConfig() {
        if (!this.apiKey || !this.userId)
            throw new Error("Call SolydFlow.configure() first.");
    }
}
exports.SolydFlow = new SolydFlowClient();
