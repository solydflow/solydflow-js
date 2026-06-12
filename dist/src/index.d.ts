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
declare class SolydFlowClient {
    private apiKey;
    private userId;
    private baseUrl;
    /**
     * Initialize the SDK
     */
    configure(apiKey: string, userId: string): Promise<void>;
    /**
     * Fetch localized packages based on IP and Proration math
     */
    getOfferings(silent?: boolean): Promise<SolydPackage[]>;
    /**
     * Check access instantly (Note: Web doesn't have secure local storage like mobile, so it fetches fresh)
     */
    hasEntitlement(entitlementId: string): Promise<boolean>;
    /**
     * Fetch current user status
     */
    getCustomerInfo(): Promise<CustomerInfo>;
    /**
     * Initialize checkout and redirect the browser
     */
    purchasePackage(packageIdentifier: string, userPhone?: string, customAmountKobo?: number): Promise<void>;
    /**
     * Generic Event Tracker
     */
    trackEvent(eventType: string, metadata?: Record<string, any>): Promise<void>;
    private requireConfig;
}
export declare const SolydFlow: SolydFlowClient;
export {};
