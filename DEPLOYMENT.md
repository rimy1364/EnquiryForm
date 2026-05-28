# Deployment Guide

## Step 1: Push to GitHub

### Create a new repository on GitHub

1. Go to [GitHub.com](https://github.com)
2. Click "+" → "New repository"
3. Name it: `enquiry-form-whatsapp`
4. Add description: "Enquiry form with WhatsApp integration"
5. Choose "Public" (or Private if you prefer)
6. Click "Create repository"

### Push your code

```bash
# Navigate to your project
cd "c:\Users\rimjh\OneDrive\Desktop\claude workspace\Enquiry form"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/enquiry-form-whatsapp.git

# Rename branch to main if needed
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 2: Deploy on Vercel

### Option A: Deploy via Vercel CLI (Fastest)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from your project directory
vercel
```

### Option B: Deploy via Vercel Web Dashboard

1. Go to [Vercel.com](https://vercel.com)
2. Click "Sign up" or "Log in"
3. Click "Add New" → "Project"
4. Select "Import Git Repository"
5. Search for "enquiry-form-whatsapp"
6. Click "Import"
7. Configure project settings:
   - **Framework**: Node.js
   - **Root Directory**: ./
   - **Build Command**: `npm install`
   - **Install Command**: `npm install`
   - **Start Command**: `node server.js`

### Add Environment Variables in Vercel

After importing the project:

1. Go to "Settings" → "Environment Variables"
2. Add these variables:

```
TWILIO_ACCOUNT_SID = your_account_sid
TWILIO_AUTH_TOKEN = your_auth_token
TWILIO_WHATSAPP_NUMBER = whatsapp:+14155552671
```

Or for WhatsApp Business API:

```
WHATSAPP_BUSINESS_API_TOKEN = your_token
WHATSAPP_PHONE_ID = your_phone_id
```

3. Click "Deploy"

## Step 3: Get Your Twilio WhatsApp Credentials

### Setup Twilio WhatsApp Sandbox

1. Go to [Twilio Console](https://console.twilio.com)
2. Navigate to "Messaging" → "WhatsApp" → "Sandbox"
3. Copy your **Account SID** and **Auth Token** from the top
4. Copy your **WhatsApp Sandbox Number** (format: whatsapp:+1415...)

### Join the Sandbox

Users need to join your WhatsApp Sandbox to receive messages:

1. Send this message to the number from Twilio:
   ```
   join {your-sandbox-keyword}
   ```
2. They will be approved and can receive messages

## Step 4: Test Your Form

### Locally

```bash
npm install
cp .env.example .env
# Edit .env with your Twilio credentials
npm run dev
# Open http://localhost:3000
```

### On Vercel

1. Your deployed URL will be: `https://enquiry-form-whatsapp.vercel.app`
2. Share this URL with users
3. Fill out the form and check WhatsApp for the message

## Webhook Setup (Optional - for incoming WhatsApp messages)

If you want to reply to enquiries via WhatsApp:

1. Go to Twilio Console → Messaging → WhatsApp → Sandbox Settings
2. Set "When a message comes in" webhook to:
   ```
   https://your-vercel-domain.vercel.app/api/webhook
   ```
3. Implement webhook handler in `server.js`

## Custom Domain (Optional)

To use your own domain:

1. In Vercel project settings → "Domains"
2. Add your custom domain
3. Update DNS records as shown by Vercel
4. Update your form action URL in client code if needed

## Update and Redeploy

After making changes:

```bash
git add .
git commit -m "Your changes here"
git push origin main
```

Vercel will automatically redeploy your changes!

## Troubleshooting

### WhatsApp messages not sending?

- ✅ Check that phone numbers are in Twilio's Sandbox
- ✅ Verify credentials are correct in environment variables
- ✅ Check server logs in Vercel dashboard
- ✅ Try sending test message via Twilio CLI:
  ```
  twilio api:messages:create --from="whatsapp:+1415..." --to="whatsapp:+91..." --body="Test"
  ```

### Vercel deployment fails?

- ✅ Check build logs in Vercel dashboard
- ✅ Ensure all environment variables are set
- ✅ Verify `package.json` has correct scripts
- ✅ Check that files are committed to Git

### Form not working?

- ✅ Check browser console for errors
- ✅ Open browser DevTools → Network tab
- ✅ Check if `/api/submit-enquiry` endpoint responds
- ✅ Verify server is running on Vercel

## Support Links

- [Twilio Documentation](https://www.twilio.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Help](https://docs.github.com)

---

**Your form is now live!** 🎉 Share the link with users to start receiving enquiries via WhatsApp.
