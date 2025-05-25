// Component for displaying message history
import React from 'react';
import { MessageType } from '../types';
import { Trash2 } from 'lucide-react';
import { clearMessageHistory } from '../api/whatsappService';

interface MessageHistoryProps {
  messages: MessageType[];
  onHistoryCleared: () => void;
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ 
  messages, 
  onHistoryCleared 
}) => {
  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6 text-center text-gray-500">
        No message history available
      </div>
    );
  }

  const handleClearHistory = () => {
    clearMessageHistory();
    onHistoryCleared();
  };

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status color based on message status
  const getStatusColor = (status: MessageType['status']): string => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Message History</h2>
        <button
          onClick={handleClearHistory}
          className="flex items-center text-sm text-red-600 hover:text-red-800"
        >
          <Trash2 size={16} className="mr-1" />
          Clear History
        </button>
      </div>
      
      <div className="divide-y divide-gray-200">
        {messages.map((message) => (
          <div key={message.id} className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  To: {message.to}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                {message.status}
              </span>
            </div>
            
            <p className="mt-2 text-sm text-gray-700">
              {message.text || "(No text content)"}
            </p>
            
            {message.fileUrl && message.fileType === 'image' && (
              <div className="mt-2">
                <img
                  src={message.fileUrl}
                  alt="Attached file"
                  className="h-20 rounded-md object-cover"
                />
              </div>
            )}
            
            {message.fileUrl && message.fileType === 'video' && (
              <div className="mt-2">
                <video
                  src={message.fileUrl}
                  className="h-20 rounded-md"
                  controls
                />
              </div>
            )}
            
            {message.fileUrl && message.fileType === 'document' && (
              <div className="mt-2">
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View attached document
                </a>
              </div>
            )}
            
            {message.error && (
              <p className="mt-2 text-sm text-red-600">
                Error: {message.error}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageHistory;