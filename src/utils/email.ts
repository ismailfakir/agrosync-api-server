import nodemailer from 'nodemailer';
import logger from './logger';

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // Create a transporter (Mailtrap configuration)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.EMAIL_PORT) || 2525,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: 'IoT API Support <noreply@iot-api.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: `<p>${options.message}</p>` // You can add HTML templates here
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${options.email}`);
  } catch (error) {
    logger.error('Email send failed:', error);
    throw new Error('Email could not be sent');
  }
};