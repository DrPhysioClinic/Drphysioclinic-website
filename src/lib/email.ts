import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Dr. Physio Clinic <noreply@send.drphysioclinic.com>';
const REPLY_TO_EMAIL = 'appointments@drphysioclinic.com';

const LOGO_URL = 'https://www.drphysioclinic.com/Dr%20physio%20logo%20combined.png';

const BRAND = {
  primary: '#2b2775',
  primaryDark: '#17153f',
  ink: '#0f172a',
  muted: '#64748b',
  bodyBg: '#f4f3f9',
  softBg: '#f4f3f9',
  border: '#cdc6e2',
  divider: '#e5e2f0',
};

const FONT_BODY = "Inter, Arial, sans-serif";
const FONT_HEAD = "'Noticia Text', Georgia, 'Times New Roman', serif";

/** Wraps inner content in the full, email-client-safe branded shell. */
function renderEmail(heading: string, contentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>${heading}</title>
<!--[if mso]><style type="text/css">a{text-decoration:none}</style><![endif]-->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noticia+Text:wght@400;700&display=swap">
</head>
<body style="margin:0;padding:0;width:100%;background-color:${BRAND.bodyBg};font-family:${FONT_BODY};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bodyBg};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="552" cellpadding="0" cellspacing="0" style="width:552px;max-width:552px;">
<tr><td style="background-color:${BRAND.primary};border-radius:16px 16px 0 0;padding:24px 40px;">
<img src="${LOGO_URL}" alt="Dr. Physio — The Way To Wellness" height="40" style="height:40px;width:auto;display:block;border:0;outline:none;text-decoration:none;">
</td></tr>
<tr><td style="background-color:#ffffff;padding:40px;">
<h1 style="margin:0 0 18px;font-family:${FONT_HEAD};font-size:30px;line-height:38px;font-weight:700;color:${BRAND.ink};">${heading}</h1>
${contentHtml}
</td></tr>
<tr><td style="padding:26px 40px 8px;">
<p style="margin:0 0 6px;font-family:${FONT_BODY};font-size:13px;line-height:20px;color:${BRAND.muted};">Dr. Physio Clinic &middot; Online &amp; in-clinic physiotherapy</p>
<p style="margin:0;font-family:${FONT_BODY};font-size:13px;line-height:20px;color:${BRAND.muted};">Questions? Reply to this email or write to appointments@drphysioclinic.com</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** A body paragraph. */
function paragraph(text: string, marginBottom = 16): string {
  return `<p style="margin:0 0 ${marginBottom}px;font-family:${FONT_BODY};font-size:16px;line-height:26px;color:${BRAND.ink};">${text}</p>`;
}

/** A boxed list of label/value detail rows. */
function detailCard(rows: { label: string; value: string }[], marginBottom = 28): string {
  const cells = rows
    .map((r, i) => {
      const border = i < rows.length - 1 ? `border-bottom:1px solid ${BRAND.divider};` : '';
      return `<tr><td style="padding:18px 22px;${border}">
<div style="font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${r.label}</div>
<div style="font-family:${FONT_BODY};font-size:17px;font-weight:600;color:${BRAND.ink};">${r.value}</div>
</td></tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.softBg};border:1px solid ${BRAND.border};border-radius:12px;margin-bottom:${marginBottom}px;">
${cells}
</table>`;
}

/** A primary purple CTA button with Outlook (VML) fallback. */
function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:8px;background-color:${BRAND.primary};">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:50px;v-text-anchor:middle;width:260px;" arcsize="16%" stroke="f" fillcolor="${BRAND.primary}">
<w:anchorlock/>
<center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${label}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a href="${href}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:${FONT_BODY};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${label}</a>
<!--<![endif]-->
</td></tr></table>`;
}

/** A bordered footnote block inside the white card. */
function noteBlock(text: string): string {
  return `<div style="border-top:1px solid ${BRAND.divider};margin-top:28px;padding-top:24px;">
<p style="margin:0;font-family:${FONT_BODY};font-size:14px;line-height:22px;color:${BRAND.muted};">${text}</p>
</div>`;
}

/* -------------------------------------------------------------------------- */
/*  Email senders                                                             */
/* -------------------------------------------------------------------------- */

export async function sendZoomConfirmationEmail(toEmail: string, patientName: string, date: string, time: string, joinUrl: string, replyTo: string = REPLY_TO_EMAIL) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping confirmation email.");
      return;
    }
    const content = `
      ${paragraph(`Hi ${patientName},`)}
      ${paragraph(`Your online video consultation has been confirmed. The details are below — please join the waiting room a few minutes early.`, 28)}
      ${detailCard([
      { label: 'Date', value: date },
      { label: 'Time', value: time },
    ])}
      ${button('Join video consultation', joinUrl)}
      <p style="margin:18px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:20px;color:${BRAND.muted};">Or paste this link into your browser:<br><span style="color:${BRAND.primary};word-break:break-all;">${joinUrl}</span></p>
      ${noteBlock(`Please join the waiting room 5 minutes before your scheduled time. If you didn't request this consultation, please contact our team.`)}
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: replyTo,
      subject: 'Your Online Consultation is Confirmed - Dr. Physio Clinic',
      html: renderEmail('Your online consultation is confirmed', content),
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

export async function sendClinicConfirmationEmail(toEmail: string, patientName: string, date: string, time: string, replyTo: string = REPLY_TO_EMAIL) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    const content = `
      ${paragraph(`Hi ${patientName},`)}
      ${paragraph(`Your in-clinic appointment has been confirmed. We look forward to seeing you at the clinic.`, 28)}
      ${detailCard([
      { label: 'Date', value: date },
      { label: 'Time', value: time },
    ], 8)}
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: replyTo,
      subject: 'Your Appointment is Confirmed - Dr. Physio Clinic',
      html: renderEmail('Your appointment is confirmed', content),
    });
  } catch (error) {
    console.error("Failed to send in-clinic confirmation email:", error);
  }
}

export async function sendCancellationEmail(toEmail: string, patientName: string, replyTo: string = REPLY_TO_EMAIL) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping cancellation email.");
      return;
    }
    const content = `
      ${paragraph(`Hi ${patientName},`)}
      ${paragraph(`Your scheduled consultation has been cancelled.`)}
      ${paragraph(`If you'd like to reschedule, please visit our website and submit a new request — we'd be happy to find another time for you.`, 0)}
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: replyTo,
      subject: 'Consultation Cancelled - Dr. Physio Clinic',
      html: renderEmail('Your consultation has been cancelled', content),
    });
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
}

export async function sendRescheduleEmail(toEmail: string, patientName: string, newDate: string, newTime: string, isOnline: boolean, replyTo: string = REPLY_TO_EMAIL) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    const content = `
      ${paragraph(`Hi ${patientName},`)}
      ${paragraph(`Your appointment has been successfully rescheduled to the new date and time below.`, 28)}
      ${detailCard([
      { label: 'New date', value: newDate },
      { label: 'New time', value: newTime },
    ], 24)}
      ${paragraph(
      isOnline
        ? `Please use the same Zoom link provided in your original confirmation email.`
        : `We look forward to seeing you at the clinic.`,
      0,
    )}
    `;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: replyTo,
      subject: 'Appointment Rescheduled - Dr. Physio Clinic',
      html: renderEmail('Your appointment has been rescheduled', content),
    });
  } catch (error) {
    console.error("Failed to send reschedule email:", error);
  }
}
