# WhatsApp Sender Application

This application allows you to send WhatsApp messages using the WasenderAPI service through a Supabase Edge Function.

## Features

- Send text messages via WhatsApp
- Attach images, videos, and documents to messages
- Save API key locally for convenience
- View message history and delivery status
- Responsive design for all device sizes

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a Supabase project and connect it to your application
4. Deploy the Edge Function to Supabase

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
```

## Development

Run the development server:

```
npm run dev
```

## Building for Production

```
npm run build
```

## Deploying to Netlify

This application is configured for easy deployment to Netlify.

## Security Considerations

- The API key is stored in localStorage for convenience but consider implementing more secure storage methods for production use
- All API requests are proxied through a Supabase Edge Function to protect your API credentials
- CORS is properly configured to prevent unauthorized access

## Credits

This application uses:
- React
- TypeScript
- Tailwind CSS
- Supabase Edge Functions
- WasenderAPI for WhatsApp messaging

## License

MIT