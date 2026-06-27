# SolydFlow JavaScript SDK

Official JavaScript SDK for SolydFlow.

SolydFlow is a hybrid revenue infrastructure that helps businesses manage subscriptions, purchases, entitlements, and customer access across local payment gateways, app stores, and global payment providers.

The JavaScript SDK enables web applications to use the same pricing logic, entitlement management, smart routing, and subscription lifecycle capabilities available across the SolydFlow platform.

For complete integration guides, API references, webhook events, and advanced configuration, visit:

**https://docs.solydflow.com/docs/intro**

---

## What is SolydFlow?

SolydFlow unifies app stores (Apple App Store and Google Play), local African payment gateways (Paystack and Flutterwave), and Stripe for global coverage and portability into a single platform.

Beyond payment aggregation, SolydFlow includes:

- Smart Payment Routing
- Purchasing Power Parity (PPP)
- Smart Upgrade Credits
- Entitlement Management
- Subscription Lifecycle Tracking
- Hosted Checkout Flows
- No-Code Paywalls

This allows businesses to manage revenue, subscriptions, and customer access from a single source of truth.

---

## Key Features

- 🌍 **Unified Revenue Infrastructure**
- 🧠 **Smart Payment Routing**
- 💳 **Dynamic Pricing & Purchasing Power Parity (PPP)**
- 🎯 **Drop-In No-Code Paywalls**
- 🔄 **Smart Upgrade Credits**
- 🔐 **Entitlement Management**
- 📡 **Subscription Lifecycle Events**
- 🔗 **Hosted Checkout Flows**

---

## Installation

Install the SDK:

```bash
npm install solydflow-js
```

or

```bash
yarn add solydflow-js
```

or

```bash
pnpm add solydflow-js
```

---

## Quick Start

Initialize the SDK as early as possible after the customer has been identified.

```javascript
import { SolydFlow } from "solydflow-js";

await SolydFlow.configure(
  "sf_pk_live_YOUR_PUBLIC_KEY",
  "user_12345"
);
```

### Parameters

| Parameter | Description |
|------------|------------|
| `publicKey` | Your SolydFlow Public API Key |
| `customerId` | Your application's unique customer identifier |

---

## Choose Your Integration Strategy

The JavaScript SDK supports two integration approaches.

| Option | Best For |
|----------|----------|
| Drop-In Paywall | Fastest implementation with dashboard-managed UI |
| Custom UI | Complete control over the customer experience |

---

## Option A: Drop-In Paywall (Recommended)

Instead of spending days building your own pricing interface, SolydFlow provides a fully responsive, high-converting Drop-In Paywall.

The paywall automatically stays synchronized with the products, pricing, design, colors, and messaging configured in your SolydFlow Console.

### Automatically Handles

- Purchasing Power Parity (PPP)
- Geo-based pricing
- Smart Upgrade Credits
- Checkout routing
- Product rendering
- Hosted checkout initiation

### Step 1: Add a Container

```html
<div id="solydflow-paywall-container"></div>
```

### Step 2: Render the Paywall

```javascript
import { SolydFlow } from "solydflow-js";

async function showPricing() {
  await SolydFlow.configure(
    "sf_pk_live_YOUR_PUBLIC_KEY",
    "user_12345"
  );

  await SolydFlow.renderPaywall(
    "solydflow-paywall-container"
  );
}
```

That's all that's required.

The SDK automatically loads and renders the paywall you designed in the SolydFlow Console.

### When Should You Use This?

Choose the Drop-In Paywall if:

- You want the fastest implementation.
- Product teams manage pricing and promotions.
- You want paywall updates without website deployments.
- You want built-in localization and optimization.

---

## Option B: Custom UI (Advanced)

If you prefer to build your own pricing experience, you can fetch package information directly and render your own components.

SolydFlow will still calculate:

- Purchasing Power Parity pricing
- Smart Upgrade Credits
- Regional pricing adjustments

```javascript
async function fetchRawPackages() {
  const offerings = await SolydFlow.getOfferings();

  offerings.forEach(pkg => {
    if (pkg.is_upgrade) {
      console.log(
        `Upgrade for ${pkg.currency} ${pkg.calculated_amount_kobo / 100}`
      );
    } else {
      console.log(
        `Standard Price: ${pkg.currency} ${pkg.amount_kobo / 100}`
      );
    }
  });
}
```

You remain responsible for rendering the UI, while SolydFlow manages pricing logic, checkout routing, and entitlement calculations.

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

Use entitlements to gate premium features, subscriptions, and customer access.

---

## Smart Payment Routing

SolydFlow can automatically route payments to the most appropriate payment rail based on currency, geography, and routing rules configured in the SolydFlow Console.

### Example Routing Rules

| Currency | Payment Rail |
|-----------|--------------|
| NGN | Monnify |
| KES | M-Pesa |
| USD | Stripe |
| Other | Paystack / Flutterwave |

Routing rules can be updated without redeploying your application.

---

## Start Checkout

Launch a checkout session for a package.

```javascript
await SolydFlow.purchasePackage(
  packageId,
  customerPhoneNumber
);
```

Example:

```javascript
await SolydFlow.purchasePackage(
  "gold_monthly",
  "2348012345678"
);
```

### Optional Phone Number

A phone number is recommended for:

- Local payment rails
- Mobile money flows
- Customer recovery workflows
- Subscription re-engagement campaigns

