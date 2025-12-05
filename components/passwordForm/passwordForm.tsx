'use client';

import { useState } from 'react';

export default function PasswordForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message);
        return;
      }

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Wrong password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={ handleSubmit } className="w-full max-w-sm space-y-4 ">
        <div className="space-y-2">
          <label htmlFor="password">Enter Password (hint: &quot;SecretShannon&quot;)</label>
          <input
            type="password"
            id="password"
            value={ password }
            onChange={ (e) => setPassword(e.target.value) }
            className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2"
            placeholder="Enter password"
            required
          />
        </div>
        { error && <p className="text-red-500 text-center">{ error }</p> }
        <button
          type="submit"
          className="w-1/2 mx-auto block border rounded-md bg-green-500"
          disabled={ isLoading }
        >
          { isLoading ? 'Verifying...' : 'Submit' }
        </button>
      </form>
    </div>
  );
}
