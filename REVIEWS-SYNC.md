# Google Reviews Sync Guide

This document explains how to connect the clinic website to the real Google Business Profile (GBP) API to automatically sync patient reviews.

## Architecture Overview
The site features a swappable data source for reviews:
1. **Mock Source (`REVIEW_SOURCE=mock`)**: Returns realistic dummy data to test the integration safely without an active GBP connection.
2. **Google Source (`REVIEW_SOURCE=google`)**: Connects to the real Google My Business API via OAuth 2.0.

The sync runs daily (or can be manually triggered) and upserts reviews into the database. New reviews are added in an unpublished state so the doctor can approve them before they appear on the public site.

## How to Go Live

### 1. Acquire Google OAuth Credentials
You need a Google Cloud Project with the **Google My Business API** enabled. Since this is a server-to-server job, you'll use the OAuth 2.0 Web Server flow or OAuth Playground to generate a persistent Refresh Token.

Required credentials:
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

### 2. Implement the API Stub
Open `src/lib/reviews/google.ts` and replace the placeholder error with the actual fetch calls.
*Note: We left this as a stub because GBP API requires explicit approval from Google which is currently pending.*

### 3. Configure Environment Variables
Set the following environment variables in your Vercel project settings:
```env
REVIEW_SOURCE=google
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REFRESH_TOKEN=your_refresh_token
CRON_SECRET=a_randomly_generated_secure_string
```

### 4. Trigger the First Sync
1. Log into the Admin Portal.
2. Navigate to **Testimonials**.
3. Click **"Sync Google Reviews"**.
4. Verify that real reviews flow into the table with a "Google" badge.
5. They will be marked as unpublished by default. Toggle them to published to show them on the public site!

### 5. Aggregate Rating Display
Once you flip `REVIEW_SOURCE=google` and publish your first sync, the website's Schema JSON-LD will automatically stop using the hardcoded 5.0/593 values and instead perfectly calculate the real average and total review count from the synced Google data in the database.
