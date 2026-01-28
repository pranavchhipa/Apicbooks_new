import { Resend } from 'resend';

// Use the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string = 'Reader') {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ApicBooks <hello@apicbooks.com>', // Updated to verified domain
      to: email,
      subject: 'Welcome to ApicBooks! 📚',
      html: `
        <div style="font-family: sans-serif; max-w-600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4F46E5;">Welcome to ApicBooks, ${name}!</h1>
          <p>We're thrilled to have you join our community of book lovers.</p>
          <p>With ApicBooks, you can:</p>
          <ul>
            <li>Track your reading progress</li>
            <li>Compare prices across major retailers</li>
            <li>Discover your next favorite book with AI</li>
          </ul>
          <div style="margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Happy Reading,<br/>
            The ApicBooks Team
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception sending email:', error);
    return { success: false, error };
  }
}
