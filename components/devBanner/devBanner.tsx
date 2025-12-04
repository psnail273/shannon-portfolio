'use client';

const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

export default function DevModeBanner() {
  if (!isDevMode) {
    return null;
  }

  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 bg-red-500 text-white text-center py-2 px-4 text-sm font-semibold">
      🚧 DEVELOPMENT MODE 🚧
    </div>
  );
}