'use client';

import { useState, useId, useCallback, useRef } from 'react';
import { ProjectType, ProjectImageType } from '@/lib/types';
import { createProjectAction, updateProjectAction, upsertImageAction } from '@/lib/actions';
import ImageUpload from '@/components/image-upload/image-upload';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AdminProjectFormProps {
  project?: ProjectType;
  onCancel: () => void;
  onSuccess: () => void;
}

interface ImageWithId extends ProjectImageType {
  id: string;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

let imageIdCounter = 0;
function generateImageId(): string {
  imageIdCounter += 1;
  return `img-${Date.now()}-${imageIdCounter}`;
}

function toImagesWithId(images: ProjectImageType[]): ImageWithId[] {
  return images.map((img) => ({ ...img, id: generateImageId() }));
}

function DragHandle({ listeners, attributes }: { listeners?: React.HTMLAttributes<HTMLButtonElement>; attributes?: React.HTMLAttributes<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted hover:text-foreground transition-colors"
      aria-label="Drag to reorder"
      { ...attributes }
      { ...listeners }
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <circle cx="5" cy="3" r="1.5" />
        <circle cx="11" cy="3" r="1.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="11" cy="8" r="1.5" />
        <circle cx="5" cy="13" r="1.5" />
        <circle cx="11" cy="13" r="1.5" />
      </svg>
    </button>
  );
}

interface SortableImageItemProps {
  image: ImageWithId;
  index: number;
  inputClass: string;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof ProjectImageType, value: string | number) => void;
  onUploadSuccess: (index: number, data: { src: string; width: number; height: number }) => void;
  onUploadRemove: (index: number) => void;
}

