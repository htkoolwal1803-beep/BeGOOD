# Automatic post-purchase messages

Orders become eligible when their admin status is **Delivered**. Message ages
are measured from the first `shippedAt` timestamp: usage on day 3, review on
day 7, replenishment on day 25. Direct-to-delivered orders use `deliveredAt`.
For older delivered orders lacking both timestamps, `updatedAt` is the best
available delivery timestamp. Checkout age is never used as fulfillment age.
Repeated status edits preserve the original timestamps.

The existing Vercel schedule runs `/api/cron/retention` using GET daily at
04:00 UTC (09:30 India time). POST remains available to authenticated admins.
Both methods require `CRON_SECRET` bearer authorization or the admin key.
Production needs `MONGO_URL` (or `MONGO_URI`), `CRON_SECRET`, and the existing
email/WhatsApp provider settings. Email fallback requires `BREVO_API_KEY` and
`EMAIL_FROM`. See `lib/whatsapp.js` for WhatsApp configuration.

Unsent messages remain due after the day threshold. This intentionally catches
up after delayed delivery or a provider outage. On the first corrected cron run,
older delivered orders with unsent messages can be due for multiple messages.
Previously recorded successful sends remain suppressed; existing review
requests marked sent/submitted remain suppressed. Historical review requests
incorrectly marked sent by the old implementation cannot be distinguished from
actual successful sends without provider logs, so they are not resent blindly.

Review links are recorded pending before a send and marked sent only after
provider success. Failed sends retain their link and retry. A database lease
serializes manual/cron sends and expires after 15 minutes if a function dies.
The configured function duration is 300 seconds. Provider acceptance followed
by a process failure before the database acknowledgment can still cause a
duplicate on retry; the provider APIs do not offer transactional delivery.

## Verify after production deployment

1. Confirm Vercel has the required environment variables and the retention cron
   is enabled for the production deployment.
2. Preview with an authenticated GET or POST to
   `/api/cron/retention?dryRun=1`. This sends nothing and writes nothing.
3. Check a controlled order in the admin portal: Shipped records `shippedAt`;
   Delivered records `deliveredAt`, and repeat edits preserve both.
4. Use the existing admin test-send control with an internal address to check
   provider delivery. Check the next scheduled run in Vercel logs, including
   `summary.failed`, and confirm send timestamps are written on success.

Local regression verification: `node --test tests/*.test.mjs`.

