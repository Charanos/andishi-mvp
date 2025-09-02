# Email (SMTP) Setup and Usage

This project uses Nodemailer with your domain mailbox to send branded emails.

- Transport: SMTP (SSL)
- Host: `mail.andishiacademy.co.ke`
- Port: `465` (secure: true)
- Sender: `Andishi Academy <evals@andishiacademy.co.ke>`

## 1) Environment Variables

Create/update `.env.local` with:

```
SMTP_HOST=mail.andishiacademy.co.ke
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=evals@andishiacademy.co.ke
SMTP_PASS=YOUR_PASSWORD
EMAIL_FROM="Andishi Academy <evals@andishiacademy.co.ke>"
FEEDBACK_INBOX=evals@andishiacademy.co.ke
NEXT_PUBLIC_API_URL=https://www.andishi.dev
```

Notes:

- Use port 465 with `SMTP_SECURE=true` (per cPanel SSL settings).
- `FEEDBACK_INBOX` overrides where admin feedback notifications go.

## 2) Core Files

- `lib/mailer.ts` — centralized Nodemailer transport and helpers
  - `verifyTransport()`
  - `sendEmail({ to, subject, html, text })`
- `lib/emailTemplates.ts` — branded HTML templates
  - `renderBaseTemplate({ title, intro, bodyHtml, cta })`
  - `renderPlainMessage(title, paragraphs, cta)`
- `app/api/email/send/route.ts` — generic email-sending API
- `app/api/feedback/route.ts` — sends admin notification + user autoresponder after feedback creation

## 3) Test the SMTP setup

Ensure the dev server is running, then send a test email:

```
POST /api/email/send
Content-Type: application/json

{
  "to": "evals@andishiacademy.co.ke",
  "subject": "SMTP verification test",
  "template": {
    "type": "plain",
    "title": "SMTP verification",
    "paragraphs": ["This is a test from the Andishi app."]
  }
}
```

Examples:

- cURL

```
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "evals@andishiacademy.co.ke",
    "subject": "SMTP verification test",
    "template": {"type": "plain", "title": "SMTP verification", "paragraphs":["This is a test from the Andishi app."]}
  }'
```

## 4) Feedback workflow emails

When a user submits the public contact form (POST `/api/feedback`):

- Admin notification is sent to `FEEDBACK_INBOX` (or `evals@` by default).
- User receives an autoresponder with their message copy.

Emails use a glassmorphic/purple-gradient theme consistent with the site.

## 5) Deliverability checklist

- SPF/DKIM/DMARC must be valid for `andiswaacademy.co.ke` in your DNS/cPanel.
- Use the SSL SMTP settings (host, port 465, secure true).
- `EMAIL_FROM` should match your authenticated mailbox.

## 6) Using templates in code

Minimal example:

```ts
import { sendEmail } from "@/lib/mailer";
import { renderBaseTemplate } from "@/lib/emailTemplates";

const html = renderBaseTemplate({
  title: "Welcome to Andishi",
  intro: "Thanks for joining!",
  bodyHtml: "<p>We are excited to have you on board.</p>",
  cta: {
    label: "Visit Dashboard",
    url: "https://andiswaacademy.co.ke/admin-dashboard",
  },
});

await sendEmail({
  to: "user@example.com",
  subject: "Welcome to Andishi",
  html,
});
```
