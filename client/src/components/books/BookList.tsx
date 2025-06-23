import React, { useState, useEffect, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { booksAPI, ratingsAPI, commentsAPI } from "../../services/api"
import type { Book, RatingResponse } from "../../types"
import BookCard from "./BookCard"
import BookModal from "./BookModal"
import BookSkeleton from "../ui/BookSkeleton"

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [booksPerPage] = useState(12) // 3x4 grid on desktop

  // Store book-specific data for efficient updates
  const [bookData, setBookData] = useState<
    Map<string, { ratingData: RatingResponse | null; commentCount: number }>
  >(new Map())

  useEffect(() => {
    fetchBooks()
  }, [])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm])

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await booksAPI.getAll()

      // Remove duplicates based on bookId (ISBN13)
      const uniqueBooks = data.filter(
        (book, index, self) =>
          index === self.findIndex((b) => b.bookId === book.bookId)
      )

      setBooks(uniqueBooks)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || "Failed to fetch books")
    } finally {
      setIsLoading(false)
    }
  }

  // Memoized filtered books to prevent unnecessary recalculations
  const filteredBooks = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase()
    if (!term) {
      return books
    }

    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        (book.publisher && book.publisher.toLowerCase().includes(term))
    )
  }, [books, debouncedSearchTerm])

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage)
    const indexOfLastBook = currentPage * booksPerPage
    const indexOfFirstBook = indexOfLastBook - booksPerPage
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)

    return {
      currentBooks,
      totalPages,
      indexOfFirstBook,
      indexOfLastBook,
    }
  }, [filteredBooks, currentPage, booksPerPage])

  const handleCardClick = (book: Book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBook(null)
  }

  const handleModalUpdate = async () => {
    if (!selectedBook?.bookId) return

    try {
      // Fetch updated data for the specific book
      const [ratingData, comments] = await Promise.all([
        ratingsAPI.getByBook(selectedBook.bookId),
        commentsAPI.getByBook(selectedBook.bookId),
      ])

      // Update the book data map
      setBookData((prev) =>
        new Map(prev).set(selectedBook.bookId!, {
          ratingData,
          commentCount: comments.length,
        })
      )
    } catch (error) {
      console.error("Failed to update book data:", error)
    }
  }

  // Page navigation functions
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const goToFirstPage = () => {
    setCurrentPage(1)
  }

  const goToLastPage = () => {
    setCurrentPage(paginationData.totalPages)
  }

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, paginationData.totalPages))
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    const { totalPages } = paginationData

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1)
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  // Render skeleton loaders
  const renderSkeletons = () => {
    return Array.from({ length: booksPerPage }, (_, index) => (
      <BookSkeleton key={`skeleton-${index}`} />
    ))
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books by title, author, or publisher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>
        {!isLoading && (
          <p className="text-gray-600 mt-2">
            Showing {paginationData.currentBooks.length} of{" "}
            {filteredBooks.length} books
            {books.length !== filteredBooks.length &&
              ` (filtered from ${books.length} total)`}
            {paginationData.totalPages > 1 &&
              ` (Page ${currentPage} of ${paginationData.totalPages})`}
          </p>
        )}
      </div>

      {/* Loading state with skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderSkeletons()}
        </div>
      )}

      {/* Error state for no books */}
      {!isLoading && filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {books.length === 0
              ? "No books available at the moment."
              : "No books found matching your search."}
          </p>
        </div>
      )}

      {/* Actual books */}
      {!isLoading && paginationData.currentBooks.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {paginationData.currentBooks.map((book) => {
              const data = bookData.get(book.bookId || "")
              return (
                <BookCard
                  key={book.bookId}
                  book={book}
                  onCardClick={handleCardClick}
                  ratingData={data?.ratingData}
                  commentCount={data?.commentCount}
                />
              )
            })}
          </div>

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              {/* First Page */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Previous Page */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-3 py-2 rounded-md border transition-colors ${
                    currentPage === pageNumber
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              {/* Next Page */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === paginationData.totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === paginationData.totalPages}
                className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <BookModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleModalUpdate}
      />
    </div>
  )
}

export default BookList
