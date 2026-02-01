const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RBSE Library <noreply@rbselibrary.edu>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent to ${options.to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${options.to}: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email to new user
 */
const sendWelcomeEmail = async (user) => {
  const subject = `Welcome to ${process.env.SCHOOL_NAME || 'RBSE'} Digital Library`;
  const text = `
    Dear ${user.name},

    Welcome to ${process.env.SCHOOL_NAME || 'RBSE'} Digital Library!

    Your account has been successfully created.

    Admission Number: ${user.admissionNumber}
    Email: ${user.email}
    Role: ${user.role}

    You can now login and start exploring our digital library resources.

    Best regards,
    ${process.env.SCHOOL_NAME || 'RBSE'} Library Team
  `;

  const html = `
    <h2>Welcome to ${process.env.SCHOOL_NAME || 'RBSE'} Digital Library!</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>Your account has been successfully created.</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Admission Number:</strong> ${user.admissionNumber}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Role:</strong> ${user.role}</p>
    </div>
    <p>You can now login and start exploring our digital library resources.</p>
    <p>Best regards,<br>${process.env.SCHOOL_NAME || 'RBSE'} Library Team</p>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const subject = 'Password Reset Request';
  const text = `
    Dear ${user.name},

    You have requested to reset your password.

    Please click on the following link to reset your password:
    ${resetUrl}

    This link will expire in 1 hour.

    If you didn't request this, please ignore this email.

    Best regards,
    ${process.env.SCHOOL_NAME || 'RBSE'} Library Team
  `;

  const html = `
    <h2>Password Reset Request</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>You have requested to reset your password.</p>
    <p>Please click on the button below to reset your password:</p>
    <div style="margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Reset Password
      </a>
    </div>
    <p>Or copy and paste this link in your browser:</p>
    <p style="color: #666; word-break: break-all;">${resetUrl}</p>
    <p><strong>This link will expire in 1 hour.</strong></p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Best regards,<br>${process.env.SCHOOL_NAME || 'RBSE'} Library Team</p>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send book borrowed confirmation email
 */
const sendBookBorrowedEmail = async (user, book, borrowing) => {
  const subject = 'Book Borrowed Successfully';
  const dueDate = new Date(borrowing.dueDate).toLocaleDateString('en-IN');

  const text = `
    Dear ${user.name},

    You have successfully borrowed the following book:

    Title: ${book.title}
    Author: ${book.author}
    Due Date: ${dueDate}

    Please return the book before the due date to avoid late fees.

    Best regards,
    ${process.env.SCHOOL_NAME || 'RBSE'} Library Team
  `;

  const html = `
    <h2>Book Borrowed Successfully</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>You have successfully borrowed the following book:</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
      <p><strong>Title:</strong> ${book.title}</p>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Due Date:</strong> <span style="color: #d32f2f;">${dueDate}</span></p>
    </div>
    <p>Please return the book before the due date to avoid late fees.</p>
    <p>Best regards,<br>${process.env.SCHOOL_NAME || 'RBSE'} Library Team</p>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send due date reminder email
 */
const sendDueDateReminderEmail = async (user, book, borrowing) => {
  const subject = 'Book Due Date Reminder';
  const dueDate = new Date(borrowing.dueDate).toLocaleDateString('en-IN');

  const text = `
    Dear ${user.name},

    This is a reminder that the following book is due soon:

    Title: ${book.title}
    Author: ${book.author}
    Due Date: ${dueDate}

    Please return or renew the book before the due date to avoid late fees.

    Best regards,
    ${process.env.SCHOOL_NAME || 'RBSE'} Library Team
  `;

  const html = `
    <h2>Book Due Date Reminder</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>This is a reminder that the following book is due soon:</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px;">
      <p><strong>Title:</strong> ${book.title}</p>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Due Date:</strong> <span style="color: #d32f2f;">${dueDate}</span></p>
    </div>
    <p>Please return or renew the book before the due date to avoid late fees.</p>
    <p>Best regards,<br>${process.env.SCHOOL_NAME || 'RBSE'} Library Team</p>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

/**
 * Send overdue notice email
 */
const sendOverdueNoticeEmail = async (user, book, borrowing, fine) => {
  const subject = 'Overdue Book Notice';
  const dueDate = new Date(borrowing.dueDate).toLocaleDateString('en-IN');

  const text = `
    Dear ${user.name},

    The following book is overdue:

    Title: ${book.title}
    Author: ${book.author}
    Due Date: ${dueDate}
    Fine: ₹${fine}

    Please return the book immediately to avoid additional late fees.

    Best regards,
    ${process.env.SCHOOL_NAME || 'RBSE'} Library Team
  `;

  const html = `
    <h2>Overdue Book Notice</h2>
    <p>Dear <strong>${user.name}</strong>,</p>
    <p>The following book is <strong style="color: #d32f2f;">OVERDUE</strong>:</p>
    <div style="margin: 20px 0; padding: 15px; background-color: #ffebee; border-left: 4px solid #d32f2f; border-radius: 5px;">
      <p><strong>Title:</strong> ${book.title}</p>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Fine:</strong> <span style="color: #d32f2f; font-size: 18px;">₹${fine}</span></p>
    </div>
    <p>Please return the book immediately to avoid additional late fees.</p>
    <p>Best regards,<br>${process.env.SCHOOL_NAME || 'RBSE'} Library Team</p>
  `;

  await sendEmail({ to: user.email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendBookBorrowedEmail,
  sendDueDateReminderEmail,
  sendOverdueNoticeEmail,
};
