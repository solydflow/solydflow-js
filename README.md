# SolydFlow JavaScript SDK

Official JavaScript SDK for SolydFlow.

Build subscription and entitlement-based applications with dynamic pricing, Purchasing Power Parity (PPP), Smart Upgrade Credits, and hosted checkout flows.

The SDK enables your application to:

* Fetch dynamic pricing
* Apply Purchasing Power Parity (PPP)
* Support Smart Upgrade Credits
* Manage customer entitlements
* Track subscription status
* Launch secure hosted checkout sessions

For complete integration guides, API references, architecture details, webhook events, and advanced configuration, visit:

**https://docs.solydflow.com/docs/intro**

---

## Installation

Install the SDK from npm:

```bash
npm install @solydflow/solydflow-js
```

or

```bash
yarn add @solydflow/solydflow-js
```

or

```bash
pnpm add @solydflow/solydflow-js
```

---

## Quick Start

Initialize the SDK as early as possible after the user has been identified.

```javascript
import { SolydFlow } from "@solydflow/solydflow-js";

await SolydFlow.configure(
  "sf_pk_live_YOUR_PUBLIC_KEY",
  "user_12345"
);
```

### Parameters

| Parameter    | Description                                   |
| ------------ | --------------------------------------------- |
| `publicKey`  | Your SolydFlow public API key                 |
| `customerId` | Your application's unique customer identifier |

---

## Check Customer Access

Determine whether a customer has access to a specific entitlement.

```javascript
const hasAccess = await SolydFlow.hasEntitlement(
  "gold_access"
);

if (hasAccess) {
  console.log("Access granted");
}
```

---

## Fetch Pricing & Packages

Retrieve offerings configured in your SolydFlow dashboard.

SolydFlow automatically applies:

* Purchasing Power Parity (PPP)
* Geo-based pricing
* Smart Upgrade Credits
* Customer-specific pricing rules

```javascript
const offerings = await SolydFlow.getOfferings();

offerings.forEach((pkg) => {
  console.log(pkg.name);
  console.log(pkg.currency);
  console.log(pkg.display_price);
});
```

---

## Start Checkout

Launch a hosted checkout session for a package.

```javascript
await SolydFlow.purchasePackage(
  packageId,
  customerPhoneNumber
);
```

Example:

```javascript
await SolydFlow.purchasePackage(
  "premium_monthly",
  "2348012345678"
);
```

The SDK automatically redirects the customer to a secure hosted payment page.

---

## Understanding the Web Purchase Flow

Unlike mobile SDKs, web applications cannot wait for payment completion inside the browser.

### Mobile SDK Flow

```text
User
 ↓
In-App Purchase
 ↓
Payment Completed
 ↓
CustomerInfo Returned
 ↓
Entitlement Activated
```

### Web SDK Flow

```text
User
 ↓
Hosted Checkout
 ↓
Payment Completed
 ↓
SolydFlow Verification
 ↓
Webhook Sent
 ↓
Backend Updated
 ↓
Entitlement Activated
```

Because checkout occurs outside your application, purchase completion is communicated through webhooks.

---

## Configure Webhooks

To receive subscription updates:

1. Open the SolydFlow Console
2. Navigate to your project settings
3. Configure a webhook endpoint
4. Deploy your backend listener

SolydFlow sends verified subscription events to your backend whenever a customer:

* Starts a subscription
* Renews a subscription
* Upgrades a subscription
* Cancels a subscription
* Restores access

Your backend should:

1. Verify the webhook signature
2. Update customer records
3. Sync entitlements
4. Unlock application features

---

## Recommended Integration Pattern

```text
Frontend
    ↓
Fetch Offerings
    ↓
Customer Selects Plan
    ↓
Hosted Checkout
    ↓
Payment Completed
    ↓
SolydFlow Webhook
    ↓
Backend Updates User
    ↓
Customer Access Granted
```

---

## Documentation

For production deployments, webhook setup, entitlement architecture, pricing configuration, SDK methods, and API references:

👉 https://docs.solydflow.com/docs/intro

---

## Support

* Documentation: https://docs.solydflow.com/docs/intro
* Dashboard: https://console.solydflow.com
* Website: https://solydflow.com
