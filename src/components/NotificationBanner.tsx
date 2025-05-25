// Component for displaying notifications and error messages
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationBannerProps {
  type: NotificationType;
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade-out animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  // Get the appropriate styling based on notification type
  const getNotificationStyles = (): {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: JSX.Element;
  } => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-800',
          borderColor: 'border-green-400',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-400',
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-400',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
        };
      case 'info':
      default:
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-400',
          icon: <AlertCircle className="h-5 w-5 text-blue-500" />,
        };
    }
  };

  const { bgColor, textColor, borderColor, icon } = getNotificationStyles();

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 max-w-md w-full transition-all duration-300 z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`rounded-md border ${borderColor} ${bgColor} p-4 shadow-md`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              className={`rounded-md inline-flex ${textColor} hover:bg-opacity-20 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade-out animation
              }}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;