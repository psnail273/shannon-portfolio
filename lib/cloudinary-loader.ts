'use client';

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom Cloudinary loader for Next.js Image component
 * Adds automatic format, quality, and responsive width transformations
 */
export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  // Check if this is a Cloudinary URL
  if (!src.includes('cloudinary.com')) {
    return src;
  }

  // Build transformation string
  const transformations = [
    `w_${width}`,           // Responsive width
    'c_scale',              // Scale to fit width
    'f_auto',               // Auto format (WebP, AVIF based on browser)
    `q_${quality || 'auto'}`, // Quality (default: auto)
  ].join(',');

  // Insert transformations into the URL path
  // Cloudinary URL format: /image/upload/[existing_transforms]/[version]/[public_id]
  // or: /image/upload/[version]/[public_id]
  const parts = src.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/${transformations}/${parts[1]}`;
  }

  return src;
}

