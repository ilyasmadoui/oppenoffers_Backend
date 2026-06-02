const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    await transporter.sendMail({
        from: `"Admin support" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

// Function to send email to multiple recipients (using BCC for privacy)
const sendEmailToMultiple = async (recipients, subject, html) => {
    if (!recipients || recipients.length === 0) {
        console.log('No recipients to send email to');
        return { success: false, message: 'No recipients provided' };
    }

    // Debug: Log all received emails
    console.log(" Emails received:", recipients);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    console.log(" Creating email transporter with Gmail...");

    try {
        // Filter out invalid emails
        const validEmails = recipients.filter(email => email && typeof email === 'string' && email.includes('@'));

        // Debug: Log valid emails after filter
        console.log(" Valid emails after filter:", validEmails);

        if (validEmails.length === 0) {
            console.log('No valid email addresses found');
            return { success: false, message: 'No valid email addresses found' };
        }

        // Show how many will actually be sent in BCC
        console.log(" Total recipients (BCC):", validEmails.length);

        // Announce sending
        console.log(" Attempting to send email...");

        await transporter.sendMail({
            from: `"Admin support" <${process.env.EMAIL_USER}>`,
            bcc: validEmails, // Use BCC to protect member privacy
            subject,
            html
        });

        // Success log message
        console.log(" Email sent successfully!");
        return {
            success: true,
            message: `Email sent to ${validEmails.length} recipients`,
            count: validEmails.length
        };

    } catch (error) {
        // Detailed error logging
        console.error(" Email sending error details:");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        return { success: false, message: 'Failed to send emails', error: error.message };
    }
};

module.exports = sendEmail;
module.exports.sendEmailToMultiple = sendEmailToMultiple;