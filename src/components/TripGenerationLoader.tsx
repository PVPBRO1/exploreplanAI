import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Building2, MapPin, Sparkles, CheckCircle } from 'lucide-react';

interface Stage {
  label: string;
  icon: typeof Plane;
  progress: number;
}

const STAGES: Stage[] = [
  { label: 'Building your itinerary...', icon: MapPin, progress: 25 },
  { label: 'Scanning flights for best value...', icon: Plane, progress: 45 },
  { label: 'Finding the best stays...', icon: Building2, progress: 65 },
  { label: 'Adding local experiences...', icon: Sparkles, progress: 85 },
  { label: 'Finalizing your trip...', icon: CheckCircle, progress: 100 },
];

interface TripGenerationLoaderProps {
  isActive: boolean;
  departureCity?: string;
  destination?: string;
  onComplete?: () => void;
}

export function TripGenerationLoader({ isActive, departureCity, destination, onComplete }: TripGenerationLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setStageIndex(0);
      setProgress(0);
      return;
    }

    const stageTimers = [2500, 2500, 2500, 2000, 1500];
    let currentStage = 0;

    const advance = () => {
      if (currentStage < STAGES.length - 1) {
        currentStage++;
        setStageIndex(currentStage);
        setProgress(STAGES[currentStage].progress);

        if (currentStage < STAGES.length - 1) {
          setTimeout(advance, stageTimers[currentStage]);
        } else {
          setTimeout(() => onComplete?.(), 1000);
        }
      }
    };

    setStageIndex(0);
    setProgress(STAGES[0].progress);
    const timer = setTimeout(advance, stageTimers[0]);

    return () => clearTimeout(timer);
  }, [isActive, onComplete]);

  if (!isActive) return null;

  const stage = STAGES[stageIndex];
  const Icon = stage.icon;

  const labelWithContext = stage.label
    .replace('flights', departureCity ? `flights from ${departureCity}` : 'flights')
    .replace('best stays', destination ? `stays in ${destination}` : 'the best stays');

  return (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="w-full max-w-sm space-y-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={stageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
              <Icon className="w-7 h-7 text-violet-600" />
            </div>
            <p className="text-lg font-medium text-gray-800">{labelWithContext}</p>
          </motion.div>
        </AnimatePresence>

        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <p className="text-center text-sm text-gray-400">
          Trip is being generated — {progress}%
        </p>
      </div>
    </div>
  );
}
