import { motion } from 'framer-motion';
import { HiChevronDown, HiArrowRight } from 'react-icons/hi';
import { PiSparkleFill } from 'react-icons/pi';
import { useState, useEffect } from 'react';

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 15;
        const y = (e.clientY / window.innerHeight - 0.5) * 15;
        setMousePosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-b from-[#0D0D0D] via-[#1a1a1a] to-[#0D0D0D] pt-16 sm:pt-20 pb-12 sm:pb-16"
    >
      {/* Patrón sutil de puntos */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Degradado radial sutil detrás de la flor - colores florales vibrantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rosa vibrante - rosas */}
        <motion.div
          className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(233, 30, 99, 0.2) 0%, rgba(217, 83, 121, 0.15) 30%, rgba(255, 215, 0, 0.1) 40%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Púrpura elegante - lirios */}
        <motion.div
          className="absolute left-1/4 top-1/2 -translate-y-1/2 w-[250px] h-[250px] sm:w-[500px] sm:h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(156, 39, 176, 0.18) 0%, rgba(233, 30, 99, 0.12) 25%, rgba(255, 215, 0, 0.1) 50%, transparent 80%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            delay: 1,
            ease: 'easeInOut',
          }}
        />
        {/* Verde esmeralda - naturaleza */}
        <motion.div
          className="absolute right-1/2 top-1/3 w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 168, 127, 0.15) 0%, rgba(255, 215, 0, 0.1) 30%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 2,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Partículas flotantes premium 2025 - colores florales */}
      {typeof window !== 'undefined' &&
        Array.from({ length: 12 }).map((_, i) => {
          const size = 3 + (i % 3) * 2;
          const delay = i * 0.4;
          const duration = 8 + (i % 4) * 2;
          const x = (i * 150) % (window.innerWidth || 1920);
          const y = (i * 200) % (window.innerHeight || 1080);

          // Colores florales rotativos
          const colors = [
            {
              main: 'rgba(233, 30, 99, 0.4)',
              shadow: 'rgba(233, 30, 99, 0.5)',
            }, // Rosa
            {
              main: 'rgba(156, 39, 176, 0.35)',
              shadow: 'rgba(156, 39, 176, 0.45)',
            }, // Púrpura
            {
              main: 'rgba(255, 215, 0, 0.3)',
              shadow: 'rgba(255, 215, 0, 0.4)',
            }, // Amarillo
            {
              main: 'rgba(0, 168, 127, 0.35)',
              shadow: 'rgba(0, 168, 127, 0.45)',
            }, // Verde
          ];
          const colorIndex = i % colors.length;
          const color = colors[colorIndex];

          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle, ${
                  color.main
                } 0%, ${color.main
                  .replace('0.4', '0.2')
                  .replace('0.35', '0.15')
                  .replace('0.3', '0.1')} 50%, transparent 100%)`,
                boxShadow: `0 0 ${size * 3}px ${color.shadow}`,
              }}
              initial={{
                x: x,
                y: y,
                opacity: 0,
                scale: 0,
              }}
              animate={{
                x: [x, (x + 300) % (window.innerWidth || 1920), x],
                y: [y, (y - 400) % (window.innerHeight || 1080), y],
                opacity: [0, 0.6, 0.8, 0.6, 0],
                scale: [0, 1, 1.2, 1, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: 'easeInOut',
              }}
            />
          );
        })}

      {/* Líneas decorativas animadas premium */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#50C878]/20 to-transparent"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFD700]/15 to-transparent"
          animate={{
            opacity: [0.2, 0.4, 0.2],
            scaleX: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12 max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 xl:gap-20 items-center">
          {/* Columna derecha - Imagen de la flor flotante y 3D */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex justify-center lg:justify-end order-2 lg:order-2"
            style={{
              rotateY: mousePosition.x * 0.15,
              rotateX: mousePosition.y * -0.15,
              willChange: 'transform',
            }}
          >
            <div className="relative w-full max-w-[250px] xs:max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[480px] 2xl:max-w-[500px] mx-auto lg:mx-0">
              {/* Resplandor sutil detrás de la flor */}
              <div
                className="absolute inset-0 -z-10 blur-[40px] sm:blur-[60px]"
                style={{
                  background:
                    'radial-gradient(circle at center, rgba(80, 200, 120, 0.1) 0%, rgba(139, 69, 139, 0.08) 40%, transparent 70%)',
                  transform: 'scale(1.2)',
                }}
              />

              {/* Imagen de la flor - flotante y 3D, limpia */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { duration: 1 },
                  scale: { duration: 1, ease: 'easeOut' },
                  y: {
                    repeat: Infinity,
                    duration: 6,
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.3 },
                }}
                className="relative z-10"
                style={{
                  filter:
                    'drop-shadow(0 20px 60px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 40px rgba(80, 200, 120, 0.2))',
                }}
              >
                <img
                  src="/Flor_de_sacuanjoche-.png"
                  alt="Flor de Sacuanjoche"
                  className="w-full h-auto"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Columna izquierda - Texto y contenido */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="flex flex-col justify-center order-1 lg:order-1 text-center lg:text-left"
          >
            {/* Badge "Desde 1983" - más integrado con bordes cuadrados y toque amarillo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-[#50C878]/10 via-[#FFD700]/10 to-[#50C878]/10 border border-[#50C878]/30 rounded-md mb-4 sm:mb-6 md:mb-8 w-fit mx-auto lg:mx-0 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#50C878]/15 hover:via-[#FFD700]/15 hover:to-[#50C878]/15 transition-all duration-300"
            >
              <PiSparkleFill className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD700]" />
              <span className="text-[10px] xs:text-xs sm:text-sm bg-gradient-to-r from-[#50C878] via-[#FFD700] to-[#50C878] bg-clip-text text-transparent font-semibold uppercase tracking-wider">
                Desde 1983
              </span>
            </motion.div>

            {/* Título principal - tipografía sans-serif bold e impactante */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-4 sm:mb-6 md:mb-8"
            >
              <motion.h1
                className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black text-white mb-2 sm:mb-3 md:mb-4 leading-[1.05] sm:leading-[0.95] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Flores que
              </motion.h1>
              <motion.h2
                className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-black mb-3 sm:mb-4 leading-[1.05] sm:leading-[0.95] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span className="text-white">hablan por</span>
                <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#50C878] via-[#FFD700] to-[#50C878] bg-clip-text text-transparent">
                  tu corazón
                </span>
              </motion.h2>
            </motion.div>

            {/* Subtítulo - fuente sans-serif legible */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal px-2 sm:px-0"
            >
              Somos una florería familiar dedicada a transformar tus momentos en
              recuerdos inolvidables con arreglos frescos y personalizados.
            </motion.p>

            {/* Botones CTA premium/boutique */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-2 sm:px-0 w-full sm:w-auto"
            >
              {/* CTA Principal - Premium boutique con gradiente fluido */}
              <motion.a
                href="#servicios"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center gap-2 px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-[#50C878] via-[#3aa85c] to-[#50C878] text-white font-bold rounded-full text-xs sm:text-sm md:text-base lg:text-lg shadow-2xl hover:shadow-[0_0_40px_rgba(80,200,120,0.5)] transition-all duration-300 overflow-hidden gradient-flow w-full sm:w-auto"
              >
                <span className="relative z-10">Ver Servicios</span>
                <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.a>

              {/* CTA Secundario - Premium ghost */}
              <motion.a
                href="#contacto"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  borderColor: 'rgba(255,255,255,0.8)',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 border-2 border-white/30 text-white font-semibold rounded-xl text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 backdrop-blur-sm hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] relative overflow-hidden group w-full sm:w-auto"
              >
                <span className="relative z-10">Contáctanos</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator premium */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block"
      >
        <motion.a
          href="#servicios"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="group flex flex-col items-center gap-1.5 sm:gap-2"
        >
          <span className="text-[10px] xs:text-xs text-white/60 uppercase tracking-wider font-medium">
            Explora
          </span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-1.5 sm:p-2 hover:border-white/40 transition-colors backdrop-blur-sm group-hover:border-[#50C878]/50">
            <HiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 group-hover:text-[#50C878] transition-colors" />
          </div>
        </motion.a>
      </motion.div>
    </section>
  );
};
