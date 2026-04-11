// render-certificate-pdf/index.ts
// Supabase Edge Function (Deno runtime)
//
// PURPOSE: Generate a binary PDF from certificate data using a remote headless Chrome.
//
// SETUP — you must configure the following Supabase secrets:
//   BROWSER_WS_ENDPOINT  — WebSocket URL of a remote headless Chrome instance, e.g.:
//       wss://chrome.browserless.io?token=YOUR_TOKEN   (Browserless.io managed service)
//       ws://your-vps-ip:9222                          (self-hosted: chromium --headless=new --remote-debugging-port=9222)
//       wss://your-railway-app.up.railway.app           (Railway/Render Docker deploy of browserless/chrome)
//   INTERNAL_SECRET      — Random string shared with generate-certificate to prevent public access.
//
//   Deploy command:
//     supabase secrets set BROWSER_WS_ENDPOINT=wss://... INTERNAL_SECRET=<random_secret>
//     supabase functions deploy render-certificate-pdf --no-verify-jwt

import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-internal-secret",
};

// Shape of the POST body this function expects
interface CertificateData {
  recipientName: string;
  courseName: string;
  completionDate: string; // Human-readable, e.g. "April 2, 2026"
  uniqueCode: string;
  instructorName?: string; // Defaults to "HAMA Academy Management"
}

/**
 * Builds a fully self-contained HTML string for the certificate.
 * All CSS is inlined; no external font/image URLs are loaded so
 * the headless browser can render it without network dependencies.
 * This is the SINGLE SOURCE OF TRUTH for what the certificate looks like.
 */
