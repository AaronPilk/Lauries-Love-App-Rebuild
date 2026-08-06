// send-email
// Body: { to: string | string[], template: 'welcome' | 'password_reset' | 'generic',
//         data?: Record<string, any>, subject?, html?, text? }
// Sends transactional email via the SendGrid v3 API.
//
// Required secrets: SENDGRID_API_KEY
// Optional secrets: SENDGRID_FROM_EMAIL (default no-reply@lau:ies... see below),
//                   SENDGRID_FROM_NAME, APP_URL (used in reset/welcome links)
import { handlePreflight, json, notConfigured } from '../_shared/cors.ts';
import { env, missingEnv } from '../_shared/supabaseAdmin.ts';

type Template = 'welcome' | 'password_reset' | 'generic';

// Renders subject + html + text for each template. Kept inline (no external
// template service) so it works the moment the SendGrid key is added.
function render(
  template: Template,
  data: Record<string, unknown>,
): { subject: string; html: string; text: string } {
  const appUrl = (env('APP_URL') ?? 'https://app.laurieslove.org').replace(/\/$/, '');
  const name = (data.first_name as string) || (data.name as string) || 'there';

  switch (template) {
    case 'welcome':
      return {
        subject: "Welcome to Laurie's Love",
        html: `<p>Hi ${name},</p>
<p>Welcome to Laurie's Love — a community built on support and connection.
You can open the app any time to share, connect, and find people who understand
what you're going through.</p>
<p><a href="${appUrl}">Open the app</a></p>
<p>With love,<br/>The Laurie's Love Team</p>`,
        text:
          `Hi ${name},\n\nWelcome to Laurie's Love. Open the app any time: ${appUrl}\n\nWith love,\nThe Laurie's Love Team`,
      };

    case 'password_reset': {
      // reset_link is supplied by the caller (e.g. from Supabase generateLink);
      // we fall back to a generic reset route so the email is never broken.
      const link = (data.reset_link as string) || `${appUrl}/reset-password`;
      return {
        subject: "Reset your Laurie's Love password",
        html: `<p>Hi ${name},</p>
<p>We received a request to reset your password. Click the button below to choose
a new one. If you didn't request this, you can safely ignore this email.</p>
<p><a href="${link}" style="display:inline-block;padding:12px 20px;background:#c2185b;color:#fff;border-radius:6px;text-decoration:none;">Reset password</a></p>
<p>Or paste this link into your browser:<br/>${link}</p>
<p>The Laurie's Love Team</p>`,
        text:
          `Hi ${name},\n\nReset your password using this link:\n${link}\n\nIf you didn't request this, ignore this email.\n\nThe Laurie's Love Team`,
      };
    }

    case 'generic':
    default:
      return {
        subject: (data.subject as string) || "A message from Laurie's Love",
        html: (data.html as string) || `<p>${(data.text as string) || ''}</p>`,
        text: (data.text as string) || '',
      };
  }
}

Deno.serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const missing = missingEnv(['SENDGRID_API_KEY']);
  if (missing.length) return notConfigured(missing);

  try {
    const body = await req.json().catch(() => ({}));
    const toRaw = body.to;
    const template: Template = body.template ?? 'generic';
    const data: Record<string, unknown> = body.data ?? body ?? {};

    const recipients: string[] = Array.isArray(toRaw) ? toRaw : toRaw ? [toRaw] : [];
    if (!recipients.length) return json({ error: '`to` is required' }, 400);

    const fromEmail = env('SENDGRID_FROM_EMAIL') ?? 'no-reply@laurieslove.org';
    const fromName = env('SENDGRID_FROM_NAME') ?? "Laurie's Love";

    // Allow explicit overrides on the generic template.
    const rendered = render(template, data);
    const subject = (body.subject as string) ?? rendered.subject;
    const html = (body.html as string) ?? rendered.html;
    const text = (body.text as string) ?? rendered.text;

    const payload = {
      personalizations: [{ to: recipients.map((email) => ({ email })) }],
      from: { email: fromEmail, name: fromName },
      subject,
      content: [
        { type: 'text/plain', value: text || ' ' },
        { type: 'text/html', value: html || `<p>${text}</p>` },
      ],
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const detail = await resp.text();
      return json({ error: 'sendgrid_error', status: resp.status, detail }, 502);
    }

    return json({ ok: true, sent: recipients.length });
  } catch (e) {
    return json({ error: (e as Error).message ?? 'send failed' }, 500);
  }
});
