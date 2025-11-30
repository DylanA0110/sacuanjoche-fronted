import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useState, useEffect, useMemo, useCallback } from 'react';
import img1 from '../../assets/Galeria/1.jpg';
import img2 from '../../assets/Galeria/2.jpg';
import img4 from '../../assets/Galeria/4.jpg';
import img5 from '../../assets/Galeria/5.jpg';
import img6 from '../../assets/Galeria/6.jpg';
import img8 from '../../assets/Galeria/8.jpg';
import img9 from '../../assets/Galeria/9.jpg';
import img10 from '../../assets/Galeria/10.jpg';
import img11 from '../../assets/Galeria/11.jpg';

interface GalleryImage {
  id: number;
  image: string;
  bgImage: string;
  title: string;
  subtitle: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 0,
    image: img1,
    bgImage: img1,
    title: 'BODAS | COLECCIÓN',
    subtitle: 'Diseñamos la celebración perfecta',
  },
  {
    id: 1,
    image: img2,
    bgImage: img2,
    title: 'AMOR Y PASIÓN',
    subtitle: 'Ramos que expresan sentimientos',
  },

  {
    id: 3,
    image: img4,
    bgImage: img4,
    title: 'RAMOS EXCLUSIVOS',
    subtitle: 'Arreglos únicos y personalizados',
  },
  {
    id: 4,
    image: img5,
    bgImage: img5,
    title: 'EVENTOS ESPECIALES',
    subtitle: 'Decoración integral con flores',
  },
  {
    id: 5,
    image: img6,
    bgImage: img6,
    title: 'OBSEQUIOS ÚNICOS',
    subtitle: 'El detalle ideal para expresar amor',
  },
  {
    id: 6,
    image: img8,
    bgImage: img8,
    title: 'BOUQUETS PREMIUM',
    subtitle: 'Calidad y elegancia en cada diseño',
  },
  {
    id: 7,
    image: img9,
    bgImage: img9,
    title: 'ARREGLOS ESPECIALES',
    subtitle: 'Diseños que reflejan tu estilo',
  },
  {
    id: 8,
    image: img10,
    bgImage: img10,
    title: 'RAMOS EXCLUSIVOS',
    subtitle: 'Arreglos frescos y personalizados',
  },
  {
    id: 9,
    image: img11,
    bgImage: img11,
    title: 'COLECCIÓN PREMIUM',
    subtitle: 'Flores que transforman momentos',
  },
];

