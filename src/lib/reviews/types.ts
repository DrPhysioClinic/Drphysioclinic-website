export interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE';
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export function parseStarRating(rating: string): number {
  switch (rating) {
    case 'FIVE': return 5;
    case 'FOUR': return 4;
    case 'THREE': return 3;
    case 'TWO': return 2;
    case 'ONE': return 1;
    default: return 5;
  }
}
