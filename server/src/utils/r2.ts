import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { Readable } from 'stream';

dotenv.config();

const accountId = process.env.R2_ACCOUNT_ID || '5650e3a8b5c944019e3ce90d359709f4';
const accessKeyId = process.env.R2_ACCESS_KEY || '2454d1fe3cb2a04e2c07dc5748077db0';
const secretAccessKey = process.env.R2_SECRET_KEY || '6950cc887d74b1b6a7450b0f7a12d3a8c0c0492441383bcf5a59dd53e9c5fc33';
export const R2_BUCKET = process.env.R2_BUCKET || 'vocatype';
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || 'https://pub-1366610845f540478990dea3a41db20c.r2.dev').replace(/\/$/, '');

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Kiểm tra xem audio của từ đã tồn tại trên R2 chưa
 */
export async function checkAudioExists(key: string): Promise<boolean> {
  try {
    await s3Client.send(
      new HeadObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );
    return true;
  } catch (e: any) {
    return false;
  }
}

/**
 * Upload buffer audio MP3 lên Cloudflare R2
 */
export async function uploadAudioToR2(
  key: string,
  buffer: Buffer,
  contentType: string = 'audio/mpeg',
): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Lấy stream Audio từ R2
 */
export async function getAudioStreamFromR2(key: string): Promise<{ stream: Readable; contentLength?: number; contentType?: string } | null> {
  try {
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      }),
    );

    return {
      stream: res.Body as Readable,
      contentLength: res.ContentLength,
      contentType: res.ContentType || 'audio/mpeg',
    };
  } catch {
    return null;
  }
}