### Checkout Experience

The SDK automatically selects the appropriate checkout experience based on your routing configuration.

Examples include:

- Hosted checkout pages
- Virtual account payments
- Mobile money payment flows

No additional application logic is required.

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

1. Open the SolydFlow Console.
2. Navigate to your project settings.
3. Configure a webhook endpoint.
4. Deploy your backend listener.

### Subscription Events

SolydFlow can notify your backend when a customer:

- Starts a subscription
- Renews a subscription
- Upgrades a subscription
- Cancels a subscription
- Restores access

### Backend Responsibilities

Your backend should:

1. Verify the cryptographic webhook signature.
2. Filter out Sandbox/Test events if running in production.
3. Synchronize user entitlements in your database.
4. Unlock application features.

Without a backend webhook, your application will not know when a user completes a payment or when a subscription is revoked due to a chargeback.

---

## Example Event Payload

SolydFlow sends a standardized, flat JSON object for all webhook events regardless of the payment provider used.

```json
{
  "event": "subscription_renewed",
  "event_id": "evt_550e8400-e29b-41d4-a716-446655440000",
  "environment": "live",
  "is_test": false,
  "user_id": "user_12345",
  "package_id": "gold_monthly",
  "entitlement": "gold_access",
  "provider": "paystack",
  "expires_at": "2026-12-31T00:00:00Z"
}
```

---

## Backend Example (Node.js / Express)

To secure your endpoint, you must verify the `X-SolydFlow-Signature` header. This header contains a UNIX timestamp (`t=...`) and the HMAC signature (`v1=...`).

The following example demonstrates how to capture the raw body, securely verify the signature to prevent replay attacks, and update your user records.

```javascript
import express from "express";
import crypto from "crypto";

const app = express();

// The secret key found in your SolydFlow Project Dashboard
const SOLYDFLOW_WEBHOOK_SECRET = process.env.SOLYDFLOW_WEBHOOK_SECRET;

// You MUST capture the raw request body to accurately calculate the cryptographic hash
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.post("/webhooks/solydflow", async (req, res) => {
  try {
    const signatureHeader = req.headers['x-solydflow-signature'];

    if (!signatureHeader) {
      return res.status(401).send('Missing SolydFlow signature');
    }

    // 1. Extract timestamp (t) and signature (v1)
    const parsedHeader = signatureHeader.split(',').reduce((acc, pair) => {
      const [key, value] = pair.split('=');
      acc[key] = value;
      return acc;
    }, {});

    const timestamp = parsedHeader['t'];
    const providedSignature = parsedHeader['v1'];

    // 2. Prevent Replay Attacks (Reject if older than 5 minutes)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp - parseInt(timestamp, 10) > 300) {
      return res.status(401).send('Webhook timestamp is too old');
    }

    // 3. Compute and Verify the Signature
    const payloadToSign = `${timestamp}.${req.rawBody}`;
    const expectedSignature = crypto
      .createHmac('sha256', SOLYDFLOW_WEBHOOK_SECRET)
      .update(payloadToSign)
      .digest('hex');

    // Use timingSafeEqual to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    );

    if (!isValid) {
      return res.status(401).send('Cryptographic signature mismatch');
    }

    // --- WEBHOOK IS SECURE ---
    const event = req.body;

    // 4. Prevent Sandbox data from corrupting your Production database
    if (event.is_test && process.env.NODE_ENV === "production") {
        console.log("Ignored SolydFlow Sandbox event.");
        return res.status(200).send("Ignored");
    }

    // 5. Handle Business Logic
    switch (event.event) {
      case "subscription_renewed":
        console.log(`Access granted for user ${event.user_id}. Unlocking: ${event.entitlement}`);
        // TODO: Update your database to grant the user access until event.expires_at
        break;

      case "subscription_revoked":
        console.log(`Access revoked for user ${event.user_id}. Reason: ${event.reason}`);
        // TODO: Remove user access immediately
        break;

      default:
        console.log("Unhandled event:", event.event);
    }

    // Always return a 200 OK so SolydFlow knows the event was received successfully
    res.status(200).json({ received: true });

  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.listen(3000, () => console.log('Listening on port 3000'));
```

## Recommended Integration Pattern

```text
Frontend
    ↓
Display Paywall
    ↓
Customer Selects Plan
    ↓
Hosted Checkout
    ↓
Payment Completed
    ↓
SolydFlow Verification
    ↓
Webhook Event
    ↓
Backend Updates Customer
    ↓
Customer Access Granted
```

---

## Platform Status

### Live

- Paystack
- Flutterwave
- No-Code Paywalls
- Entitlements
- Subscription Events

### Testing

- Stripe

### Planned

- Monnify
- M-Pesa / Daraja
- Additional regional payment rails

---

## Security

### Non-Custodial

SolydFlow never holds your funds.

Payments move directly between your customers and your connected payment providers.

### Verification

All transactions are verified before subscription events and entitlements are issued.

### Signed Webhooks

Webhook events are cryptographically signed and should always be verified by your backend.

---

## Documentation

For production deployments, entitlement architecture, webhook setup, SDK methods, pricing configuration, routing rules, and API references:

👉 https://docs.solydflow.com/docs/intro

---

## Support

- Documentation: https://docs.solydflow.com/docs/intro
- Console: https://console.solydflow.com
- Website: https://solydflow.com
- Support: support@solydflow.com