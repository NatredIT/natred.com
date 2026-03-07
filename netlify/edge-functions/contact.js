export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  const { name, email, company, phone, message, turnstileToken } = body;

  if (!name || !email || !message || !turnstileToken) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  // Verify Turnstile token server-side
  const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  });

  const turnstileData = await turnstileRes.json();
  if (!turnstileData.success) {
    return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 400 });
  }

  // Build email body
  const emailText = [
    `Name: ${name}`,
    `Email: ${email}`,
    company ? `Company: ${company}` : null,
    phone ? `Phone: ${phone}` : null,
    ``,
    `Message:`,
    message,
  ].filter((line) => line !== null).join('\n');

  // Send via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'website@natred.com',
      to: 'service@natred.com',
      reply_to: email,
      subject: `Website Enquiry from ${name}`,
      text: emailText,
    }),
  });

  if (!resendRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
};

export const config = {
  path: '/api/contact',
};
