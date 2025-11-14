import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { HiChevronDown, HiArrowRight } from 'react-icons/hi';
import { useMemo, useRef, useState, useEffect } from 'react';

export const Hero = () => {
  const flowerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // useInView de Framer Motion - más eficiente que Intersection Observer manual
  const isInView = useInView(heroRef, { margin: '-20%', once: false });

  // Detectar si es móvil y prefers-reduced-motion
  useEffect(() => {
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
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', checkReducedMotion);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Motion values para animación 3D fluida - optimizado
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transformaciones suaves - 3D elegante estilo Starbucks
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

  // Optimizar handleMove - cachear getBoundingClientRect
  const rectRef = useRef<DOMRect | null>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion || !isInView) return;

    // Cachear rect para evitar múltiples llamadas
    if (!rectRef.current) {
      const rect = flowerRef.current?.getBoundingClientRect();
      if (!rect) return;
      rectRef.current = rect;
      // Resetear cache después de un tiempo
      setTimeout(() => {
        rectRef.current = null;
      }, 100);
    }

    const rect = rectRef.current;
    const offsetX = e.clientX - (rect.left + rect.width / 2);
    const offsetY = e.clientY - (rect.top + rect.height / 2);

    x.set(offsetX);
    y.set(offsetY);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
    rectRef.current = null;
  };

  // Estilos constantes - sombra más intensa para resaltar la flor
  const flowerShadow = {
    filter:
      'drop-shadow(0 20px 40px rgba(0,0,0,0.2)) drop-shadow(0 0 30px rgba(80,200,120,0.3))',
  };

  // Partículas para CSS animations
  const particles = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return Array.from({ length: 4 }).map((_, i) => {
      const size = 5 + (i % 3) * 1.5;
      const delay = i * 0.8;
      const duration = 12 + (i % 2) * 2;
      const x = (i * 300) % (window.innerWidth || 1920);
      const y = (i * 350) % (window.innerHeight || 1080);

      const colors = [
        { main: 'rgba(233, 30, 99, 0.3)', shadow: 'rgba(233, 30, 99, 0.4)' },
        { main: 'rgba(255, 215, 0, 0.25)', shadow: 'rgba(255, 215, 0, 0.35)' },
        { main: 'rgba(0, 168, 127, 0.25)', shadow: 'rgba(0, 168, 127, 0.35)' },
        { main: 'rgba(255, 215, 0, 0.4)', shadow: 'rgba(255, 215, 0, 0.6)' },
      ];
      const color = colors[i % colors.length];
      const isSparkle = i === 3;

      return {
        key: `particle-${i}`,
        size,
        delay,
        duration,
        x,
        y,
        color,
        isSparkle,
      };
    });
  }, []);

  // Determinar si se deben mostrar animaciones
  const shouldAnimate = !prefersReducedMotion && isInView && !isMobile;

  return (
    <section
      ref={heroRef}
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden pt-16 sm:pt-20 pb-12 sm:pb-16"
    >
      {/* Fondo claro con más contraste para resaltar la flor */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to bottom, #f0f0f0 0%, #ffffff 50%, #f8f8f8 100%)',
        }}
      />

      {/* Animación de blob SVG - colores más intensos para resaltar la flor */}
      <svg
        className="absolute inset-0 w-full h-full -z-10 opacity-50"
        preserveAspectRatio="xMidYMid slice"
        viewBox="10 10 80 80"
        style={{ mixBlendMode: 'multiply' }}
      >
        {/* Verde principal más intenso */}
        <path
          fill="#50C878"
          className="hero-out-top"
          d="M37-5C25.1-14.7,5.7-19.1-9.2-10-28.5,1.8-32.7,31.1-19.8,49c15.5,21.5,52.6,22,67.2,2.3C59.4,35,53.7,8.5,37-5Z"
          opacity="0.6"
        />
        {/* Amarillo claro más visible */}
        <path
          fill="#FFE082"
          className="hero-in-top"
          d="M20.6,4.1C11.6,1.5-1.9,2.5-8,11.2-16.3,23.1-8.2,45.6,7.4,50S42.1,38.9,41,24.5C40.2,14.1,29.4,6.6,20.6,4.1Z"
          opacity="0.5"
        />
        {/* Verde esmeralda más intenso */}
        <path
          fill="#00A87F"
          className="hero-out-bottom"
          d="M105.9,48.6c-12.4-8.2-29.3-4.8-39.4.8-23.4,12.8-37.7,51.9-19.1,74.1s63.9,15.3,76-5.6c7.6-13.3,1.8-31.1-2.3-43.8C117.6,63.3,114.7,54.3,105.9,48.6Z"
          opacity="0.45"
        />
        {/* Rosa más visible */}
        <path
          fill="#E91E63"
          className="hero-in-bottom"
          d="M102,67.1c-9.6-6.1-22-3.1-29.5,2-15.4,10.7-19.6,37.5-7.6,47.8s35.9,3.9,44.5-12.5C115.5,92.6,113.9,74.6,102,67.1Z"
          opacity="0.4"
        />
      </svg>
      {/* Patrón sutil de puntos */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Pétalos con CSS animations - solo desktop y en viewport */}
      {shouldAnimate &&
        Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`petal-${i}`}
            className="hero-petal"
            style={
              {
                left: `${15 + i * 25}%`,
                top: `${20 + i * 20}%`,
                '--delay': `${i * 2}s`,
                '--duration': `${14 + i * 2}s`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Partículas con CSS animations */}
      {shouldAnimate &&
        particles.map((particle) => (
          <div
            key={particle.key}
            className={`hero-particle ${
              particle.isSparkle ? 'hero-particle-sparkle' : ''
            }`}
            style={
              {
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                '--delay': `${particle.delay}s`,
                '--duration': `${particle.isSparkle ? 10 : particle.duration}s`,
                '--color-main': particle.color.main,
                '--color-shadow': particle.color.shadow,
                '--size': `${particle.size}px`,
              } as React.CSSProperties
            }
          />
        ))}

      {/* Línea decorativa - solo CSS, sin motion.div */}
      <div
        className="absolute top-1/4 left-0 w-full h-px bg-linear-to-r from-transparent via-[#50C878]/20 to-transparent"
        style={{
          opacity: shouldAnimate ? 0.3 : 0.2,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Columna derecha - Imagen de la flor con efecto 3D optimizado */}
          <motion.div
            ref={flowerRef}
            onMouseMove={handleMove}
            onMouseLeave={reset}
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.5, x: 50 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center lg:justify-end order-2 lg:order-2"
            style={{
              rotateX: prefersReducedMotion ? 0 : rotateX,
              rotateY: prefersReducedMotion ? 0 : rotateY,
              scale: prefersReducedMotion ? 1 : scale,
              transformStyle: 'preserve-3d',
              willChange: 'transform',
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
              />

              {/* Imagen de la flor - solo transform (y), sin scale simultáneo */}
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
                        rotateZ: shouldAnimate ? [0, -1, 0, 1, 0] : 0,
                      }
                    : { opacity: 0.5 }
                }
                transition={{
                  opacity: { duration: 1 },
                  y: shouldAnimate
                    ? {
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }
                    : { duration: 0 },
                  rotateZ: shouldAnimate
                    ? {
                        duration: 6,
                        repeat: Infinity,
                        ease: 'easeInOut',
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

          {/* Columna izquierda - Texto y contenido */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0.5, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col justify-center order-1 lg:order-1 text-center lg:text-left"
          >
            {/* Badge "Desde 1983" - mejorado sin icono */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-linear-to-r from-[#50C878]/10 via-[#FFE082]/10 to-[#50C878]/10 border border-[#50C878]/20 rounded-full mb-4 sm:mb-6 md:mb-8 w-fit mx-auto lg:mx-0 backdrop-blur-sm hover:bg-linear-to-r hover:from-[#50C878]/15 hover:via-[#FFE082]/15 hover:to-[#50C878]/15 transition-all duration-300"
            >
              <span className="text-xs sm:text-sm bg-linear-to-r from-[#50C878] via-[#00A87F] to-[#50C878] bg-clip-text text-transparent font-bold uppercase tracking-wider">
                Desde 1983
              </span>
            </motion.div>

            {/* Título principal - agrupado en un solo motion.div */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={
                isInView ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 20 }
              }
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-4 sm:mb-6 md:mb-8"
            >
              <h1 className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-[#171517] mb-2 sm:mb-3 md:mb-4 leading-[1.05] tracking-tight">
                Flores que
              </h1>
              <h2 className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 sm:mb-4 leading-[1.05] tracking-tight">
                <span className="text-[#171517]">hablan por</span>
                <br className="hidden sm:block" />
                <span className="bg-linear-to-r from-[#50C878] via-[#00A87F] to-[#50C878] bg-clip-text text-transparent">
                  tu corazón
                </span>
              </h2>
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-[#4a4a4a] mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal px-2 sm:px-0"
            >
              Somos una florería familiar dedicada a transformar tus momentos en
              recuerdos inolvidables con arreglos frescos y personalizados.
            </motion.p>

            {/* Botones CTA - agrupados */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0 w-full sm:w-auto"
            >
              {/* CTA Principal */}
              <motion.a
                href="#servicios"
                whileHover={
                  !prefersReducedMotion && isInView
                    ? {
                        scale: 1.05,
                        y: -3,
                        transition: {
                          type: 'spring',
                          stiffness: 400,
                          damping: 17,
                        },
                      }
                    : {}
                }
                whileTap={
                  !prefersReducedMotion && isInView
                    ? {
                        scale: 0.97,
                        transition: { duration: 0.15 },
                      }
                    : {}
                }
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 bg-[#50C878] hover:bg-[#63d68b] text-white font-bold rounded-full text-xs sm:text-sm md:text-base lg:text-lg shadow-[0_4px_20px_rgba(80,200,120,0.3)] hover:shadow-[0_6px_30px_rgba(80,200,120,0.4)] transition-all duration-300 overflow-hidden w-full sm:w-auto"
                style={{ willChange: 'transform' }}
              >
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                  Ver Servicios
                </span>
                <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                {shouldAnimate && (
                  <div
                    className="absolute inset-0 bg-linear-to-r from-white/20 via-white/10 to-white/20"
                    style={{
                      animation: 'shimmer 3s ease-in-out infinite',
                      animationDelay: '0.5s',
                    }}
                  />
                )}
              </motion.a>

              {/* CTA Secundario */}
              <a
                href="#contacto"
                className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 border-2 border-[#50C878]/40 text-[#50C878] font-semibold rounded-xl text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 backdrop-blur-sm hover:shadow-[0_4px_20px_rgba(80,200,120,0.2)] relative overflow-hidden group w-full sm:w-auto hover:border-[#50C878]/60 hover:bg-[#50C878]/5"
              >
                <span className="relative z-10">Contáctanos</span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
              </a>
            </motion.div>
          </motion.div>
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
