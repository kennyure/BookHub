import React, { useState, useEffect } from "react"
import { MessageCircle, Eye } from "lucide-react"
import { ratingsAPI, commentsAPI } from "../../services/api"
import type { Book, RatingResponse } from "../../types"
import RatingStars from "../ratings/RatingStars"

interface BookCardProps {
  book: Book
  onCardClick: (book: Book) => void
  ratingData?: RatingResponse | null
  commentCount?: number
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onCardClick,
  ratingData: externalRatingData,
  commentCount: externalCommentCount,
}) => {
  const [ratingData, setRatingData] = useState<RatingResponse | null>(null)
  const [commentCount, setCommentCount] = useState(0)

  // Use external data if provided, otherwise use internal state
  const displayRatingData =
    externalRatingData !== undefined ? externalRatingData : ratingData
  const displayCommentCount =
    externalCommentCount !== undefined ? externalCommentCount : commentCount

  useEffect(() => {
    if (externalRatingData === undefined) {
      fetchRatingData()
    }
    if (externalCommentCount === undefined) {
      fetchCommentCount()
    }
  }, [book.bookId, externalRatingData, externalCommentCount])

  // Update internal state when external data changes
  useEffect(() => {
    if (externalRatingData !== undefined) {
      setRatingData(externalRatingData)
    }
  }, [externalRatingData])

  useEffect(() => {
    if (externalCommentCount !== undefined) {
      setCommentCount(externalCommentCount)
    }
  }, [externalCommentCount])

  const fetchRatingData = async () => {
    if (!book.bookId) return
    try {
      const data = await ratingsAPI.getByBook(book.bookId)
      setRatingData(data)
    } catch (error) {
      console.error("Failed to fetch ratings:", error)
    }
  }

  const fetchCommentCount = async () => {
    if (!book.bookId) return
    try {
      const comments = await commentsAPI.getByBook(book.bookId)
      setCommentCount(comments.length)
    } catch (error) {
      console.error("Failed to fetch comment count:", error)
    }
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-100"
      onClick={() => onCardClick(book)}
    >
      <div className="relative">
        <img
          src={book.book_image}
          alt={book.title}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "https://via.placeholder.com/300x200?text=No+Image"
          }}
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
          <Eye size={14} />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

        {displayRatingData && (
          <div className="flex items-center space-x-2 mb-3">
            <RatingStars
              rating={displayRatingData.averageRating}
              totalRatings={displayRatingData.totalRatings}
              bookId={book.bookId!}
              onRatingUpdate={fetchRatingData}
              isAuthenticated={false}
              readonly={true}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageCircle size={14} />
              <span>{displayCommentCount}</span>
            </div>
          </div>

          {book.price && (
            <p className="text-sm font-semibold text-green-600">{book.price}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookCard
