import { useState } from 'react';

interface ImageSkeletonProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageSkeleton({ src, alt, className = '' }: ImageSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 flex items-center justify-center rounded-inherit">
          <span className="text-xs text-gray-400 font-medium px-3 text-center">Image unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-inherit overflow-hidden">
          <div className="absolute inset-0 shimmer-effect" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  );
}
