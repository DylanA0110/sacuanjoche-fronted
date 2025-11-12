import { motion, useScroll, useTransform } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import { PiFlowerFill } from "react-icons/pi";
import { useState } from "react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const headerHeight = useTransform(scrollY, [0, 100], [80, 64]);

  const menuItems = [
    { label: "Inicio", href: "#inicio" },
    { label: "Servicios", href: "#servicios" },
    { label: "Historia", href: "#historia" },
    { label: "Contacto", href: "#contacto" },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: useTransform(scrollY, [0, 50], ['rgba(13, 13, 13, 0.98)', 'rgba(13, 13, 13, 0.95)']),
        backdropFilter: useTransform(scrollY, [0, 50], ['blur(12px)', 'blur(24px)']),
      } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 shadow-lg relative overflow-hidden"
    >
      {/* Efectos de fondo sutiles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#50C878]/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#50C878]/3 rounded-full blur-2xl" />
      </div>

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="flex items-center justify-between"
          style={{ height: headerHeight }}
        >
          {/* Logo con más vida */}
          <motion.a
            href="#inicio"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-3 group relative"
          >
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#50C878]/40 to-[#50C878]/25 border-2 border-[#50C878]/50 flex items-center justify-center backdrop-blur-sm group-hover:from-[#50C878]/50 group-hover:to-[#50C878]/35 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(80,200,120,0.4)]"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <PiFlowerFill className="w-5 h-5 text-[#50C878] group-hover:scale-110 transition-transform" />
            </motion.div>
            <span className="font-orquidea text-xl sm:text-2xl font-bold text-white group-hover:text-[#50C878] transition-colors">
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
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#50C878] to-[#3aa85c] group-hover:w-full transition-all duration-300" />
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
        </motion.div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
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
