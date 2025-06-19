// Book types
export interface Book {
  author: string
  book_image: string
  book_image_height: number
  book_image_width: number
  contributor: string
  created_date: string
  description: string
  price: string
  publisher: string
  title: string
  list_name?: string
  list_display_name?: string
  bookId?: string
}

// User types
export interface User {
  id: number
  username: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
}

// Rating types
export interface Rating {
  id: number
  bookId: string
  userId: number
  rating: number
  createdAt: string
  updatedAt: string
  User?: {
    username: string
  }
}

export interface RatingResponse {
  averageRating: number
  totalRatings: number
  ratings: Rating[]
}

// Comment types
export interface Comment {
  id: number
  bookId: string
  userId: number
  content: string
  createdAt: string
  updatedAt: string
  User?: {
    username: string
  }
}

// Form types
export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  confirmPassword?: string
}

export interface RatingForm {
  rating: number
}

export interface CommentForm {
  content: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
}
