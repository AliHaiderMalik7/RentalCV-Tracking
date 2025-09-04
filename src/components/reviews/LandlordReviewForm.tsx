import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Button from "@/components/common/Button";
import { toast } from "react-toastify";
import { FaStar } from "react-icons/fa";

interface LandlordReviewFormProps {
  tenancyId?: string;
}

interface ReviewFormData {
  communicationRating: number;
  punctualityRating: number;
  conditionRating: number;
  paymentRating: number;
  overallRating: number;
  comment: string;
}

const LandlordReviewForm = ({ tenancyId }: LandlordReviewFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const userId = currentUser?._id;

  const queryParams = new URLSearchParams(location.search);
  const tenancyIdFromUrl = queryParams.get("tenancyId") || tenancyId;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    communicationRating: 0,
    punctualityRating: 0,
    conditionRating: 0,
    paymentRating: 0,
    overallRating: 0,
    comment: "",
  });

  const tenancyDetails = useQuery(
    api.tenancy.getTenancyById,
    tenancyIdFromUrl ? { tenancyId: tenancyIdFromUrl as any } : "skip",
  );

  const submitReview = useMutation(api.reviews.submitLandlordReview);

  useEffect(() => {
    if (!userId || !tenancyIdFromUrl) {
      toast.error("Invalid review session");
      navigate("/login");
      return;
    }
  }, [userId, tenancyIdFromUrl, navigate]);

  useEffect(() => {
    // Calculate overall rating as average of all ratings
    const ratings = [
      formData.communicationRating,
      formData.punctualityRating,
      formData.conditionRating,
      formData.paymentRating,
    ];
    const validRatings = ratings.filter((r) => r > 0);
    const average =
      validRatings.length > 0
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
        : 0;

    if (average !== formData.overallRating) {
      setFormData((prev) => ({
        ...prev,
        overallRating: Math.round(average * 10) / 10,
      }));
    }
  }, [
    formData.communicationRating,
    formData.punctualityRating,
    formData.conditionRating,
    formData.paymentRating,
  ]);

  const handleRatingChange = (field: keyof ReviewFormData, rating: number) => {
    setFormData((prev) => ({ ...prev, [field]: rating }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const validateForm = () => {
    if (formData.communicationRating === 0) {
      toast.error("Please rate communication");
      return false;
    }
    if (formData.punctualityRating === 0) {
      toast.error("Please rate punctuality");
      return false;
    }
    if (formData.conditionRating === 0) {
      toast.error("Please rate property condition");
      return false;
    }
    if (formData.paymentRating === 0) {
      toast.error("Please rate payment reliability");
      return false;
    }
    if (!formData.comment.trim()) {
      toast.error("Please add a comment about your experience");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !tenancyIdFromUrl || !userId) {
      return;
    }

    setLoading(true);

    try {
      const result = await submitReview({
        tenancyId: tenancyIdFromUrl as any,
        reviewerId: userId,
        revieweeType: "tenant" as const,
        communicationRating: formData.communicationRating as any,
        punctualityRating: formData.punctualityRating as any,
        conditionRating: formData.conditionRating as any,
        paymentRating: formData.paymentRating as any,
        overallRating: formData.overallRating,
        comment: formData.comment,
      });

      if (result.success) {
        toast.success(
          "Review submitted successfully! Thank you for your feedback.",
        );
        navigate("/landlord/dashboard");
      } else {
        toast.error(result.error || "Failed to submit review");
      }
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred while submitting your review");
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (
    field: keyof ReviewFormData,
    label: string,
    description: string,
  ) => {
    const rating = formData[field] as number;

    return (
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <span className="text-sm font-medium text-gray-900">
            {rating > 0 ? `${rating}/5` : "Not rated"}
          </span>
        </div>

        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(field, star)}
              className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                star <= rating
                  ? "text-yellow-400 hover:text-yellow-500"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            >
              <FaStar className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!tenancyDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tenancy details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Review Your Tenant
            </h1>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
              <p className="text-green-800 font-semibold">
                🎉 This review is FREE for you!
              </p>
            </div>
          </div>
        </div>

        {/* Tenancy Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Tenancy Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p>
                <strong>Tenant:</strong> {tenancyDetails.invitedTenantName}
              </p>
              <p>
                <strong>Property:</strong> Property details loading...
              </p>
            </div>
            <div>
              <p>
                <strong>Tenancy Period:</strong>{" "}
                {new Date(tenancyDetails.startDate).toLocaleDateString()} -{" "}
                {tenancyDetails.endDate
                  ? new Date(tenancyDetails.endDate).toLocaleDateString()
                  : "Ongoing"}
              </p>
              {tenancyDetails.monthlyRent && (
                <p>
                  <strong>Monthly Rent:</strong> ${tenancyDetails.monthlyRent}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Rate Your Experience
          </h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Categories */}
            <div className="space-y-6">
              {renderStarRating(
                "communicationRating",
                "Communication",
                "How well did the tenant communicate throughout the tenancy?",
              )}

              {renderStarRating(
                "punctualityRating",
                "Punctuality",
                "Was the tenant punctual with rent payments and appointments?",
              )}

              {renderStarRating(
                "conditionRating",
                "Property Condition",
                "How well did the tenant maintain the property condition?",
              )}

              {renderStarRating(
                "paymentRating",
                "Payment Reliability",
                "How reliable was the tenant with rent and other payments?",
              )}
            </div>

            {/* Overall Rating Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-800">
                  Overall Rating:
                </span>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= formData.overallRating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-blue-800">
                    {formData.overallRating > 0
                      ? formData.overallRating.toFixed(1)
                      : "0.0"}
                    /5
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments *
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Please provide specific examples of your experience with this
                tenant. Keep it factual and professional.
              </p>
              <textarea
                value={formData.comment}
                onChange={handleCommentChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Example: The tenant was very communicative and maintained the property well. Rent was always paid on time and they were respectful of the property and neighbors."
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.comment.length} characters
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">
                Review Guidelines
              </h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Be honest and factual based on your actual experience</li>
                <li>• Avoid discriminatory language or personal attacks</li>
                <li>• Focus on tenancy-related behavior and property care</li>
                <li>• Keep comments professional and constructive</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                className="px-8 py-3 text-lg font-semibold"
                size="lg"
              >
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandlordReviewForm;
