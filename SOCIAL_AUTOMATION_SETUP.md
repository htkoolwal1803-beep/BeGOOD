# BeGood social publishing setup

This integration publishes only after an exact Slack approval from the configured approver. LinkedIn and Instagram retain separate scheduled times and a 24-hour late-approval window.

## Production environment variables

Set these in the BeGOOD Vercel project. Never commit their values.

```text
# Shared security and scheduling
CRON_SECRET
SOCIAL_TOKEN_ENCRYPTION_KEY
SOCIAL_SCHEDULE_START_DATE=2026-08-19

# Vercel Blob (created automatically when a Blob store is connected)
BLOB_READ_WRITE_TOKEN

# Slack
SLACK_BOT_TOKEN
SLACK_SIGNING_SECRET
SLACK_CHANNEL_ID=C0BQH9ZHMB9
SLACK_APPROVER_USER_ID=U0BQUU6M5B7

# Meta / Instagram
META_APP_ID
META_APP_SECRET
META_LOGIN_CONFIG_ID
META_REDIRECT_URI=https://begoodshop.in/api/auth/meta/callback
META_GRAPH_VERSION=v26.0
INSTAGRAM_USERNAME=be_good_hat

# LinkedIn
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
LINKEDIN_ORGANIZATION_ID=111785014
LINKEDIN_REDIRECT_URI=https://begoodshop.in/api/auth/linkedin/callback
LINKEDIN_VERSION=202607
```

`SOCIAL_TOKEN_ENCRYPTION_KEY` must be a random value at least 32 characters long. Changing it after OAuth connection invalidates the encrypted tokens and requires reconnecting both platforms.

## Vercel Blob

1. Open the BeGOOD project in Vercel.
2. Open Storage and create a Blob store.
3. Connect it to Production. Vercel adds `BLOB_READ_WRITE_TOKEN`.
4. Redeploy after environment variables are complete.

## Meta

1. Under Facebook Login for Business, create or open the login configuration used by BeGood.
2. Copy its configuration ID into `META_LOGIN_CONFIG_ID`.
3. Keep the redirect URI as `https://begoodshop.in/api/auth/meta/callback`.
4. Set the data-deletion callback URL to `https://begoodshop.in/api/auth/meta/data-deletion`.
5. After deployment, sign in at `/admin/social` and select Connect under Instagram / Meta.

## Slack

After the production route is deployed:

1. Enable Event Subscriptions.
2. Set Request URL to `https://begoodshop.in/api/slack/events`.
3. Subscribe to the bot event `message.channels`.
4. Save, reinstall the app if Slack requests it, and keep the bot invited to `#gpt`.

The only accepted command is `APPROVE BG-YYYYMMDD-NN`, sent by the configured user in the configured channel.

## LinkedIn

After Community Management API access is approved, open `/admin/social` and select Connect under LinkedIn. The company organization is fixed to `111785014`; member-profile publishing is not implemented.

## UTC cron schedule

| Workflow | UTC | IST |
|---|---:|---:|
| Approval request | 02:00 | 07:30 |
| LinkedIn publish | 07:00 | 12:30 |
| Instagram publish | 14:00 | 19:30 |

The daily jobs do nothing on days without a queued post. Post creation validates the every-second-day schedule beginning 2026-08-19.

## Operational safety

- External publish failures move the platform to `needs_review`; automatic retry is paused to prevent duplicate posts.
- A manual Retry button is available in `/admin/social` after the operator confirms that no post exists on the platform.
- Slack event IDs and post IDs are unique in MongoDB.
- OAuth tokens are encrypted at rest with AES-256-GCM.
- Unapproved posts never enter the publisher.
