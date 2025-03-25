const crypto = require('crypto');

// Function to generate signature for Cashfree
function generateSignature(postData, secretKey) {
  return crypto
    .createHmac('sha256', secretKey)
    .update(postData)
    .digest('base64');
}

exports.handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }
  
  try {
    // Parse request body
    const { name, whatsapp, amount, orderId, quantity } = JSON.parse(event.body);
    
    // Your Cashfree credentials - these should be set as environment variables in Netlify
    const appId = process.env.CASHFREE_APP_ID || "804378dc2100ad26ac9fe5becb873408";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "cfsk_ma_prod_93f3cd9a7122964512b4ebfd74552f9d_04d089b7";
    
    // Validate inputs
    if (!name || !whatsapp || !amount || !orderId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }
    
    // Create order data for Cashfree
    const orderData = {
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: "INR",
      orderNote: quantity + " Coconut(s)",
      customerName: name,
      customerPhone: whatsapp,
      customerEmail: whatsapp + "@example.com",
      returnUrl: event.headers.referer + "delivery.html",
      notifyUrl: event.headers.referer + "delivery.html",
      source: "web",
      appId: appId
    };
    
    // Convert to the format needed for Cashfree API
    const sortedKeys = Object.keys(orderData).sort();
    const signatureData = sortedKeys
      .map(key => `${key}${orderData[key]}`)
      .join('');
    
    // Generate signature
    const signature = generateSignature(signatureData, secretKey);
    
    // Add signature to response
    const responseData = {
      ...orderData,
      signature: signature,
      stage: "PROD" // or TEST for testing
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to process payment request' })
    };
  }
};