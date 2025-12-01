import { useRef, useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { HeroBackground } from './HeroBackground';
import { HeroParticles } from './HeroParticles';
import { HeroFlower } from './HeroFlower';
import { HeroText } from './HeroText';

export const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // useInView optimizado - solo se activa una vez para mejor performance
  const isInView = useInView(heroRef, {
    margin: '-10%',
    once: true,
    amount: 0.3,
  });

  // Detectar si es móvil y prefers-reduced-motion - optimizado con debounce
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };

    checkMobile();
    checkReducedMotion();

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', checkReducedMotion);

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(resizeTimeout);
      mediaQuery.removeEventListener('change', checkReducedMotion);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Determinar si se deben mostrar animaciones
  const shouldAnimate = useMemo(
    () => !prefersReducedMotion && isInView && !isMobile,
    [prefersReducedMotion, isInView, isMobile]
  );

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen flex items-center overflow-x-hidden overflow-y-auto sm:overflow-hidden pt-24 sm:pt-20 pb-12 sm:pb-16"
    >
      <HeroBackground shouldAnimate={shouldAnimate} />

      <HeroParticles shouldAnimate={shouldAnimate} isMobile={isMobile} />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 sm:pt-12 sm:pb-12 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          <HeroFlower
            isInView={isInView}
            shouldAnimate={shouldAnimate}
            prefersReducedMotion={prefersReducedMotion}
            isMobile={isMobile}
          />

          <HeroText
            isInView={isInView}
            shouldAnimate={shouldAnimate}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>

      {/* Scroll indicator - solo animar si está en viewport */}
      {isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block"
        >
          <a
            href="#servicios"
            className="group flex flex-col items-center gap-1.5 sm:gap-2"
            style={
              shouldAnimate
                ? {
                    animation: 'scrollBounce 2.5s ease-in-out infinite',
                  }
                : {}
            }
          >
            <span className="text-[10px] xs:text-xs text-[#4a4a4a] uppercase tracking-wider font-medium">
              Explora
            </span>
            <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-[#50C878]/30 rounded-full flex items-start justify-center p-1.5 sm:p-2 hover:border-[#50C878]/50 transition-colors backdrop-blur-sm group-hover:border-[#50C878]">
              <HiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#50C878] group-hover:text-[#00A87F] transition-colors" />
            </div>
          </a>
        </motion.div>
      )}
    </section>
  );
};
