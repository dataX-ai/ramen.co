import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { dodoWebhookKey } from "@/lib/dodoLib";
import * as brevo from '@getbrevo/brevo';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    const webhookSecret = dodoWebhookKey || "";
    const wh = new Webhook(webhookSecret);

    try {
      wh.verify(rawBody, headers);
      const body = JSON.parse(rawBody);
      const paymentData = body.data;
      console.log("paymentData", paymentData);
      const {
        payment_id,
        business_id,
        total_amount,
        customer,
        created_at,
        metadata,
        payment_method,
        payment_link,
      } = paymentData;

      if (paymentData.status === "succeeded") {
        console.log("Payment succeeded");
        console.log("paymentRecord", JSON.stringify(paymentData));
        
        // Save data to Google Sheets
        await saveToGoogleSheet({
          paymentId: payment_id,
          totalAmount: total_amount,
          customerEmail: customer.email,
          customerName: customer.name,
          createdAt: created_at,
          metadata: metadata || {},
          paymentMethod: payment_method,
        });
        
        // Send receipt email
        await sendReceiptEmail({
          customerEmail: customer.email,
          totalAmount: total_amount,
          paymentId: payment_id,
          createdAt: created_at,
          metadata: metadata || {},
        });
      }

      return NextResponse.json({ status: "ok" });
    } catch (error) {
      console.error("Webhook error:", error);
      return NextResponse.json(
        { error: "Webhook processing failed" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Google Sheets integration
async function saveToGoogleSheet({
  paymentId,
  totalAmount,
  customerEmail,
  customerName,
  createdAt,
  metadata,
  paymentMethod,
}: {
  paymentId: string;
  totalAmount: number;
  customerEmail: string;
  customerName: string;
  createdAt: string;
  metadata: any;
  paymentMethod: string;
}) {
  try {
    // Environment variables
    const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      throw new Error('Missing Google Sheets credentials');
    }

    // Initialize auth with JWT
    const serviceAccountAuth = new JWT({
      email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: GOOGLE_PRIVATE_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Get the sheet by title "Orders" instead of using the first sheet
    const sheet = doc.sheetsByTitle["Orders"];
    if (!sheet) {
      throw new Error('Sheet named "Orders" not found');
    }
    
    // Format the date
    const orderDate = new Date(createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Format amount
    const formattedAmount = (totalAmount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).replace('₹', '').trim();

    // Extract address information from metadata
    const address = metadata.address || 'N/A';
    const phone = metadata.phone || 'N/A';
    const zipcode = metadata.zipCode || 'N/A';
    const quantity = metadata.quantity || 1;
    const mapLink = metadata.map || 'N/A';
    
    // Add a new row with all the payment details
    await sheet.addRow({
      PaymentID: paymentId,
      OrderDate: orderDate,
      CustomerName: customerName,
      CustomerEmail: customerEmail,
      Phone: phone,
      Address: address,
      Zipcode: zipcode,
      Product: 'Tori Paitan Ramen | Non-Veg',
      Quantity: quantity,
      Amount: formattedAmount,
      PaymentMethod: paymentMethod,
      MapLink: mapLink
    });

    console.log('Payment data saved to Google Sheet successfully');
    return true;
  } catch (error) {
    console.error('Failed to save to Google Sheet:', error);
    return false;
  }
}

async function sendReceiptEmail({ customerEmail, totalAmount, paymentId, createdAt, metadata }: {
  customerEmail: string;
  totalAmount: number;
  paymentId: string;
  createdAt: string;
  metadata: any;
}) {
  try {
    // Initialize Brevo API
    let apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || '');
    
    // Format the date
    const orderDate = new Date(createdAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Prepare email content
    const formattedAmount = (totalAmount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    // Prepare address information
    const address = metadata.address || 'N/A';
    const phone = metadata.phone || 'N/A';
    const zipcode = metadata.zipcode || 'N/A';
    const quantity = metadata.quantity || 1;

    // Create the HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9d1c2; border-radius: 8px; background-color: #fff;">
        <div style="text-align: center; margin-bottom: 30px; background-color: #385e67; padding: 20px; border-radius: 8px; color: white;">
          <h1 style="margin-bottom: 5px;">Thank You for Your Order!</h1>
          <p style="font-size: 16px; color: #e9d1c2;">Your order will reach you within 50 minutes.</p>
        </div>
        
        <div style="margin-bottom: 30px; padding: 20px; background-color: #e9d1c2; border-radius: 8px;">
          <h2 style="color: #654117; margin-top: 0; border-bottom: 2px solid #c86d73; padding-bottom: 10px;">Order Details</h2>
          <p style="color: #385e67;"><strong style="color: #654117;">Order ID:</strong> ${paymentId}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Date:</strong> ${orderDate}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Product:</strong> Tori Paitan Ramen | Non-Veg</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Quantity:</strong> ${quantity}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Total Amount:</strong> ${formattedAmount}</p>
        </div>
        
        <div style="margin-bottom: 30px; padding: 20px; background-color: #e9d1c2; border-radius: 8px;">
          <h2 style="color: #654117; margin-top: 0; border-bottom: 2px solid #c86d73; padding-bottom: 10px;">Delivery Information</h2>
          <p style="color: #385e67;"><strong style="color: #654117;">Email:</strong> ${customerEmail}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Address:</strong> ${address}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Phone:</strong> ${phone}</p>
          <p style="color: #385e67;"><strong style="color: #654117;">Zipcode:</strong> ${zipcode}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #385e67; border-radius: 8px;">
          <p style="color: #e9d1c2; margin-bottom: 5px;">If you have any questions or concerns, please contact us at <a href="mailto:parth@ateulerlabs.com" style="color: white; text-decoration: underline;">parth@ateulerlabs.com</a>.</p>
          <p style="color: white; font-weight: bold;">Thank you for choosing Ramen Co.!</p>
          <p style="color: #e9d1c2; margin-top: 10px;">Visit us at: <a href="https://ramen.2vid.ai" style="color: white; text-decoration: underline; font-weight: bold;">ramen.2vid.ai</a></p>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9d1c2;">
            <p style="color: #e9d1c2; font-size: 12px;">© 2023 Ramen Co. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    // Prepare email data using Brevo SDK
    let sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Thank you for your Ramen Co. order!";
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { 
      name: "Kanishka | Ramen Co.", 
      email: "kanishka@ateulerlabs.com" 
    };
    sendSmtpEmail.to = [
      { 
        email: customerEmail 
      }
    ];
    sendSmtpEmail.cc = [
      { 
        email: "parth@ateulerlabs.com", 
        name: "Parth | Ramen Co."
      }
    ];
    sendSmtpEmail.replyTo = { 
      email: "kanishka@ateulerlabs.com", 
      name: "Kanishka | Ramen Co." 
    };
    
    // Send the email using Brevo SDK
    console.log("Sending receipt email to:", customerEmail);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully. Returned data:', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Failed to send receipt email:", error);
    return false;
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
