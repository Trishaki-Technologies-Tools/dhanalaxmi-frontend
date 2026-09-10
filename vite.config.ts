import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";

const devPhoneLimits = new Map<string, { lastSent: number; count: number; hourStart: number }>();
const devIpLimits = new Map<string, { lastSent: number; count: number; windowStart: number }>();

function msg91Plugin(): Plugin {
  return {
    name: "msg91-dev-sms",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/api/send-live-sms" && req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", () => {
            try {
              const { phone, otp } = JSON.parse(body);
              const rawPhone = String(phone || "");
              let cleanPhone = rawPhone.replace(/\D/g, "");
              if (cleanPhone.length === 12 && cleanPhone.startsWith("91")) cleanPhone = cleanPhone.slice(2);
              else if (cleanPhone.length === 11 && cleanPhone.startsWith("0")) cleanPhone = cleanPhone.slice(1);

              // 1. Strict Format Validation: For India, exactly 10 digits and starts with 6, 7, 8, or 9
              if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(
                  JSON.stringify({
                    success: false,
                    error: "Invalid mobile number. Indian mobile numbers must be exactly 10 digits starting with 6, 7, 8, or 9.",
                  })
                );
                return;
              }

              const now = Date.now();

              // 2. Client IP Rate Limiting (10s burst protection + max 10 requests / 10 mins)
              const rawForwarded = req.headers["x-forwarded-for"];
              const clientIp = (typeof rawForwarded === "string" ? rawForwarded.split(",")[0]?.trim() : req.socket.remoteAddress) || "local";

              if (clientIp && clientIp !== "127.0.0.1" && clientIp !== "::1") {
                const ipRec = devIpLimits.get(clientIp) || { lastSent: 0, count: 0, windowStart: now };
                const ipElapsed = Math.floor((now - ipRec.lastSent) / 1000);
                if (ipRec.lastSent > 0 && ipElapsed < 10) {
                  const wait = 10 - ipElapsed;
                  res.writeHead(429, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: false, error: `Please wait ${wait} seconds before requesting another OTP.` }));
                  return;
                }
                if (now - ipRec.windowStart > 600000) {
                  ipRec.count = 0;
                  ipRec.windowStart = now;
                }
                if (ipRec.count >= 10) {
                  res.writeHead(429, { "Content-Type": "application/json" });
                  res.end(JSON.stringify({ success: false, error: "Too many requests from your network. Please wait a few minutes." }));
                  return;
                }
                ipRec.count += 1;
                ipRec.lastSent = now;
                devIpLimits.set(clientIp, ipRec);
              }

              // 3. Phone Number Rate Limiting (60-second cooldown + max 5 per hour)
              const phoneRec = devPhoneLimits.get(cleanPhone) || { lastSent: 0, count: 0, hourStart: now };
              const phoneElapsed = Math.floor((now - phoneRec.lastSent) / 1000);
              if (phoneRec.lastSent > 0 && phoneElapsed < 60) {
                const wait = 60 - phoneElapsed;
                res.writeHead(429, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: `Please wait ${wait} seconds before requesting a new OTP.` }));
                return;
              }
              if (now - phoneRec.hourStart > 3600000) {
                phoneRec.count = 0;
                phoneRec.hourStart = now;
              }
              if (phoneRec.count >= 5) {
                res.writeHead(429, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: "Maximum OTP attempts reached for this number. Please try again after 1 hour." }));
                return;
              }
              phoneRec.count += 1;
              phoneRec.lastSent = now;
              devPhoneLimits.set(cleanPhone, phoneRec);

              let authkey = process.env["MSG91_AUTH_KEY"] || "";
              let templateId = process.env["MSG91_TEMPLATE_ID"] || "";

              const envCandidates = [
                path.resolve(process.cwd(), "backend/.env.production"),
                path.resolve(process.cwd(), "backend/.env"),
              ];
              for (const p of envCandidates) {
                if ((!authkey || !templateId) && fs.existsSync(p)) {
                  const content = fs.readFileSync(p, "utf8");
                  const keyMatch = content.match(/MSG91_AUTH_KEY=["']?([^"'\r\n]+)/);
                  const tplMatch = content.match(/MSG91_TEMPLATE_ID=["']?([^"'\r\n]+)/);
                  if (keyMatch && keyMatch[1] && !authkey) authkey = keyMatch[1];
                  if (tplMatch && tplMatch[1] && !templateId) templateId = tplMatch[1];
                }
              }

              if (!authkey || !templateId) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: "MSG91 credentials missing in backend/.env" }));
                return;
              }

              const payload = JSON.stringify({
                template_id: templateId.trim(),
                short_url: "0",
                recipients: [
                  {
                    mobiles: "91" + cleanPhone,
                    number: String(otp),
                  },
                ],
              });

              const httpsReq = https.request(
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
                (msgRes) => {
                  let msgData = "";
                  msgRes.on("data", (c) => (msgData += c));
                  msgRes.on("end", () => {
                    console.log("[MSG91 Live SMS] Response:", msgRes.statusCode, msgData);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true, message: "Live SMS sent", msg91: msgData }));
                  });
                }
              );

              httpsReq.on("error", (err) => {
                console.error("[MSG91 Live SMS] Request error:", err);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ success: false, error: err.message }));
              });

              httpsReq.write(payload);
              httpsReq.end();
            } catch (err: any) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    TanStackRouterVite(),
    react(),
    tsconfigPaths(),
    msg91Plugin(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
