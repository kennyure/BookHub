import React, { useState, useEffect } from "react"
import { booksAPI, ratingsAPI, commentsAPI } from "../../services/api"
import type { Book, RatingResponse } from "../../types"
import BookCard from "./BookCard"
import BookModal from "./BookModal"

const BookList: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  useEffect(() => {
    const term = debouncedSearchTerm.trim().toLowerCase()
    if (!term) {
      setFilteredBooks(books)
      return
    }
    const filtered = books.filter(
      (book) => book.title.toLowerCase().includes(term)
      // book.author.toLowerCase().includes(term) ||
      // book.publisher.toLowerCase().includes(term)
    )
    setFilteredBooks(filtered)
  }, [debouncedSearchTerm, books])

  const fetchBooks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const data = await booksAPI.getAll()
      setBooks(data)
      setFilteredBooks(data)
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || "Failed to fetch books")
    } finally {
      setIsLoading(false)
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading books...</div>
      </div>
    )
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Books</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search books by title, author, or publisher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <p className="text-gray-600 mt-2">
          Showing {filteredBooks.length} of {books.length} books
        </p>
      </div>

      <div className="hidden">{filteredBooks.length}</div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No books found matching your search.
          </p>
        </div>
      )}

      {filteredBooks.length !== 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
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
