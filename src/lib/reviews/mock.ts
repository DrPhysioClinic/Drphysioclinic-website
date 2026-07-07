import { GoogleReview } from './types';

export async function fetchMockReviews(): Promise<GoogleReview[]> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      reviewId: 'mock_review_1',
      reviewer: {
        displayName: 'Aarav Patel',
        profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/mock_photo_1',
      },
      starRating: 'FIVE',
      comment: 'Excellent service! Dr. Jeetendra is very knowledgeable and patient. My knee pain is completely gone after 5 sessions.',
      createTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      updateTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      reviewReply: {
        comment: 'Thank you Aarav for your kind words. We are glad you are feeling better!',
        updateTime: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      }
    },
    {
      // Comment-less review (rating only)
      reviewId: 'mock_review_2',
      reviewer: {
        displayName: 'Priya Shah',
      },
      starRating: 'FIVE',
      // No comment
      createTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      // Long comment + Edited
      reviewId: 'mock_review_3',
      reviewer: {
        displayName: 'Rohan Desai',
        profilePhotoUrl: 'https://lh3.googleusercontent.com/a-/mock_photo_3',
      },
      starRating: 'FIVE',
      comment: 'I had a severe sports injury and was really worried if I could ever play badminton again. The team here, especially Dr. Jeetendra, worked with me for 3 months with a dedicated rehabilitation program. The facilities are top-notch and the staff is very supportive. Highly recommend for any sports injuries. Edited: Changed to 5 stars! Parking is fine now.',
      createTime: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
      updateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Edited VERY recently
    }
  ];
}
