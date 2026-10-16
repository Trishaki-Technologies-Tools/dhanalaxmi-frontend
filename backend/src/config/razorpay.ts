import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

export const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_SECRET || "";

  return { keyId, keySecret };
};

export const getRazorpayInstance = () => {
  const { keyId, keySecret } = getRazorpayConfig();

  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in the environment variables."
    );
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};
