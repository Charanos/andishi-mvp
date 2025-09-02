// Themed HTML email templates matching Andishi brand
// Usage: renderBaseTemplate({ title, intro, bodyHtml, cta }) returns a full HTML string

export type CTA = { label: string; url: string } | null;

// Compute absolute logo URL for email clients
function getLogoUrl(): string {
  const site = process.env.NEXT_PUBLIC_API_URL || 'https://www.andishi.dev';
  return `${site}/logo.svg`;
}

// Base wrapper with updated brand visuals
export function renderBaseTemplate(params: {
  title: string;
  intro?: string;
  bodyHtml?: string;
  cta?: CTA;
  footerNote?: string;
}): string {
  const {
    title,
    intro = '',
    bodyHtml = '',
    cta = null,
    footerNote = 'You received this email from Andishi / Andishi Academy. For queries, contact info@andishi.dev.',
  } = params;

  // Brand palette tuned for glassmorphism (muted, less bright)
  const brandHeaderGradient = 'linear-gradient(135deg, #1E3A8A, #5B21B6)'; // deeper blue -> purple
  const headerOverlay = 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))';
  const cardBg = 'rgba(255,255,255,0.08)'; // slightly dimmer than before
  const cardBorder = '1px solid rgba(255,255,255,0.12)';
  const containerShadow = '0 18px 40px rgba(2, 6, 23, 0.55)';
  const borderRadius = '18px';

  const ctaUrl = cta && cta.url ? normalizeUrl(cta.url) : '';
  const ctaHtml = cta
    ? `<a href="${ctaUrl}" style="
        display:inline-block;padding:12px 20px;background:#2563EB;color:#ffffff;text-decoration:none;
        border-radius:999px;font-weight:700;letter-spacing:.2px;border:1px solid rgba(255,255,255,0.12);
        box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35)
      ">${cta.label}</a>`
    : '';

  const logo = getLogoUrl();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <!-- Fonts (not all clients support webfonts; we fall back safely) -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&family=Montserrat:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;background:#0B1020;color:#E5E7EB;font-family:Nunito, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;min-height:100vh;">
    <div style="max-width:680px;margin:56px auto 48px;padding:0 18px;">
      <!-- Header -->
      <div style="background:${brandHeaderGradient};border-radius:${borderRadius};padding:18px 22px;color:#fff;box-shadow:${containerShadow};position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:${headerOverlay};opacity:.45;"></div>
        <div style="position:relative;display:flex;align-items:center;gap:12px;">
          <div style="display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.25);border:1px solid rgba(255,255,255,0.25);">
            <img src="${logo}" alt="Andishi" width="22" height="22" style="display:block;" />
          </div>
          <div style="font-size:15px;font-weight:800;letter-spacing:.3px;font-family:Montserrat, Arial, sans-serif;">Andishi</div>
        </div>
        <h1 style="position:relative;margin:12px 0 0 0;font-size:21px;line-height:28px;font-family:Montserrat, Arial, sans-serif;">${escapeHtml(title)}</h1>
        ${intro ? `<p style=\"position:relative;margin:10px 0 0;opacity:.94;\">${escapeHtml(intro)}</p>` : ''}
      </div>

      <!-- Card Body -->
      <div style="background:${cardBg};border:${cardBorder};backdrop-filter: blur(14px);border-radius:${borderRadius};margin-top:14px;padding:26px 24px 24px;box-shadow:${containerShadow};">
        <div style="height:1px;background:linear-gradient(90deg, rgba(255,255,255,0.24), rgba(255,255,255,0.06));opacity:.35;border-radius:1px;margin:4px 0 18px;"></div>
        ${bodyHtml}
        ${ctaHtml ? `<div style=\"margin-top:20px\">${ctaHtml}</div>` : ''}
      </div>

      <!-- Footer -->
      <div style="text-align:center;color:#9CA3AF;font-size:12px;margin-top:28px;line-height:18px;">
        ${escapeHtml(footerNote)}<br/>
        <span style="opacity:.85;">© ${new Date().getFullYear()} Andishi / Andishi Academy. All rights reserved.</span>
      </div>
    </div>
  </body>
</html>`;
}

export function renderPlainMessage(title: string, paragraphs: string[], cta?: CTA): string {
  const body = paragraphs
    .map(
      (p) => `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">${escapeHtml(p)}</p>`
    )
    .join('');
  return renderBaseTemplate({ title, intro: paragraphs[0] || '', bodyHtml: body, cta });
}

