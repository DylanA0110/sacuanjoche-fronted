import { memo } from 'react';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';

interface HeroTextProps {
  isInView: boolean;
  shouldAnimate: boolean;
  prefersReducedMotion: boolean;
}

export const HeroText = memo(
  ({ isInView, shouldAnimate, prefersReducedMotion }: HeroTextProps) => {
    return (
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col justify-center order-1 lg:order-1 text-center lg:text-left"
      >
        {/* Badge "Desde 1983" */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-[#50C878]/10 via-[#FFE082]/10 to-[#50C878]/10 border border-[#50C878]/20 rounded-full mb-4 sm:mb-6 md:mb-8 w-fit mx-auto lg:mx-0 backdrop-blur-sm hover:bg-gradient-to-r hover:from-[#50C878]/15 hover:via-[#FFE082]/15 hover:to-[#50C878]/15 transition-all duration-300"
        >
          <span className="text-xs sm:text-sm bg-gradient-to-r from-[#50C878] via-[#00A87F] to-[#50C878] bg-clip-text text-transparent font-bold uppercase tracking-wider">
            Desde 1983
          </span>
        </motion.div>

        {/* Título principal - agrupado en un solo motion.div */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.5,
            delay: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="mb-4 sm:mb-6 md:mb-8"
        >
          <h1 className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-[#171517] mb-2 sm:mb-3 md:mb-4 leading-[1.05] tracking-tight">
            Flores que
          </h1>
          <h2 className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-3 sm:mb-4 leading-[1.05] tracking-tight">
            <span className="text-[#171517]">hablan por </span>
            <span className="bg-gradient-to-r from-[#50C878] via-[#00A87F] to-[#50C878] bg-clip-text text-transparent">
              tu corazón
            </span>
          </h2>
        </motion.div>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
          className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-[#4a4a4a] mb-6 sm:mb-8 md:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal px-2 sm:px-0"
        >
          Somos una florería familiar dedicada a transformar tus momentos en
          recuerdos inolvidables con arreglos frescos y personalizados.
        </motion.p>

        {/* Botones CTA - agrupados */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
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
            style={{
              willChange:
                isInView && !prefersReducedMotion ? 'transform' : 'auto',
            }}
          >
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
              Ver Servicios
            </span>
            <HiArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            {shouldAnimate && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-white/20"
                style={{
                  animation: 'shimmer 3s ease-in-out infinite',
                  animationDelay: '0.5s',
                }}
                aria-hidden="true"
              />
            )}
          </motion.a>

          {/* CTA Secundario */}
          <a
            href="#contacto"
            className="inline-flex items-center justify-center px-5 sm:px-6 md:px-8 lg:px-10 py-2.5 sm:py-3 md:py-4 border-2 border-[#50C878]/40 text-[#50C878] font-semibold rounded-xl text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 backdrop-blur-sm hover:shadow-[0_4px_20px_rgba(80,200,120,0.2)] relative overflow-hidden group w-full sm:w-auto hover:border-[#50C878]/60 hover:bg-[#50C878]/5"
          >
            <span className="relative z-10">Contáctanos</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
          </a>
        </motion.div>
      </motion.div>
    );
  }
);

HeroText.displayName = 'HeroText';

