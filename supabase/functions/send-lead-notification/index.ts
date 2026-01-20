// supabase/functions/send-lead-notification/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  to: string;
  serviceProviderName: string;
  jobTitle: string;
  jobCategory: string;
  location: string;
  zipcode: string;
  budget: number;
  description: string;
  jobId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json();
    
    // Get Gmail credentials from environment variables
    const GMAIL_USER = Deno.env.get('GMAIL_USER');
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD');

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      throw new Error('Gmail credentials not configured');
    }

    // Initialize SMTP client
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: GMAIL_USER,
      password: GMAIL_APP_PASSWORD,
    });

    // Compose email
    const subject = `🔔 New Job Posted in Your Area: ${payload.jobTitle}`;
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .job-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .job-title { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
    .job-detail { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
    .job-detail:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #666; display: inline-block; width: 120px; }
    .value { color: #333; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
    .cta-button:hover { background: #5568d3; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 New Lead Alert!</h1>
      <p>A new job has been posted in your service area</p>
    </div>
    
    <div class="content">
      <p>Hi ${payload.serviceProviderName},</p>
      
      <p>Great news! A new job matching your service type has been posted in your area. This could be a perfect opportunity for you!</p>
      
      <div class="job-card">
        <div class="job-title">${payload.jobTitle}</div>
        
        <div class="job-detail">
          <span class="label">📍 Location:</span>
          <span class="value">${payload.location}, ${payload.zipcode}</span>
        </div>
        
        <div class="job-detail">
          <span class="label">🔧 Category:</span>
          <span class="value">${payload.jobCategory}</span>
        </div>
        
        <div class="job-detail">
          <span class="label">💰 Budget:</span>
          <span class="value">£${payload.budget}</span>
        </div>
        
        <div class="job-detail">
          <span class="label">📝 Description:</span>
          <span class="value">${payload.description}</span>
        </div>
      </div>
      
      <center>
        <a href="https://yourdomain.com/marketplace/${payload.jobId}" class="cta-button">
          View Full Details & Purchase Lead
        </a>
      </center>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        ⚡ <strong>Quick Tip:</strong> Leads are available on a first-come, first-served basis. 
        Act fast to secure this opportunity!
      </p>
    </div>
    
    <div class="footer">
      <p>You're receiving this because you signed up for lead notifications in this area.</p>
      <p>© 2026 EliteConnector. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        <a href="https://yourdomain.com/unsubscribe" style="color: #667eea;">Unsubscribe</a> | 
        <a href="https://yourdomain.com/settings" style="color: #667eea;">Manage Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await client.send({
      from: GMAIL_USER,
      to: payload.to,
      subject: subject,
      content: htmlBody,
      html: htmlBody,
    });

    await client.close();

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        recipient: payload.to 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
})