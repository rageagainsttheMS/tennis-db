import { generatePresignedUrl } from '@/lib/utils/s3';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, folder } = await request.json();
    
    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName and fileType are required' },
        { status: 400 }
      );
    }

    const { signedUrl, key, publicUrl } = await generatePresignedUrl(
      fileName,
      fileType,
      folder
    );

    return NextResponse.json({ signedUrl, key, publicUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
