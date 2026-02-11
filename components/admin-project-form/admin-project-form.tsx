'use client';

import { useState } from 'react';
import { ProjectType, ProjectImageType } from '@/lib/types';
import { createProjectAction, updateProjectAction } from '@/lib/actions';

interface AdminProjectFormProps {
  project?: ProjectType;
  onCancel: () => void;
  onSuccess: () => void;
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyImage = { src: '', alt: '', width: 0, height: 0, order: 0 };

export default function AdminProjectForm({ project, onCancel, onSuccess }: AdminProjectFormProps) {
  const isEditing = !!project;

  const [slug, setSlug] = useState(project?.slug ?? '');
  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [date, setDate] = useState(project?.date ? new Date(project.date).toISOString().split('T')[0] : '');
  const [isProtected, setIsProtected] = useState(project?.protected ?? false);
  const [typesInput, setTypesInput] = useState(project?.types.join(', ') ?? '');
  const [images, setImages] = useState<ProjectImageType[]>(
    project?.images.length ? project.images : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [slugTouched, setSlugTouched] = useState(isEditing);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(toKebabCase(value));
    }
  };

  const handleAddImage = () => {
    setImages([...images, { ...emptyImage, order: images.length }]);
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

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setImages(updated.map((img, i) => ({ ...img, order: i })));
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
    if (!date) {
      setError('Date is required.');
      setIsSubmitting(false);
      return;
    }

    const types = typesInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const formData = {
      slug,
      title: title.trim(),
      description: description.trim(),
      date,
      protected: isProtected,
      types,
      images: images.map((img, i) => ({
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

  const inputClass = 'w-full rounded-sm border border-[#171717]/20 px-4 py-3 text-[#171717] bg-white focus:outline-none focus:ring-2 focus:ring-[#b997ce] focus:border-transparent transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-[#171717] mb-1';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair">
          { isEditing ? `Edit: ${project.title}` : 'New Project' }
        </h2>
        <button
          onClick={ onCancel }
          className="px-4 py-2 rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors duration-200 text-sm"
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
            <p className="text-[#c97c7c] text-xs mt-1">Must be kebab-case (e.g. my-project-name)</p>
          ) }
        </div>

        { /* Description */ }
        <div>
          <label htmlFor="description" className={ labelClass }>Description * (Markdown supported)</label>
          <textarea
            id="description"
            value={ description }
            onChange={ (e) => setDescription(e.target.value) }
            className={ `${inputClass} min-h-[120px] resize-y` }
            placeholder="Project description (supports Markdown)"
            required
          />
        </div>

        { /* Date */ }
        <div>
          <label htmlFor="date" className={ labelClass }>Date *</label>
          <input
            id="date"
            type="date"
            value={ date }
            onChange={ (e) => setDate(e.target.value) }
            className={ inputClass }
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

        { /* Protected */ }
        <div className="flex items-center gap-3">
          <input
            id="protected"
            type="checkbox"
            checked={ isProtected }
            onChange={ (e) => setIsProtected(e.target.checked) }
            className="w-5 h-5 rounded-sm border border-[#171717]/20 accent-[#b997ce]"
          />
          <label htmlFor="protected" className="text-sm text-[#171717]">Protected (requires authentication to view)</label>
        </div>

        { /* Images */ }
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className={ labelClass }>Images</span>
            <button
              type="button"
              onClick={ handleAddImage }
              className="px-3 py-1.5 text-sm rounded-sm bg-[#b997ce] text-white hover:bg-[#a67fbc] transition-colors duration-200"
            >
              Add Image
            </button>
          </div>

          { images.length === 0 && (
            <p className="text-[#8d8d8d] text-sm">No images added yet.</p>
          ) }

          { images.map((img, index) => (
            <div
              key={ index }
              className="border border-[#171717]/10 rounded-sm p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Image { index + 1 }</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={ () => handleMoveImage(index, 'up') }
                    disabled={ index === 0 }
                    className="px-2 py-1 text-xs rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors disabled:opacity-30"
                    title="Move up"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={ () => handleMoveImage(index, 'down') }
                    disabled={ index === images.length - 1 }
                    className="px-2 py-1 text-xs rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors disabled:opacity-30"
                    title="Move down"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={ () => handleRemoveImage(index) }
                    className="px-2 py-1 text-xs rounded-sm border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#8d8d8d]">Image URL (https://)</label>
                <input
                  type="text"
                  value={ img.src }
                  onChange={ (e) => handleImageChange(index, 'src', e.target.value) }
                  className={ inputClass }
                  placeholder="https://res.cloudinary.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-[#8d8d8d]">Alt text</label>
                <input
                  type="text"
                  value={ img.alt }
                  onChange={ (e) => handleImageChange(index, 'alt', e.target.value) }
                  className={ inputClass }
                  placeholder="Descriptive alt text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#8d8d8d]">Width</label>
                  <input
                    type="number"
                    value={ img.width || '' }
                    onChange={ (e) => handleImageChange(index, 'width', parseInt(e.target.value) || 0) }
                    className={ inputClass }
                    placeholder="1200"
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8d8d8d]">Height</label>
                  <input
                    type="number"
                    value={ img.height || '' }
                    onChange={ (e) => handleImageChange(index, 'height', parseInt(e.target.value) || 0) }
                    className={ inputClass }
                    placeholder="800"
                    min="1"
                  />
                </div>
              </div>
            </div>
          )) }
        </div>

        { /* Submit */ }
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={ isSubmitting }
            className="flex-1 sm:flex-none px-6 py-3 rounded-sm bg-[#b997ce] text-white font-medium hover:bg-[#a67fbc] transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
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
            className="flex-1 sm:flex-none px-6 py-3 rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors duration-200 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
