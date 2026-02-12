import { cookies } from 'next/headers';
import { getProjects } from '@/lib/db';
import { verifyAdminAuthToken } from '@/lib/auth';
import AdminDashboard from './admin-dashboard';
import AdminPasswordForm from '@/components/adminPasswordForm/adminPasswordForm';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('adminAuthToken')?.value;
  const isAdminAuthenticated = adminToken ? verifyAdminAuthToken(adminToken) : false;

  if (!isAdminAuthenticated) {
    return (
      <div className="flex flex-col gap-6 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
        <h1 className="text-3xl sm:text-4xl font-playfair">Admin</h1>
        <AdminPasswordForm />
      </div>
    );
  }

  const projects = await getProjects();

  return (
    <div className="flex flex-col gap-6 py-2 sm:py-4 md:py-8 xl:py-12 px-8">
      <h1 className="text-3xl sm:text-4xl font-playfair">Admin</h1>
      <AdminDashboard initialProjects={ projects } />
    </div>
  );
}
