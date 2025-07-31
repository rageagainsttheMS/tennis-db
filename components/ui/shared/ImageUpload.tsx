"use client";

import { useState, useRef } from 'react';
import { Box, Button, Input, Image, Text, Progress } from '@chakra-ui/react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  folder?: string;
}

export function ImageUpload({ onImageUploaded, currentImage, folder = 'tournaments' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading, uploadProgress } = useImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file, folder)
      .then(onImageUploaded)
      .catch((error) => {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
        setPreview(currentImage || null);
      });
  };

  return (
    <Box>
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        display="none"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        colorScheme="blue"
        variant="outline"
        mb={4}
      >
        {uploading ? 'Uploading...' : 'Choose Image'}
      </Button>

      {uploading && (
        <Box mb={4}>
          <Text fontSize="sm" mb={2}>Uploading... {uploadProgress}%</Text>
           <Progress.Root key={uploadProgress} colorScheme="blue">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      )}

      {preview && (
        <Box>
          <Image
            src={preview}
            alt="Preview"
            maxW="200px"
            maxH="200px"
            objectFit="cover"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          />
        </Box>
      )}
    </Box>
  );
}
