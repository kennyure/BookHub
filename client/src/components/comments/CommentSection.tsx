import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { Send, Trash2 } from "lucide-react"
import { commentsAPI } from "../../services/api"
import { useAuth } from "../../contexts/AuthContext"
import type { Comment, CommentForm as CommentFormType } from "../../types"

const schema = yup
  .object({
    content: yup
      .string()
      .required("Comment is required")
      .min(1, "Comment cannot be empty"),
  })
  .required()

interface CommentSectionProps {
  bookId: string
  onCommentUpdate: () => void
  isAuthenticated: boolean
}

const CommentSection: React.FC<CommentSectionProps> = ({
  bookId,
  onCommentUpdate,
  isAuthenticated,
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormType>({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    fetchComments()
  }, [bookId])

  const fetchComments = async () => {
    try {
      setIsLoading(true)
      const data = await commentsAPI.getByBook(bookId)
      setComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: CommentFormType) => {
    if (!isAuthenticated) {
      alert("Please log in to comment")
      return
    }

    try {
      await commentsAPI.create(bookId, data.content)
      reset()
      await fetchComments()
      onCommentUpdate()
    } catch (error) {
      console.error("Failed to submit comment:", error)
      alert("Failed to submit comment. Please try again.")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await commentsAPI.delete(commentId)
      await fetchComments()
      onCommentUpdate()
    } catch (error) {
      console.error("Failed to delete comment:", error)
      alert("Failed to delete comment. Please try again.")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  console.log(user, isAuthenticated, comments)
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Comments</h4>

      {isAuthenticated && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <textarea
            {...register("content")}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            rows={3}
          />
          {errors.content && (
            <p className="text-red-500 text-sm">{errors.content.message}</p>
          )}
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Send size={16} />
            <span>Post Comment</span>
          </button>
        </form>
      )}

      {!isAuthenticated && (
        <p className="text-gray-500 text-sm">
          Please{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            log in
          </a>{" "}
          to comment.
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-4">
          <p className="text-gray-500">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.User?.username || "Anonymous"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                {isAuthenticated && user && comment.userId === user.id && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CommentSection
