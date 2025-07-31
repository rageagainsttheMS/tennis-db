import { generateViewPresignedUrl } from '@/lib/utils/s3';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json(
        { error: 'key is required' },
        { status: 400 }
      );
    }

    const { presignedUrl } = await generateViewPresignedUrl(key);

    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error('Error generating view presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate view URL' },
      { status: 500 }
    );
  }
}
