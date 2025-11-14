import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import {
  HiLocationMarker,
  HiPhone,
  HiMail,
  HiArrowRight,
} from 'react-icons/hi';
import { GiRose } from 'react-icons/gi';

// Lazy loading para mejor rendimiento y code splitting
const Hero = lazy(() =>
  import('../components/Hero').then((module) => ({ default: module.Hero }))
);
const Services = lazy(() =>
  import('../components/Services').then((module) => ({
    default: module.Services,
  }))
);
const Gallery = lazy(() =>
  import('../components/Gallery').then((module) => ({
    default: module.Gallery,
  }))
);
const About = lazy(() =>
  import('../components/About').then((module) => ({ default: module.About }))
);
const Contact = lazy(() =>
  import('../components/Contact').then((module) => ({
    default: module.Contact,
  }))
);

// Componente de carga
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
    <div className="w-16 h-16 border-4 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Suspense fallback={<LoadingFallback />}>
          <Hero />
        </Suspense>
        <Suspense fallback={null}>
          <Services />
        </Suspense>
        <Suspense fallback={null}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Gallery />
        </Suspense>
        <Suspense fallback={null}>
          <Contact />
        </Suspense>
      </main>
      <footer className="bg-linear-to-b from-[#0D0D0D] via-[#0a0a0a] to-[#0D0D0D] border-t border-white/5 relative overflow-hidden">
        {/* Efectos de fondo premium - sin animaciones para evitar re-renders */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/1 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/1 rounded-full blur-3xl" />

          {/* Línea decorativa estática - sin animación para mejor rendimiento */}
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/5 to-transparent opacity-10" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="py-8 sm:py-10 md:py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mb-8">
              {/* Logo y descripción */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                    <GiRose className="w-5 h-5 text-white/80" />
                  </div>
                  <h3 className="font-sans text-xl sm:text-2xl font-black text-white">
                    Floristería{' '}
                    <span className="text-white/90">Sacuanjoche</span>
                  </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-md">
                  Creando los ramos florales más bellos, delicados y de calidad
                  del mercado desde 1983.
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
                  <span>Hecho con dedicación y pasión</span>
                </div>
              </motion.div>

              {/* Enlaces rápidos */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h4 className="font-sans text-base font-black text-white mb-4 uppercase tracking-wider">
                  Enlaces
                </h4>
                <ul className="space-y-2">
                  {[
                    { href: '#inicio', label: 'Inicio' },
                    { href: '#servicios', label: 'Servicios' },
                    { href: '#galeria', label: 'Galería' },
                    { href: '#historia', label: 'Historia' },
                    { href: '#contacto', label: 'Contacto' },
                  ].map((link) => (
                    <li key={link.href}>
                      <motion.a
                        href={link.href}
                        className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        whileHover={{ x: 4 }}
                      >
                        <HiArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-white/60" />
                        <span>{link.label}</span>
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Información de contacto */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h4 className="font-sans text-base font-black text-white mb-4 uppercase tracking-wider">
                  Contacto
                </h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <HiLocationMarker className="w-5 h-5 text-white/40 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        Montoya, 2 Cuadras al Norte
                      </p>
                      <p className="text-gray-500 text-sm">
                        Managua, Nicaragua
                      </p>
                    </div>
                  </li>
                  <li>
                    <motion.a
                      href="tel:+50522660187"
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
                      whileHover={{ x: 4 }}
                    >
                      <HiPhone className="w-5 h-5 text-white/40 shrink-0" />
                      <span>+505 2266-0187</span>
                    </motion.a>
                  </li>
                  <li>
                    <motion.a
                      href="mailto:ventas@floreriasacuanjoche.com"
                      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm font-medium group"
                      whileHover={{ x: 4 }}
                    >
                      <HiMail className="w-5 h-5 text-white/40 shrink-0" />
                      <span className="break-all">
                        ventas@floreriasacuanjoche.com
                      </span>
                    </motion.a>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Línea divisoria y copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="pt-6 border-t border-white/5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-gray-500 text-sm">
                  © {new Date().getFullYear()} Floristería Sacuanjoche. Todos
                  los derechos reservados.
                </p>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>Fundada en 1983</span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span>Managua, Nicaragua</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}
