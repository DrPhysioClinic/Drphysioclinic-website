import { Resend } from "resend";
import { config } from "dotenv";

config({ path: ".env.local" });

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@example.com',
      subject: 'Test Email',
      html: '<p>Testing</p>'
    });
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
