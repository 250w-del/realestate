import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Filter, Search } from 'lucide-react'
import { fetchReviews, createReview, approveReview } from '../store/slices/reviewSlice'
import toast from 'react-hot-toast'

const ReviewsPage = () => {
  const dispatch = useDispatch()
  const { reviews, loading } = useSelector(state => state.reviews)
  const { user } = useSelector(state => state.auth)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [formData, setFormData] = useState({
    propertyId: '',
    rating: 5,
    title: '',
    content: ''
  })

  useEffect(() => {
    dispatch(fetchReviews())
  }, [dispatch])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    try {
      await dispatch(createReview(formData)).unwrap()
      setShowReviewForm(false)
      setFormData({ propertyId: '', rating: 5, title: '', content: '' })
      toast.success('Review submitted successfully!')
    } catch (error) {
      toast.error('Failed to submit review')
    }
  }

  const handleApproveReview = async (reviewId) => {
    try {
      await dispatch(approveReview(reviewId)).unwrap()
      toast.success('Review approved!')
    } catch (error) {
      toast.error('Failed to approve review')
    }
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.property?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || review.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50 py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Property Reviews</h1>
            <p className="text-gray-600">Read and share experiences with properties</p>
          </div>
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Write Review
            </button>
          )}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Reviews</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Write a Review</h2>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Property ID
                  </label>
                  <input
                    type="text"
                    value={formData.propertyId}
                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to share your experience!'
              }
            </p>
            {user && !searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Write First Review
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      {review.reviewer?.avatar ? (
                        <img
                          src={review.reviewer.avatar}
                          alt={review.reviewer.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                          {review.reviewer?.name?.[0] || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {review.reviewer?.name || 'Anonymous'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                      review.status === 'approved' ? 'bg-green-100 text-green-800' :
                      review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {review.status}
                    </span>
                    {user?.role === 'admin' && review.status === 'pending' && (
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                  <p className="text-gray-700">{review.content}</p>
                </div>

                {review.property && (
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-600">
                      Reviewed: <a href={`/properties/${review.property.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        {review.property.title}
                      </a>
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <button className="flex items-center hover:text-gray-700">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Helpful ({review.helpful || 0})
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ReviewsPage
