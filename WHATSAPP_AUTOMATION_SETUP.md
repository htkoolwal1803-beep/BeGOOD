# BeGood WhatsApp automation setup

The website code is ready for Meta's WhatsApp Cloud API. Complete these steps in Meta and Vercel to activate it.

## 1. Create a permanent production token

In Meta Business Settings:

1. Go to **Users → System users** and create an Admin system user.
2. Assign the BeGood Meta app with full control.
3. Assign the BeGood WhatsApp Business Account to the same system user.
4. Generate a token for the BeGood app with:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
5. Copy it directly into Vercel. Do not paste it into chat, Slack, GitHub, or a document.

The temporary token on WhatsApp → API Setup is for testing only and expires.

## 2. Add Vercel environment variables

Add these to Production, Preview, and Development as appropriate:

```text
WHATSAPP_PHONE_NUMBER_ID=<Phone Number ID from WhatsApp → API Setup>
WHATSAPP_ACCESS_TOKEN=<permanent system-user token>
WHATSAPP_API_VERSION=v26.0
WHATSAPP_VERIFY_TOKEN=<a new random private string you choose>
META_APP_SECRET=<Meta App Dashboard → Settings → Basic → App secret>
```

Optional template-name overrides are available if Meta requires a different approved name:

```text
WHATSAPP_TEMPLATE_ORDER_CONFIRMATION=begood_order_confirmation
WHATSAPP_TEMPLATE_ORDER_STATUS=begood_order_status
WHATSAPP_TEMPLATE_OFFER=begood_offer
WHATSAPP_TEMPLATE_PRODUCT_LAUNCH=begood_product_launch
```

Redeploy after adding the variables.

## 3. Submit message templates in WhatsApp Manager

Use language **English (`en`)**. The names and variable order must match the code.

### `begood_order_confirmation`

- Category: Utility
- Body: `Hi {{1}}, your BeGood order {{2}} is confirmed. Total: {{3}}. Payment: {{4}}. We'll message you when its status changes.`
- Button: Visit website → `View order`
- Dynamic URL: `https://begoodshop.in/order/{{1}}`
- Example variables: `Hardik`, `A1B2C3D4`, `₹625`, `Paid online`
- URL example suffix: a complete BeGood order ID

### `begood_order_status`

- Category: Utility
- Body: `Hi {{1}}, an update for BeGood order {{2}}: it is now {{3}}. Tap below to view the order.`
- Button: Visit website → `View order`
- Dynamic URL: `https://begoodshop.in/order/{{1}}`
- Example variables: `Hardik`, `A1B2C3D4`, `shipped`
- URL example suffix: a complete BeGood order ID

### `abar_usage_tip`

- Category: Utility
- Body: `Hi {{1}}, one useful A-Bar tip: enjoy it shortly before the moment that matters. It is designed to act in less than 20 minutes.`
- Example variable: `Hardik`

### `abar_review_request`

- Category: Marketing
- Body: `Hi {{1}}, how did your A-Bar experience go? Share an honest review—good or bad—and receive ₹20 off your next order.`
- Button: Visit website → `Leave a review`
- Dynamic URL: `https://begoodshop.in/{{1}}`
- Example variable: `Hardik`
- URL example suffix: `review/example-review-token`

### `abar_reorder_reminder`

- Category: Marketing
- Body: `Hi {{1}}, running low on A-Bar? Reorder now so you have one ready before the next exam, interview, deadline, or stressful moment.`
- Button: Visit website → `Reorder`
- Fixed URL: `https://begoodshop.in/shop`
- Example variable: `Hardik`

### `begood_offer`

- Category: Marketing
- Body: `Hi {{1}}, a BeGood offer for you: {{2}}. {{3}}. Tap below to shop.`
- Button: Visit website → `Shop now`
- Fixed URL: `https://begoodshop.in/shop`
- Example variables: `Hardik`, `Buy 4 A-Bars, get 1 free`, `Valid through 31 August`

### `begood_product_launch`

- Category: Marketing
- Body: `Hi {{1}}, introducing {{2}} from BeGood. {{3}}. Tap below to learn more and shop.`
- Button: Visit website → `Explore`
- Fixed URL: `https://begoodshop.in/shop`
- Example variables: `Hardik`, `BeGood P-Bar`, `Designed for difficult period days`

Meta makes the final category decision during review. Do not edit approved wording without updating the template in WhatsApp Manager.

## 4. Configure the webhook

In Meta App Dashboard → WhatsApp → Configuration:

- Callback URL: `https://begoodshop.in/api/webhooks/whatsapp`
- Verify token: exactly the same value as `WHATSAPP_VERIFY_TOKEN` in Vercel
- Subscribe the WhatsApp Business Account to the `messages` webhook field

The endpoint verifies Meta's `x-hub-signature-256` using `META_APP_SECRET`. It stores sent/delivered/read/failed receipts and treats `STOP`, `UNSUBSCRIBE`, `CANCEL`, or `OPT OUT` as marketing opt-outs.

## 5. What sends automatically

| Trigger | Template | Consent rule |
|---|---|---|
| Successful online or COD order | `begood_order_confirmation` | WhatsApp opt-in required |
| Admin changes order to Processing, Shipped, or Delivered | `begood_order_status` | WhatsApp opt-in required |
| Day 3 after order | `abar_usage_tip` | WhatsApp opt-in required; email is fallback |
| Day 7 after order | `abar_review_request` | WhatsApp opt-in required; email is fallback |
| Day 25 after order, unless reordered | `abar_reorder_reminder` | WhatsApp opt-in required; email is fallback |
| Admin sends an offer or launch | `begood_offer` / `begood_product_launch` | WhatsApp opt-in required |

The checkout checkbox is unticked by default and stores consent on the order. Existing customers who never opted in are excluded from marketing campaigns.

## 6. Test safely

1. Wait until every template shows **Active** in WhatsApp Manager.
2. Place one low-value test order using a phone you control.
3. Confirm the order message arrives once.
4. In `/admin`, change that order to Processing, Shipped, and Delivered, checking each message.
5. Reply `STOP` and confirm `/admin/whatsapp` no longer counts that number in the opted-in audience.
6. In `/admin/whatsapp`, preview a campaign before sending it.

Order status updates currently follow the status selected in the BeGood admin dashboard. Courier-generated live tracking requires a separate Shiprocket, Delhivery, or other courier webhook integration.
