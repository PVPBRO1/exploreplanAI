import { useEffect, useState } from 'react';

export function RouteLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(30), 50);
    const t2 = setTimeout(() => setProgress(60), 150);
    const t3 = setTimeout(() => setProgress(85), 300);
    const t4 = setTimeout(() => setProgress(95), 450);
    const t5 = setTimeout(() => setProgress(100), 550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-[#0073cf] to-[#00b4d8] transition-all ease-out"
          style={{
            width: `${progress}%`,
            transitionDuration: '350ms',
          }}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold tracking-tight">E</span>
          </div>
          <div className="absolute inset-0 w-12 h-12 rounded-2xl border-2 border-zinc-900/20 animate-ping" style={{ animationDuration: '1.5s' }} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-base font-semibold text-zinc-900 tracking-tight">ExplorePlan</p>
          <p className="text-sm text-gray-400">Preparing your experience...</p>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#0073cf] animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
