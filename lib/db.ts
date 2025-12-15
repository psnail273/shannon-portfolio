'server-only';

import { neon } from '@neondatabase/serverless';
import { GalleryImageType } from './types';

export async function getImages (isProtected: boolean = false): Promise<GalleryImageType[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`
    SELECT
      src,
      alt,
      slug,
      name,
      description,
      date,
      width,
      height,
      types
    FROM images
    WHERE protected=${isProtected};
  `;

  return response as unknown as GalleryImageType[];
}

export async function getImageBySlug(slug: string): Promise<GalleryImageType | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`
    SELECT
      src,
      alt,
      slug,
      name,
      description,
      date,
      width,
      height,
      types
    FROM images
    WHERE slug=${slug};
  `;
  return response[0] as unknown as GalleryImageType;
}