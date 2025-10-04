# Email Configuration for Password Reset

This document explains how to configure email functionality for the password reset feature.

## Development Mode

In development mode, emails are logged to the console instead of being sent. This allows you to test the functionality without setting up email credentials.

## Production Setup

To enable actual email sending in production, you need to configure the following environment variables in your `.env` file:

### Gmail Configuration (Recommended)

```env
NODE_ENV=production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com
CLIENT_URL=https://yourdomain.com
```

### Gmail App Password Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings > Security > App passwords
3. Generate a new app password for "Mail"
4. Use this app password (not your regular Gmail password) in `EMAIL_PASS`

### Other Email Providers

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-username
EMAIL_PASS=your-mailgun-smtp-password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

## Testing Email Functionality

1. Start the backend server: `npm run dev`
2. Go to the frontend and click "Forgot password?"
3. Enter a valid email address
4. Check the console logs for the email content (in development)
5. In production, check the actual email inbox

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive information
- Consider using a dedicated email service for production
- The reset token expires in 10 minutes for security
- Reset tokens are hashed before storing in the database

## Troubleshooting

### Email Not Sending
- Check your email provider's SMTP settings
- Verify your credentials are correct
- Check if your email provider requires app-specific passwords
- Ensure your server can make outbound SMTP connections

### Gmail Issues
- Make sure 2FA is enabled
- Use app password, not regular password
- Check if "Less secure app access" is enabled (if not using app passwords)

### Development Testing
- Emails are logged to console in development mode
- Check the server console for email content
- The reset URL is also logged for easy testing
