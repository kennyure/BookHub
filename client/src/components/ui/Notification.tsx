import React, { useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info } from "lucide-react"

interface NotificationProps {
  isOpen: boolean
  onClose: () => void
  message: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
}

const Notification: React.FC<NotificationProps> = ({
  isOpen,
  onClose,
  message,
  type = "info",
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800",
        }
      case "error":
        return {
          icon: AlertCircle,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
        }
      case "warning":
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
        }
      case "info":
      default:
        return {
          icon: Info,
          iconColor: "text-blue-600",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
        }
    }
  }

  const styles = getTypeStyles()
  const IconComponent = styles.icon

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`${styles.bgColor} ${styles.borderColor} border rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start space-x-3">
          <IconComponent size={20} className={`${styles.iconColor} mt-0.5`} />
          <div className="flex-1">
            <p className={`${styles.textColor} text-sm font-medium`}>
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${styles.textColor} hover:opacity-70 transition-opacity`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification
