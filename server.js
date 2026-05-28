require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { google } = require('googleapis');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store form submissions (in production, use a database)
const submissions = [];

// ── WHATSAPP MESSAGE TEMPLATE ──
function formatWhatsAppMessage(data) {
  return `
🎯 *New Enquiry Received!*

👤 *Name:* ${data.name}
📱 *WhatsApp:* ${data.phone}
🎂 *Age:* ${data.age}
📍 *City:* ${data.city}
⚧️ *Gender:* ${data.gender}

🎯 *Primary Goal:* ${data.goal}
📈 *Training Experience:* ${data.experience}

🩺 *Injuries/Limitations:* ${data.injuries || 'None'}

📌 *How they found us:* ${data.source}

━━━━━━━━━━━━━━━━━━
*Reply to schedule a consultation*
  `.trim();
}

// ── SUBMIT FORM ENDPOINT ──
app.post('/api/submit-enquiry', async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      age,
      city,
      gender,
      goal,
      trainingExperience,
      message,
      source
    } = req.body;

    const experience = trainingExperience || req.body.experience;
    const injuries = message || req.body.injuries || '';
    const sourceValue = source || req.body.source || 'Web form';

    if (!name || !phone || !age || !city || !gender || !goal || !experience) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name,
      phone,
      email: email || '',
      age,
      city,
      gender,
      goal,
      trainingExperience: experience,
      message: injuries,
      source: sourceValue
    };
    submissions.push(submission);

    await appendToGoogleSheet([
      submission.timestamp,
      submission.name,
      submission.phone,
      submission.email,
      submission.age,
      submission.city,
      submission.gender,
      submission.goal,
      submission.trainingExperience,
      submission.message,
      submission.source
    ]);

    const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '+919092430052';
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      await sendWhatsAppViaTwilio(adminPhone, formatWhatsAppMessage(submission));
    }
    if (process.env.WHATSAPP_BUSINESS_API_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      await sendWhatsAppViaBusinessAPI(adminPhone, formatWhatsAppMessage(submission));
    }

    console.log('✅ Enquiry received:', submission);
    console.log('📊 Saved enquiry to Google Sheets:', process.env.GOOGLE_SHEET_ID);
    console.log('📱 WhatsApp message sent to admin:', adminPhone);

    res.json({
      success: true,
      message: 'Enquiry submitted successfully! Your details have been saved and admin will be notified.',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('❌ Error submitting enquiry:', error);
    res.status(500).json({ error: error.message || 'Failed to submit enquiry' });
  }
});

async function appendToGoogleSheet(row) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';

  if (!spreadsheetId) {
    console.log('⚠️ Google Sheets disabled: GOOGLE_SHEET_ID not configured');
    return;
  }

  const credentials = getGoogleServiceAccountCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] }
  });
}

function getGoogleServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    } catch (error) {
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_KEY: must be valid JSON');
    }
  }

  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials are not configured');
  }

  return {
    type: 'service_account',
    client_email: clientEmail,
    private_key: privateKey.replace(/\\n/g, '\n')
  };
}

// ── TWILIO WHATSAPP INTEGRATION ──
async function sendWhatsAppViaTwilio(toPhone, message) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_WHATSAPP_NUMBER;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    // Format phone number
    const phoneNumber = toPhone.replace(/\D/g, '');
    const toPhoneFormatted = phoneNumber.startsWith('91') ? `+${phoneNumber}` : `+91${phoneNumber}`;

    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${fromPhone}`,
        To: `whatsapp:${toPhoneFormatted}`,
        Body: message
      }),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✅ WhatsApp message sent via Twilio:', response.data.sid);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp via Twilio:', error.response?.data || error.message);
    throw error;
  }
}

// ── WHATSAPP BUSINESS API INTEGRATION ──
async function sendWhatsAppViaBusinessAPI(toPhone, message) {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_BUSINESS_API_TOKEN;

    // Format phone number
    const phoneNumber = toPhone.replace(/\D/g, '');
    const toPhoneFormatted = phoneNumber.startsWith('91') ? phoneNumber : `91${phoneNumber}`;

    const response = await axios.post(
      `https://graph.instagram.com/v18.0/${phoneId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneFormatted,
        type: 'text',
        text: {
          body: message
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ WhatsApp message sent via Business API:', response.data.messages[0].id);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending WhatsApp via Business API:', error.response?.data || error.message);
    throw error;
  }
}

// ── GET SUBMISSIONS (for admin dashboard) ──
app.get('/api/submissions', (req, res) => {
  res.json({ submissions });
});

// ── HEALTH CHECK ──
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for all non-API routes (for SPA)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── START SERVER ──
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Form available at http://localhost:${PORT}`);
  console.log(`📊 Submissions at http://localhost:${PORT}/api/submissions`);
});
