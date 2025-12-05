import 'server-only'

import { cookies } from 'next/headers';
import PasswordForm from '@/components/passwordForm/passwordForm';
import { verifyAuthToken } from '@/lib/auth';
import Gallery from '@/components/gallery/gallery';
import { secrets } from '@/lib/secrets';

export default async function Secrets() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const isAuthenticated = token ? verifyAuthToken(token) : false;

  return (
    <div className="relative w-full flex flex-col items-center space-y-4 px-8">
      <div className="w-full">
        { !isAuthenticated ? 
          <PasswordForm /> : 
          <Gallery images={ secrets } uriPrefix="/secrets" /> }
      </div>
    </div>
  );
}
