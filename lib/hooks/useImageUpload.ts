import { useState } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File, folder: string = 'tournaments'): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder,
        }),
      });

      if (!response.ok) throw new Error('Failed to get upload URL');

      const { signedUrl, publicUrl } = await response.json();

      // Upload file to S3
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload file');

      setUploadProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getPresignedUrl = async (key: string): Promise<string> => {
    try {
      const response = await fetch('/api/get-image-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) throw new Error('Failed to get presigned URL');

      const { presignedUrl } = await response.json();
      return presignedUrl;
    } catch (error) {
      console.error('Get presigned URL error:', error);
      throw error;
    }
  };

  return { uploadImage, uploading, uploadProgress, getPresignedUrl };
}
