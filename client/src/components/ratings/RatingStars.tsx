import React, { useState } from "react"
import { Star } from "lucide-react"
import { ratingsAPI } from "../../services/api"

interface RatingStarsProps {
  rating: number
  totalRatings: number
  bookId: string
  onRatingUpdate: () => void
  isAuthenticated: boolean
  readonly?: boolean
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalRatings,
  bookId,
  onRatingUpdate,
  isAuthenticated,
  readonly = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingClick = async (selectedRating: number) => {
    if (readonly || !isAuthenticated) {
      if (!isAuthenticated) {
        alert("Please log in to rate books")
      }
      return
    }

    try {
      setIsSubmitting(true)
      await ratingsAPI.createOrUpdate(bookId, selectedRating)
      onRatingUpdate()
    } catch (error) {
      console.error("Failed to submit rating:", error)
      alert("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    const displayRating = readonly ? rating : hoverRating || rating

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          disabled={isSubmitting || readonly}
          onClick={() => handleRatingClick(i)}
          onMouseEnter={() => !readonly && setHoverRating(i)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`inline-flex items-center ${
            !readonly && isAuthenticated ? "cursor-pointer" : "cursor-default"
          } ${isSubmitting ? "opacity-50" : ""}`}
        >
          <Star
            size={16}
            className={`${
              i <= displayRating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            } ${!readonly && isAuthenticated ? "hover:text-yellow-400" : ""}`}
          />
        </button>
      )
    }
    return stars
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">{renderStars()}</div>
      <span className="text-sm text-gray-600">
        {rating.toFixed(1)} ({totalRatings}{" "}
        {totalRatings === 1 ? "rating" : "ratings"})
      </span>
    </div>
  )
}

export default RatingStars
