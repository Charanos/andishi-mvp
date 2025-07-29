# Admin Client Reviews CRUD Implementation Guide

This guide outlines the implementation of admin CRUD operations for client reviews, following the same patterns established for blog posts and projects.

## Overview

The implementation will allow admin users to:

1. Create, read, update, and delete client reviews
2. Moderate and manage reviews through an intuitive admin dashboard interface
3. Display reviews on the homepage with the existing carousel component

## Architecture Components

### 1. Database Schema

Add a Review model to `prisma/schema.prisma`:

```prisma
model Review {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  position  String
  avatar    String?
  rating    Int
  review    String
  project   String
  featured  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. API Endpoints

#### Main Reviews API (`/api/reviews`)

- `GET /api/reviews` - Fetch all reviews (public access)
- `POST /api/reviews` - Create new review (admin only)
- `GET /api/reviews/[id]` - Fetch single review (public access)
- `PUT /api/reviews/[id]` - Update review (admin only)
- `DELETE /api/reviews/[id]` - Delete review (admin only)

### 3. React Hooks

#### `useReviewCrud` Hook

Similar to `useBlogCrud`, this hook will manage review operations:

```typescript
export const useReviewCrud = () => {
  const { user, token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  // CRUD operations
  const createReview = useCallback(
    async (reviewData: ReviewFormData): Promise<ReviewType | null> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const updateReview = useCallback(
    async (
      id: string,
      reviewData: Partial<ReviewFormData>
    ): Promise<ReviewType | null> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const deleteReview = useCallback(
    async (id: string): Promise<boolean> => {
      /* ... */
    },
    [isAdmin, token]
  );
  const fetchReviews = useCallback(async (): Promise<ReviewType[]> => {
    /* ... */
  }, []);

  return {
    createReview,
    updateReview,
    deleteReview,
    fetchReviews,
    isLoading,
    error,
    isAdmin,
    clearError: () => setError(null),
  };
};
```

### 4. Admin Dashboard UI Components

#### Review Management Interface

Create a dedicated admin interface for managing reviews:

```tsx
const ReviewsAdmin = () => {
  const { fetchReviews, createReview, updateReview, deleteReview } =
    useReviewCrud();
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewType | null>(null);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      setLoading(true);
      const reviewData = await fetchReviews();
      if (reviewData) {
        setReviews(reviewData);
      }
      setLoading(false);
    };

    loadReviews();
  }, [fetchReviews]);

  // Handle create review
  const handleCreate = async (reviewData: ReviewFormData) => {
    const result = await createReview(reviewData);
    if (result) {
      setReviews((prev) => [result, ...prev]);
      setShowForm(false);
      toast.success("Review created successfully");
    }
  };

  // Handle update review
  const handleUpdate = async (
    id: string,
    reviewData: Partial<ReviewFormData>
  ) => {
    const result = await updateReview(id, reviewData);
    if (result) {
      setReviews((prev) =>
        prev.map((review) => (review.id === id ? result : review))
      );
      setEditingReview(null);
      toast.success("Review updated successfully");
    }
  };

  // Handle delete review
  const handleDelete = async (id: string) => {
    const confirmed = await showConfirmationModal({
      title: "Delete Review",
      message:
        "Are you sure you want to delete this review? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (confirmed) {
      const success = await deleteReview(id);
      if (success) {
        setReviews((prev) => prev.filter((review) => review.id !== id));
        toast.success("Review deleted successfully");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-medium text-white">
          Client Reviews Management
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
        >
          Add New Review
        </button>
      </div>

      {/* Review Form Modal */}
      {(showForm || editingReview) && (
        <ReviewForm
          review={editingReview}
          onSubmit={editingReview ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Reviews List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-400">Loading reviews...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-6 hover:bg-gray-800/30 transition-colors"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">
                      {review.name}
                    </h3>
                    <p className="text-gray-400 text-sm">{review.position}</p>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={`${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-600"
                          } text-sm mr-1`}
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-gray-300 line-clamp-2">
                      {review.review}
                    </p>
                    <p className="mt-2 text-indigo-400 text-sm">
                      Project: {review.project}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingReview(review)}
                      className="p-2 text-blue-400 hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. Homepage Integration

Update the ClientReviews component to fetch reviews from the API instead of using static data:

```tsx
// In ClientReviews component
const ClientReviews = () => {
  const [currentReview, setCurrentReview] = useState(0);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reviews from API
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/reviews");
        const result = await response.json();

        if (response.ok && result.data) {
          setReviews(result.data);
        } else {
          throw new Error(result.error || "Failed to load reviews");
        }
      } catch (err) {
        setError(err.message || "Failed to load reviews");
        console.error("Error loading reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Rest of the component remains the same
  // ...
};
```

## Implementation Steps

1. **Database Migration**

   - Add Review model to Prisma schema
   - Run `npx prisma generate` to update client
   - Run `npx prisma db push` to update database

2. **API Development**

   - Create `/api/reviews` route handlers
   - Implement authentication middleware for admin-only endpoints
   - Add validation for review data

3. **Frontend Implementation**

   - Create `useReviewCrud` hook
   - Implement admin dashboard UI for review management
   - Update ClientReviews component to fetch from API
   - Add form components for creating/editing reviews

4. **Testing**
   - Verify public access to reviews list
   - Test admin-only CRUD operations
   - Check homepage display of reviews
   - Validate form validation and error handling

## Security Considerations

- All CUD operations must be protected by admin authentication
- Input validation for all API endpoints
- Proper error handling and user feedback
- Rate limiting for review submissions (if allowing public submissions in future)

## Error Handling

- Implement toast notifications for user feedback
- Add confirmation modals for destructive actions
- Provide clear error messages for failed operations
- Implement retry mechanisms for failed requests

## Performance Optimization

- Implement proper indexing on review fields
- Use caching for reviews data
- Optimize review list queries
- Lazy load review details when needed

## Future Enhancements

- Add review moderation workflow (pending/approved/rejected)
- Allow clients to submit reviews (with admin approval)
- Add review categories or tags
- Implement review analytics dashboard
- Add review response functionality

This implementation follows the same patterns established for blog posts and projects, ensuring consistency across the platform while providing powerful admin capabilities for review management.
