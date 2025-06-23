import React from "react"

const BookSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 animate-pulse">
      {/* Image skeleton */}
      <div className="relative">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="absolute top-2 right-2 bg-gray-300 rounded-full w-6 h-6"></div>
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>

        {/* Author skeleton */}
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>

        {/* Rating skeleton */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>

        {/* Bottom row skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
    </div>
  )
}

export default BookSkeleton
