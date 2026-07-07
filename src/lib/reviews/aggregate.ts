import { createClient } from '@supabase/supabase-js';

// Server-side helper to compute aggregate rating from Google reviews
export async function getAggregateGoogleRating() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // The user explicitly requested: "computes over all source='google' rows regardless of publish state"
  const { data, error } = await supabase
    .from('testimonials')
    .select('rating')
    .eq('source', 'google')
    .not('rating', 'is', null);

  if (error || !data || data.length === 0) {
    return null;
  }

  const reviewCount = data.length;
  const totalStars = data.reduce((sum, row) => sum + (row.rating || 0), 0);
  const ratingValue = (totalStars / reviewCount).toFixed(1);

  return {
    ratingValue,
    reviewCount: reviewCount.toString(),
  };
}