function SortableImageItem({ image, index, inputClass, onRemove, onChange, onUploadSuccess, onUploadRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUploadSuccess = useCallback((data: { src: string; width: number; height: number }) => {
    onUploadSuccess(index, data);
  }, [index, onUploadSuccess]);

  const handleUploadRemove = useCallback(() => {
    onUploadRemove(index);
  }, [index, onUploadRemove]);

  return (
    <div
      ref={ setNodeRef }
      style={ style }
      className="border border-border-subtle rounded-sm p-4 flex flex-col gap-3 bg-surface"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <DragHandle listeners={ listeners } attributes={ attributes } />
          <span className="text-sm font-medium">Image { index + 1 }</span>
        </div>
        <button
          type="button"
          onClick={ () => onRemove(index) }
          className="px-2 py-1 text-xs rounded-sm border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
        >
          Remove
        </button>
      </div>

      <ImageUpload
        initialImage={ image.src ? { src: image.src, alt: image.alt, width: image.width, height: image.height, order: image.order } : undefined }
        onUploadSuccess={ handleUploadSuccess }
        onRemove={ handleUploadRemove }
      />

      <div>
        <label className="text-xs text-muted">Alt text (optional)</label>
        <input
          type="text"
          value={ image.alt }
          onChange={ (e) => onChange(index, 'alt', e.target.value) }
          className={ inputClass }
          placeholder="Defaults to image filename"
        />
      </div>
    </div>
  );
}

export default function AdminProjectForm({ project, onCancel, onSuccess }: AdminProjectFormProps) {
  const isEditing = !!project;
  const dndId = useId();

  const [slug, setSlug] = useState(project?.slug ?? '');
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [typesInput, setTypesInput] = useState(project?.types.join(', ') ?? '');
  const [images, setImages] = useState<ImageWithId[]>(
    project?.images.length ? toImagesWithId(project.images) : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [slugTouched, setSlugTouched] = useState(isEditing);

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const handleDescriptionDrop = useCallback(async (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    // Always prevent default for file drops to stop browser navigation
    e.preventDefault();
    e.stopPropagation();

    const file = files[0];
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;

    const textarea = descriptionRef.current;
    const cursorPos = textarea?.selectionStart ?? 0;
    const placeholderId = Date.now();
    const placeholder = `![Uploading image-${placeholderId}...]()`;

    // Insert placeholder at cursor position using functional setState to avoid stale closure
    setDescription((prev) => {
      const before = prev.slice(0, cursorPos);
      const after = prev.slice(cursorPos);
      return `${before}${placeholder}${after}`;
    });

    // Restore cursor position after React re-render
    const newCursorPos = cursorPos + placeholder.length;
    requestAnimationFrame(() => {
      if (textarea) {
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
      }
    });

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/cloudinary', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { src, width, height } = await res.json();

      // Derive alt text from filename
      const altText = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');

      // Upsert image to database for dimension tracking
      await upsertImageAction({ src, alt: altText, width, height });

      // Replace placeholder with actual markdown
      setDescription((prev) => prev.replace(placeholder, `![${altText}](${src})`));
    } catch {
      // Remove placeholder on failure
      setDescription((prev) => prev.replace(placeholder, ''));
    }
  }, []);

  const handleDescriptionDragOver = useCallback((e: React.DragEvent<HTMLTextAreaElement>) => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(toKebabCase(value));
    }
  };

  const handleAddImage = () => {
    setImages([...images, { src: '', alt: '', width: 0, height: 0, order: images.length, id: generateImageId() }]);
  };

  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, order: i }));
    setImages(updated);
  };

  const handleImageChange = (index: number, field: keyof ProjectImageType, value: string | number) => {
    const updated = [...images];
    updated[index] = { ...updated[index], [field]: value };
    setImages(updated);
  };

  const handleImageUploadSuccess = useCallback((index: number, data: { src: string; width: number; height: number }) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], src: data.src, width: data.width, height: data.height };
      return updated;
    });
  }, []);

  const handleImageUploadRemove = useCallback((index: number) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], src: '', width: 0, height: 0 };
      return updated;
    });
  }, []);

  const handleImageDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id);
      const newIndex = prev.findIndex((img) => img.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      return reordered.map((img, i) => ({ ...img, order: i }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);

    // Client-side validation
    if (!slug.trim()) {
      setError('Slug is required.');
      setIsSubmitting(false);
      return;
    }
    if (!SLUG_REGEX.test(slug)) {
      setError('Slug must be kebab-case (lowercase letters, numbers, and hyphens).');
      setIsSubmitting(false);
      return;
    }
    if (!title.trim()) {
      setError('Title is required.');
      setIsSubmitting(false);
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      setIsSubmitting(false);
      return;
    }
    // Filter out empty image slots (user added slot but never uploaded)
    const validImages = images.filter((img) => img.src.trim() !== '');

    const types = typesInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const formData = {
      slug,
      title: title.trim(),
      description: description.trim(),
      types,
      images: validImages.map((img, i) => ({
        src: img.src.trim(),
        alt: img.alt.trim(),
        width: Number(img.width),
        height: Number(img.height),
        order: i,
      })),
    };

    try {
      const result = isEditing
        ? await updateProjectAction(project.slug, formData)
        : await createProjectAction(formData);

      if (result.success) {
        setSuccessMsg(isEditing ? 'Project updated successfully.' : 'Project created successfully.');
        setTimeout(() => onSuccess(), 500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full rounded-sm border border-border px-4 py-3 text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-foreground mb-1';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair">
          { isEditing ? `Edit: ${project.title}` : 'New Project' }
        </h2>
        <button
          onClick={ onCancel }
          className="px-4 py-2 rounded-sm border border-border hover:bg-hover-bg transition-colors duration-200 text-sm"
        >
          Back to List
        </button>
      </div>

      { error && (
        <div className="px-4 py-3 rounded-sm text-sm bg-red-50 text-red-800 border border-red-200">
          { error }
        </div>
      ) }
      { successMsg && (
        <div className="px-4 py-3 rounded-sm text-sm bg-green-50 text-green-800 border border-green-200">
          { successMsg }
        </div>
      ) }

      <form onSubmit={ handleSubmit } className="flex flex-col gap-5">
        { /* Title */ }
        <div>
          <label htmlFor="title" className={ labelClass }>Title *</label>
          <input
            id="title"
            type="text"
            value={ title }
            onChange={ (e) => handleTitleChange(e.target.value) }
            className={ inputClass }
            placeholder="Project title"
            required
          />
        </div>

        { /* Slug */ }
        <div>
          <label htmlFor="slug" className={ labelClass }>Slug *</label>
          <input
            id="slug"
            type="text"
            value={ slug }
            onChange={ (e) => { setSlug(e.target.value); setSlugTouched(true); } }
            className={ inputClass }
            placeholder="project-slug"
            required
          />
          { slug && !SLUG_REGEX.test(slug) && (
            <p className="text-error text-xs mt-1">Must be kebab-case (e.g. my-project-name)</p>
          ) }
        </div>

        { /* Description */ }
        <div>
          <label htmlFor="description" className={ labelClass }>Description * (Markdown supported)</label>
          <textarea
            id="description"
            ref={ descriptionRef }
            value={ description }
            onChange={ (e) => setDescription(e.target.value) }
            onDrop={ handleDescriptionDrop }
            onDragOver={ handleDescriptionDragOver }
            className={ `${inputClass} min-h-[240px] resize-y` }
            placeholder="Project description (supports Markdown). Drop images here to upload."
            required
          />
        </div>

        { /* Types */ }
        <div>
          <label htmlFor="types" className={ labelClass }>Types (comma-separated)</label>
          <input
            id="types"
            type="text"
            value={ typesInput }
            onChange={ (e) => setTypesInput(e.target.value) }
            className={ inputClass }
            placeholder="e.g. Branding, Web Design, Illustration"
          />
        </div>

        { /* Images */ }
        <div className="flex flex-col gap-3">
          <span className={ labelClass }>Images</span>

          { images.length === 0 && (
            <p className="text-muted text-sm">No images added yet.</p>
          ) }

          <DndContext
            id={ dndId }
            sensors={ sensors }
            collisionDetection={ closestCenter }
            onDragEnd={ handleImageDragEnd }
          >
            <SortableContext
              items={ images.map((img) => img.id) }
              strategy={ verticalListSortingStrategy }
            >
              { images.map((img, index) => (
                <SortableImageItem
                  key={ img.id }
                  image={ img }
                  index={ index }
                  inputClass={ inputClass }
                  onRemove={ handleRemoveImage }
                  onChange={ handleImageChange }
                  onUploadSuccess={ handleImageUploadSuccess }
                  onUploadRemove={ handleImageUploadRemove }
                />
              )) }
            </SortableContext>
          </DndContext>

          <button
            type="button"
            onClick={ handleAddImage }
            className="px-3 py-1.5 text-sm rounded-sm bg-accent text-white hover:bg-accent-hover transition-colors duration-200 self-start"
          >
            Add Image
          </button>
        </div>

        { /* Submit */ }
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={ isSubmitting }
            className="flex-1 sm:flex-none px-6 py-3 rounded-sm bg-accent text-white font-medium hover:bg-accent-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            { isSubmitting
              ? (isEditing ? 'Updating...' : 'Creating...')
              : (isEditing ? 'Update Project' : 'Create Project')
            }
          </button>
          <button
            type="button"
            onClick={ onCancel }
            disabled={ isSubmitting }
            className="flex-1 sm:flex-none px-6 py-3 rounded-sm border border-border hover:bg-hover-bg transition-colors duration-200 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
