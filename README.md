# Enquiry Form - WhatsApp Integration

A modern, responsive enquiry form with WhatsApp message integration. Collect enquiries with a beautiful UI and automatically send WhatsApp messages to your customers.

## Features

✨ **Modern UI** - Clean, responsive design that works on all devices
📱 **WhatsApp Integration** - Automatic WhatsApp messages when enquiries are submitted
🎯 **Multi-step Form** - Easy-to-follow form pages with progress tracking
✅ **Form Validation** - Real-time validation with helpful error messages
🔒 **Secure** - Data validation and secure handling
📊 **Admin View** - View all submissions via API endpoint

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **WhatsApp Integration**: Twilio or WhatsApp Business API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Twilio account (for WhatsApp integration) or WhatsApp Business API access

### Installation

1. Clone this repository
```bash
git clone https://github.com/yourusername/enquiry-form-whatsapp.git
cd enquiry-form-whatsapp
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root directory with your credentials:
```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155552671

# Or WhatsApp Business API
WHATSAPP_BUSINESS_API_TOKEN=your_token
WHATSAPP_PHONE_ID=your_phone_id

PORT=3000
```

4. Run the server
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## WhatsApp Integration Setup

### Option 1: Using Twilio (Recommended for testing)

1. Go to [Twilio Console](https://console.twilio.com)
2. Create a WhatsApp Sandbox
3. Copy your Account SID and Auth Token
4. Add to `.env` file

### Option 2: Using WhatsApp Business API

1. Get WhatsApp Business API access
2. Create a WhatsApp application
3. Get your Phone ID and API Token
4. Add to `.env` file

## API Endpoints

- **POST** `/api/submit-enquiry` - Submit an enquiry
- **GET** `/api/submissions` - Get all submissions (admin)
- **GET** `/health` - Health check

## Project Structure

```
├── public/
│   └── index.html          # Frontend form
├── server.js               # Express server & API
├── package.json            # Dependencies
├── .env                    # Environment variables (not in git)
├── .gitignore              # Git ignore rules
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## Form Fields

The enquiry form collects:

1. **Full Name** - Text input
2. **WhatsApp Number** - Phone number with validation
3. **Email Address** - Email with validation
4. **Message** - Textarea for enquiry details
5. **Company** (Optional) - Additional information

## WhatsApp Message Format

When an enquiry is submitted, a formatted message is sent:

```
🎯 New Enquiry Received!

👤 Name: John Doe
📱 WhatsApp: +91 98765 43210
📧 Email: john@example.com
💬 Message: I'm interested in your services

📍 Company: Acme Corp

━━━━━━━━━━━━━━━━━━
Reply to schedule a consultation
```

## Deployment on Vercel

1. Push your code to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Vercel](https://vercel.com) and connect your GitHub repo

3. Add environment variables in Vercel project settings:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - Or WhatsApp Business API credentials

4. Deploy!

## Development

To run locally with auto-reload:
```bash
npm run dev
```

To view form submissions:
```bash
curl http://localhost:3000/api/submissions
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | For Twilio |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | For Twilio |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp Number | For Twilio |
| `WHATSAPP_BUSINESS_API_TOKEN` | WhatsApp API Token | For Business API |
| `WHATSAPP_PHONE_ID` | WhatsApp Phone ID | For Business API |
| `PORT` | Server port | No (default: 3000) |

## Troubleshooting

### WhatsApp message not sending
- Verify your Twilio credentials are correct
- Check that the phone number format is valid
- Ensure the Twilio WhatsApp Sandbox is active

### Form not submitting
- Check browser console for errors
- Verify server is running
- Check that `/api/submit-enquiry` endpoint is accessible

### CORS errors
- CORS is enabled for all origins in development
- For production, update CORS settings in `server.js`

## License

MIT License - feel free to use this project for your own enquiry forms!

## Support

For issues or questions, please create a GitHub issue or contact support.

---

**Created with ❤️ - Make enquiry collection easy!**
