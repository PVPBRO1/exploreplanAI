import { useState } from 'react';

interface ImageSkeletonProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageSkeleton({ src, alt, className = '' }: ImageSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-inherit" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
