import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
// For testing locally without verified domain, Resend requires from: 'onboarding@resend.dev' and to: 'your-email'
// In production, this should be 'updates@drphysioclinic.com' or similar.
const FROM_EMAIL = 'onboarding@resend.dev';

export async function sendZoomConfirmationEmail(toEmail: string, patientName: string, date: string, time: string, joinUrl: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping confirmation email.");
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Your Online Consultation is Confirmed - Dr. Physio Clinic',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Online Consultation Confirmed</h2>
          <p>Hi ${patientName},</p>
          <p>Your online video consultation has been confirmed for <strong>${date}</strong> at <strong>${time}</strong>.</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin-top: 0; font-weight: bold;">Join Video Call:</p>
            <a href="${joinUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">Click here to join</a>
            <p style="font-size: 12px; margin-bottom: 0; margin-top: 12px;">Or copy link: ${joinUrl}</p>
          </div>
          <p>Please join the waiting room 5 minutes before your scheduled time.</p>
          <p>Best regards,<br>Dr. Physio Clinic Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
}

export async function sendClinicConfirmationEmail(toEmail: string, patientName: string, date: string, time: string) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Your Appointment is Confirmed - Dr. Physio Clinic',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Appointment Confirmed</h2>
          <p>Hi ${patientName},</p>
          <p>Your in-clinic appointment has been confirmed for <strong>${date}</strong> at <strong>${time}</strong>.</p>
          <p>We look forward to seeing you at the clinic.</p>
          <p>Best regards,<br>Dr. Physio Clinic Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send in-clinic confirmation email:", error);
  }
}

export async function sendCancellationEmail(toEmail: string, patientName: string) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Skipping cancellation email.");
      return;
    }
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Consultation Cancelled - Dr. Physio Clinic',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Consultation Cancelled</h2>
          <p>Hi ${patientName},</p>
          <p>Your scheduled consultation has been cancelled.</p>
          <p>If you'd like to reschedule, please visit our website and submit a new request.</p>
          <p>Best regards,<br>Dr. Physio Clinic Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
}

export async function sendRescheduleEmail(toEmail: string, patientName: string, newDate: string, newTime: string, isOnline: boolean) {
  try {
    if (!process.env.RESEND_API_KEY) return;
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Appointment Rescheduled - Dr. Physio Clinic',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2>Appointment Rescheduled</h2>
          <p>Hi ${patientName},</p>
          <p>Your appointment has been successfully rescheduled to <strong>${newDate}</strong> at <strong>${newTime}</strong>.</p>
          ${isOnline ? '<p>Please use the same Zoom link provided in your original confirmation email.</p>' : '<p>We look forward to seeing you at the clinic.</p>'}
          <p>Best regards,<br>Dr. Physio Clinic Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send reschedule email:", error);
  }
}
