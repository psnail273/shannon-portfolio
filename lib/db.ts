'server-only';

import { neon } from '@neondatabase/serverless';
import { GalleryImageType, ProjectImageType, ProjectType } from './types';

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

export async function getAllProjects(): Promise<ProjectType[]> {
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
    GROUP BY p.slug, p.title, p.description, p.date, p.protected
    ORDER BY p.date DESC;`;
  return response as unknown as ProjectType[];
}

export async function createProject(
  projectData: { slug: string; title: string; description: string; date: string; protected: boolean; types: string[] },
  images: ProjectImageType[]
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);

  const queries = [
    sql`INSERT INTO project (slug, title, description, date, protected, types)
        VALUES (${projectData.slug}, ${projectData.title}, ${projectData.description}, ${projectData.date}, ${projectData.protected}, ${projectData.types})`,
    ...images.map((img) =>
      sql`INSERT INTO image (src, alt, width, height, "order")
          VALUES (${img.src}, ${img.alt}, ${img.width}, ${img.height}, ${img.order})
          ON CONFLICT (src) DO UPDATE SET alt = ${img.alt}, width = ${img.width}, height = ${img.height}, "order" = ${img.order}`
    ),
    ...images.map((img) =>
      sql`INSERT INTO project_image (project_slug, image_src)
          VALUES (${projectData.slug}, ${img.src})
          ON CONFLICT DO NOTHING`
    ),
  ];

  await sql.transaction(queries);
}

export async function updateProject(
  originalSlug: string,
  projectData: { slug: string; title: string; description: string; date: string; protected: boolean; types: string[] },
  images: ProjectImageType[]
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);

  const queries = [
    // Update project fields
    sql`UPDATE project
        SET slug = ${projectData.slug}, title = ${projectData.title}, description = ${projectData.description},
            date = ${projectData.date}, protected = ${projectData.protected}, types = ${projectData.types}
        WHERE slug = ${originalSlug}`,
    // Remove all existing image associations for this project
    sql`DELETE FROM project_image WHERE project_slug = ${originalSlug}`,
    // Upsert images and create new associations
    ...images.map((img) =>
      sql`INSERT INTO image (src, alt, width, height, "order")
          VALUES (${img.src}, ${img.alt}, ${img.width}, ${img.height}, ${img.order})
          ON CONFLICT (src) DO UPDATE SET alt = ${img.alt}, width = ${img.width}, height = ${img.height}, "order" = ${img.order}`
    ),
    ...images.map((img) =>
      sql`INSERT INTO project_image (project_slug, image_src)
          VALUES (${projectData.slug}, ${img.src})`
    ),
  ];

  await sql.transaction(queries);
}

export async function deleteProject(slug: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const sql = neon(process.env.DATABASE_URL);

  await sql.transaction([
    sql`DELETE FROM project_image WHERE project_slug = ${slug}`,
    sql`DELETE FROM project WHERE slug = ${slug}`,
  ]);
}