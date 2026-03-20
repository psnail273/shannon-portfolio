'use client';

import { useState } from 'react';

export default function AdminPasswordForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin-password', {
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
      <p className="text-sm text-foreground/60 mb-4">Admin access required</p>
      <form onSubmit={ handleSubmit } className="flex flex-col gap-2 w-full max-w-sm">
        <div className="space-y-3">
          <input
            type="password"
            id="admin-password"
            value={ password }
            onChange={ (e) => setPassword(e.target.value) }
            className="w-full rounded-sm border border-border px-4 py-3 text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
            placeholder="Enter admin password"
            required
          />
        </div>
        { error && <p className="text-error text-center text-sm">{ error }</p> }
        <button
          type="submit"
          className="w-full py-3 rounded-sm bg-accent text-white font-medium hover:bg-accent-hover transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={ isLoading }
        >
          { isLoading ? 'Verifying...' : 'Submit' }
        </button>
      </form>
    </div>
  );
}