function buildCertificateHtml(data: CertificateData): string {
  const {
    recipientName,
    courseName,
    completionDate,
    uniqueCode,
    instructorName = "HAMA Academy Management",
  } = data;

  // We embed the Google Fonts CSS snippet as a data URI to avoid external
  // requests inside the headless browser. Using system-safe serif/sans fallbacks.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Certificate of Completion</title>
  <style>
    /* System font stack — no external font requests needed */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    html, body {
      width: 1056px;
      height: 816px;
      overflow: hidden;
      background: #1A1A1A;
      font-family: 'Georgia', 'Times New Roman', Times, serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      position: relative;
      width: 1056px;
      height: 816px;
      background: #1A1A1A;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Double gold border */
    .border-outer {
      position: absolute;
      inset: 18px;
      border: 4px solid #D4AF37;
      border-radius: 10px;
    }
    .border-inner {
      position: absolute;
      inset: 30px;
      border: 1px solid rgba(212, 175, 55, 0.5);
      border-radius: 6px;
    }

    /* Watermark note symbol */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 260px;
      color: #D4AF37;
      opacity: 0.04;
      pointer-events: none;
      user-select: none;
      line-height: 1;
    }

    /* Corner decoration squares */
    .corner {
      position: absolute;
      width: 22px;
      height: 22px;
      border: 2px solid #D4AF37;
    }
    .corner-tl { top: 42px; left: 42px; border-right: none; border-bottom: none; }
    .corner-tr { top: 42px; right: 42px; border-left: none; border-bottom: none; }
    .corner-bl { bottom: 42px; left: 42px; border-right: none; border-top: none; }
    .corner-br { bottom: 42px; right: 42px; border-left: none; border-top: none; }

    /* Content */
    .content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 80px;
      width: 100%;
      height: 100%;
    }

    .logo {
      font-size: 52px;
      line-height: 1;
      margin-bottom: 12px;
    }

    .brand-name {
      font-size: 32px;
      color: #D4AF37;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 4px;
    }

    .brand-sub {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 11px;
      color: #888;
      letter-spacing: 5px;
      text-transform: uppercase;
      margin-bottom: 28px;
    }

    .divider {
      width: 240px;
      height: 1px;
      background: linear-gradient(to right, transparent, #D4AF37, transparent);
      margin: 0 auto 24px;
    }

    .cert-title {
      font-size: 26px;
      color: #F5F5DC;
      font-weight: 400;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .label {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 13px;
      color: #888;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }

    .recipient-name {
      font-size: 42px;
      color: #F5F5DC;
      font-weight: 400;
      margin-bottom: 20px;
      letter-spacing: 1px;
    }

    .course-name {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 20px;
      color: #D4AF37;
      font-weight: 700;
      margin-bottom: 28px;
      max-width: 700px;
      line-height: 1.4;
    }

    .divider-sm {
      width: 120px;
      height: 1px;
      background: linear-gradient(to right, transparent, #555, transparent);
      margin: 0 auto 24px;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      max-width: 680px;
      margin-top: 8px;
    }

    .footer-col {
      text-align: center;
    }

    .footer-label {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 10px;
      color: #777;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .footer-value {
      font-family: 'Arial', 'Helvetica Neue', sans-serif;
      font-size: 14px;
      color: #F5F5DC;
    }

    .footer-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      color: #D4AF37;
      letter-spacing: 1px;
    }

    .footer-sig {
      font-size: 20px;
      color: #D4AF37;
    }

    .border-line {
      width: 160px;
      height: 1px;
      background: #333;
      margin: 0 auto 8px;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Decorative borders -->
    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <!-- Corner accents -->
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <!-- Watermark -->
    <div class="watermark">♫</div>

    <!-- Main content -->
    <div class="content">
      <div class="logo">🎵</div>
      <div class="brand-name">HAMA LMS</div>
      <div class="brand-sub">Learning Management System</div>

      <div class="divider"></div>

      <div class="cert-title">Certificate of Completion</div>

      <div class="label">This is to certify that</div>
      <div class="recipient-name">${escapeHtml(recipientName)}</div>

      <div class="label">has successfully completed the course</div>
      <div class="course-name">${escapeHtml(courseName)}</div>

      <div class="divider-sm"></div>

      <div class="footer">
        <div class="footer-col">
          <div class="footer-label">Date Issued</div>
          <div class="footer-value">${escapeHtml(completionDate)}</div>
        </div>
        <div class="footer-col">
          <div class="border-line"></div>
          <div class="footer-label">Authorized Signature</div>
          <div class="footer-sig">${escapeHtml(instructorName)}</div>
        </div>
        <div class="footer-col">
          <div class="footer-label">Certificate ID</div>
          <div class="footer-code">${escapeHtml(uniqueCode)}</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/** Simple HTML entity escaping to prevent XSS in the template */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- Security: validate internal secret ---
  // This function is NOT meant to be publicly callable.
  // generate-certificate passes INTERNAL_SECRET as X-Internal-Secret.
  const internalSecret = Deno.env.get("INTERNAL_SECRET");
  if (!internalSecret) {
    // Secret not configured — refuse all requests to avoid unprotected access
    console.error("INTERNAL_SECRET env var is not set");
    return new Response(
      JSON.stringify({ error: "Service not configured (missing INTERNAL_SECRET)" }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const providedSecret = req.headers.get("X-Internal-Secret");
  if (providedSecret !== internalSecret) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // --- Parse and validate request body ---
  let body: CertificateData;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { recipientName, courseName, completionDate, uniqueCode } = body;
  if (!recipientName || !courseName || !completionDate || !uniqueCode) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: recipientName, courseName, completionDate, uniqueCode" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // --- Check browser endpoint is configured ---
  const browserWsEndpoint = Deno.env.get("BROWSER_WS_ENDPOINT");
  if (!browserWsEndpoint) {
    console.error("BROWSER_WS_ENDPOINT is not set. Cannot generate PDF.");
    return new Response(
      JSON.stringify({
        error:
          "PDF generation service not configured. Set the BROWSER_WS_ENDPOINT secret " +
          "(e.g., wss://chrome.browserless.io?token=YOUR_TOKEN) in Supabase project secrets.",
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // --- Generate PDF with Puppeteer using a remote browser ---
  let browser: Awaited<ReturnType<typeof puppeteer.connect>> | null = null;
  try {
    // Connect to the remote headless Chrome instance via WebSocket.
    // This avoids launching a local Chrome process, which is not possible in Deno edge functions.
    browser = await puppeteer.connect({
      browserWSEndpoint: browserWsEndpoint,
    });

    const page = await browser.newPage();

    // Letter landscape: 11in × 8.5in at 96dpi = 1056 × 816 px
    await page.setViewport({ width: 1056, height: 816, deviceScaleFactor: 2 });

    const html = buildCertificateHtml(body);

    // Set page content and wait for DOM to be ready
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    // Generate PDF: landscape letter size, no margins (template handles its own padding)
    const pdfBytes = await page.pdf({
      width: "11in",
      height: "8.5in",
      printBackground: true, // Required for dark backgrounds and gradients
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await page.close();

    // Return the raw PDF binary
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        // Signal to callers that this is a PDF byte stream, not JSON
        "X-Content-Kind": "certificate-pdf",
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new Response(
      JSON.stringify({
        error: "PDF generation failed",
        detail: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } finally {
    // Always disconnect from the remote browser to free up sessions
    if (browser) {
      try {
        await browser.disconnect();
      } catch (_) {
        // Ignore disconnect errors
      }
    }
  }
});
