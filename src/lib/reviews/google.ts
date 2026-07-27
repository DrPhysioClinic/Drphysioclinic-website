import { GoogleReview } from './types';

export async function fetchGoogleReviews(): Promise<GoogleReview[]> {
  const GOOGLE_OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const GOOGLE_OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const GOOGLE_OAUTH_REFRESH_TOKEN = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!GOOGLE_OAUTH_CLIENT_ID || !GOOGLE_OAUTH_CLIENT_SECRET || !GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new Error('Google OAuth credentials not configured.');
  }

  // 1. Exchange refresh token for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      client_secret: GOOGLE_OAUTH_CLIENT_SECRET,
      refresh_token: GOOGLE_OAUTH_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenRes.ok) {
    const errorText = await tokenRes.text();
    throw new Error(`Failed to refresh access token: ${errorText}`);
  }

  const { access_token } = await tokenRes.json();

  // 2. Fetch accounts
  const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!accountsRes.ok) {
    const errorText = await accountsRes.text();
    throw new Error(`Failed to fetch accounts: ${errorText}`);
  }

  const accountsData = await accountsRes.json();
  const accountName = accountsData.accounts?.[0]?.name;

  if (!accountName) {
    throw new Error('No Google Business Profile accounts found for this user.');
  }

  // 3. Fetch locations
  const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!locationsRes.ok) {
    const errorText = await locationsRes.text();
    throw new Error(`Failed to fetch locations: ${errorText}`);
  }

  const locationsData = await locationsRes.json();
  const locationName = locationsData.locations?.[0]?.name;

  if (!locationName) {
    throw new Error('No Google Business Profile locations found for this account.');
  }

  // 4. Fetch reviews (with pagination)
  const allReviews: GoogleReview[] = [];
  let nextPageToken = '';

  do {
    const url = new URL(`https://mybusiness.googleapis.com/v4/${accountName}/${locationName}/reviews`);
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }
    
    const reviewsRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    if (!reviewsRes.ok) {
      const errorText = await reviewsRes.text();
      throw new Error(`Failed to fetch reviews: ${errorText}`);
    }

    const reviewsData = await reviewsRes.json();
    if (reviewsData.reviews && reviewsData.reviews.length > 0) {
      allReviews.push(...reviewsData.reviews);
    }

    nextPageToken = reviewsData.nextPageToken || '';
  } while (nextPageToken);

  return allReviews;
}
