import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { Resend } from "resend";

console.log("Starting server.ts execution...");
dotenv.config();

async function startServer() {
  console.log("Starting server initialization...");
  const app = express();
  const PORT = Number(process.env.PORT) || 3050;

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

  // Initialize Database
  const initDb = async () => {
    try {
      if (!process.env.DATABASE_URL) {
        console.warn("DATABASE_URL not set. Database initialization skipped.");
        return;
      }
      const sql = getSql();
      console.log("Initializing Neon DB tables...");
      
      // Clean up old unused table if it exists
      await sql`DROP TABLE IF EXISTS submissions`;

      // Table 1: Bookings - Specifically for ride requests
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          booking_reference TEXT UNIQUE NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          pickup_location TEXT NOT NULL,
          destination_location TEXT NOT NULL,
          pickup_date TEXT NOT NULL,
          pickup_time TEXT NOT NULL,
          service_type TEXT NOT NULL,
          driver_preference TEXT NOT NULL,
          special_instructions TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Table 2: Contacts - For general inquiries
      await sql`
        CREATE TABLE IF NOT EXISTS contacts (
          id SERIAL PRIMARY KEY,
          contact_reference TEXT UNIQUE NOT NULL,
          sender_name TEXT NOT NULL,
          sender_email TEXT NOT NULL,
          message_content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      console.log("Neon DB tables (Bookings & Contacts) initialized successfully.");
    } catch (error) {
      console.error("Failed to initialize Neon DB:", error);
    }
  };

  await initDb();

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
    console.log("Received submission request:", req.body.reference);
    const { 
      fullName, 
      email, 
      phone, 
      fromLocation, 
      toLocation, 
      pickupDate, 
      pickupTime, 
      driverOption, 
      service, 
      message,
      reference 
    } = req.body;

    const isBooking = !!service;

    try {
      const sql = getSql();
      let savedData;

      if (isBooking) {
        // Save to Bookings table
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
        // Save to Contacts table
        const result = await sql`
          INSERT INTO contacts (
            contact_reference, sender_name, sender_email, message_content
          ) VALUES (
            ${reference}, ${fullName}, ${email}, ${message}
          ) RETURNING *
        `;
        savedData = result[0];
      }

      console.log(`Saved to ${isBooking ? 'Bookings' : 'Contacts'} table:`, savedData);

      // Send Emails
      try {
        const resend = getResend();
        const adminEmail = process.env.ADMIN_EMAIL;
        const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

        if (!adminEmail) {
          console.warn("ADMIN_EMAIL not set, skipping admin notification.");
        }

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
              <div style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
                  © ${new Date().getFullYear()} Commuter Mobility Solutions.<br>
                  This is an automated message, please do not reply directly to this email.
                </p>
              </div>
            </div>
          `,
        };

        // 2. Notification email to the admin
        const adminMailOptions = {
          from: `Commuter System <${fromEmail}>`,
          to: adminEmail || email, // Fallback to user email if admin email is not set
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
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #FC6C03; font-size: 15px; font-weight: 500;"><a href="mailto:${email}" style="color: #FC6C03; text-decoration: none;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Phone</td>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #02285E; font-size: 15px; font-weight: 500;">${phone || 'N/A'}</td>
                  </tr>
                </table>

                ${isBooking ? `
                <h2 style="color: #02285E; margin: 0 0 20px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Trip Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                  <tr>
                    <td style="padding: 12px 0; color: #64748b; font-size: 15px; width: 35%;">Service</td>
                    <td style="padding: 12px 0; color: #02285E; font-size: 15px; font-weight: 500;">${service.replace('-', ' ').toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Date & Time</td>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #02285E; font-size: 15px; font-weight: 500;">${pickupDate} at ${pickupTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Pickup</td>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #02285E; font-size: 15px; font-weight: 500;">${fromLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Drop-off</td>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #02285E; font-size: 15px; font-weight: 500;">${toLocation}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-size: 15px;">Driver Pref.</td>
                    <td style="padding: 12px 0; border-top: 1px solid #f1f5f9; color: #02285E; font-size: 15px; font-weight: 500;">${driverOption}</td>
                  </tr>
                </table>
                ` : ''}

                <h2 style="color: #02285E; margin: 0 0 16px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">Message / Instructions</h2>
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; color: #475569; font-size: 15px; line-height: 1.6;">
                  ${message || '<em>No additional message provided.</em>'}
                </div>
                
                <div style="margin-top: 40px; text-align: center;">
                  <a href="mailto:${email}" style="background-color: #FC6C03; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reply to Customer</a>
                </div>
              </div>
            </div>
          `,
        };

        const emailPromises = [resend.emails.send(userMailOptions)];
        if (adminEmail) {
          emailPromises.push(resend.emails.send(adminMailOptions));
        }

        const results = await Promise.all(emailPromises);
        
        // Check for Resend API errors
        results.forEach((result, index) => {
          if (result.error) {
            console.error(`Error sending email ${index + 1}:`, result.error);
          }
        });

        console.log("Emails processed successfully.");
      } catch (emailError) {
        console.error("Failed to send emails:", emailError);
      }

      res.status(201).json({ 
        success: true, 
        message: "Submission saved and notifications sent.",
        data: savedData 
      });
    } catch (error) {
      console.error("Error processing submission:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to process submission. Please try again." 
      });
    }
  });

  // Admin API Routes
  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res.status(500).json({ error: "ADMIN_SECRET not configured on server." });
    }
    const token = req.headers["x-admin-token"];
    if (token === adminSecret) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized access." });
    }
  };

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res.status(500).json({ error: "ADMIN_SECRET not configured on server." });
    }
    if (password === adminSecret) {
      res.json({ success: true, token: adminSecret });
    } else {
      res.status(401).json({ success: false, message: "Invalid password." });
    }
  });

  app.get("/api/admin/bookings", isAdmin, async (req, res) => {
    try {
      const sql = getSql();
      const bookings = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings." });
    }
  });

  app.get("/api/admin/contacts", isAdmin, async (req, res) => {
    try {
      const sql = getSql();
      const contacts = await sql`SELECT * FROM contacts ORDER BY created_at DESC`;
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contacts." });
    }
  });

  app.delete("/api/admin/bookings/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const sql = getSql();
      await sql`DELETE FROM bookings WHERE id = ${id}`;
      res.json({ success: true, message: "Booking deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete booking." });
    }
  });

  app.delete("/api/admin/contacts/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const sql = getSql();
      await sql`DELETE FROM contacts WHERE id = ${id}`;
      res.json({ success: true, message: "Contact request deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact request." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring Vite middleware in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware configured.");
  } else {
    console.log("Serving static files in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
