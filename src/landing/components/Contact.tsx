import { motion } from "framer-motion";
import { TbMapPin, TbPhone, TbMail, TbMessageCircle } from "react-icons/tb";

const contactInfo = [
  {
    icon: TbMapPin,
    title: "Ubicación",
    content: "Managua, Nicaragua",
    link: "https://maps.google.com",
    color: "#F7B600",
  },
  {
    icon: TbPhone,
    title: "Teléfono",
    content: "+505 1234 5678",
    link: "tel:+50512345678",
    color: "#00A87F",
  },
  {
    icon: TbMail,
    title: "Email",
    content: "info@sacuanjoche.com",
    link: "mailto:info@sacuanjoche.com",
    color: "#E91E63",
  },
];

const hours = [
  { day: "Lunes - Viernes", time: "8:00 AM - 6:00 PM" },
  { day: "Sábado", time: "9:00 AM - 5:00 PM" },
  { day: "Domingo", time: "Cerrado" },
];

export const Contact = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
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
        ease: "easeOut",
        delay: i * 0.12,
      },
    }),
  };

  return (
    <motion.section
      id="contacto"
      className="py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-[#fff9f2] via-white to-[#f3fff6] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-80 sm:w-[450px] md:w-[550px] h-80 sm:h-[450px] md:h-[550px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, #00A87F0e, #F7B60008, transparent 60%)`,
            clipPath: 'polygon(0% 0%, 100% 0%, 90% 30%, 70% 50%, 50% 70%, 30% 85%, 10% 95%, 0% 100%)',
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
        <motion.div className="text-center mb-12 sm:mb-16" variants={sectionVariants}>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-4">
            CONTACTO
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171217] mb-4 sm:mb-6 leading-[1.08]">
            CONÉCTATE CON{' '}
            <span className="bg-gradient-to-r from-[#F7B600] via-[#E91E63] to-[#00A87F] bg-clip-text text-transparent">
              SACUANJOCHE
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-[#4E7A5A] max-w-3xl mx-auto leading-relaxed font-medium px-4 sm:px-0">
            Estamos aquí para ayudarte a expresar tus sentimientos con flores.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {contactInfo.map((item, index) => (
              <motion.a
                key={item.title}
                href={item.link}
                target={item.link.startsWith('http') ? '_blank' : undefined}
                rel={item.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                variants={cardVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.35 }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group block"
              >
                <div className="relative bg-white rounded-3xl p-8 sm:p-10 overflow-hidden h-full flex flex-col items-center justify-center text-center min-h-[280px] sm:min-h-[300px] border border-white/80 shadow-[0_12px_35px_rgba(23,21,23,0.08)] transition-all duration-300">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle, ${item.color}18, transparent 75%)`,
                    }}
                  />
                  <div className="relative z-10 flex flex-col items-center gap-4">
                    <motion.div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center border border-white/60 bg-white/80 backdrop-blur-lg shadow-[0_12px_30px_rgba(23,21,23,0.08)]"
                      style={{ color: item.color }}
                      whileHover={{ rotate: 4, scale: 1.08 }}
                    >
                      <item.icon className="w-10 h-10 sm:w-12 sm:h-12" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3
                        className="font-sans text-xl sm:text-2xl font-black"
                        style={{
                          background: `linear-gradient(135deg, ${item.color}, ${item.color}cc)` ,
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                        {item.title}
                      </h3>
                      <p className="text-[#5c5468] text-base sm:text-lg leading-relaxed font-medium">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <motion.div className="bg-white rounded-2xl p-8 sm:p-10 md:p-12 border border-white/70 shadow-[0_12px_35px_rgba(23,21,23,0.08)] mb-8" variants={sectionVariants}>
            <h3 className="font-sans text-2xl sm:text-3xl font-black text-[#0D0D0D] mb-6 text-center">
              Horarios de Atención
            </h3>
            <div className="space-y-4">
              {hours.map((hour) => (
                <div
                  key={hour.day}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-700 font-medium text-base sm:text-lg">
                    {hour.day}
                  </span>
                  <span className="text-gray-600 font-medium text-base sm:text-lg">
                    {hour.time}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="text-center" variants={sectionVariants}>
            <motion.a
              href="https://wa.me/50512345678"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white shadow-lg transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, #25D366, #128C7E)`,
                boxShadow: `0 8px 30px rgba(37, 211, 102, 0.4)` ,
              }}
            >
              <TbMessageCircle className="w-6 h-6" />
              <span className="text-lg">Contáctanos por WhatsApp</span>
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};
