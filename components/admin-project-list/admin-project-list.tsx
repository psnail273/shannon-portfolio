'use client';

import { useState, useId } from 'react';
import Image from 'next/image';
import cloudinaryLoader from '@/lib/cloudinary-loader';
import { ProjectType } from '@/lib/types';
import { deleteProjectAction, reorderProjectsAction } from '@/lib/actions';
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

interface AdminProjectListProps {
  projects: ProjectType[];
  onEdit: (project: ProjectType) => void;
  onCreate: () => void;
  onProjectsChange: () => void;
}

function DragHandle({ listeners, attributes }: { listeners?: React.HTMLAttributes<HTMLButtonElement>; attributes?: React.HTMLAttributes<HTMLButtonElement> }) {
  return (
    <button
      type="button"
      className="cursor-grab active:cursor-grabbing touch-none p-1 text-muted hover:text-foreground transition-colors shrink-0"
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

interface SortableProjectCardProps {
  project: ProjectType;
  onEdit: (project: ProjectType) => void;
  deletingSlug: string | null;
  confirmSlug: string | null;
  onDelete: (slug: string) => void;
  onCancelDelete: () => void;
}

function SortableProjectCard({ project, onEdit, deletingSlug, confirmSlug, onDelete, onCancelDelete }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={ setNodeRef }
      style={ style }
      className="border border-border-subtle rounded-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-surface"
    >
      <DragHandle listeners={ listeners } attributes={ attributes } />

      { project.images.length > 0 && (
        <div className="w-12 h-12 shrink-0 rounded-sm overflow-hidden bg-hover-bg">
          <Image
            loader={ cloudinaryLoader }
            src={ project.images[0].src }
            alt={ project.images[0].alt || project.title }
            width={ 48 }
            height={ 48 }
            className="w-full h-full object-cover"
          />
        </div>
      ) }
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium truncate">{ project.title }</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted mt-1 flex-wrap">
          <span>{ project.slug }</span>
          <span>{ project.images.length } image{ project.images.length !== 1 ? 's' : '' }</span>
          { project.types.length > 0 && (
            <span>{ project.types.join(', ') }</span>
          ) }
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={ () => onEdit(project) }
          className="px-3 py-1.5 text-sm rounded-sm border border-border hover:bg-hover-bg transition-colors duration-200"
        >
          Edit
        </button>
        { confirmSlug === project.slug ? (
          <div className="flex gap-1">
            <button
              onClick={ () => onDelete(project.slug) }
              disabled={ deletingSlug === project.slug }
              className="px-3 py-1.5 text-sm rounded-sm bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 disabled:opacity-60"
            >
              { deletingSlug === project.slug ? 'Deleting...' : 'Confirm' }
            </button>
            <button
              onClick={ onCancelDelete }
              className="px-3 py-1.5 text-sm rounded-sm border border-border hover:bg-hover-bg transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={ () => onDelete(project.slug) }
            className="px-3 py-1.5 text-sm rounded-sm border border-red-300 text-red-500 hover:bg-red-50 transition-colors duration-200"
          >
            Delete
          </button>
        ) }
      </div>
    </div>
  );
}

export default function AdminProjectList({ projects: initialProjects, onEdit, onCreate, onProjectsChange }: AdminProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const dndId = useId();

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

  const handleDelete = async (slug: string) => {
    if (confirmSlug !== slug) {
      setConfirmSlug(slug);
      return;
    }

    setDeletingSlug(slug);
    setMessage(null);

    const result = await deleteProjectAction(slug);

    if (result.success) {
      setMessage({ type: 'success', text: `Project "${slug}" deleted.` });
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      onProjectsChange();
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setDeletingSlug(null);
    setConfirmSlug(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = projects.findIndex((p) => p.slug === active.id);
    const newIndex = projects.findIndex((p) => p.slug === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    setProjects(reordered);

    // Persist the new order
    setIsSavingOrder(true);
    setMessage(null);

    const orderItems = reordered.map((p, i) => ({ slug: p.slug, order: i }));
    const result = await reorderProjectsAction(orderItems);

    if (result.success) {
      onProjectsChange();
    } else {
      setMessage({ type: 'error', text: result.error });
      // Revert on failure
      setProjects(projects);
    }

    setIsSavingOrder(false);
  };

  // Sync projects when parent re-renders with new data
  if (initialProjects !== projects && initialProjects.length !== projects.length) {
    setProjects(initialProjects);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-playfair">Projects</h2>
          { isSavingOrder && (
            <span className="text-xs text-muted">Saving order...</span>
          ) }
        </div>
        <button
          onClick={ onCreate }
          className="px-4 py-2 rounded-sm bg-accent text-white font-medium hover:bg-accent-hover transition-colors duration-200"
        >
          New Project
        </button>
      </div>

      { message && (
        <div className={ `px-4 py-3 rounded-sm text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}` }>
          { message.text }
        </div>
      ) }

      { projects.length === 0 ? (
        <p className="text-muted text-center py-8">No projects yet. Create your first project!</p>
      ) : (
        <DndContext
          id={ dndId }
          sensors={ sensors }
          collisionDetection={ closestCenter }
          onDragEnd={ handleDragEnd }
        >
          <SortableContext
            items={ projects.map((p) => p.slug) }
            strategy={ verticalListSortingStrategy }
          >
            <div className="flex flex-col gap-3">
              { projects.map((project) => (
                <SortableProjectCard
                  key={ project.slug }
                  project={ project }
                  onEdit={ onEdit }
                  deletingSlug={ deletingSlug }
                  confirmSlug={ confirmSlug }
                  onDelete={ handleDelete }
                  onCancelDelete={ () => setConfirmSlug(null) }
                />
              )) }
            </div>
          </SortableContext>
        </DndContext>
      ) }
    </div>
  );
}
