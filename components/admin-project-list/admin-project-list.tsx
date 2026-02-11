'use client';

import { useState } from 'react';
import { ProjectType } from '@/lib/types';
import { deleteProjectAction } from '@/lib/actions';

interface AdminProjectListProps {
  projects: ProjectType[];
  onEdit: (project: ProjectType) => void;
  onCreate: () => void;
  onProjectsChange: () => void;
}

export default function AdminProjectList({ projects, onEdit, onCreate, onProjectsChange }: AdminProjectListProps) {
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      onProjectsChange();
    } else {
      setMessage({ type: 'error', text: result.error });
    }

    setDeletingSlug(null);
    setConfirmSlug(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-playfair">Projects</h2>
        <button
          onClick={ onCreate }
          className="px-4 py-2 rounded-sm bg-[#b997ce] text-white font-medium hover:bg-[#a67fbc] transition-colors duration-200"
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
        <p className="text-[#8d8d8d] text-center py-8">No projects yet. Create your first project!</p>
      ) : (
        <div className="flex flex-col gap-3">
          { projects.map((project) => (
            <div
              key={ project.slug }
              className="border border-[#171717]/10 rounded-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{ project.title }</span>
                  { project.protected && (
                    <span className="text-xs px-2 py-0.5 bg-[#b997ce]/10 text-[#b997ce] rounded-sm">protected</span>
                  ) }
                </div>
                <div className="flex items-center gap-3 text-xs text-[#8d8d8d] mt-1 flex-wrap">
                  <span>{ project.slug }</span>
                  <span>{ new Date(project.date).toLocaleDateString('en-US', { timeZone: 'UTC' }) }</span>
                  <span>{ project.images.length } image{ project.images.length !== 1 ? 's' : '' }</span>
                  { project.types.length > 0 && (
                    <span>{ project.types.join(', ') }</span>
                  ) }
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={ () => onEdit(project) }
                  className="px-3 py-1.5 text-sm rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors duration-200"
                >
                  Edit
                </button>
                { confirmSlug === project.slug ? (
                  <div className="flex gap-1">
                    <button
                      onClick={ () => handleDelete(project.slug) }
                      disabled={ deletingSlug === project.slug }
                      className="px-3 py-1.5 text-sm rounded-sm bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 disabled:opacity-60"
                    >
                      { deletingSlug === project.slug ? 'Deleting...' : 'Confirm' }
                    </button>
                    <button
                      onClick={ () => setConfirmSlug(null) }
                      className="px-3 py-1.5 text-sm rounded-sm border border-[#171717]/20 hover:bg-[#171717]/5 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={ () => handleDelete(project.slug) }
                    className="px-3 py-1.5 text-sm rounded-sm border border-red-300 text-red-500 hover:bg-red-50 transition-colors duration-200"
                  >
                    Delete
                  </button>
                ) }
              </div>
            </div>
          )) }
        </div>
      ) }
    </div>
  );
}
