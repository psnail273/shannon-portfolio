import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createAuthToken, TOKEN_EXPIRY_SECONDS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const data: { password: string } = await request.json();
  const password = data.password;

  if (password !== process.env.PASSWORD) {
    return new Response(
      JSON.stringify({ message: 'Incorrect password. Please try again.' }),
      {
        status: 401,
      }
    );
  }

  const token = createAuthToken();

  const cookie = (await cookies()).set('authToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: '/',
  });

  return new Response(JSON.stringify({ message: 'Authenticated' }), {
    status: 200,
    headers: {
      'Set-Cookie': cookie.toString(),
    },
  });
}
