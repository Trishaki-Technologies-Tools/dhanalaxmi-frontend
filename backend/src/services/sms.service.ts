import https from "https";
import { validateIndianMobileNumber } from "../utils/phone-validator.js";

/**
 * Dispatches an SMS OTP via MSG91 Flow API.
 * Validates the mobile number format before sending; if invalid, does not call MSG91.
 */
export async function sendMsg91Otp(
  phone: string,
  otp: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Strict format validation: must be 10 digits and start with 6, 7, 8, or 9
  const validation = validateIndianMobileNumber(phone);
  if (!validation.valid) {
    console.warn("[MSG91 Aborted] Invalid mobile number format:", phone, validation.error);
    return {
      success: false,
      error: validation.error || "Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.",
    };
  }

  const authkey = process.env.MSG91_AUTH_KEY || "505779Adxsd9jGlEjy6aa25b64P1";
  const templateId = process.env.MSG91_TEMPLATE_ID || "6aa2519133e81598ed072984";

  if (!authkey || !templateId) {
    console.warn(
      "[MSG91] MSG91_AUTH_KEY or MSG91_TEMPLATE_ID is missing in environment variables."
    );
    return { success: false, error: "SMS service credentials not configured." };
  }

  const mobileWithCode = "91" + validation.cleanPhone;

  const payload = JSON.stringify({
    template_id: templateId.trim(),
    short_url: "0",
    recipients: [
      {
        mobiles: mobileWithCode,
        number: otp, // Matches ##number## in MSG91 SMS template
      },
    ],
  });

  return new Promise((resolve) => {
    const req = https.request(
      {
        method: "POST",
        hostname: "control.msg91.com",
        path: "/api/v5/flow",
        headers: {
          accept: "application/json",
          authkey: authkey.trim(),
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString();
            const json = JSON.parse(body);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              console.log("[MSG91] SMS sent successfully to:", mobileWithCode, json);
              resolve({ success: true, data: json });
            } else {
              console.error("[MSG91] Send failed:", res.statusCode, json);
              resolve({ success: false, error: json.message || "Failed to send SMS" });
            }
          } catch (e: any) {
            console.error("[MSG91] Response parse error:", e);
            resolve({ success: false, error: e.message });
          }
        });
      }
    );

    req.on("error", (err) => {
      console.error("[MSG91] Request error:", err);
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}
