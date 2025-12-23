export default function Loading() {
  return (
    <div className="flex h-32 items-center justify-center bg-background z-50">
      <div className="w-1/4 h-0.5 rounded-full overflow-hidden relative bg-[#b997ce]/20">
        <div 
          className="absolute inset-y-0 bg-[#b997ce]"
          style={ {
            animation: 'loading-bar 2s ease-in-out infinite',
          } }
        />
      </div>
      <style>
        { `
          @keyframes loading-bar {
            0% { width: 0%; left: 0%; }
            20% { width: 100%; left: 0%; }
            50% { width: 100%; left: 0%; }
            70% { width: 0%; left: 100%; }
            100% { width: 0%; left: 100%; }
          }
        ` }
      </style>
    </div>
  );
}
