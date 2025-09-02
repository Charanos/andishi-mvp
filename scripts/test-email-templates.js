/*
Usage:
  node scripts/test-email-templates.js --to someone@example.com --type invite \
    --base http://localhost:3000 \
    --name "Jane Doe" --role "Frontend Developer" \
    --url "/developer-evaluation/TOKEN123" --expires "in 72 hours"

Types:
  - invite   (CTA: Take Assessment)
  - reminder (CTA: Resume Assessment)
  - results  (CTA: View Details)

Notes:
  - BASE URL defaults to http://localhost:3000. Override with --base or BASE_URL env.
  - The email API is app/api/email/send/route.ts and expects { to, subject, template }.
  - The server will apply the branded base template and normalize CTA URLs to https + www.
*/

const args = require('node:process').argv.slice(2);

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

(async () => {
  const opts = parseArgs(args);
  const to = opts.to || process.env.TO;
  const type = (opts.type || 'invite').toLowerCase();
  const base = opts.base || process.env.BASE_URL || 'http://localhost:3000';
  const name = opts.name || 'Candidate';
  const role = opts.role || 'Developer';
  const url = opts.url || '/developer-evaluation/TOKEN123';
  const expires = opts.expires; // optional

  if (!to) {
    console.error('Missing --to. Example: --to you@example.com');
    process.exit(1);
  }

  const subjectByType = {
    invite: `Your Andishi Technical Assessment`,
    reminder: `Reminder: Complete Your Assessment`,
    results: `Assessment Results Available`,
  };

  const subject = opts.subject || subjectByType[type] || 'Andishi Notification';

  // Construct template payloads that the API will render with renderBaseTemplate
  let template;
  if (type === 'invite') {
    template = {
      title: 'Your Andishi Technical Assessment',
      paragraphs: [
        `Hi ${name}, we’re excited to invite you to the Andishi technical assessment for the ${role} role.`,
        `Please click the button below to start your assessment.${expires ? ` This link will be valid until ${expires}.` : ''}`.trim(),
      ],
      cta: { label: 'Take Assessment', url },
    };
  } else if (type === 'reminder') {
    template = {
      title: 'Reminder: Complete Your Assessment',
      paragraphs: [
        `Hi ${name}, just a friendly reminder to complete your Andishi assessment for the ${role} role.`,
      ],
      cta: { label: 'Resume Assessment', url },
    };
  } else if (type === 'results') {
    template = {
      title: 'Assessment Results',
      paragraphs: [
        `Hi ${name}, your assessment results are now available.`,
        `Click below to view the detailed breakdown and next steps.`,
      ],
      cta: { label: 'View Details', url },
    };
  } else {
    template = {
      title: subject,
      paragraphs: [
        `Hello ${name}, this is a generic test of the Andishi branded email template.`,
      ],
      cta: { label: 'Open Link', url },
    };
  }

  const payload = {
    to,
    subject,
    template,
  };

  const endpoint = `${base.replace(/\/$/, '')}/api/email/send`;
  console.log(`POST ${endpoint}`);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));

    if (!res.ok) process.exit(2);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(3);
  }
})();
