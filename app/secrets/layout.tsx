import 'server-only';

import type { ReactNode } from 'react';
import { cookies } from 'next/headers';

import PasswordForm from '@/components/passwordForm/passwordForm';
import { verifyAuthToken } from '@/lib/auth';

export default async function SecretsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const isAuthenticated = token ? verifyAuthToken(token) : false;

  return (
    <div className="relative w-full flex flex-col items-center space-y-4 px-8">
      <div className="w-full">
        { isAuthenticated ? children : <PasswordForm /> }
      </div>
    </div>
  );
}


