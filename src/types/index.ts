// Type definitions for the WhatsApp Sender application

// Message types
export type MessageType = {
  id: string;
  to: string;
  text: string;
  fileUrl?: string;
  fileType?: FileType;
  status: MessageStatus;
  timestamp: number;
  error?: string;
};

// File types that can be attached to messages
export type FileType = 'image' | 'video' | 'document';

// Status of a sent message
export type MessageStatus = 'pending' | 'sent' | 'failed';

// Form data for sending messages
export type SendMessageFormData = {
  to: string;
  text: string;
  file?: File | null;
  fileType?: FileType;
};

// Response from the WhatsApp API
export type WasenderResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string;
};
