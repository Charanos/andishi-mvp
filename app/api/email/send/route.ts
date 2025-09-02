import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, verifyTransport } from '@/lib/mailer';
import { renderPlainMessage, renderBaseTemplate } from '@/lib/emailTemplates';

// POST /api/email/send
// Body: { to: string|string[], subject: string, html?: string, text?: string, template?: { type: 'plain'|'custom', title?: string, paragraphs?: string[], cta?: { label: string, url: string } } }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject } = body || {};
    if (!to || !subject) {
      return NextResponse.json({ success: false, error: 'Missing required fields: to, subject' }, { status: 400 });
    }

    const transportOk = await verifyTransport();
    if (!transportOk) {
      return NextResponse.json({ success: false, error: 'SMTP transport not verified. Check credentials.' }, { status: 500 });
    }

    let html: string | undefined = body.html;
    let text: string | undefined = body.text;

    if (!html) {
      const t = body.template as { type?: 'plain'|'custom'; title?: string; paragraphs?: string[]; cta?: { label: string; url: string } } | undefined;
      if (t?.type === 'plain') {
        html = renderPlainMessage(t.title || subject, t.paragraphs || [subject], t.cta);
      } else {
        // default themed wrapper with provided text
        const content = (t?.paragraphs || [body.text || '']).map((p: string) => `<p style="margin:0 0 10px;line-height:1.6;color:#e5e7eb;">${escapeHtml(p)}</p>`).join('');
        html = renderBaseTemplate({ title: t?.title || subject, bodyHtml: content, cta: t?.cta });
      }
      text = text || (Array.isArray(body?.template?.paragraphs) ? body.template.paragraphs.join('\n\n') : body.text || subject);
    }

    const info = await sendEmail({ to, subject, html, text });
    return NextResponse.json({ success: true, messageId: info.messageId, response: info.response });
  } catch (err: any) {
    console.error('[email/send] error', err);
    return NextResponse.json({ success: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
