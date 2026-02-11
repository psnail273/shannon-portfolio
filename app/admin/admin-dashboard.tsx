'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectType } from '@/lib/types';
import AdminProjectList from '@/components/admin-project-list/admin-project-list';
import AdminProjectForm from '@/components/admin-project-form/admin-project-form';

type View = { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; project: ProjectType };

export default function AdminDashboard({ initialProjects }: { initialProjects: ProjectType[] }) {
  const [view, setView] = useState<View>({ mode: 'list' });
  const router = useRouter();

  const handleProjectsChange = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleEdit = useCallback((project: ProjectType) => {
    setView({ mode: 'edit', project });
  }, []);

  const handleCreate = useCallback(() => {
    setView({ mode: 'create' });
  }, []);

  const handleCancel = useCallback(() => {
    setView({ mode: 'list' });
  }, []);

  const handleSuccess = useCallback(() => {
    setView({ mode: 'list' });
    router.refresh();
  }, [router]);

  if (view.mode === 'create') {
    return (
      <AdminProjectForm
        onCancel={ handleCancel }
        onSuccess={ handleSuccess }
      />
    );
  }

  if (view.mode === 'edit') {
    return (
      <AdminProjectForm
        project={ view.project }
        onCancel={ handleCancel }
        onSuccess={ handleSuccess }
      />
    );
  }

  return (
    <AdminProjectList
      projects={ initialProjects }
      onEdit={ handleEdit }
      onCreate={ handleCreate }
      onProjectsChange={ handleProjectsChange }
    />
  );
}
