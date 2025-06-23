import React, { createContext, useContext, useState, useEffect } from "react"
import type { ReactNode } from "react"
import { authAPI } from "../services/api"
import type { User, LoginForm, RegisterForm } from "../types"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: LoginForm) => Promise<void>
  register: (credentials: RegisterForm) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

// Helper function to decode JWT token
const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.userId || payload.id,
      username: payload.username,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to decode token:", error)
    return null
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  )
  const [isLoading, setIsLoading] = useState(true)

  const login = async (credentials: LoginForm) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login(credentials)
      const newToken = response.token

      setToken(newToken)
      localStorage.setItem("token", newToken)

      // Decode token to get user info
      const userData = decodeToken(newToken)
      setUser(userData)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterForm) => {
    try {
      setIsLoading(true)
      const response = await authAPI.register(credentials)
      const newToken = response.token

      setToken(newToken)
      localStorage.setItem("token", newToken)

      // Decode token to get user info
      const userData = decodeToken(newToken)
      setUser(userData)
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("token")
  }

  const isAuthenticated = !!token && !!user

  useEffect(() => {
    // Check if token exists on app load and validate it
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      try {
        const userData = decodeToken(storedToken)
        if (userData) {
          setToken(storedToken)
          setUser(userData)
        } else {
          // Invalid token, remove it
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Failed to validate stored token:", error)
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
  }, [])

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    setUser,
    isAuthenticated,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