// Assessment-specific templates
export function renderAssessmentInvite(params: {
  candidateName?: string;
  role?: string;
  startUrl: string;
  expiresAt?: string; // ISO or human-readable
}): string {
  const { candidateName = 'Candidate', role = 'Developer', startUrl, expiresAt } = params;
  const paragraphs = [
    `Hi ${escapeHtml(candidateName)} — we’d love to see how you approach real‑world challenges for the ${escapeHtml(role)} track.`,
    `You’ll work through a short, practical exercise that mirrors the kind of problems we solve at Andishi. Most candidates take 30–45 minutes. ${expiresAt ? `Your invite is active until ${escapeHtml(expiresAt)}.` : ''}`.trim(),
  ];
  const body = paragraphs
    .map(p => `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">${p}</p>`)
    .join('');
  return renderBaseTemplate({
    title: 'Your Andishi Skills Assessment',
    intro: `Set aside a focused block of time — your progress is saved if you need a break.`,
    bodyHtml: body,
    cta: { label: 'Start Assessment', url: normalizeUrl(startUrl) },
  });
}

export function renderAssessmentReminder(params: {
  candidateName?: string;
  role?: string;
  startUrl: string;
  daysLeft?: number;
}): string {
  const { candidateName = 'Candidate', role = 'Developer', startUrl, daysLeft } = params;
  const body = [
    `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">Hi ${escapeHtml(candidateName)} — your Andishi assessment for the ${escapeHtml(role)} track is waiting.</p>`,
    `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">Pick up where you left off anytime. ${typeof daysLeft === 'number' ? `About <strong>${daysLeft} day${daysLeft === 1 ? '' : 's'}</strong> remaining.` : ''}</p>`
  ].join('');
  return renderBaseTemplate({
    title: 'Your Andishi Assessment Is Waiting',
    intro: 'Your progress is saved — jump back in when you’re ready.',
    bodyHtml: body,
    cta: { label: 'Resume Assessment', url: normalizeUrl(startUrl) },
  });
}

export function renderAssessmentResults(params: {
  candidateName?: string;
  overallScore: number;
  recommendation?: 'hire' | 'interview' | 'not_recommended';
  detailsUrl?: string;
}): string {
  const { candidateName = 'Candidate', overallScore, recommendation, detailsUrl } = params;
  const recLabel = recommendation
    ? recommendation.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    : undefined;
  const rows = [
    `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">Hi ${escapeHtml(candidateName)} — your Andishi assessment results are ready.</p>`,
    `<div style="margin:14px 0;padding:14px 16px;border-radius:12px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;gap:12px;">
       <div style="font-family:Montserrat, Arial, sans-serif;font-size:28px;font-weight:800;color:#60A5FA;">${Math.round(overallScore)}%</div>
       <div style="color:#D1D5DB;">Overall Score</div>
     </div>`,
    recLabel ? `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">Recommendation: <strong style=\"font-family:Montserrat, Arial, sans-serif;color:#C4B5FD;\">${escapeHtml(recLabel)}</strong></p>` : '',
    `<p style="margin:0 0 16px;line-height:1.7;color:#e5e7eb;">Open the full report for a short breakdown and next steps.</p>`
  ].join('');
  return renderBaseTemplate({
    title: 'Your Andishi Results Are In',
    intro: 'Here’s a concise summary — the full report includes context and next steps.',
    bodyHtml: rows,
    cta: detailsUrl ? { label: 'View Full Report', url: normalizeUrl(detailsUrl) } : null,
  });
}

export function renderMinimalNotice(params: { title: string; paragraphs: string[]; cta?: CTA }): string {
  const body = params.paragraphs
    .map(p => `<p style=\"margin:0 0 16px;line-height:1.7;color:#e5e7eb;\">${escapeHtml(p)}</p>`) 
    .join('');
  return renderBaseTemplate({ title: params.title, intro: params.paragraphs[0] || '', bodyHtml: body, cta: params.cta || null });
}

function escapeHtml(input: string) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Ensure all links use https and www.andishi.dev when applicable
function normalizeUrl(input: string): string {
  if (!input) return input;
  // Relative path -> absolute site
  if (input.startsWith('/')) {
    return `https://www.andishi.dev${input}`;
  }
  try {
    const u = new URL(input);
    if (u.hostname.endsWith('andishi.dev') && !u.hostname.startsWith('www.')) {
      u.hostname = 'www.andishi.dev';
    }
    if (u.protocol !== 'https:') {
      u.protocol = 'https:';
    }
    return u.toString();
  } catch {
    return 'https://www.andishi.dev';
  }
}
