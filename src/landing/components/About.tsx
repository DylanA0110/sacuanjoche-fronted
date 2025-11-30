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
      className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 sm:pb-24 lg:pb-32 bg-linear-to-b from-[#0D0D0D] via-[#1a1a1a] to-[#0D0D0D] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(circle, rgba(217, 83, 121, 0.12), rgba(233, 30, 99, 0.08), transparent)',
          }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.3, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 rounded-full blur-xl"
          style={{
            background:
              'radial-gradient(circle, rgba(0, 168, 127, 0.1), rgba(247, 182, 0, 0.06), transparent)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 1.2,
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
            HISTORIA
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-medium">
            Un viaje de amor, dedicación y crecimiento desde 1983
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto relative">
          {/* Línea del tiempo - visible en mobile y desktop, se une verticalmente */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-0.5 sm:w-1 h-full"
            style={{ minHeight: 'calc(100% + 4rem)' }}
          >
            <motion.div
              className="w-full h-full bg-white/20"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              style={{ transformOrigin: 'top' }}
            />
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
                  className={`relative ${marginTop} mb-12 sm:mb-16 lg:mb-0`}
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
                  {/* Punto de conexión en la línea - visible en mobile y desktop */}
                  <div className="absolute -top-4 sm:-top-4 lg:-top-8 left-1/2 -translate-x-1/2 z-30">
                    <div className="relative">
                      <div
                        className="absolute inset-0 rounded-full blur-lg opacity-60"
                        style={{ backgroundColor: event.accent }}
                      />
                      <div
                        className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white/40 flex items-center justify-center shadow-xl"
                        style={{
                          backgroundColor: event.accent,
                          boxShadow: `0 0 20px ${event.accent}60`,
                        }}
                      >
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card moderna y limpia */}
                  <motion.div
                    className="bg-linear-to-br from-white/5 to-white/2 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 md:p-10 relative overflow-hidden group cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500"
                    whileHover={{
                      y: -8,
                      scale: 1.01,
                      borderColor: `rgba(255,255,255,0.3)`,
                      transition: {
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      },
                    }}
                  >
                    {/* Efecto de brillo sutil al hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${event.accent}15, transparent 70%)`,
                      }}
                    />

                    <div className="relative z-10">
                      {/* Año - diseño minimalista */}
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className="px-4 py-2 rounded-lg font-black text-lg sm:text-xl md:text-2xl text-white"
                          style={{
                            backgroundColor: `${event.accent}20`,
                            borderLeft: `3px solid ${event.accent}`,
                          }}
                        >
                          {event.year}
                        </div>
                        <motion.div
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                          style={{
                            backgroundColor: `${event.accent}20`,
                            border: `2px solid ${event.accent}40`,
                          }}
                          whileHover={{
                            rotate: 5,
                            scale: 1.1,
                            backgroundColor: `${event.accent}30`,
                          }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <event.icon
                            className="w-6 h-6 sm:w-7 sm:h-7"
                            style={{ color: event.accent }}
                          />
                        </motion.div>
                      </div>

                      {/* Título y descripción */}
                      <h3 className="font-sans text-xl sm:text-2xl md:text-3xl font-black text-white mb-4 tracking-tight">
                        {event.title}
                      </h3>

                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base md:text-lg font-normal">
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
                <p className="font-sans text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
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
