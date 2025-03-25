# Tender Coconut Delivery App

A web application for ordering tender coconuts with Razorpay payment integration.

## Payment Integration

This application uses Razorpay for processing payments. The integration follows a client-side approach where:

1. User selects quantity of coconuts on the index page
2. User provides delivery address and contact information
3. Upon clicking "Pay", the Razorpay payment modal opens
4. After successful payment, user is redirected to the delivery page
5. Failed payments redirect the user back to the index page

### Key Features

- Prefetched payment amount based on quantity selected
- Real-time location selection using interactive map
- Client-side payment processing (no server required)
- User-friendly payment flow with clear feedback
- Seamless mobile experience

## Development

To run the application locally, simply serve the files with any HTTP server. For example:

```bash
# Using Python's simple HTTP server
python -m http.server

# Or using Node.js serve package
npx serve
```

## Payment Testing

For testing payments, you can use the following test card details:

- Card Number: 4111 1111 1111 1111
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name
- 3D Secure Password: 1234

## Environment Variables

The application now uses Razorpay live keys:
- Key ID: rzp_live_4ogkBBSJ1qo2mf
- ⚠️ Note: The Secret Key is stored securely and should not be exposed in client-side code.