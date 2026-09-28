import { createHmac, timingSafeEqual } from 'crypto';

const API_URL = 'https://api.autosend.com/v1';
const API_KEY = process.env.AUTOSEND_API_KEY!;
const FROM_EMAIL = 'aka@designerdada.com';
const FROM_NAME = 'Designerdada';
const LIST_ID = process.env.AUTOSEND_NEWSLETTER_LIST_ID!;
const TOKEN_SECRET = process.env.NEWSLETTER_TOKEN_SECRET!;
const WELCOME_TEMPLATE_ID = 'A-c4188498766cd7019509';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function verifyToken(token: string): string | null {
  const parts = token.split(':');
  if (parts.length !== 3) return null;

  const [encodedEmail, timestamp, providedHmac] = parts;
  const payload = `${encodedEmail}:${timestamp}`;
  const expectedHmac = createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');

  try {
    const a = Buffer.from(providedHmac, 'base64url');
    const b = Buffer.from(expectedHmac, 'base64url');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age > TOKEN_TTL_MS) return null;

  try {
    return Buffer.from(encodedEmail, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}


const text = (body: string, status: number) =>
  new Response(body, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');

  if (!token) {
    return text('Missing or invalid token.', 400);
  }

  const email = verifyToken(token);

  if (!email) {
    return text('This confirmation link is invalid or has expired. Please subscribe again at designerdada.com.', 400);
  }

  if (!LIST_ID) {
    console.error('AUTOSEND_NEWSLETTER_LIST_ID is not set');
    return text('Server misconfiguration. Please contact the site owner.', 500);
  }

  try {
    // Add contact to the Newsletter list and mark as confirmed
    console.log(`Adding ${email} to list ${LIST_ID}`);
    const contactRes = await fetch(`${API_URL}/contacts/email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        listIds: [LIST_ID],
        customFields: { confirmed: true, confirmedAt: new Date().toISOString() },
      }),
    });

    const contactBody = await contactRes.json();
    if (!contactRes.ok) {
      console.error('AutoSend contact upsert error:', JSON.stringify(contactBody));
      return text('Something went wrong. Please try again.', 500);
    }
    console.log('AutoSend contact upsert response:', JSON.stringify(contactBody));

    // Send welcome email
    await fetch(`${API_URL}/mails/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: { email },
        templateId: WELCOME_TEMPLATE_ID,
      }),
    });

    // Redirect to home with success flag
    return Response.redirect('https://designerdada.com/?subscribed=1', 302);
  } catch (err) {
    console.error('Confirm error:', err);
    return text('Internal server error. Please try again.', 500);
  }
}
