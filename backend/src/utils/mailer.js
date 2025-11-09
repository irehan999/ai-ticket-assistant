import nodemailer from 'nodemailer';

const sendMail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASS
        }
    });

    const mailOptions = {
        from: process.env.MAILTRAP_FROM_EMAIL,
        to,
        subject,
        text
    };

    try {
        
        const info = await transporter.sendMail(mailOptions);
        return info;

        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

export default sendMail;
