'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedImageProps {
  src: string | null | undefined;
  alt: string;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ src, alt }) => {
  const { token } = useAuth();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (src && token) {
        try {
          const response = await fetch(src, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const blob = await response.blob();
            setImageUrl(URL.createObjectURL(blob));
          }
        } catch (error) {
          console.error("Gagal memuat gambar:", error);
        }
      }
    };

    fetchImage();

    // Cleanup object URL saat komponen di-unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [src, token]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-500 shadow-sm">
        Tidak Ada Gambar
      </div>
    );
  }

  return imageUrl ? (
    <img src={imageUrl} alt={alt} className="object-cover w-full h-full" />
  ) : (
    <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
      Memuat...
    </div>
  );
};

export default ProtectedImage;