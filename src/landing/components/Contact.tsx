import { motion } from 'framer-motion';
import { TbMapPin, TbPhone, TbMail, TbMessageCircle } from 'react-icons/tb';

const contactInfo = [
  {
    icon: TbMapPin,
    title: 'Ubicación',
    content:
      'Montoya, 2 Cuadras al Norte, 175 varas al Oeste, Managua, Nicaragua',
    link: 'https://maps.google.com',
    color: '#F7B600',
    gradientStart: '#FFB84D',
    gradientEnd: '#FF7E7E',
  },
  {
    icon: TbPhone,
    title: 'Teléfono',
    content: '+505 2266-0187',
    link: 'tel:+50522660187',
    color: '#00A87F',
    gradientStart: '#50C878',
    gradientEnd: '#00A87F',
  },
  {
    icon: TbMail,
    title: 'Email',
    content: 'ventas@floreriasacuanjoche.com',
    link: 'mailto:ventas@floreriasacuanjoche.com',
    color: '#E91E63',
    gradientStart: '#FF7E7E',
    gradientEnd: '#FF4848',
  },
];

const hours = [
  { day: 'Lunes - Viernes', time: '8:00 AM - 6:00 PM' },
  { day: 'Sábado', time: '9:00 AM - 5:00 PM' },
  { day: 'Domingo', time: 'Cerrado' },
];

export const Contact = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] as const },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.94 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1] as const,
        delay: i * 0.12,
      },
    }),
  };

  return (
    <motion.section
      id="contacto"
      className="pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-20 sm:pb-24 md:pb-28 lg:pb-32 bg-linear-to-b from-[#fafafa] via-[#ffffff] to-[#f5f5f5] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 sm:w-[450px] md:w-[550px] h-80 sm:h-[450px] md:h-[550px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, #00A87F0e, #F7B60008, transparent 60%)`,
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12 },
          },
        }}
      >
        <motion.div
          className="text-center mb-12 sm:mb-16"
          variants={sectionVariants}
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-4">
            CONTACTO
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171517] mb-4 sm:mb-6 leading-[1.08]">
            CONTACTO
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#4a4a4a] max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            Estamos aquí para ayudarte a expresar tus sentimientos con flores.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Tarjetas de contacto con efecto animado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 justify-items-center">
            {contactInfo.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.link}
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={
                  item.link.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                variants={cardVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                className="group block"
              >
                <div className="contact-card relative bg-white rounded-[10px] p-6 sm:p-8 md:p-10 overflow-hidden border-2 border-gray-200 shadow-[0px_2px_10px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col items-center justify-center cursor-pointer min-h-[220px] sm:min-h-[240px] md:min-h-[260px] w-full max-w-[320px] mx-auto">
                  {/* Icono con efecto de gradiente animado */}
                  <div className="contact-icon-wrapper mb-4 sm:mb-5 md:mb-6">
                    <div
                      className="contact-icon w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-800 ease-in-out relative overflow-hidden"
                      style={{
                        background: `linear-gradient(90deg, ${item.gradientStart} 0%, ${item.gradientStart} 20%, ${item.gradientEnd} 50%, ${item.gradientEnd} 70%, rgba(0, 0, 0, 0.05) 80%, rgba(0, 0, 0, 0.1) 100%)`,
                        backgroundPosition: '0px',
                        backgroundSize: '300px',
                      }}
                    >
                      <item.icon
                        className="contact-icon-svg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 transition-all duration-300 relative z-10"
                        style={{ color: 'white', fill: 'currentColor' }}
                      />
                      {/* Gradiente overlay para hover */}
                      <div
                        className="contact-icon-gradient absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{
                          background: `linear-gradient(90deg, ${item.gradientStart}, ${item.gradientEnd})`,
                          mixBlendMode: 'screen',
                        }}
                      />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="contact-title w-full text-center mt-0 mb-3 sm:mb-4 text-[#171517] font-semibold uppercase tracking-[3px] sm:tracking-[4px] text-sm sm:text-base md:text-lg">
                    {item.title}
                  </h3>

                  {/* Texto que aparece en hover */}
                  <p className="contact-text w-[90%] mx-auto text-xs sm:text-sm md:text-base text-center mt-3 sm:mt-4 text-[#4a4a4a] font-light tracking-[1px] sm:tracking-[2px] opacity-0 max-h-0 transition-all duration-300 ease-in-out leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Horarios de atención con efecto flip */}
          <motion.div
            className="flex justify-center items-center mb-0"
            variants={sectionVariants}
          >
            <div className="flip-container">
              <div className="flipper">
                {/* Frente de la tarjeta */}
                <div className="flip-front">
                  <div className="flip-front-content">
                    <h3 className="flip-title">Horarios de Atención</h3>
                    <p className="flip-subtitle">Florería Sacuanjoche</p>
                    <div className="flip-icon-wrapper">
                      <svg
                        className="flip-icon"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="flip-hover-text">
                      Pasa el cursor para ver horarios
                    </p>
                  </div>
                </div>

                {/* Reverso de la tarjeta */}
                <div className="flip-back">
                  <div className="flip-back-content">
                    <h3 className="flip-back-title">Horarios de Atención</h3>
                    <p className="flip-back-subtitle">Florería Sacuanjoche</p>
                    <div className="flip-hours-list">
                      {hours.map((hour) => (
                        <div key={hour.day} className="flip-hour-item">
                          <span className="flip-hour-day">{hour.day}</span>
                          <span className="flip-hour-time">{hour.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Botón WhatsApp con efecto 3D */}
          <motion.div
            className="text-center mt-12 sm:mt-16 md:mt-20"
            variants={sectionVariants}
          >
            <a
              href="https://wa.me/50522660187"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-button-3d inline-flex items-center gap-3"
            >
              <TbMessageCircle className="w-5 h-5" />
              <span>Contáctanos por WhatsApp</span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};
