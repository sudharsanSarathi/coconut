// Serverless function to create a Razorpay payment link
const https = require('https');

// Razorpay API credentials
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_0PozcqkrTstyyk';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'y97rmGys8Oq8F8OMOBRddg4M';

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      amount,
      name,
      phone,
      email,
      description,
      callback_url,
      callback_method = 'get'
    } = req.body;

    if (!amount || !name || !phone || !callback_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Prepare the request data for Razorpay
    const postData = JSON.stringify({
      amount: parseInt(amount) * 100, // convert to paise
      currency: 'INR',
      accept_partial: false,
      description: description || `Payment for ${name}`,
      customer: {
        name: name,
        email: email || `${phone}@example.com`,
        contact: phone
      },
      notify: {
        sms: true,
        email: !!email
      },
      reminder_enable: false,
      callback_url: callback_url,
      callback_method: callback_method
    });

    // Create auth string for Basic Auth
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    // Request options
    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/payment_links',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Length': postData.length
      }
    };

    // Make the request to Razorpay
    const razorpayResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: response });
          } catch (error) {
            reject(new Error('Error parsing response: ' + error.message));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(new Error('Request error: ' + error.message));
      });
      
      // Write the data to the request body
      req.write(postData);
      req.end();
    });

    // Return an error if the request was not successful
    if (razorpayResponse.statusCode < 200 || razorpayResponse.statusCode >= 300) {
      return res.status(razorpayResponse.statusCode).json({
        error: 'Error creating payment link',
        details: razorpayResponse.data
      });
    }

    // Return the payment link
    return res.status(200).json({
      id: razorpayResponse.data.id,
      short_url: razorpayResponse.data.short_url,
      reference_id: razorpayResponse.data.reference_id
    });
    
  } catch (error) {
    console.error('Error creating payment link:', error);
    return res.status(500).json({ error: 'Server error', message: error.message });
  }
};