import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(
  fileName: string,
  fileType: string,
  folder: string = 'images'
) {
  const key = `${folder}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return {
    signedUrl,
    key,
    publicUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  };
}

export async function generateViewPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  
  return { presignedUrl };
}
