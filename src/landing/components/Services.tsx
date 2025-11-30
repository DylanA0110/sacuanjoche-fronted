import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import RamosImg from '../../assets/Servicios/Ramos.jpg';
import CondolenciasImg from '../../assets/Servicios/Condolencias.jpg';
import ArreglosImg from '../../assets/Servicios/Arreglos-especiales.jpg';
import BodaImg from '../../assets/Servicios/Boda.jpg';

const services = [
  {
    title: 'Ramos y Bouquets',
    description:
      'Creamos arreglos florales únicos y elegantes para expresar tus sentimientos más profundos.',
    color: '#E91E63',
    image: RamosImg,
    angle: 4,
  },
  {
    title: 'Coronas y Condolencias',
    description:
      'Arreglos delicados y respetuosos para mostrar tus condolencias en momentos difíciles.',
    color: '#00A87F',
    image: CondolenciasImg,
    angle: -8,
  },
  {
    title: 'Arreglos Especiales',
    description:
      'Diseños personalizados para ocasiones especiales que reflejan tu estilo y personalidad.',
    color: '#E91E63',
    image: ArreglosImg,
    angle: -7,
  },
  {
    title: 'Eventos y Bodas',
    description:
      'Embellecemos tus eventos más importantes con arreglos florales excepcionales y únicos.',
    color: '#FFC107',
    image: BodaImg,
    angle: 11,
  },
];

export const Services = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  };

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  // Auto-play opcional
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calcular z-index para cada tarjeta
  const getZIndex = (index: number) => {
    if (index === activeIndex) return 10;
    const diff = (index - activeIndex + services.length) % services.length;
    if (diff === 1) return 9;
    if (diff === 2) return 8;
    if (diff === 3) return 7;
    if (diff === 4) return 6;
    if (diff === 5) return 5;
    return -1;
  };

  return (
    <section
      id="servicios"
      className="relative bg-linear-to-b from-[#fdf7f9] via-[#ffffff] to-[#f7f9fb] pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-16 sm:pb-20 md:pb-24 lg:pb-32 overflow-hidden"
    >
      {/* Efectos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 sm:w-[500px] md:w-[600px] h-96 sm:h-[500px] md:h-[600px] rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${services[0].color}06, ${services[0].color}04, transparent 60%)`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 sm:w-[450px] md:w-[550px] h-80 sm:h-[450px] md:h-[550px] rounded-full blur-xl"
          style={{
            background: `radial-gradient(circle, ${services[1].color}05, ${services[1].color}03, transparent 65%)`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.18, 0.32, 0.18],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: 2.5,
            ease: [0.4, 0, 0.2, 1] as const,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Título */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#00A87F] mb-1 sm:mb-2">
            SERVICIOS
          </p>
          <h2 className="font-sans text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#171517] mb-1 sm:mb-2 tracking-tight leading-[1.08]">
            SERVICIOS
          </h2>
          <p className="text-[#665b68] text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 font-medium">
            Diseños vibrantes que combinan romanticismo, color y sentimiento
            para cada momento especial.
          </p>
        </motion.div>

        {/* Carrusel de tarjetas apiladas */}
        <div className="flex justify-center items-center w-full">
          <div className="services-cards">
            {services.map((service, index) => {
              const isActive = index === activeIndex;
              const zIndex = getZIndex(index);

              return (
                <article
                  key={service.title}
                  className={`service-card ${
                    isActive ? 'service-card-active' : ''
                  }`}
                  style={
                    {
                      '--angle': `${service.angle}deg`,
                      zIndex: zIndex,
                    } as React.CSSProperties
                  }
                >
                  <div
                    className={`service-card-img-wrapper ${
                      isActive ? 'service-card-img-active' : ''
                    }`}
                  >
                    <img
                      className="service-card-img"
                      src={service.image}
                      alt={service.title}
                    />
                  </div>
                  <div
                    className={`service-card-data ${
                      isActive ? 'service-card-data-active' : ''
                    }`}
                  >
                    <span
                      className="service-card-num"
                      style={{ color: service.color }}
                    >
                      {index + 1}/{services.length}
                    </span>
                    <h2
                      className="font-sans font-black text-xl sm:text-2xl md:text-3xl leading-tight"
                      style={{
                        background: `linear-gradient(135deg, ${service.color}, ${service.color}dd)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {service.title}
                    </h2>
                    <p className="text-[#4a5568] text-sm sm:text-base md:text-lg leading-relaxed font-medium">
                      {service.description}
                    </p>
                    <footer className="service-card-footer">
                      <button
                        onClick={goToPrevious}
                        aria-label="Previous"
                        className="service-card-nav-btn"
                      >
                        &#10094;
                      </button>
                      <button
                        onClick={goToNext}
                        aria-label="Next"
                        className="service-card-nav-btn"
                      >
                        &#10095;
                      </button>
                    </footer>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
