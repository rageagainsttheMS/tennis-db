import { generateViewPresignedUrl, isAllowedImageKey } from '@/lib/utils/s3';
import { NextRequest, NextResponse } from 'next/server';

// Public on purpose: player and tournament images appear on public pages.
// To stop it being used to read arbitrary objects, it only signs keys in the allowed image folders.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { key } = (body ?? {}) as Record<string, unknown>;
  if (!isAllowedImageKey(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 });
  }

  try {
    const { presignedUrl } = await generateViewPresignedUrl(key);
    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error('Error generating view presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate view URL' }, { status: 500 });
  }
}
