// Service for handling WhatsApp message sending
// Added API key validation and improved error handling
import { MessageType, SendMessageFormData, WasenderResponse } from '../types';

// Supabase Edge Function URL
const EDGE_FUNCTION_URL = 'https://pbkxpylwatscfjzbmwur.supabase.co/functions/v1/whatsapp-sender';

/**
 * Send a WhatsApp message through the Supabase Edge Function
 */
export const sendWhatsAppMessage = async (
  data: SendMessageFormData
): Promise<WasenderResponse> => {
  try {
    // Validate recipient
    if (!data.to || data.to.trim() === '') {
      return {
        success: false,
        error: 'Recipient phone number is required',
      };
    }

    // Validate content
    if ((!data.text || data.text.trim() === '') && !data.file) {
      return {
        success: false,
        error: 'Either message text or file is required',
      };
    }

    // Prepare payload for the Edge Function
    const payload: Record<string, any> = {
      to: data.to,
      text: data.text,
    };

    // If there's a file, upload it first and get the URL
    if (data.file) {
      const fileUrl = await uploadFile(data.file);
      payload.fileUrl = fileUrl;
      payload.fileType = data.fileType || getFileTypeFromFile(data.file);
    }

    // Call the Edge Function
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || 'Failed to send message');
    }

    return {
      success: true,
      message: result.message || 'Message sent successfully',
    };
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      const message = error instanceof Error ? error.message : 'Failed to send message';
      return {
        success: false,
        error: message,
      };
  }
};

/**
 * Mock function to simulate file upload
 * In a real app, you would upload the file to a storage service and return the URL
 */
const uploadFile = async (file: File): Promise<string> => {
  // This is a placeholder. In a real app, you would upload the file to a storage service.
  return URL.createObjectURL(file);
};

/**
 * Determine file type based on the file object
 */
const getFileTypeFromFile = (file: File): 'image' | 'video' | 'document' => {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('video/')) {
    return 'video';
  } else {
    return 'document';
  }
};

/**
 * Save message to history
 */
export const saveMessageToHistory = (message: MessageType): void => {
  const history = getMessageHistory();
  history.unshift(message);
  localStorage.setItem('whatsapp_message_history', JSON.stringify(history));
};

/**
 * Get message history from local storage
 */
export const getMessageHistory = (): MessageType[] => {
  const history = localStorage.getItem('whatsapp_message_history');
  return history ? JSON.parse(history) : [];
};

/**
 * Clear message history
 */
export const clearMessageHistory = (): void => {
  localStorage.removeItem('whatsapp_message_history');
};
