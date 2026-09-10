/**
 * Indian Mobile Number Validator & Dual-Layer Rate Limiting (Phone & IP)
 * 
 * Rules:
 * 1. Strictly validates format: Exactly 10 digits, starts with 6, 7, 8, or 9.
 * 2. Rate limits by both Phone Number and Client IP Address to stop spam & prevent unnecessary MSG91 API usage.
 * 3. Does NOT rely on MAC address (as MAC address is inaccessible/unreliable over HTTP).
 * 4. Number is considered verified ONLY after user enters the correct OTP.
 */

interface PhoneRateRecord {
  lastSent: number;
  attemptsThisHour: number;
  hourWindowStart: number;
}

interface IpRateRecord {
  lastSent: number;
  count: number;
  windowStart: number;
}

// In-memory rate-limiting maps
const phoneLimits = new Map<string, PhoneRateRecord>();
const ipLimits = new Map<string, IpRateRecord>();

// Periodic cleanup of stale rate-limit records every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, record] of phoneLimits.entries()) {
    if (now - record.lastSent > 3600000) {
      phoneLimits.delete(phone);
    }
  }
  for (const [ip, record] of ipLimits.entries()) {
    if (now - record.windowStart > 600000) {
      ipLimits.delete(ip);
    }
  }
}, 15 * 60 * 1000);

/**
 * Validates Indian mobile number format strictly before invoking MSG91.
 * Must be exactly 10 digits and start with 6, 7, 8, or 9.
 */
export function validateIndianMobileNumber(raw: string): {
  valid: boolean;
  cleanPhone: string;
  error?: string;
} {
  if (!raw || typeof raw !== "string") {
    return { valid: false, cleanPhone: "", error: "Mobile number is required." };
  }

  // Normalize: extract numeric digits and trim any country code prefixes (+91, 91, or trunk prefix 0)
  let clean = raw.replace(/\D/g, "");
  if (clean.length === 12 && clean.startsWith("91")) {
    clean = clean.slice(2);
  } else if (clean.length === 11 && clean.startsWith("0")) {
    clean = clean.slice(1);
  }

  // Rule 1: Exactly 10 digits
  if (clean.length !== 10) {
    return {
      valid: false,
      cleanPhone: clean,
      error: "Mobile number must be exactly 10 digits.",
    };
  }

  // Rule 2: Must start with 6, 7, 8, or 9 (TRAI standard for Indian mobile operators)
  if (!/^[6-9]\d{9}$/.test(clean)) {
    return {
      valid: false,
      cleanPhone: clean,
      error: "Invalid mobile number. Indian mobile numbers must start with 6, 7, 8, or 9.",
    };
  }

  return { valid: true, cleanPhone: clean };
}

/**
 * Dual-Layer OTP Rate Limiter:
 * - Phone Rate Limit:
 *     - Minimum 60-second cooldown between successive OTP requests to the same number.
 *     - Maximum 5 OTP requests per hour per number.
 * - IP Rate Limit:
 *     - Minimum 10-second burst cooldown between requests from the same IP.
 *     - Maximum 10 OTP requests per 10-minute window per IP.
 */
export function checkOtpRateLimit(
  phone: string,
  ip?: string
): { allowed: boolean; retryAfterSeconds?: number; error?: string } {
  const now = Date.now();

  // 1. IP Address Rate Limiting (prevents automated bots scraping across random phone numbers)
  if (ip && ip !== "::1" && ip !== "127.0.0.1") {
    const ipRecord = ipLimits.get(ip) || { lastSent: 0, count: 0, windowStart: now };

    // Burst protection: at least 10 seconds between requests from the same IP
    const ipElapsed = Math.floor((now - ipRecord.lastSent) / 1000);
    if (ipRecord.lastSent > 0 && ipElapsed < 10) {
      const wait = 10 - ipElapsed;
      return {
        allowed: false,
        retryAfterSeconds: wait,
        error: `Please wait ${wait} seconds before requesting another OTP from this network.`,
      };
    }

    // Reset 10-minute window
    if (now - ipRecord.windowStart > 600000) {
      ipRecord.count = 0;
      ipRecord.windowStart = now;
    }

    if (ipRecord.count >= 10) {
      return {
        allowed: false,
        error: "Too many OTP requests from your network. Please wait a few minutes before trying again.",
      };
    }

    ipRecord.count += 1;
    ipRecord.lastSent = now;
    ipLimits.set(ip, ipRecord);
  }

  // 2. Phone Number Rate Limiting (prevents spamming a specific user's phone)
  const phoneRecord = phoneLimits.get(phone);
  if (!phoneRecord) {
    phoneLimits.set(phone, {
      lastSent: now,
      attemptsThisHour: 1,
      hourWindowStart: now,
    });
    return { allowed: true };
  }

  // 60-second cooldown per phone number
  const phoneElapsed = Math.floor((now - phoneRecord.lastSent) / 1000);
  if (phoneElapsed < 60) {
    const wait = 60 - phoneElapsed;
    return {
      allowed: false,
      retryAfterSeconds: wait,
      error: `Please wait ${wait} seconds before requesting a new OTP.`,
    };
  }

  // Hourly limit: maximum 5 requests per hour per number
  if (now - phoneRecord.hourWindowStart > 3600000) {
    phoneRecord.attemptsThisHour = 0;
    phoneRecord.hourWindowStart = now;
  }

  if (phoneRecord.attemptsThisHour >= 5) {
    return {
      allowed: false,
      error: "Maximum OTP attempts reached for this mobile number. Please try again after 1 hour.",
    };
  }

  // Update record for this phone
  phoneRecord.attemptsThisHour += 1;
  phoneRecord.lastSent = now;
  phoneLimits.set(phone, phoneRecord);

  return { allowed: true };
}
