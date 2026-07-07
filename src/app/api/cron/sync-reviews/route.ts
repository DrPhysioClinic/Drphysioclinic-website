import { NextResponse } from 'next/server';
import { fetchReviews } from '@/lib/reviews/source';
import { parseStarRating } from '@/lib/reviews/types';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase admin client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  // CRON_SECRET protection for Vercel Cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const googleReviews = await fetchReviews();
    
    // Fetch existing synced reviews
    const { data: existingRows, error: fetchError } = await supabase
      .from('testimonials')
      .select('id, google_review_id, review_updated_at')
      .not('google_review_id', 'is', null);
      
    if (fetchError) throw fetchError;
    
    const existingMap = new Map(existingRows?.map(r => [r.google_review_id, r]));
    const fetchedIds = new Set<string>();

    let inserted = 0;
    let updated = 0;

    for (const review of googleReviews) {
      fetchedIds.add(review.reviewId);
      
      // The user requested: "comment-less reviews: import with empty body, not placeholder text"
      const bodyText = review.comment || "";
      const rating = parseStarRating(review.starRating);
      
      const existingRow = existingMap.get(review.reviewId);
      
      if (!existingRow) {
        // Insert new
        const { error: insertError } = await supabase.from('testimonials').insert({
          patient_name: review.reviewer.displayName,
          image_url: review.reviewer.profilePhotoUrl || null,
          testimonial: bodyText,
          rating: rating,
          google_review_id: review.reviewId,
          review_created_at: review.createTime,
          review_updated_at: review.updateTime,
          source: 'google',
          is_published: false // Must be explicitly approved
        });
        
        if (insertError) {
          console.error(`Failed to insert review ${review.reviewId}:`, insertError);
        } else {
          inserted++;
        }
      } else {
        // Update existing if updateTime changed
        if (existingRow.review_updated_at !== review.updateTime) {
          const { error: updateError } = await supabase.from('testimonials')
            .update({
              patient_name: review.reviewer.displayName,
              image_url: review.reviewer.profilePhotoUrl || null,
              testimonial: bodyText,
              rating: rating,
              review_updated_at: review.updateTime
              // intentionally NOT updating is_published
            })
            .eq('google_review_id', review.reviewId);
            
          if (updateError) {
            console.error(`Failed to update review ${review.reviewId}:`, updateError);
          } else {
            updated++;
          }
        }
      }
    }
    
    // Flag reviews that were deleted from Google
    let flagged = 0;
    for (const row of existingRows || []) {
      if (row.google_review_id && !fetchedIds.has(row.google_review_id)) {
        // Just flag the source as google_removed, preserve everything else
        const { error: flagError } = await supabase.from('testimonials')
          .update({ source: 'google_removed' })
          .eq('google_review_id', row.google_review_id);
          
        if (flagError) {
          console.error(`Failed to flag removed review ${row.google_review_id}:`, flagError);
        } else {
          flagged++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      results: {
        fetched: googleReviews.length,
        inserted,
        updated,
        flagged
      }
    });

  } catch (error: any) {
    console.error('Error syncing reviews:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET handler for manual browser tests or vercel cron if it uses GET
export async function GET(request: Request) {
  return POST(request);
}
