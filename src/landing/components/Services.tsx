import { motion } from "framer-motion";
import { RiFlowerLine, RiGift2Line, RiSparkling2Line } from "react-icons/ri";
import { TbHeartHandshake } from "react-icons/tb";

const services = [
  {
    icon: RiFlowerLine,
    title: "Ramos y Bouquets",
    description: "Creamos arreglos florales únicos y elegantes para expresar tus sentimientos más profundos.",
    color: "#E91E63",
    accentColors: ["#FF6B9D", "#FFB3D1", "#FFD1E6"],
  },
  {
    icon: TbHeartHandshake,
    title: "Coronas y Condolencias",
    description: "Arreglos delicados y respetuosos para mostrar tus condolencias en momentos difíciles.",
    color: "#00A87F",
    accentColors: ["#2DB896", "#5AC8AD", "#7DD3C1"],
  },
  {
    icon: RiGift2Line,
    title: "Arreglos Especiales",
    description: "Diseños personalizados para ocasiones especiales que reflejan tu estilo y personalidad.",
    color: "#E91E63",
    accentColors: ["#FF6B9D", "#FFB3D1", "#FFD1E6"],
  },
  {
    icon: RiSparkling2Line,
    title: "Eventos y Bodas",
    description: "Embellecemos tus eventos más importantes con arreglos florales excepcionales y únicos.",
    color: "#FFC107",
    accentColors: ["#FFD54F", "#FFE082", "#FFF59D"],
  },
];

export const Services = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 80 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.92 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        delay: index * 0.12,
      },
    }),
  };

  return (
    <motion.section
      id="servicios"
      className="relative bg-gradient-to-b from-[#fdf7f9] via-[#ffffff] to-[#f7f9fb] py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 sm:w-[500px] md:w-[600px] h-96 sm:h-[500px] md:h-[600px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${services[0].color}08, ${services[0].accentColors[0]}05, transparent 60%)`,
            clipPath: 'polygon(0% 0%, 100% 0%, 90% 30%, 70% 50%, 50% 70%, 30% 85%, 10% 95%, 0% 100%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 sm:w-[450px] md:w-[550px] h-80 sm:h-[450px] md:h-[550px] rounded-full blur-3xl"
          style={{
            background: `radial-gradient(circle, ${services[1].color}07, ${services[1].accentColors[0]}04, transparent 65%)`,
            clipPath: 'polygon(20% 0%, 100% 10%, 95% 40%, 80% 60%, 60% 75%, 40% 85%, 20% 90%, 0% 100%, 0% 0%)',
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            delay: 2,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          variants={sectionVariants}
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-4">
            SERVICIOS
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171517] mb-4 sm:mb-6 tracking-tight leading-[1.08]">
            NUESTRA <span className="bg-gradient-to-r from-[#D95379] via-[#F7B600] to-[#00A87F] bg-clip-text text-transparent">ALQUIMIA FLORAL</span>
          </h2>
          <p className="text-[#665b68] text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
            Diseños vibrantes que combinan romanticismo, color y sentimiento para cada momento especial.
          </p>
        </motion.div>

        {/* Grid de servicios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const accentShadow = `0 18px 45px ${service.color}22`;

            return (
              <motion.div
                key={service.title}
                className="relative rounded-[36px] border border-white/60 bg-white/80 backdrop-blur-xl p-8 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(17,18,26,0.08)] overflow-hidden group/card transition-transform"
                variants={cardVariants}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                whileHover={{ y: -12, scale: 1.02 }}
              >
                {/* halos */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 10% 10%, ${service.color}10, transparent 55%), radial-gradient(circle at 85% 85%, ${service.accentColors[0]}15, transparent 60%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col items-center text-center gap-5">
                  <motion.div
                    className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl flex items-center justify-center border border-white/50 bg-white/70 backdrop-blur-lg"
                    style={{
                      boxShadow: accentShadow,
                    }}
                    whileHover={{ rotate: 4, scale: 1.08 }}
                  >
                    <service.icon
                      className="w-14 h-14 md:w-16 md:h-16"
                      style={{ color: service.color }}
                    />
                    <div
                      className="absolute -inset-1 rounded-[inherit] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle, ${service.color}20, transparent 70%)`,
                      }}
                    />
                  </motion.div>

                  <div className="space-y-3">
                    <h3
                      className="font-sans text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                      style={{
                        background: `linear-gradient(120deg, ${service.color}, ${service.accentColors[0]}, ${service.accentColors[1]})`,
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {service.title}
                    </h3>
                    <p className="text-[#5e5562] text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                      {service.description}
                    </p>
                  </div>

                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F7B600]/30 bg-[#F9F2D6]/40 text-[#c17817] font-semibold text-sm tracking-wide"
                    whileHover={{ scale: 1.05 }}
                  >
                    Amor, color &amp; diseño
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F7B600]" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};
