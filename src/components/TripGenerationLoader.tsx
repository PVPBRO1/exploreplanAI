import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fetchLocationImage } from '../lib/api/unsplash';

const STEPS = [
  'Optimizing your route, end to end',
  'Scanning 2000+ airlines for best value',
  'Reading 1B+ reviews for you',
  'Finding stays with the best deals',
  'Tailoring the plan to you',
];

const LOCAL_FALLBACK_IMAGES = [
  '/destinations/tokyo.jpg',
  '/destinations/paris.jpg',
  '/destinations/bali.jpg',
  '/destinations/rome.jpg',
  '/destinations/beach.jpg',
  '/destinations/london.jpg',
  '/destinations/dubai.jpg',
  '/destinations/nyc.jpg',
  '/destinations/sydney.jpg',
  '/destinations/marrakech.jpg',
];

const DEST_IMAGE_MAP: Record<string, string[]> = {
  japan: ['/destinations/tokyo.jpg'],
  tokyo: ['/destinations/tokyo.jpg'],
  kyoto: ['/destinations/tokyo.jpg'],
  osaka: ['/destinations/tokyo.jpg'],
  paris: ['/destinations/paris.jpg'],
  france: ['/destinations/paris.jpg'],
  bali: ['/destinations/bali.jpg'],
  indonesia: ['/destinations/bali.jpg'],
  rome: ['/destinations/rome.jpg'],
  italy: ['/destinations/rome.jpg', '/destinations/italian-village.jpg'],
  florence: ['/destinations/italian-village.jpg'],
  barcelona: ['/destinations/barcelona.jpg'],
  spain: ['/destinations/barcelona.jpg'],
  london: ['/destinations/london.jpg'],
  uk: ['/destinations/london.jpg'],
  dubai: ['/destinations/dubai.jpg'],
  'new york': ['/destinations/nyc.jpg'],
  sydney: ['/destinations/sydney.jpg'],
  australia: ['/destinations/sydney.jpg'],
  marrakech: ['/destinations/marrakech.jpg'],
  morocco: ['/destinations/marrakech.jpg'],
  egypt: ['/destinations/egypt.jpg'],
  cairo: ['/destinations/egypt.jpg'],
  nepal: ['/destinations/nepal.jpg'],
  portugal: ['/destinations/porto.jpg'],
  lisbon: ['/destinations/porto.jpg'],
  porto: ['/destinations/porto.jpg'],
  mexico: ['/destinations/mexico.jpg'],
  maldives: ['/destinations/beach.jpg'],
  greece: ['/destinations/beach.jpg'],
  iceland: ['/destinations/nepal.jpg'],
  'cape town': ['/destinations/beach.jpg'],
  'south africa': ['/destinations/beach.jpg'],
  thailand: ['/destinations/bali.jpg'],
  bangkok: ['/destinations/bali.jpg'],
  peru: ['/destinations/nepal.jpg'],
  singapore: ['/destinations/dubai.jpg'],
};

function getLocalImagesForDest(dest?: string): string[] {
  if (!dest) return [];
  const lower = dest.toLowerCase();
  for (const [key, imgs] of Object.entries(DEST_IMAGE_MAP)) {
    if (lower.includes(key)) return imgs;
  }
  return [];
}

const CARD_ROTATIONS = [-6, 4, -3, 5];
const CARD_BORDERS = [
  'border-rose-200/70',
  'border-pink-200',
  'border-rose-100',
  'border-pink-100',
];

interface TripGenerationLoaderProps {
  isActive: boolean;
  departureCity?: string;
  destination?: string;
  dataReady?: boolean;
  progress?: number;
  stageLabel?: string;
  onComplete?: () => void;
}

function progressToCompletedSteps(p: number): number {
  if (p >= 100) return STEPS.length;
  if (p >= 85) return 4;
  if (p >= 65) return 3;
  if (p >= 45) return 2;
  if (p >= 25) return 1;
  return 0;
}

