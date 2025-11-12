import { motion } from 'framer-motion';
import { HiCalendar, HiHeart, HiUsers, HiSparkles } from 'react-icons/hi';

const timelineEvents = [
  {
    year: '1983',
    title: 'Fundación',
    description:
      'Nace bajo el concepto de un negocio familiar que fusionaría el trabajo como fuente generadora de ingresos y la atención al hogar, teniendo un cuidado personalizado a nuestras hijas.',
    icon: HiCalendar,
    accent: '#D95379',
  },
  {
    year: '1983',
    title: 'Nuestra Inspiración',
    description:
      'La mayor inspiración nuestra era darle seguimiento al valor y consejos de nuestros padres de tener lo propio y no depender de un salario, y poder sacar adelante a nuestras hijas que estaban de meses.',
    icon: HiHeart,
    accent: '#D95379',
  },
  {
    year: '1983+',
    title: 'Nuestro Equipo',
    description:
      'En sus inicios era atendido por Sarita mi esposa y Lidia, que fue la persona que inició labores desde la fundación. Con el correr de los años a este esfuerzo se han unido nuestras hijas Fátima y Ana Patricia.',
    icon: HiUsers,
    accent: '#00A87F',
  },
  {
    year: 'Hoy',
    title: 'Nuestro Compromiso',
    description:
      'Además de brindar Florería Sacuánjoche un servicio para las necesidades de las personas que nos visitan, se le da un valor agregado: la amabilidad, el buen trato y satisfacer las necesidades del cliente en sus más exquisitos gustos y preferencias.',
    icon: HiSparkles,
    accent: '#F7B600',
  },
];

export const About = () => {
  return (
    <motion.section
      id="historia"
      className="py-20 sm:py-24 lg:py-32 bg-gradient-to-b from-[#0D0D0D] via-[#1a1a1a] to-[#0D0D0D] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #D95379/20, #E91E63/15, transparent)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, #00A87F/15, #F7B600/10, transparent)',
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: 0.8,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="text-center mb-16 sm:mb-20"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, ease: 'easeOut' },
            },
          }}
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-white/60 mb-4">
            HISTORIA
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 tracking-tight leading-[1.08]">
            NUESTRA{' '}
            <span className="bg-gradient-to-r from-[#D95379] via-[#00A87F] to-[#F7B600] bg-clip-text text-transparent">
              LÍNEA DEL TIEMPO
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-medium">
            Un viaje de amor, dedicación y crecimiento desde 1983
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto relative min-h-[1000px] lg:min-h-[1200px]">
          <div
            className="hidden lg:block absolute inset-0"
            style={{ height: '1200px' }}
          >
            <motion.svg
              className="w-full h-full"
              viewBox="0 0 1200 900"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="pathGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#D95379" />
                  <stop offset="50%" stopColor="#00A87F" />
                  <stop offset="100%" stopColor="#F7B600" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 50 300 Q 200 250 400 350 Q 600 450 800 550 Q 1000 650 1150 200"
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </motion.svg>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
            {timelineEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              const marginTop = isEven
                ? 'lg:mt-0'
                : index === 1
                ? 'lg:mt-48'
                : index === 3
                ? 'lg:mt-80'
                : 'lg:mt-64';

              return (
                <motion.div
                  key={event.title}
                  className={`relative ${marginTop} mb-8 lg:mb-0`}
                  initial={{ opacity: 0, y: 80, scale: 0.92 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.8,
                    ease: 'easeOut',
                    delay: index * 0.15,
                  }}
                  whileHover={{ y: -12, scale: 1.01 }}
                >
                  <div className="hidden lg:block absolute -top-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full blur-xl opacity-70 animate-pulse"
                        style={{ backgroundColor: event.accent }}
                      />
                      <div
                        className="relative w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center shadow-xl cursor-pointer transition-all duration-300 hover:scale-125"
                        style={{
                          background: `linear-gradient(135deg, ${event.accent}, ${event.accent}dd)`,
                          boxShadow: `0 0 30px ${event.accent}60, 0 0 60px ${event.accent}30`,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  <motion.div
                    className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 sm:p-10 md:p-12 relative overflow-hidden group cursor-pointer min-h-[320px]"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div
                      className="absolute top-0 right-0 w-40 h-40 opacity-40 pointer-events-none transition-opacity duration-500 group-hover:opacity-60"
                      style={{
                        background: `radial-gradient(circle at top right, ${event.accent}50, ${event.accent}30, transparent 70%)`,
                        clipPath:
                          'polygon(100% 0%, 100% 60%, 40% 100%, 0% 100%, 0% 0%)',
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-32 h-32 opacity-25 pointer-events-none transition-opacity duration-500 group-hover:opacity-40"
                      style={{
                        background: `radial-gradient(circle at bottom left, ${event.accent}40, transparent 65%)`,
                        clipPath:
                          'polygon(0% 0%, 60% 0%, 100% 40%, 100% 100%, 0% 100%)',
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex justify-center mb-6">
                        <div
                          className="px-6 py-3 rounded-2xl font-black text-xl sm:text-2xl md:text-3xl text-white shadow-xl border-2 border-white/40 transition-all duration-300 group-hover:scale-110"
                          style={{
                            background: `linear-gradient(135deg, ${event.accent}, ${event.accent}ee)`,
                            boxShadow: `0 10px 40px ${event.accent}50, inset 0 2px 0 rgba(255,255,255,0.3)`,
                          }}
                        >
                          {event.year}
                        </div>
                      </div>

                      <div className="flex justify-center mb-6">
                        <motion.div
                          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center border-2 border-white/30 shadow-2xl transition-all duration-300 group-hover:border-white/50"
                          style={{
                            background: `linear-gradient(135deg, ${event.accent}30, ${event.accent}20)`,
                            boxShadow: `0 12px 40px ${event.accent}40, inset 0 2px 0 rgba(255,255,255,0.2)`,
                          }}
                          initial={{ rotate: -15, opacity: 0 }}
                          whileInView={{ rotate: 0, opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.7, ease: 'easeOut' }}
                        >
                          <event.icon
                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
                            style={{
                              color: event.accent,
                              filter: `drop-shadow(0 4px 8px ${event.accent}60)`,
                            }}
                          />
                        </motion.div>
                      </div>

                      <h3 className="font-sans text-2xl sm:text-3xl md:text-4xl font-black text-white mb-5 text-center group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-white/90 group-hover:to-white group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 tracking-tight leading-tight">
                        {event.title}
                      </h3>

                      <p className="text-gray-200 leading-relaxed text-base sm:text-lg md:text-xl font-medium group-hover:text-white transition-colors duration-300 text-center">
                        {event.description}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="mt-20 sm:mt-32 text-center"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
              },
            }}
          >
            <motion.div
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 sm:p-12 lg:p-16 transition-all duration-500 relative overflow-hidden group cursor-pointer"
              whileHover={{ y: -12, scale: 1.02 }}
            >
              <div className="relative z-10">
                <p className="text-gray-300 text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 font-medium group-hover:text-gray-200 transition-colors duration-300">
                  Nos caracterizamos porque las manos que realizan el trabajo de
                  selección de flores y los arreglos en sí, son manos que
                  trabajan con
                </p>
                <p className="font-sans text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-[#D95379] via-[#00A87F] to-[#F7B600] bg-clip-text text-transparent tracking-tight">
                  Amor, pasión y dedicación
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};
