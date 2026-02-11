'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { verifyAdminAuthToken } from './auth';
import { createProject, updateProject, deleteProject } from './db';
import { ProjectImageType } from './types';

export type ActionResult = { success: true } | { success: false; error: string };

interface ProjectFormData {
  slug: string;
  title: string;
  description: string;
  date: string;
  protected: boolean;
  types: string[];
  images: ProjectImageType[];
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminAuthToken')?.value;
  return token ? verifyAdminAuthToken(token) : false;
}

function validateProjectData(data: ProjectFormData): string | null {
  if (!data.slug || !data.slug.trim()) {
    return 'Slug is required.';
  }
  if (!SLUG_REGEX.test(data.slug)) {
    return 'Slug must be kebab-case (lowercase letters, numbers, and hyphens).';
  }
  if (!data.title || !data.title.trim()) {
    return 'Title is required.';
  }
  if (!data.description || !data.description.trim()) {
    return 'Description is required.';
  }
  if (!data.date) {
    return 'Date is required.';
  }
  for (let i = 0; i < data.images.length; i++) {
    const img = data.images[i];
    if (!img.src || !img.src.trim()) {
      return `Image ${i + 1}: URL is required.`;
    }
    if (!img.src.startsWith('https://')) {
      return `Image ${i + 1}: URL must start with https://.`;
    }
    if (!img.alt || !img.alt.trim()) {
      return `Image ${i + 1}: Alt text is required.`;
    }
    if (!img.width || img.width <= 0) {
      return `Image ${i + 1}: Width must be a positive number.`;
    }
    if (!img.height || img.height <= 0) {
      return `Image ${i + 1}: Height must be a positive number.`;
    }
  }
  return null;
}

export async function createProjectAction(data: ProjectFormData): Promise<ActionResult> {
  if (!await verifyAdminAuth()) {
    return { success: false, error: 'Not authenticated.' };
  }

  const validationError = validateProjectData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await createProject(
      {
        slug: data.slug,
        title: data.title.trim(),
        description: data.description.trim(),
        date: data.date,
        protected: data.protected,
        types: data.types.filter((t) => t.trim() !== ''),
      },
      data.images.map((img, i) => ({
        src: img.src.trim(),
        alt: img.alt.trim(),
        width: img.width,
        height: img.height,
        order: img.order ?? i,
      }))
    );

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return { success: false, error: 'A project with this slug already exists.' };
    }
    console.error('createProjectAction error:', err);
    return { success: false, error: 'Failed to create project. Please try again.' };
  }
}

export async function updateProjectAction(originalSlug: string, data: ProjectFormData): Promise<ActionResult> {
  if (!await verifyAdminAuth()) {
    return { success: false, error: 'Not authenticated.' };
  }

  const validationError = validateProjectData(data);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await updateProject(
      originalSlug,
      {
        slug: data.slug,
        title: data.title.trim(),
        description: data.description.trim(),
        date: data.date,
        protected: data.protected,
        types: data.types.filter((t) => t.trim() !== ''),
      },
      data.images.map((img, i) => ({
        src: img.src.trim(),
        alt: img.alt.trim(),
        width: img.width,
        height: img.height,
        order: img.order ?? i,
      }))
    );

    revalidatePath('/');
    revalidatePath('/admin');
    revalidatePath(`/designs/${data.slug}`);
    if (originalSlug !== data.slug) {
      revalidatePath(`/designs/${originalSlug}`);
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('duplicate key') || message.includes('unique constraint')) {
      return { success: false, error: 'A project with this slug already exists.' };
    }
    console.error('updateProjectAction error:', err);
    return { success: false, error: 'Failed to update project. Please try again.' };
  }
}

export async function deleteProjectAction(slug: string): Promise<ActionResult> {
  if (!await verifyAdminAuth()) {
    return { success: false, error: 'Not authenticated.' };
  }

  if (!slug || !slug.trim()) {
    return { success: false, error: 'Slug is required.' };
  }

  try {
    await deleteProject(slug);
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: unknown) {
    console.error('deleteProjectAction error:', err);
    return { success: false, error: 'Failed to delete project. Please try again.' };
  }
}