function ShimmerBar() {
  return (
    <div className="relative h-1 w-24 rounded-full overflow-hidden bg-slate-200/50 ml-auto">
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-rose-300/60 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

function LoaderImage({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);

  return (
    <img
      ref={imgRef}
      src={failed ? fallback : src}
      alt={alt}
      className="w-full h-full object-cover"
      loading="eager"
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
}

export function TripGenerationLoader({
  isActive,
  destination,
  dataReady,
  progress = 0,
  onComplete,
}: TripGenerationLoaderProps) {
  const [completeCalled, setCompleteCalled] = useState(false);
  const [destImages, setDestImages] = useState<string[]>([]);

  const completedSteps = useMemo(() => progressToCompletedSteps(progress), [progress]);

  const localDestImages = useMemo(() => getLocalImagesForDest(destination), [destination]);

  const loadDestImages = useCallback(async () => {
    if (!destination) return;
    try {
      const [img1, img2] = await Promise.allSettled([
        fetchLocationImage(`${destination} scenic landscape`),
        fetchLocationImage(`${destination} travel`),
      ]);
      const urls: string[] = [];
      if (img1.status === 'fulfilled' && img1.value && !img1.value.startsWith('/destinations'))
        urls.push(img1.value);
      if (img2.status === 'fulfilled' && img2.value && !img2.value.startsWith('/destinations'))
        urls.push(img2.value);
      if (urls.length > 0) setDestImages(urls);
    } catch {
      /* local fallbacks handle it */
    }
  }, [destination]);

  useEffect(() => {
    if (!isActive) {
      setCompleteCalled(false);
      return;
    }
    loadDestImages();
  }, [isActive, loadDestImages]);

  useEffect(() => {
    if (!isActive) return;
    if (dataReady && progress >= 100 && !completeCalled) {
      setCompleteCalled(true);
      const t = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(t);
    }
  }, [isActive, dataReady, progress, completeCalled, onComplete]);

  if (!isActive) return null;

  const baseLocal = localDestImages.length > 0 ? localDestImages : [LOCAL_FALLBACK_IMAGES[0], LOCAL_FALLBACK_IMAGES[1]];
  const images = [
    destImages[0] || baseLocal[0] || LOCAL_FALLBACK_IMAGES[0],
    destImages[1] || baseLocal[1] || baseLocal[0] || LOCAL_FALLBACK_IMAGES[1],
    baseLocal[0] || LOCAL_FALLBACK_IMAGES[2],
    baseLocal[1] || baseLocal[0] || LOCAL_FALLBACK_IMAGES[3],
  ];

  const headline = destination
    ? `Building your ${destination} trip`
    : 'Building your trip';

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-rose-50 via-pink-50/60 to-fuchsia-50/40 px-6">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 text-center mb-8 leading-snug max-w-md">
        {headline}
      </h2>

      <div className="flex items-center justify-center gap-3 mb-10">
        {images.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            initial={{ opacity: 0, scale: 0.85, rotate: CARD_ROTATIONS[i] }}
            animate={{ opacity: 1, scale: 1, rotate: CARD_ROTATIONS[i] }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={`w-28 h-32 md:w-36 md:h-40 rounded-2xl overflow-hidden border-[3px] ${CARD_BORDERS[i]} shadow-lg bg-white`}
          >
            <LoaderImage
              src={src}
              fallback={LOCAL_FALLBACK_IMAGES[i % LOCAL_FALLBACK_IMAGES.length]}
              alt=""
            />
          </motion.div>
        ))}
      </div>

      <div className="space-y-3 w-full max-w-sm">
        {STEPS.map((step, i) => {
          const isDone = i < completedSteps;
          const isCurrent = i === completedSteps && completedSteps < STEPS.length;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                isDone
                  ? 'bg-emerald-500'
                  : isCurrent
                    ? 'border-2 border-rose-300 bg-white'
                    : 'border-2 border-gray-200 bg-white'
              }`}>
                {isDone && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                {isCurrent && (
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-rose-400"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
              </div>

              <span className={`text-sm transition-colors duration-300 flex-1 ${
                isDone
                  ? 'text-slate-800 font-semibold'
                  : isCurrent
                    ? 'text-slate-600 font-medium'
                    : 'text-slate-400'
              }`}>
                {step}
              </span>

              {isCurrent && <ShimmerBar />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
