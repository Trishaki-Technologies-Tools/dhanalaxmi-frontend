import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const getR2Client = () => {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const accessKeyId = (process.env.R2_ACCESS_KEY_ID || "").trim();
  const secretAccessKey = (process.env.R2_SECRET_ACCESS_KEY || "").trim();

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
};

export const uploadToR2 = async (fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> => {
  const accountId = (process.env.R2_ACCOUNT_ID || "").trim();
  const bucketName = (process.env.R2_BUCKET_NAME || "dhanalaxmi").trim();
  const publicDomain = (process.env.R2_PUBLIC_DOMAIN || "").trim();

  const uniqueKey = `products/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

  const client = getR2Client();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueKey,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await client.send(command);

  // Return public CDN URL
  if (publicDomain) {
    const cleanDomain = publicDomain.endsWith("/") ? publicDomain.slice(0, -1) : publicDomain;
    return `${cleanDomain}/${uniqueKey}`;
  }

  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com/${uniqueKey}`;
};

export const deleteFromR2 = async (fileKey: string): Promise<void> => {
  const bucketName = (process.env.R2_BUCKET_NAME || "dhanalaxmi").trim();
  const client = getR2Client();

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  await client.send(command);
};
