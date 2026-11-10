import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

// No explicit credentials: the SDK's default provider chain uses the Lambda role in AWS
// (including AWS_SESSION_TOKEN) and env vars / your AWS profile locally.
const s3Client = new S3Client({});

export const UPLOAD_FOLDERS = ['players', 'tournaments'] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

export function isUploadFolder(folder: unknown): folder is UploadFolder {
  return typeof folder === 'string' && (UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

/**
 * Keys in the shape this app stores: `<allowed folder>/<single file name>`.
 * The file-name check is loose on purpose, because older uploads kept the user's original file name.
 */
export function isAllowedImageKey(key: unknown): key is string {
  if (typeof key !== 'string' || key.length > 512) return false;
  const [folder, file, ...rest] = key.split('/');
  return (
    rest.length === 0 &&
    isUploadFolder(folder) &&
    !!file &&
    file !== '.' &&
    file !== '..' &&
    !/[\u0000-\u001f\\]/.test(file)
  );
}

/**
 * Presigned PUT for one image. Content-Type and Content-Length are signed, so S3 rejects
 * the upload if the browser sends a different type or a different size than was approved here.
 * The key is generated on the server, so the client can't choose where the file goes.
 */
export async function generatePresignedUrl(fileType: string, fileSize: number, folder: UploadFolder) {
  const extension = ALLOWED_IMAGE_TYPES[fileType];
  const key = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const signedUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 300,
    signableHeaders: new Set(['content-type', 'content-length']),
  });

  return { signedUrl, key };
}

export async function generateViewPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { presignedUrl };
}
