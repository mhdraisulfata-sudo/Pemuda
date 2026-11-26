import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { safeUrl } from '../data/seed';
import type { Destination } from '../types/tourism';

interface HeroDestinationSlideshowProps {
  destinations: Destination[];
  fallbackImage: string;
  onSelectDestination: (dest: Destination) => void;
}

export function HeroDestinationSlideshow({
  destinations,
  fallbackImage,
  onSelectDestination,
}: HeroDestinationSlideshowProps) {
  const prefersReducedMotion = useReducedMotion();
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const [fallbackFailed, setFallbackFailed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    if (slides.length <= 1 || isPaused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length, isPaused, prefersReducedMotion]);

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
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative rounded-xl overflow-hidden aspect-[16/9] lg:aspect-[16/8] border border-[#1d352d] photo-gradient card-shadow"
    >
      <AnimatePresence mode="sync">
        {current && !fallbackFailed ? (
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
              opacity: { duration: 0.75, ease: 'easeInOut' },
              scale: { duration: 5.2, ease: 'linear' },
            }}
            onClick={() => onSelectDestination(current)}
            className="absolute inset-0 w-full h-full object-cover block cursor-pointer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#7bc9ad] p-6">
            <MapPin className="w-8 h-8 opacity-80" strokeWidth={1.5} />
            <span className="font-display text-base font-semibold">
              {current?.nama || 'Destinasi Aceh'}
            </span>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

      {slides.length > 1 && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Destinasi sebelumnya"
            className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 border border-white/15 text-white inline-grid place-items-center cursor-pointer transition-colors backdrop-blur-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Destinasi berikutnya"
            className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 border border-white/15 text-white inline-grid place-items-center cursor-pointer transition-colors backdrop-blur-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {current && (
        <div className="absolute bottom-0 inset-x-0 px-4 py-3 text-white flex items-end justify-between gap-4 z-10">
          <button
            type="button"
            onClick={() => onSelectDestination(current)}
            className="text-left bg-transparent border-0 p-0 cursor-pointer min-w-0"
          >
            <motion.div
              key={`caption-${current.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="font-display text-base font-semibold text-white hover:text-[#4ae3b1] transition-colors truncate">
                {current.nama}
              </div>
              <div className="text-[11px] text-white/80 capitalize truncate">
                {current.wilayah} · {current.kategori}
              </div>
            </motion.div>
          </button>

          {slides.length > 1 && (
            <div
              className="flex items-center gap-1.5 shrink-0 pb-1"
              aria-label="Pilih slide destinasi"
            >
              {slides.slice(0, 8).map((s, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Tampilkan ${s.nama}`}
                    className={`h-1.5 rounded-full border-0 p-0 cursor-pointer transition-all duration-200 ${
                      isActive
                        ? 'w-5 bg-[#3ad19e]'
                        : 'w-1.5 bg-white/45 hover:bg-white/75'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
