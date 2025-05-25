// WhatsApp Sender App - Main component
// This application allows users to send WhatsApp messages using the WasenderAPI

import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import MessageForm from './components/MessageForm';
import MessageHistory from './components/MessageHistory';
import NotificationBanner from './components/NotificationBanner';
import { MessageType } from './types';
import { getMessageHistory } from './api/whatsappService';

function App() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Load message history from local storage on component mount
  useEffect(() => {
    const history = getMessageHistory();
    setMessages(history);
  }, []);

  const handleMessageSent = (message: MessageType) => {
    // Update the messages state with the new message
    setMessages(prevMessages => {
      // If the message already exists in the list, update it
      const exists = prevMessages.findIndex(m => m.id === message.id) !== -1;
      
      if (exists) {
        return prevMessages.map(m => 
          m.id === message.id ? message : m
        );
      } else {
        // Otherwise, add it to the beginning of the list
        return [message, ...prevMessages];
      }
    });

    // Show success notification if the message was sent successfully
    if (message.status === 'sent') {
      setNotification({
        type: 'success',
        message: 'Message sent successfully!',
      });
    }
  };

  const handleError = (error: string) => {
    setNotification({
      type: 'error',
      message: error,
    });
  };

  const handleHistoryCleared = () => {
    setMessages([]);
    setNotification({
      type: 'info',
      message: 'Message history cleared',
    });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {notification && (
        <NotificationBanner
          type={notification.type}
          message={notification.message}
          onClose={closeNotification}
        />
      )}

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-500 p-3 rounded-full">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Sender</h1>
          <p className="mt-2 text-sm text-gray-600">
            Send WhatsApp messages easily using the WasenderAPI
          </p>
        </div>

        <MessageForm 
          onMessageSent={handleMessageSent} 
          onError={handleError}
        />
        
        <MessageHistory 
          messages={messages} 
          onHistoryCleared={handleHistoryCleared}
        />

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            Using WhatsApp API services provided by{' '}
            <a 
              href="https://wasenderapi.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-green-600 hover:underline"
            >
              WasenderAPI
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;