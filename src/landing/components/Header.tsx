import { motion, useScroll, useTransform } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { GiRose } from 'react-icons/gi';
import { useState } from 'react';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  // Transformaciones FUERA del JSX (muy importante - evita recreación constante)
  const headerHeight = useTransform(scrollY, [0, 100], [72, 60]);

  // Fondo fijo sin cambio de color - más simple y moderno
  const backgroundColor = 'rgba(15, 15, 15, 0.95)';

  const menuItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Historia', href: '#historia' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        height: headerHeight,
        backgroundColor: backgroundColor,
      }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 shadow-lg backdrop-blur-xl overflow-hidden"
    >
      {/* Fondo sutil que combina con el Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#50C878]/20 opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#50C878]/15 opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-center">
        <div className="flex items-center justify-between w-full py-3">
          {/* Logo con más vida */}
          <motion.a
            href="#inicio"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 group relative"
          >
            <motion.div
              className="w-9 h-9 rounded-full bg-linear-to-br from-[#50C878]/40 to-[#50C878]/25 border-2 border-[#50C878]/50 flex items-center justify-center backdrop-blur-sm group-hover:from-[#50C878]/50 group-hover:to-[#50C878]/35 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(80,200,120,0.4)]"
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <GiRose className="w-4 h-4 text-[#50C878] group-hover:scale-110 transition-transform" />
            </motion.div>
            <span className="font-orquidea text-lg sm:text-xl font-bold text-white group-hover:text-[#50C878] transition-colors">
              Sacuanjoche
            </span>
          </motion.a>

          {/* Menú desktop con más vida */}
          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="px-5 py-2 text-white/80 hover:text-[#50C878] transition-colors font-medium text-sm uppercase tracking-wider relative group"
                whileHover={{ y: -2 }}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#50C878] to-[#3aa85c] group-hover:w-full transition-all duration-300" />
                <span className="absolute inset-0 bg-[#50C878]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </motion.a>
            ))}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-2 hover:text-[#50C878] transition-colors relative z-10"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 space-y-1 border-t border-white/10 mt-2 pt-4"
          >
            {menuItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="block py-3 px-4 text-white/80 hover:text-[#50C878] hover:bg-white/5 rounded-lg transition-all font-medium text-sm uppercase tracking-wider"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        )}
      </nav>
    </motion.header>
  );
};
