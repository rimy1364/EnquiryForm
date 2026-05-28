# Local Development Guide

## Prerequisites

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** - Comes with Node.js
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **Twilio Account** - Free at [twilio.com](https://www.twilio.com/)

## Setup Steps

### 1. Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/YOUR_USERNAME/enquiry-form-whatsapp.git
cd enquiry-form-whatsapp
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web server
- `cors` - Cross-Origin Resource Sharing
- `dotenv` - Environment variable management
- `axios` - HTTP client for API calls

### 3. Get Twilio Credentials

#### Free Trial Setup

1. Go to [Twilio Console](https://console.twilio.com)
2. Sign up for free account (gets $15 free credit)
3. Go to "Messaging" → "Try it out" → "Send an SMS"
4. Copy your credentials:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (long alphanumeric string)

#### Enable WhatsApp

1. In Twilio Console, go to "Messaging" → "WhatsApp"
2. Click "Get Started"
3. Create WhatsApp Sandbox:
   - You get a sandbox number like `whatsapp:+1415555...`
   - You get a keyword like `join xyz123`

### 4. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Open .env and add your credentials
# On Windows
notepad .env

# On Mac/Linux
nano .env
```

**Fill in your credentials:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+1415555...
PORT=3000
```

⚠️ **Important**: Never commit `.env` to Git! It's in `.gitignore` ✓

### 5. Setup Twilio WhatsApp Sandbox

For users to receive WhatsApp messages, they need to join your sandbox:

```
Send this to your Twilio WhatsApp number:
join xyz123
```

(Replace `xyz123` with your sandbox keyword)

### 6. Start Development Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3000
📝 Form available at http://localhost:3000
📊 Submissions at http://localhost:3000/api/submissions
```

### 7. Test the Form

1. Open http://localhost:3000 in your browser
2. Fill out the form
3. Submit
4. Check your WhatsApp for the message!

## File Structure Explained

```
├── public/
│   └── index.html           # Frontend form (HTML/CSS/JS)
│   
├── server.js                # Backend API server
├── package.json             # Project dependencies
├── .env.example             # Template for environment variables
├── .gitignore               # Git ignore rules
├── README.md                # Project documentation
├── DEPLOYMENT.md            # Deployment guide
└── LOCAL_SETUP.md          # This file
```

## Available Scripts

```bash
# Start development server
npm run dev

# Start production server
npm start

# View all submissions
curl http://localhost:3000/api/submissions

# Health check
curl http://localhost:3000/health
```

## API Endpoints (for testing)

### Submit Form
```bash
curl -X POST http://localhost:3000/api/submit-enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+91 98765 43210",
    "email": "john@example.com",
    "message": "I am interested",
    "company": "Acme"
  }'
```

### Get Submissions
```bash
curl http://localhost:3000/api/submissions
```

### Health Check
```bash
curl http://localhost:3000/health
```

## Common Issues

### Port Already in Use

If you get "Port 3000 already in use":

```bash
# Use a different port
PORT=3001 npm run dev
```

### Module not found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### WhatsApp message not sending

Check these:
- ✅ Is `.env` file created with correct credentials?
- ✅ Did you join the WhatsApp sandbox?
- ✅ Is the phone number format correct?
- ✅ Check server console for error messages

### CORS Error

This is normal in development. The form works fine - it's just browser security. Production deployment handles this automatically.

## Development Tips

### Hot Reload (Optional)

For automatic server restart on file changes:

```bash
npm install -D nodemon
```

Then update `package.json`:

```json
"dev": "nodemon server.js"
```

### View Server Logs

All form submissions are logged to console:

```
✅ Enquiry received: {
  id: '1234567890',
  timestamp: '2024-05-28T10:30:00.000Z',
  name: 'John Doe',
  ...
}
```

### Test with Different Phone Numbers

To test with different numbers, change the recipient phone number in `server.js`:

```javascript
const toPhone = "+91 YOUR_NUMBER_HERE";
```

## Next Steps

- ✅ Test form locally
- ✅ Commit changes to Git
- ✅ Push to GitHub
- ✅ Deploy to Vercel
- ✅ Get custom domain
- ✅ Share with users!

## Need Help?

- **Twilio Docs**: https://www.twilio.com/docs
- **Express Docs**: https://expressjs.com/
- **Node.js Docs**: https://nodejs.org/docs/

---

**Happy coding!** 🚀
