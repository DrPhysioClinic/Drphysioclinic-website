import { GoogleReview } from './types';
import { fetchMockReviews } from './mock';
import { fetchGoogleReviews } from './google';

export async function fetchReviews(): Promise<GoogleReview[]> {
  const source = process.env.REVIEW_SOURCE || 'mock';
  
  if (source === 'google') {
    return fetchGoogleReviews();
  }
  
  return fetchMockReviews();
}
