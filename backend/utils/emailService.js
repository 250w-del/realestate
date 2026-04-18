const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    this.fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  }

  // Verify transporter connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server connection verified');
      return true;
    } catch (error) {
      console.error('Email server connection failed:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail, userName) {
    const mailOptions = {
      from: this.fromEmail,
      to: userEmail,
      subject: 'Welcome to RealEstate Platform',
      html: this.getWelcomeEmailTemplate(userName)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', userEmail);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }

  // Send property inquiry notification to agent
  async sendPropertyInquiry(agentEmail, agentName, clientName, propertyTitle, message) {
    const mailOptions = {
      from: this.fromEmail,
      to: agentEmail,
      subject: `New Property Inquiry: ${propertyTitle}`,
      html: this.getPropertyInquiryTemplate(agentName, clientName, propertyTitle, message)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Property inquiry email sent to:', agentEmail);
      return true;
    } catch (error) {
      console.error('Error sending property inquiry email:', error);
      throw error;
    }
  }

  // Send viewing confirmation
  async sendViewingConfirmation(userEmail, userName, agentName, propertyTitle, viewingDate) {
    const mailOptions = {
      from: this.fromEmail,
      to: userEmail,
      subject: `Viewing Confirmed: ${propertyTitle}`,
      html: this.getViewingConfirmationTemplate(userName, agentName, propertyTitle, viewingDate)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Viewing confirmation email sent to:', userEmail);
      return true;
    } catch (error) {
      console.error('Error sending viewing confirmation email:', error);
      throw error;
    }
  }

  // Send agent approval notification
  async sendAgentApprovalNotification(agentEmail, agentName) {
    const mailOptions = {
      from: this.fromEmail,
      to: agentEmail,
      subject: 'Agent Account Approved',
      html: this.getAgentApprovalTemplate(agentName)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Agent approval email sent to:', agentEmail);
      return true;
    } catch (error) {
      console.error('Error sending agent approval email:', error);
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: this.fromEmail,
      to: userEmail,
      subject: 'Password Reset Request',
      html: this.getPasswordResetTemplate(resetUrl)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent to:', userEmail);
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }

  // Send new property notification to subscribers
  async sendNewPropertyNotification(subscribers, property) {
    const propertyUrl = `${process.env.FRONTEND_URL}/properties/${property.id}`;
    
    const mailOptions = {
      from: this.fromEmail,
      subject: `New Property Listed: ${property.title}`,
      html: this.getNewPropertyTemplate(property, propertyUrl)
    };

    try {
      // Send to all subscribers (in batches to avoid rate limiting)
      const batchSize = 50;
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        const promises = batch.map(subscriber => {
          return this.transporter.sendMail({
            ...mailOptions,
            to: subscriber.email
          });
        });
        
        await Promise.all(promises);
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`New property notification sent to ${subscribers.length} subscribers`);
      return true;
    } catch (error) {
      console.error('Error sending new property notification:', error);
      throw error;
    }
  }

  // Email templates
  getWelcomeEmailTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to RealEstate Platform</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to RealEstate Platform!</h1>
            <p>Your journey to finding the perfect property starts here</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for joining RealEstate Platform! We're excited to help you find your dream property.</p>
            
            <h3>What you can do now:</h3>
            <ul>
              <li>Browse thousands of properties</li>
              <li>Save your favorite listings</li>
              <li>Connect with verified agents</li>
              <li>Get personalized recommendations</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Get Started</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 RealEstate Platform. All rights reserved.</p>
            <p>You received this email because you signed up for an account on our platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPropertyInquiryTemplate(agentName, clientName, propertyTitle, message) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Property Inquiry</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Property Inquiry!</h1>
            <p>You have a new inquiry about your property</p>
          </div>
          <div class="content">
            <p>Hi ${agentName},</p>
            <p><strong>${clientName}</strong> is interested in your property: <strong>${propertyTitle}</strong></p>
            
            <div class="message-box">
              <h3>Message from client:</h3>
              <p>${message}</p>
            </div>
            
            <p>Please respond to this inquiry as soon as possible to provide excellent customer service.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard/messages" class="btn">View Messages</a>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getViewingConfirmationTemplate(userName, agentName, propertyTitle, viewingDate) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Viewing Confirmed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .btn { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Viewing Confirmed!</h1>
            <p>Your property viewing has been scheduled</p>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Your viewing for <strong>${propertyTitle}</strong> has been confirmed with <strong>${agentName}</strong>.</p>
            
            <div class="details">
              <h3>Viewing Details:</h3>
              <p><strong>Date & Time:</strong> ${viewingDate}</p>
              <p><strong>Agent:</strong> ${agentName}</p>
              <p><strong>Property:</strong> ${propertyTitle}</p>
            </div>
            
            <p>Please make sure to arrive on time for your viewing. If you need to reschedule, please contact the agent as soon as possible.</p>
            
            <a href="${process.env.FRONTEND_URL}/dashboard/viewings" class="btn">View My Viewings</a>
            
            <p>We hope you find your dream property!</p>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAgentApprovalTemplate(agentName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Agent Account Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Congratulations! 🎉</h1>
            <p>Your agent account has been approved</p>
          </div>
          <div class="content">
            <p>Hi ${agentName},</p>
            <p>We're pleased to inform you that your agent account has been approved and is now active on RealEstate Platform.</p>
            
            <h3>What you can do now:</h3>
            <ul>
              <li>List your properties for sale or rent</li>
              <li>Connect with potential buyers and renters</li>
              <li>Manage your property listings</li>
              <li>Track your performance and analytics</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
            
            <p>Welcome to our community of professional real estate agents!</p>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTemplate(resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .btn { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
          .warning { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
            <p>Reset your account password</p>
          </div>
          <div class="content">
            <p>You requested to reset your password. Click the button below to set a new password.</p>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <a href="${resetUrl}" class="btn">Reset Password</a>
            
            <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getNewPropertyTemplate(property, propertyUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Property Listed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0ea5e9; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .property-card { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .property-image { width: 100%; height: 200px; background: #e5e7eb; }
          .property-details { padding: 20px; }
          .price { color: #0ea5e9; font-size: 24px; font-weight: bold; }
          .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Property Listed!</h1>
            <p>Check out this latest addition to our platform</p>
          </div>
          <div class="content">
            <div class="property-card">
              <div class="property-image"></div>
              <div class="property-details">
                <h2>${property.title}</h2>
                <p class="price">$${property.price?.toLocaleString() || '0'}</p>
                <p>${property.location || 'Location'}</p>
                <p>${property.bedrooms || 0} bed • ${property.bathrooms || 0} bath • ${property.size || 0} sqft</p>
              </div>
            </div>
            
            <p>${property.description?.substring(0, 200) || 'Description'}...</p>
            
            <a href="${propertyUrl}" class="btn">View Property Details</a>
            
            <p>Happy house hunting!</p>
            
            <p>Best regards,<br>The RealEstate Platform Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Create and export singleton instance
const emailService = new EmailService();

module.exports = emailService;
