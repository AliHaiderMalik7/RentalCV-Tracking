import { useState } from 'react';
import { FaStar, FaRegStar, FaReply, FaExclamationTriangle } from 'react-icons/fa';

type Review = {
  id: string;
  landlordName: string;
  propertyLocation: string;
  dates: string;
  rating: number;
  comments: string;
  isDisputed: boolean;
  tenantReply?: string;
  evidence?: string[]; // URLs to images/docs
};

const TenantReviewsPage = () => {
  // Mock data
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev1',
      landlordName: 'Sarah Johnson',
      propertyLocation: 'Chicago, IL',
      dates: 'Jan 2022 - Dec 2023',
      rating: 5,
      comments: 'Excellent tenant! Always paid rent on time and kept the property in perfect condition.',
      isDisputed: false,
      tenantReply: 'Thank you! I enjoyed living here.'
    },
    {
      id: 'rev2',
      landlordName: 'Michael Chen',
      propertyLocation: 'Austin, TX',
      dates: 'Mar 2021 - Feb 2022',
      rating: 4,
      comments: 'Good tenant overall. Minor wear and tear but responsive to communication.',
      isDisputed: false
    },
    {
      id: 'rev3',
      landlordName: 'David Wilson',
      propertyLocation: 'Seattle, WA',
      dates: 'Aug 2020 - Jul 2021',
      rating: 2,
      comments: 'Several late payments and left damage to walls.',
      isDisputed: true,
      tenantReply: 'I dispute these claims. The damage was pre-existing and payments were only late twice due to bank issues.'
    }
  ]);

  // State for reply modal
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Calculate stats
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const handleReplySubmit = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, tenantReply: replyText } 
        : review
    ));
    setReplyingTo(null);
    setReplyText('');
  };

  const handleDispute = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, isDisputed: !review.isDisputed } 
        : review
    ));
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => 
      i < rating ? <FaStar key={i} className="text-yellow-400" /> : <FaRegStar key={i} className="text-gray-300" />
    );
  };

  return (
    <div className="max-w-8xl mx-auto p-6">
      {/* Header and Stats */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Rental Reviews</h1>
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex">{renderStars(Math.round(averageRating))}</div>
            <p className="text-gray-600">{reviews.length} reviews</p>
          </div>
        </div>
        
        {/* Rating distribution */}
        <div className="mt-4 space-y-1">
          {[5, 4, 3, 2, 1].map(stars => (
            <div key={stars} className="flex items-center">
              <span className="w-8">{stars}★</span>
              <progress 
                value={ratingDistribution[stars as keyof typeof ratingDistribution]} 
                max={reviews.length} 
                className="h-2 mx-2 flex-1"
              />
              <span>({ratingDistribution[stars as keyof typeof ratingDistribution]})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No reviews yet. Reviews will appear here after landlords submit them.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div 
              key={review.id} 
              className={`p-6 bg-white rounded-lg shadow-sm border ${
                review.isDisputed ? 'border-red-200 bg-red-50' : 'border-gray-200'
              }`}
            >
              {/* Review Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    {renderStars(review.rating)}
                    <span className="font-medium">{review.landlordName}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {review.propertyLocation} • {review.dates}
                  </p>
                </div>
                {review.isDisputed && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                    <FaExclamationTriangle /> Disputed
                  </span>
                )}
              </div>

              {/* Review Content */}
              <div className="mt-4">
                <p className="text-gray-700">{review.comments}</p>
              </div>

              {/* Tenant Reply */}
              {review.tenantReply && (
                <div className="mt-4 pl-4 border-l-2 border-blue-200">
                  <p className="text-sm font-medium text-blue-600">Your response:</p>
                  <p className="text-gray-700 mt-1">{review.tenantReply}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                {!review.tenantReply && (
                  <button 
                    onClick={() => setReplyingTo(review.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaReply /> Reply
                  </button>
                )}
                <button 
                  onClick={() => handleDispute(review.id)}
                  className={`flex items-center gap-1 text-sm ${
                    review.isDisputed ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                  }`}
                >
                  <FaExclamationTriangle /> 
                  {review.isDisputed ? 'Resolve Dispute' : 'Dispute Review'}
                </button>
              </div>

              {/* Reply Modal */}
              {replyingTo === review.id && (
                <div className="mt-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="Type your response..."
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button 
                      onClick={() => setReplyingTo(null)}
                      className="px-3 py-1 border border-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleReplySubmit(review.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Submit Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TenantReviewsPage;