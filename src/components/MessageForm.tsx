// Form component for sending WhatsApp messages
import React, { useState } from 'react';
import { MessageType, SendMessageFormData, FileType } from '../types';
import { sendWhatsAppMessage, saveMessageToHistory } from '../api/whatsappService';
import { Upload, Send, X, Image, FileVideo, File } from 'lucide-react';

interface MessageFormProps {
  onMessageSent: (message: MessageType) => void;
  onError: (error: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onMessageSent, onError }) => {
  const [formData, setFormData] = useState<SendMessageFormData>({
    to: '',
    text: '',
    file: null,
    fileType: undefined,
  });
  
  const [loading, setLoading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ 
        ...prev, 
        file, 
        fileType: getFileTypeFromFile(file) 
      }));
      
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    }
  };

  const getFileTypeFromFile = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null, fileType: undefined }));
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.to) {
      onError('Recipient phone number is required');
      return;
    }
    
    if (!formData.text && !formData.file) {
      onError('Please enter a message or attach a file');
      return;
    }
    
    setLoading(true);
    
    try {
      const messageId = Date.now().toString();
      const message: MessageType = {
        id: messageId,
        to: formData.to,
        text: formData.text,
        fileUrl: filePreview || undefined,
        fileType: formData.fileType,
        status: 'pending',
        timestamp: Date.now(),
      };
      
      saveMessageToHistory(message);
      onMessageSent(message);
      
      const response = await sendWhatsAppMessage(formData);
      
      const updatedMessage: MessageType = {
        ...message,
        status: response.success ? 'sent' : 'failed',
        error: response.error,
      };
      
      saveMessageToHistory(updatedMessage);
      onMessageSent(updatedMessage);
      
      if (response.success) {
        setFormData({
          to: '',
          text: '',
          file: null,
          fileType: undefined,
        });
        removeFile();
      } else {
        onError(response.error || 'Failed to send message');
      }
    } catch (error) {
      onError((error as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderFilePreview = () => {
    if (!filePreview) return null;
    
    if (formData.fileType === 'image') {
      return (
        <div className="relative mt-2 rounded-lg overflow-hidden">
          <img 
            src={filePreview} 
            alt="Preview" 
            className="max-h-48 max-w-full object-contain"
          />
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      );
    }
    
    if (formData.fileType === 'video') {
      return (
        <div className="relative mt-2 rounded-lg overflow-hidden">
          <video 
            src={filePreview} 
            controls 
            className="max-h-48 max-w-full"
          />
          <button
            type="button"
            onClick={removeFile}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      );
    }
    
    return (
      <div className="relative mt-2 flex items-center p-3 bg-gray-100 rounded-lg">
        <File size={24} className="text-blue-500 mr-2" />
        <span className="text-sm truncate">
          {formData.file?.name || 'Document'}
        </span>
        <button
          type="button"
          onClick={removeFile}
          className="ml-auto bg-red-500 text-white rounded-full p-1"
          title="Remove file"
        >
          <X size={16} />
        </button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-1">
          Recipient Phone Number
        </label>
        <input
          type="text"
          id="to"
          name="to"
          value={formData.to}
          onChange={handleChange}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Enter phone number with country code (e.g., +1234567890)"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="text"
          name="text"
          value={formData.text}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Type your message here..."
        />
      </div>

      {renderFilePreview()}

      <div className="flex items-center justify-between mt-6">
        <div className="flex space-x-2">
          <label 
            htmlFor="file-upload" 
            className="cursor-pointer flex items-center justify-center rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 focus:outline-none"
          >
            <Upload size={16} className="mr-1" />
            Attach File
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('file-upload') as HTMLInputElement;
                input.accept = 'image/*';
                input.click();
              }}
              className="rounded-md bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 focus:outline-none"
              title="Upload Image"
            >
              <Image size={16} />
            </button>
            
            <button
              type="button"
              onClick={() => {
                const input = document.getElementById('file-upload') as HTMLInputElement;
                input.accept = 'video/*';
                input.click();
              }}
              className="rounded-md bg-purple-100 p-2 text-purple-600 hover:bg-purple-200 focus:outline-none"
              title="Upload Video"
            >
              <FileVideo size={16} />
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending...
            </>
          ) : (
            <>
              <Send size={16} className="mr-1" />
              Send Message
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
