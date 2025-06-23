import React, { useState, useEffect } from "react"
import { X, MessageCircle, Building, Heart, Share2 } from "lucide-react"
import { ratingsAPI, commentsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import type { Book, RatingResponse } from "../../types"
import RatingStars from "../ratings/RatingStars"
import CommentSection from "../comments/CommentSection"

interface BookModalProps {
  book: Book | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

const BookModal: React.FC<BookModalProps> = ({
  book,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [ratingData, setRatingData] = useState<RatingResponse | null>(null)
  const [commentCount, setCommentCount] = useState(0)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (book && isOpen) {
      fetchRatingData()
      fetchCommentCount()
    }
  }, [book, isOpen])

  const fetchRatingData = async () => {
    if (!book?.bookId) return
    try {
      const data = await ratingsAPI.getByBook(book.bookId)
      setRatingData(data)
    } catch (error) {
      console.error("Failed to fetch ratings:", error)
    }
  }

  const fetchCommentCount = async () => {
    if (!book?.bookId) return
    try {
      const comments = await commentsAPI.getByBook(book.bookId)
      setCommentCount(comments.length)
    } catch (error) {
      console.error("Failed to fetch comment count:", error)
    }
  }

  const handleRatingUpdate = async () => {
    await fetchRatingData()
    // Notify parent component to update card data
    onUpdate?.()
  }

  const handleCommentUpdate = async () => {
    await fetchCommentCount()
    // Notify parent component to update card data
    onUpdate?.()
  }

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Book Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Image */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  <img
                    src={book.book_image}
                    alt={book.title}
                    className="w-full h-[500px] object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src =
                        "https://via.placeholder.com/400x500?text=No+Image"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110">
                      <Heart size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110">
                      <Share2 size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Author */}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-600 font-medium">
                    by {book.author}
                  </p>
                </div>

                {/* Rating Section */}
                {ratingData && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Rating
                        </h3>
                        <RatingStars
                          rating={ratingData.averageRating}
                          totalRatings={ratingData.totalRatings}
                          bookId={book.bookId!}
                          onRatingUpdate={handleRatingUpdate}
                          isAuthenticated={isAuthenticated}
                          readonly={false}
                        />
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-600">
                          {ratingData.averageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {ratingData.totalRatings}{" "}
                          {ratingData.totalRatings === 1 ? "rating" : "ratings"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Details */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building size={20} className="text-indigo-600 mr-2" />
                    Book Information
                  </h3>

                  {book.publisher && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">
                        Publisher
                      </span>
                      <span className="text-gray-900">{book.publisher}</span>
                    </div>
                  )}

                  {book.price && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">Price</span>
                      <span className="text-2xl font-bold text-green-600">
                        {book.price}
                      </span>
                    </div>
                  )}

                  {book.contributor && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-600 font-medium">
                        Contributor
                      </span>
                      <span className="text-gray-900">{book.contributor}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {book.description && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      About this book
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Comments Section */}
                {book.bookId && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-indigo-100 rounded-full">
                        <MessageCircle size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Community Discussion
                        </h3>
                        <p className="text-sm text-gray-600">
                          {commentCount}{" "}
                          {commentCount === 1 ? "comment" : "comments"}
                        </p>
                      </div>
                    </div>
                    <CommentSection
                      bookId={book.bookId}
                      onCommentUpdate={handleCommentUpdate}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookModal
