# Email Setup Guide

This guide will help you set up email functionality for the Attendance Management System.

## Gmail Setup

1. **Enable 2-Factor Authentication**
   - Go to your Google Account settings
   - Navigate to Security
   - Enable 2-Step Verification if not already enabled

2. **Generate an App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" as the app and "Other" as the device
   - Enter a name for the app (e.g., "Attendance Management System")
   - Click "Generate"
   - Google will generate a 16-character password

3. **Update .env File**
   - Open the `.env` file in the root directory
   - Update the following values:
     ```
     EMAIL_USER=your-gmail-address@gmail.com
     EMAIL_PASS=your-16-character-app-password
     ```

## Testing Email Setup

1. Start the application with `npm run dev:full`
2. Go to the login page and click "Forgot Password"
3. Enter your email address
4. Check your email for the reset link
5. If you don't receive the email, check the console logs for the reset link

## Troubleshooting

- **"Username and Password not accepted" error**: Make sure you're using an App Password, not your regular Gmail password
- **Email not sending**: Check your internet connection and make sure the email credentials are correct
- **Reset link not working**: Make sure the application is running and the token hasn't expired

## Development Mode

In development mode, even if email sending fails, the application will still:
1. Generate a reset token
2. Save it to the database
3. Log the reset link to the console
4. Return a success message to the user

This allows you to test the password reset functionality without setting up email. 