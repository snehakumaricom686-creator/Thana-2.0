import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NOTIFICATION_EMAIL,
    pass: process.env.NOTIFICATION_PASSWORD
  }
});

export const sendNotificationEmail = async (subject, text) => {
  try {
    if (!process.env.NOTIFICATION_EMAIL || !process.env.NOTIFICATION_PASSWORD) {
      console.log('Skipping email notification, credentials not provided.');
      return;
    }

    const mailOptions = {
      from: `"Thana 2.0 System" <${process.env.NOTIFICATION_EMAIL}>`,
      to: process.env.NOTIFICATION_EMAIL, // Send an alert to yourself
      subject: subject,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};
