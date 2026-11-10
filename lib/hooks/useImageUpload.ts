import { useCallback, useState } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /** Uploads the file and resolves with its S3 object key (e.g. `players/123-abc.jpg`). */
  const uploadImage = async (file: File, folder: string = 'tournaments'): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Get presigned URL. The server picks the key and signs the exact type and size.
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: file.type,
          fileSize: file.size,
          folder,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: undefined }));
        throw new Error(error ?? 'Failed to get upload URL');
      }

      const { signedUrl, key } = await response.json();

      // Upload file to S3. The browser sets Content-Length from the body, which must match the signed size.
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload file');

      setUploadProgress(100);
      return key;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const getPresignedUrl = useCallback(async (key: string): Promise<string> => {
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
  }, []);

  return { uploadImage, uploading, uploadProgress, getPresignedUrl };
}
