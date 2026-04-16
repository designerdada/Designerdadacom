#!/usr/bin/env node

/**
 * test-send.js - Send a test email via Autosend
 *
 * Usage:
 *   node test-send.js <recipient-email>
 *
 * Environment Variables:
 *   AUTOSEND_API_KEY - Required. Your Autosend API key.
 *
 * Examples:
 *   AUTOSEND_API_KEY=your_api_key node test-send.js user@example.com
 *   export AUTOSEND_API_KEY=your_api_key && node test-send.js user@example.com
 */

const { Autosend } = require('autosendjs');

async function main() {
  // Validate API key
  const apiKey = process.env.AUTOSEND_API_KEY;
  if (!apiKey) {
    console.error('Error: AUTOSEND_API_KEY environment variable is not set.');
    console.error('Usage: AUTOSEND_API_KEY=your_key node test-send.js <recipient-email>');
    process.exit(1);
  }

  // Validate recipient email argument
  const recipientEmail = process.argv[2];
  if (!recipientEmail) {
    console.error('Error: Recipient email is required.');
    console.error('Usage: node test-send.js <recipient-email>');
    process.exit(1);
  }

  // Basic email format validation
  if (!recipientEmail.includes('@')) {
    console.error('Error: Invalid email format.');
    process.exit(1);
  }

  // Initialize Autosend client
  const autosend = new Autosend(apiKey);

  console.log(`Sending test email to: ${recipientEmail}`);

  try {
    await autosend.emails.send({
      from: { email: 'test@yourdomain.com' },
      to: { email: recipientEmail },
      subject: 'Test Email from Autosend',
      html: '<p>Your Autosend integration is working!</p>'
    });

    console.log('Success: Test email sent successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error: Failed to send email.');
    console.error(`Details: ${error.message || error}`);
    process.exit(1);
  }
}

main();