export const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [backgroundImage, setBackgroundImage] = useState(
    galleryImages[0].bgImage
  );
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.65);
  const [isMobile, setIsMobile] = useState(false);

  // Memoizar partículas para evitar recálculos
  const particles = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 3 }).map((_, i) => ({
      key: `gallery-particle-${i}`,
      size: 2 + (i % 2),
      delay: i * 1.2,
      duration: 14 + i * 2,
      x: (i * 350) % (window.innerWidth || 1920),
      y: (i * 400) % (window.innerHeight || 1080),
      opacity: 0.15 + (i % 2) * 0.08,
    }));
  }, []);

  // Optimizado: memoizar checkMobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loop infinito automático - SOLO cuando la galería está visible - más rápido
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    let observer: IntersectionObserver | null = null;
    const gallerySection = document.getElementById('galeria');

    if (!gallerySection) return;

    // Intersection Observer para detectar cuando está visible
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Solo iniciar intervalo cuando está visible - reducido a 3 segundos
            interval = setInterval(() => {
              setActiveIndex((prev) => (prev + 1) % galleryImages.length);
            }, 3000);
          } else {
            // Limpiar intervalo cuando no está visible
            if (interval) {
              clearInterval(interval);
            }
          }
        });
      },
      { threshold: 0.3 } // Se activa cuando 30% está visible
    );

    observer.observe(gallerySection);

    return () => {
      if (interval) clearInterval(interval);
      if (observer) observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setBackgroundImage(galleryImages[activeIndex].bgImage);
    const opacityVariation = 0.55 + (activeIndex % 3) * 0.1;
    setBackgroundOpacity(opacityVariation);
  }, [activeIndex]);

  const goToNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  }, []);

  const goToPrev = useCallback(() => {
    setActiveIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
    );
  }, []);

  const goToCard = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // Memoizar transformaciones para mejor rendimiento
  const getCardTransform = useCallback(
    (index: number) => {
      const distance = index - activeIndex;
      const absDistance = Math.abs(distance);

      if (isMobile) {
        if (absDistance === 0) {
          return { scale: 1, rotateY: 0, x: 0, z: 0, opacity: 1 };
        } else if (absDistance === 1) {
          return {
            scale: 0.85,
            rotateY: distance > 0 ? 10 : -10,
            x: distance * 180,
            z: -50,
            opacity: 0.7,
          };
        } else {
          return {
            scale: 0,
            rotateY: 0,
            x: 0,
            z: -200,
            opacity: 0,
            pointerEvents: 'none' as const,
          };
        }
      }

      if (absDistance > 2) {
        return {
          scale: 0,
          rotateY: 0,
          x: 0,
          z: -500,
          opacity: 0,
          pointerEvents: 'none' as const,
        };
      }

      if (absDistance === 0) {
        return { scale: 1, rotateY: 0, x: 0, z: 0, opacity: 1 };
      } else if (absDistance === 1) {
        return {
          scale: 0.82,
          rotateY: distance > 0 ? 15 : -15,
          x: distance * 240,
          z: -80,
          opacity: 0.9,
        };
      } else {
        return {
          scale: 0.65,
          rotateY: distance > 0 ? 22 : -22,
          x: distance * 380,
          z: -160,
          opacity: 0.6,
        };
      }
    },
    [activeIndex, isMobile]
  );

  const cardSize = useMemo(() => {
    if (typeof window === 'undefined') {
      return { width: '280px', height: '370px' };
    }
    const width = window.innerWidth;
    if (width < 640) {
      return { width: '260px', height: '350px' };
    } else if (width < 1024) {
      return { width: '320px', height: '420px' };
    } else if (width < 1280) {
      return { width: '380px', height: '500px' };
    } else if (width < 1536) {
      return { width: '420px', height: '560px' };
    }
    return { width: '460px', height: '600px' };
  }, [isMobile]);

  return (
    <section
      id="galeria"
      className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 sm:pb-24 lg:pb-32 relative overflow-hidden min-h-screen flex items-center bg-linear-to-b from-[#0f0b0a] via-[#141010] to-[#0f0b0a]"
    >
      {/* Textura sutil de fondo premium */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(80, 200, 120, 0.3) 1px, transparent 1px), radial-gradient(circle at 80% 50%, rgba(255, 215, 0, 0.2) 1px, transparent 1px)`,
          backgroundSize: '120px 120px, 150px 150px',
        }}
      />

      {/* Partículas flotantes optimizadas - reducidas de 5 a 3 */}
      {particles.map((particle) => (
        <motion.div
          key={particle.key}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: `rgba(80, 200, 120, ${particle.opacity})`,
            boxShadow: `0 0 ${particle.size * 3}px rgba(80, 200, 120, 0.25)`,
            willChange: 'transform, opacity',
          }}
          initial={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
          }}
          animate={{
            x: [
              particle.x,
              (particle.x + 180) %
                (typeof window !== 'undefined' ? window.innerWidth : 1920),
              particle.x,
            ],
            y: [
              particle.y,
              (particle.y - 280) %
                (typeof window !== 'undefined' ? window.innerHeight : 1080),
              particle.y,
            ],
            opacity: [0, 0.3, 0.5, 0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Dynamic Background con opacidad variable */}
      <AnimatePresence mode="wait">
        <motion.div
          key={backgroundImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
          style={{ willChange: 'opacity' }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              filter: 'blur(40px) brightness(0.25) saturate(1.2)',
              transform: 'scale(1.4)',
              willChange: 'opacity',
            }}
          />
          <motion.div
            className="absolute inset-0 bg-[#0D0D0D]"
            animate={{ opacity: backgroundOpacity }}
            transition={{ duration: 1.5 }}
            style={{ willChange: 'opacity' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Resplandor verde difuso - reducido blur */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#50C878]/15 blur-[80px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl">
        {/* Layout: Mobile centrado, Desktop dividido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Header con jerarquía mejorada */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center lg:text-left order-2 lg:order-1 max-w-lg"
          >
            <h2 className="font-sans text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-tight mb-4 tracking-tight">
              Nuestra <span className="text-[#50C878]">Galería</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg lg:text-xl leading-relaxed">
              Descubre la pasión de{' '}
              <span className="text-white/90">Sacuanjoche</span>. Proyectos con
              amor y dedicación.
            </p>
          </motion.div>

          {/* 3D Carousel optimizado */}
          <div className="order-1 lg:order-2 w-full">
            <div className="relative w-full overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] 2xl:h-[650px] flex items-center justify-center mx-auto group/carousel"
                style={{
                  perspective: isMobile ? '1000px' : '1400px',
                  maxWidth: '100%',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {galleryImages.map((image, index) => {
                    const transform = getCardTransform(index);
                    const isActive = index === activeIndex;
                    const absDistance = Math.abs(index - activeIndex);

                    return (
                      <motion.div
                        key={image.id}
                        initial={false}
                        animate={{
                          scale: transform.scale,
                          rotateY: transform.rotateY,
                          x: transform.x,
                          z: transform.z,
                          opacity: transform.opacity,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                        style={{
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center center',
                          pointerEvents: transform.pointerEvents || 'auto',
                          willChange:
                            absDistance <= 2 ? 'transform, opacity' : 'auto',
                        }}
                        className="absolute cursor-pointer"
                        onClick={() => goToCard(index)}
                        whileHover={
                          isActive && transform.opacity > 0
                            ? {
                                scale: 1.03,
                                y: -5,
                                transition: { duration: 0.3, ease: 'easeOut' },
                              }
                            : transform.opacity > 0
                            ? {
                                scale: transform.scale * 1.03,
                                y: -5,
                                transition: { duration: 0.3, ease: 'easeOut' },
                              }
                            : {}
                        }
                      >
                        <div
                          className="relative rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-500 group/card"
                          style={{
                            width: cardSize.width,
                            height: cardSize.height,
                          }}
                        >
                          <img
                            src={image.image}
                            alt={image.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                            loading={
                              index <= activeIndex + 2 &&
                              index >= activeIndex - 2
                                ? 'eager'
                                : 'lazy'
                            }
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent group-hover/card:from-black/70 transition-all duration-500" />
                          {/* Resplandor verde al hover */}
                          <div
                            className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                            style={{
                              boxShadow:
                                'inset 0 0 60px rgba(80, 200, 120, 0.2), 0 0 40px rgba(80, 200, 120, 0.3)',
                            }}
                          />
                          <div
                            className={`absolute inset-0 flex flex-col justify-end p-4 sm:p-6 lg:p-8 ${
                              isActive ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300`}
                          >
                            <h3 className="text-white font-hero text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-1 sm:mb-2">
                              {image.title}
                            </h3>
                            <p className="text-white/95 text-xs sm:text-sm md:text-base lg:text-lg">
                              {image.subtitle}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Navigation Arrows - Visibles siempre, especialmente en mobile */}
                <motion.button
                  onClick={goToPrev}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute left-2 sm:left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-300 opacity-100 md:opacity-70 md:group-hover/carousel:opacity-100"
                  aria-label="Previous image"
                >
                  <HiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.button>

                <motion.button
                  onClick={goToNext}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 sm:right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-300 opacity-100 md:opacity-70 md:group-hover/carousel:opacity-100"
                  aria-label="Next image"
                >
                  <HiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.button>
              </motion.div>
            </div>

            {/* Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex justify-center gap-2 mt-6 sm:mt-8"
            >
              {galleryImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToCard(index)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-8 sm:w-10 bg-[#50C878]'
                      : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
