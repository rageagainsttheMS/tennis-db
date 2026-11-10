import { getAdminSession } from '@/lib/utils/auth-guards';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_UPLOAD_BYTES,
  generatePresignedUrl,
  isUploadFolder,
} from '@/lib/utils/s3';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Only admins may get upload URLs for the bucket.
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { fileType, fileSize, folder } = (body ?? {}) as Record<string, unknown>;

  if (typeof fileType !== 'string' || !(fileType in ALLOWED_IMAGE_TYPES)) {
    return NextResponse.json(
      { error: `fileType must be one of: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}` },
      { status: 400 }
    );
  }
  if (typeof fileSize !== 'number' || !Number.isInteger(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `fileSize must be between 1 byte and ${MAX_UPLOAD_BYTES} bytes` },
      { status: 400 }
    );
  }
  if (!isUploadFolder(folder)) {
    return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
  }

  try {
    const { signedUrl, key } = await generatePresignedUrl(fileType, fileSize, folder);
    return NextResponse.json({ signedUrl, key });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
