import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { Resend } from "resend";
import crypto from "crypto";

// --- Admin auth helpers (HMAC signed, time-limited token; no raw secret on client) ---
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function signAdminToken(secret: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined, secret: string): boolean {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  // Constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

// Simple in-memory login rate limiter (per IP)
const loginAttempts = new Map<string, { count: number; first: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min lockout window

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMin?: number } {
  const now = Date.now();
  const rec = loginAttempts.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    loginAttempts.set(ip, { count: 0, first: now });
    return { allowed: true };
  }
  if (rec.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMin: Math.ceil((WINDOW_MS - (now - rec.first)) / 60000) };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const rec = loginAttempts.get(ip);
  if (rec) rec.count += 1;
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

function getClientIp(req: express.Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
}

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
          trip_type TEXT DEFAULT 'one-way',
          return_date TEXT,
          return_time TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      // Migration: add return-trip columns to existing tables
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS trip_type TEXT DEFAULT 'one-way'`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_date TEXT`;
      await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS return_time TEXT`;

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
      reference,
      tripType,
      returnDate,
      returnTime
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
            service_type, driver_preference, special_instructions,
            trip_type, return_date, return_time
          ) VALUES (
            ${reference}, ${fullName}, ${email}, ${phone},
            ${fromLocation}, ${toLocation}, ${pickupDate}, ${pickupTime},
            ${service}, ${driverOption}, ${message || null},
            ${tripType || 'one-way'}, ${returnDate || null}, ${returnTime || null}
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

        const driverLabel = (driverOption || 'with-driver').replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        const serviceLabel = isBooking ? service.replace('-', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '';
        const year = new Date().getFullYear();

        const tripRows = isBooking ? `
          <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;width:42%;">Service</td><td style="padding:10px 0;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${serviceLabel}</td></tr>
          <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Date &amp; Time</td><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${pickupDate} at ${pickupTime}</td></tr>
          <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Pickup</td><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${fromLocation}</td></tr>
          <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Drop-off</td><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${toLocation}</td></tr>
          <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Driver Option</td><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${driverLabel}</td></tr>
        ` : '';

        // 1. Acknowledgement email to the user (this is a QUOTE request, not a confirmed booking)
        const userMailOptions = {
          from: `Commuter Transit <${fromEmail}>`,
          to: email,
          subject: isBooking ? `Quote Request Received — ${reference}` : `Enquiry Received — ${reference}`,
          html: `
            <div style="background-color:#f4f5f7;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 30px rgba(2,40,94,0.08);">
                <div style="background-color:#02285E;padding:36px 40px;">
                  <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Commuter Transit</h1>
                  <p style="color:#FD9E58;margin:6px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Specialist Transport &amp; Mobility</p>
                </div>
                <div style="padding:40px;">
                  <div style="display:inline-block;background-color:#FFF4EC;color:#FC6C03;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:6px 14px;border-radius:999px;margin-bottom:20px;">${isBooking ? 'Quote Request Received' : 'Enquiry Received'}</div>
                  <h2 style="color:#02285E;margin:0 0 16px;font-size:22px;font-weight:700;">Thanks, ${fullName.split(' ')[0]}.</h2>
                  <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 28px;">We've received your ${isBooking ? 'quote request' : 'enquiry'}. This is <strong>not a confirmed booking yet</strong> — our team will review the details and contact you shortly with availability and pricing.</p>

                  <div style="background-color:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:24px;margin-bottom:28px;">
                    <p style="color:#94a3b8;margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Your Reference</p>
                    <p style="color:#02285E;margin:0 0 18px;font-size:20px;font-weight:700;letter-spacing:1px;">${reference}</p>
                    ${isBooking ? `<table style="width:100%;border-collapse:collapse;border-top:1px solid #eef2f7;padding-top:8px;">${tripRows}</table>` : ''}
                  </div>

                  <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
                    <tr>
                      <td style="padding:0;">
                        <a href="tel:0411099994" style="display:inline-block;background-color:#FC6C03;color:#ffffff;padding:13px 26px;text-decoration:none;border-radius:999px;font-weight:600;font-size:13px;">Call us: 0411 099 994</a>
                      </td>
                    </tr>
                  </table>

                  <p style="color:#475569;font-size:15px;line-height:1.7;margin:28px 0 0;">Warm regards,<br><strong style="color:#02285E;">The Commuter Transit Team</strong></p>
                </div>
                <div style="background-color:#f8fafc;padding:24px 40px;border-top:1px solid #eef2f7;">
                  <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">© ${year} Commuter Transit · Melbourne, VIC<br>Automated message — please do not reply directly.</p>
                </div>
              </div>
            </div>
          `,
        };

        // 2. Notification email to the admin
        const adminMailOptions = {
          from: `Commuter Transit <${fromEmail}>`,
          to: adminEmail || email,
          subject: `${isBooking ? '🚐 New Quote Request' : '✉️ New Enquiry'} — ${reference}`,
          html: `
            <div style="background-color:#f4f5f7;padding:32px 16px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <div style="max-width:560px;margin:0 auto;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 30px rgba(2,40,94,0.08);">
                <div style="background-color:#FC6C03;padding:32px 40px;">
                  <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${isBooking ? 'New Quote Request' : 'New Enquiry'}</h1>
                  <p style="color:#ffffff;opacity:0.9;margin:6px 0 0;font-size:13px;font-weight:500;">Reference: ${reference}</p>
                </div>
                <div style="padding:40px;">
                  <p style="color:#94a3b8;margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Customer</p>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
                    <tr><td style="padding:10px 0;color:#94a3b8;font-size:13px;width:42%;">Name</td><td style="padding:10px 0;color:#02285E;font-size:14px;font-weight:600;text-align:right;">${fullName}</td></tr>
                    <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Email</td><td style="padding:10px 0;border-top:1px solid #eef2f7;text-align:right;"><a href="mailto:${email}" style="color:#FC6C03;font-size:14px;font-weight:600;text-decoration:none;">${email}</a></td></tr>
                    <tr><td style="padding:10px 0;border-top:1px solid #eef2f7;color:#94a3b8;font-size:13px;">Phone</td><td style="padding:10px 0;border-top:1px solid #eef2f7;text-align:right;"><a href="tel:${phone}" style="color:#02285E;font-size:14px;font-weight:600;text-decoration:none;">${phone || 'N/A'}</a></td></tr>
                  </table>

                  ${isBooking ? `
                  <p style="color:#94a3b8;margin:0 0 14px;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Trip Details</p>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">${tripRows}</table>
                  ` : ''}

                  <p style="color:#94a3b8;margin:0 0 12px;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Message / Instructions</p>
                  <div style="background-color:#f8fafc;border:1px solid #eef2f7;border-radius:12px;padding:18px;color:#475569;font-size:14px;line-height:1.6;margin-bottom:28px;">
                    ${message || '<em style="color:#94a3b8;">No additional message provided.</em>'}
                  </div>

                  <a href="mailto:${email}" style="display:inline-block;background-color:#FC6C03;color:#ffffff;padding:13px 28px;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px;">Reply to Customer</a>
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
  // Hardening headers for all admin endpoints
  const adminHeaders = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
    next();
  };
  app.use("/api/admin", adminHeaders);

  const isAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res.status(500).json({ error: "ADMIN_SECRET not configured on server." });
    }
    const token = req.headers["x-admin-token"] as string | undefined;
    if (verifyAdminToken(token, adminSecret)) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized or expired session." });
    }
  };

  app.post("/api/admin/login", (req, res) => {
    const ip = getClientIp(req);
    const { password } = req.body;
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res.status(500).json({ error: "ADMIN_SECRET not configured on server." });
    }

    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return res.status(429).json({ success: false, message: `Too many attempts. Try again in ${rate.retryAfterMin} minute(s).` });
    }

    // Constant-time password comparison
    const a = Buffer.from(String(password || ""));
    const b = Buffer.from(adminSecret);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);

    if (match) {
      clearAttempts(ip);
      res.json({ success: true, token: signAdminToken(adminSecret) });
    } else {
      recordFailedAttempt(ip);
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
