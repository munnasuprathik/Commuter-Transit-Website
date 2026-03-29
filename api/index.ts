import express from "express";
import { neon } from "@neondatabase/serverless";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Lazy NeonDB Connection
let sqlClient: any = null;
const getSql = () => {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for database operations.");
    }
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
};

// Lazy Resend Client
let resendClient: Resend | null = null;
const getResend = () => {
  if (!resendClient) {
    const { RESEND_API_KEY } = process.env;
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required for email operations.");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
};

// API Routes
app.get("/api/health", async (req, res) => {
  try {
    const sql = getSql();
    await sql`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected", message: error instanceof Error ? error.message : String(error) });
  }
});

app.post("/api/bookings", async (req, res) => {
  const { 
    fullName, email, phone, fromLocation, toLocation, 
    pickupDate, pickupTime, driverOption, service, message, reference 
  } = req.body;

  const isBooking = !!service;

  try {
    const sql = getSql();
    let savedData;

    if (isBooking) {
      const result = await sql`
        INSERT INTO bookings (
          booking_reference, customer_name, customer_email, customer_phone, 
          pickup_location, destination_location, pickup_date, pickup_time, 
          service_type, driver_preference, special_instructions
        ) VALUES (
          ${reference}, ${fullName}, ${email}, ${phone}, 
          ${fromLocation}, ${toLocation}, ${pickupDate}, ${pickupTime}, 
          ${service}, ${driverOption}, ${message || null}
        ) RETURNING *
      `;
      savedData = result[0];
    } else {
      const result = await sql`
        INSERT INTO contacts (
          contact_reference, sender_name, sender_email, message_content
        ) VALUES (
          ${reference}, ${fullName}, ${email}, ${message}
        ) RETURNING *
      `;
      savedData = result[0];
    }

    // Send Emails
    try {
      const resend = getResend();
      const adminEmail = process.env.ADMIN_EMAIL;
      const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

      // 1. Confirmation email to the user
      const userMailOptions = {
        from: `Commuter <${fromEmail}>`,
        to: email,
        subject: isBooking ? `Booking Confirmation - ${reference}` : `Contact Request Received - ${reference}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
            <div style="background-color: #02285E; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">Commuter.</h1>
              <p style="color: #FD9E58; margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Mobility Solutions</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #02285E; margin: 0 0 20px 0; font-size: 20px;">${isBooking ? 'Your Booking is Confirmed' : 'We Received Your Request'}</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">Hi ${fullName},</p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">Thank you for reaching out to Commuter. We have successfully received your ${isBooking ? 'booking details' : 'message'}. One of our team members will review it and contact you shortly.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #02285E; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Request Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 40%;">Reference ID</td>
                    <td style="padding: 8px 0; color: #02285E; font-size: 14px; font-weight: 600; text-align: right;">${reference}</td>
                  </tr>
                  ${isBooking ? `
                  <tr>
                    <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">Service</td>
                    <td style="padding: 8px 0; border-top: 1px solid #e2e8f0; color: #02285E; font-size: 14px; font-weight: 600; text-align: right;">${service.replace('-', ' ').toUpperCase()}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0;">Best regards,<br><strong style="color: #02285E;">The Commuter Team</strong></p>
            </div>
          </div>
        `,
      };

      // 2. Notification email to the admin
      const adminMailOptions = {
        from: `Commuter System <${fromEmail}>`,
        to: adminEmail || email,
        subject: `New ${isBooking ? 'Booking' : 'Contact Request'} - ${reference}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
            <div style="background-color: #FC6C03; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600;">New ${isBooking ? 'Booking' : 'Contact'} Request</h1>
              <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0 0; font-size: 15px;">Ref: ${reference}</p>
            </div>
            <div style="padding: 40px;">
              <h2 style="color: #02285E; margin: 0 0 20px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Customer Information</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                <tr>
                  <td style="padding: 12px 0; color: #64748b; font-size: 15px; width: 35%;">Name</td>
                  <td style="padding: 12px 0; color: #02285E; font-size: 15px; font-weight: 500;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Email</td>
                  <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #FC6C03; font-size: 15px; font-weight: 500;">${email}</td>
                </tr>
              </table>

              <h2 style="color: #02285E; margin: 0 0 16px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Message / Instructions</h2>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; color: #475569; font-size: 15px; line-height: 1.6;">
                ${message || '<em>No additional message provided.</em>'}
              </div>
            </div>
          </div>
        `,
      };

      await Promise.all([
        resend.emails.send(userMailOptions),
        adminEmail ? resend.emails.send(adminMailOptions) : Promise.resolve()
      ]);
    } catch (emailError) {
      console.error("Failed to send emails:", emailError);
    }

    res.status(201).json({ success: true, message: "Submission saved and notifications sent.", data: savedData });
  } catch (error) {
    console.error("Error processing submission:", error);
    res.status(500).json({ success: false, message: "Failed to process submission." });
  }
});

// Admin Routes
const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return res.status(500).json({ error: "ADMIN_SECRET not configured." });
  if (req.headers["x-admin-token"] === adminSecret) next();
  else res.status(401).json({ error: "Unauthorized access." });
};

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const adminSecret = process.env.ADMIN_SECRET;
  if (password === adminSecret) res.json({ success: true, token: adminSecret });
  else res.status(401).json({ success: false, message: "Invalid password." });
});

app.get("/api/admin/bookings", isAdmin, async (req, res) => {
  try {
    const sql = getSql();
    const result = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    res.json(result);
  } catch (error) { res.status(500).json({ error: "Failed to fetch bookings." }); }
});

app.get("/api/admin/contacts", isAdmin, async (req, res) => {
  try {
    const sql = getSql();
    const result = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
    res.json(result);
  } catch (error) { res.status(500).json({ error: "Failed to fetch contacts." }); }
});

app.delete("/api/admin/bookings/:id", isAdmin, async (req, res) => {
  try {
    const sql = getSql();
    await sql`DELETE FROM bookings WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to delete booking." }); }
});

app.delete("/api/admin/contacts/:id", isAdmin, async (req, res) => {
  try {
    const sql = getSql();
    await sql`DELETE FROM contacts WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: "Failed to delete contact." }); }
});

export default app;
