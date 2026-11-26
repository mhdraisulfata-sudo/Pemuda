import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { safeUrl } from '../data/seed';
import type { Destination } from '../types/tourism';

interface HeroDestinationBackdropProps {
  destinations: Destination[];
  fallbackImage: string;
  onInspectCurrent?: (dest: Destination) => void;
}

export function HeroDestinationSlideshow({
  destinations,
  fallbackImage,
  onInspectCurrent,
}: HeroDestinationBackdropProps) {
  const prefersReducedMotion = useReducedMotion();
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => {
    const withValidImg = destinations.filter((d) => Boolean(safeUrl(d.imageUrl)));
    if (withValidImg.length > 0) {
      return [...withValidImg].sort(
        (a, b) => Number(Boolean(b.unggulan)) - Number(Boolean(a.unggulan))
      );
    }
    return destinations;
  }, [destinations]);

  const safeIndex = slides.length > 0 ? activeIndex % slides.length : 0;
  const current = slides[safeIndex] || null;

  useEffect(() => {
    if (slides.length <= 1 || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length, prefersReducedMotion]);

  const handlePrev = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const rawImg = current ? safeUrl(current.imageUrl) : '';
  const imgSrc =
    current && !failedIds[current.id] && rawImg ? rawImg : fallbackImage;

  return (
    <>
      <div className="absolute inset-0 overflow-hidden bg-[#06182c]">
        <AnimatePresence mode="sync">
          {current && !fallbackFailed && (
            <motion.img
              key={`${current.id}-${safeIndex}`}
              src={imgSrc}
              alt={current.nama}
              referrerPolicy="no-referrer"
              onError={() => {
                if (current && !failedIds[current.id] && rawImg) {
                  setFailedIds((prev) => ({ ...prev, [current.id]: true }));
                } else {
                  setFallbackFailed(true);
                }
              }}
              initial={
                prefersReducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 1.02 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, scale: 1.08 }
              }
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.9, ease: 'easeInOut' },
                scale: { duration: 5.5, ease: 'linear' },
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-[#041527]/75 via-[#072138]/55 to-[#041527]/80"
        />
      </div>

      {current && slides.length > 0 && (
        <div className="relative z-10 w-[min(1140px,92%)] mx-auto mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/85">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Destinasi sebelumnya"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white inline-grid place-items-center cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onInspectCurrent?.(current)}
            className="bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-xs rounded-full px-4 py-1 text-xs text-white cursor-pointer transition-colors"
          >
            {current.nama} · {current.wilayah}
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Destinasi berikutnya"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 text-white inline-grid place-items-center cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
