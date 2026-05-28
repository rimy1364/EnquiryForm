require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

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
    const { name, phone, age, city, gender, goal, experience, injuries, source } = req.body;

    // Validate required fields
    if (!name || !phone || !age || !city || !gender || !goal || !experience || !source) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store submission
    const submission = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...req.body
    };
    submissions.push(submission);

    // Send WhatsApp message via Twilio (if configured)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      await sendWhatsAppViaTwilio(phone, formatWhatsAppMessage(req.body));
    }

    // Optionally send WhatsApp via WhatsApp Business API
    if (process.env.WHATSAPP_BUSINESS_API_TOKEN && process.env.WHATSAPP_PHONE_ID) {
      await sendWhatsAppViaBusinessAPI(phone, formatWhatsAppMessage(req.body));
    }

    // Log to console
    console.log('✅ Enquiry received:', submission);

    res.json({
      success: true,
      message: 'Enquiry submitted successfully! You will receive a WhatsApp message shortly.',
      submissionId: submission.id
    });

  } catch (error) {
    console.error('❌ Error submitting enquiry:', error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
});

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
