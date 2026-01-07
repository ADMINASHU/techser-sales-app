import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: process.env.EMAIL_SERVER_PORT,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

// For development, we might not have SMTP.
// If env vars are missing, we can just log to console.

export async function sendEmail({ to, subject, html }) {
    if (!process.env.EMAIL_SERVER_HOST) {
        return { success: true };
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Techser App" <noreply@techser.com>',
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error) {
        return { error: "Failed to send email" };
    }
}
