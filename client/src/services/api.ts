import axios from "axios"
import type {
  Book,
  Rating,
  Comment,
  RatingResponse,
  AuthResponse,
  LoginForm,
  RegisterForm,
} from "../types"

const API_BASE_URL = "http://localhost:5000/api"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: async (data: RegisterForm): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", {
      username: data.username,
      password: data.password,
    })
    return response.data
  },

  login: async (data: LoginForm): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", {
      username: data.username,
      password: data.password,
    })
    return response.data
  },
}

// Books API
export const booksAPI = {
  getAll: async (): Promise<Book[]> => {
    const response = await api.get("/books")
    return response.data
  },
}

// Ratings API
export const ratingsAPI = {
  createOrUpdate: async (bookId: string, rating: number): Promise<Rating> => {
    const response = await api.post("/ratings", { bookId, rating })
    return response.data
  },

  getByBook: async (bookId: string): Promise<RatingResponse> => {
    const response = await api.get(`/ratings/${bookId}`)
    return response.data
  },

  delete: async (ratingId: number): Promise<void> => {
    await api.delete(`/ratings/${ratingId}`)
  },
}

// Comments API
export const commentsAPI = {
  create: async (bookId: string, content: string): Promise<Comment> => {
    const response = await api.post("/comments", { bookId, content })
    return response.data
  },

  getByBook: async (bookId: string): Promise<Comment[]> => {
    const response = await api.get(`/comments/${bookId}`)
    return response.data
  },

  update: async (commentId: number, content: string): Promise<Comment> => {
    const response = await api.put(`/comments/${commentId}`, { content })
    return response.data
  },

  delete: async (commentId: number): Promise<void> => {
    await api.delete(`/comments/${commentId}`)
  },
}

export default api
