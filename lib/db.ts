'server-only';

import { neon } from '@neondatabase/serverless';
import { GalleryImageType, ProjectType } from './types';

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

export async function getProjects(isProtected: boolean = false): Promise<ProjectType[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`
    SELECT
      p.slug,
      p.title, 
      p.description, 
      p.date, 
      p.protected,
      p.types,
      COALESCE(
        json_agg(
           json_build_object('src', i.src, 'alt', i.alt, 'width', i.width, 'height', i.height, 'order', i.order)
           ORDER BY i.order
        ) FILTER (WHERE i.src IS NOT NULL),
        '[]'
      ) as images
    FROM project p
    LEFT JOIN project_image pi ON p.slug = pi.project_slug
    LEFT JOIN image i ON pi.image_src = i.src
    WHERE p.protected=${isProtected}
    GROUP BY p.slug, p.title, p.description, p.date, p.protected;`
  return response as unknown as ProjectType[];
}

export async function getProjectBySlug(slug: string): Promise<ProjectType | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);
  const response = await sql`
    SELECT
      p.slug,
      p.title, 
      p.description, 
      p.date, 
      p.protected,
      p.types,
      COALESCE(
        json_agg(
           json_build_object('src', i.src, 'alt', i.alt, 'width', i.width, 'height', i.height, 'order', i.order)
           ORDER BY i.order
        ) FILTER (WHERE i.src IS NOT NULL),
        '[]'
      ) as images
    FROM project p
    LEFT JOIN project_image pi ON p.slug = pi.project_slug
    LEFT JOIN image i ON pi.image_src = i.src
    WHERE p.slug=${slug}
    GROUP BY p.slug, p.title, p.description, p.date, p.protected;`
  return response[0] as unknown as ProjectType;
}