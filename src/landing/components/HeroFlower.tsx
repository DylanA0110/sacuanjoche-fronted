import { memo, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface HeroFlowerProps {
  isInView: boolean;
  shouldAnimate: boolean;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}

export const HeroFlower = memo(
  ({ isInView, shouldAnimate, prefersReducedMotion, isMobile }: HeroFlowerProps) => {
    const flowerRef = useRef<HTMLDivElement>(null);
    const rafId = useRef<number | null>(null);

    // Motion values para animación 3D - solo si no es móvil y está en viewport
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Transformaciones suaves - 3D elegante
    const rotateX = useTransform(
      y,
      [-50, 50],
      isMobile || !isInView ? [0, 0] : [-3, 3]
    );
    const rotateY = useTransform(
      x,
      [-50, 50],
      isMobile || !isInView ? [0, 0] : [3, -3]
    );
    const scale = useTransform(
      y,
      [-50, 50],
      isMobile || !isInView ? [1, 1] : [1.02, 1]
    );

    // Optimizar handleMove - usar RAF para mejor performance
    const rectRef = useRef<DOMRect | null>(null);
    const lastX = useRef(0);
    const lastY = useRef(0);

    const updateTransform = useCallback(() => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        x.set(lastX.current);
        y.set(lastY.current);
      });
    }, [x, y]);

    const handleMove = useCallback(
      (e: React.MouseEvent) => {
        if (prefersReducedMotion || !isInView || isMobile) return;

        // Cachear rect solo cuando cambia el tamaño de ventana
        if (!rectRef.current) {
          const rect = flowerRef.current?.getBoundingClientRect();
          if (!rect) return;
          rectRef.current = rect;
        }

        const rect = rectRef.current;
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);

        // Suavizar el movimiento
        lastX.current += (offsetX - lastX.current) * 0.1;
        lastY.current += (offsetY - lastY.current) * 0.1;

        updateTransform();
      },
      [prefersReducedMotion, isInView, isMobile, updateTransform]
    );

    const reset = useCallback(() => {
      lastX.current = 0;
      lastY.current = 0;
      x.set(0);
      y.set(0);
      rectRef.current = null;

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    }, [x, y]);

    // Limpiar RAF al desmontar
    useEffect(() => {
      return () => {
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      };
    }, []);

    // Estilos constantes - sombra más intensa para resaltar la flor
    const flowerShadow = {
      filter:
        'drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 0 30px rgba(80,200,120,0.3))',
    };

    return (
      <motion.div
        ref={flowerRef}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        initial={{ opacity: 0, x: 50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="flex justify-center lg:justify-end order-2 lg:order-2"
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          scale: prefersReducedMotion ? 1 : scale,
          transformStyle: 'preserve-3d',
          willChange: shouldAnimate ? 'transform' : 'auto',
        }}
      >
        <div className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] 2xl:max-w-[560px] mx-auto lg:mx-0">
          {/* Glow más intenso para resaltar la flor */}
          <div
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background:
                'radial-gradient(circle at center, rgba(80,200,120,0.25), rgba(80,200,120,0.15), transparent 70%)',
              transform: 'scale(1.2)',
              opacity: 0.7,
            }}
            aria-hidden="true"
          />

          {/* Imagen de la flor - animación simplificada (solo y, sin rotateZ simultáneo) */}
          <motion.img
            src="/Flor_de_sacuanjoche-.png"
            alt="Flor de Sacuanjoche"
            className="w-full h-auto relative z-10"
            loading="eager"
            decoding="async"
            width="500"
            height="500"
            style={{
              aspectRatio: '1/1',
              objectFit: 'contain',
              ...flowerShadow,
            }}
            initial={{ opacity: 0 }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    y: shouldAnimate ? [0, -3, 0] : 0,
                  }
                : { opacity: 0.5 }
            }
            transition={{
              opacity: { duration: 0.8, ease: 'easeOut' },
              y: shouldAnimate
                ? {
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    repeatType: 'reverse' as const,
                  }
                : { duration: 0 },
            }}
            whileHover={
              !prefersReducedMotion && isInView
                ? {
                    y: -8,
                    transition: { duration: 0.3 },
                  }
                : {}
            }
          />
        </div>
      </motion.div>
    );
  }
);

HeroFlower.displayName = 'HeroFlower';

