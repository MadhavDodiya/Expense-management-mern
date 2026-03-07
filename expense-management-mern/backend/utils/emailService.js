const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use a test account or console logging
  if (process.env.NODE_ENV === 'development') {
    return {
      sendMail: async (options) => {
        console.log('=== EMAIL SENT ===');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Text:', options.text);
        console.log('HTML:', options.html);
        console.log('==================');
        return { messageId: 'dev-' + Date.now() };
      }
    };
  }

  // For production, use real email service
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  const result = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@expensemanagement.com',
    ...mailOptions
  });
  return result;
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetUrl, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@expensemanagement.com',
    to: email,
    subject: 'Password Reset Request - Expense Management System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Expense Management System</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${userName},</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your Expense Management System account.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #667eea; word-break: break-all; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            This link will expire in 10 minutes for security reasons.
          </p>
          
          <p style="color: #666; line-height: 1.6; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2024 Expense Management System. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Hello ${userName},
      
      We received a request to reset your password for your Expense Management System account.
      
      Click the link below to reset your password:
      ${resetUrl}
      
      This link will expire in 10 minutes for security reasons.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      Expense Management System Team
    `
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

const sendExpenseSubmittedEmail = async ({ to, userName, expenseTitle, amount, currency, expenseDate, status }) => {
  if (!to) return null;
  return sendEmail({
    to,
    subject: `Expense Submitted: ${expenseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
        <h2>Expense Submission Confirmation</h2>
        <p>Hello ${userName || 'User'},</p>
        <p>Your expense has been submitted successfully.</p>
        <ul>
          <li><strong>Title:</strong> ${expenseTitle}</li>
          <li><strong>Amount:</strong> ${amount} ${currency}</li>
          <li><strong>Expense Date:</strong> ${expenseDate}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
      </div>
    `,
    text: `Expense submitted.\nTitle: ${expenseTitle}\nAmount: ${amount} ${currency}\nExpense Date: ${expenseDate}\nStatus: ${status}`
  });
};

const sendExpenseStatusEmail = async ({ to, userName, expenseTitle, decision, comments, approverName }) => {
  if (!to) return null;
  return sendEmail({
    to,
    subject: `Expense ${decision}: ${expenseTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
        <h2>Expense ${decision}</h2>
        <p>Hello ${userName || 'User'},</p>
        <p>Your expense <strong>${expenseTitle}</strong> has been <strong>${decision}</strong>.</p>
        <p><strong>Reviewed by:</strong> ${approverName || 'Approver'}</p>
        <p><strong>Comments:</strong> ${comments || 'No comments provided.'}</p>
      </div>
    `,
    text: `Expense ${decision}\nTitle: ${expenseTitle}\nReviewed by: ${approverName || 'Approver'}\nComments: ${comments || 'No comments provided.'}`
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendExpenseSubmittedEmail,
  sendExpenseStatusEmail
};
