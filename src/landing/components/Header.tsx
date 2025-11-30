import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiLogout, HiUser, HiShoppingCart } from 'react-icons/hi';
import { GiRose } from 'react-icons/gi';
import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { useCarrito } from '@/carrito/hooks/useCarrito';
import { toast } from 'sonner';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCarrito();

  // Transformaciones: Solo aplicamos cambio de altura en pantallas grandes (md hacia arriba)
  // En móvil mantenemos una altura fija para evitar saltos visuales
  
  // Fondo sólido y oscuro para asegurar legibilidad
  const backgroundColor = 'rgba(15, 15, 15, 0.98)';

  const VALID_HASHES = ['#inicio', '#servicios', '#galeria', '#historia', '#contacto'];

  const menuItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Historia', href: '#historia' },
    { label: 'Contacto', href: '#contacto' },
  ];

  // 🔒 BLOQUEO DE SCROLL ROBUSTO
  useEffect(() => {
    if (isMenuOpen) {
      // Guardar la posición actual para evitar que la página salte al inicio
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    } else {
      // Restaurar el scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [isMenuOpen]);

  const handleHashLink = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      setIsMenuOpen(false); // Cerrar menú inmediatamente
      
      if (!VALID_HASHES.includes(hash)) {
        navigate('/', { replace: true });
        return;
      }
      
      if (location.pathname !== '/') {
        navigate(`/${hash}`);
      } else {
        window.history.pushState(null, '', hash);
        const element = document.querySelector(hash);
        if (element) {
          const offset = 80;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = element.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
    },
    [location.pathname, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast.success('Sesión cerrada correctamente');
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  }, [logout, navigate]);

  const nombreUsuario = user?.email || 'Usuario';

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          // En móvil usamos altura automática/fija, en desktop la dinámica
          backgroundColor: backgroundColor,
        }}
        // z-40 para el header base, pero el menú móvil tendrá z-100
        className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 shadow-lg backdrop-blur-xl min-h-[60px]"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10 h-full">
          <div className="flex items-center justify-between py-3 md:py-0 md:h-(--header-height)" style={{ height: '100%' }}>
            
            {/* LOGO */}
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-2 relative z-101" // Z-index alto para que el logo se vea sobre el menú abierto si quieres
            >
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#50C878]/40 to-[#50C878]/25 border-2 border-[#50C878]/50 flex items-center justify-center">
                <GiRose className="w-4 h-4 text-[#50C878]" />
              </div>
              <span className="font-orquidea text-lg font-bold text-white">
                Sacuanjoche
              </span>
            </Link>

            {/* MENÚ DESKTOP (Oculto en móvil) */}
            <div className="hidden md:flex items-center space-x-1">
              {menuItems.map((item) => (
                item.href.startsWith('#') ? (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleHashLink(e, item.href)}
                    className="px-3 py-2 text-white/80 hover:text-[#50C878] transition-colors text-xs uppercase tracking-wider font-medium"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="px-3 py-2 text-white/80 hover:text-[#50C878] transition-colors text-xs uppercase tracking-wider font-medium"
                  >
                    {item.label}
                  </Link>
                )
              ))}

              {/* Iconos Desktop */}
              <div className="flex items-center gap-2 ml-2 border-l border-white/10 pl-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/carrito" className="p-2 text-white hover:text-[#50C878] relative">
                      <HiShoppingCart size={20} />
                      {itemCount > 0 && (
                        <span className="absolute top-0 right-0 bg-[#50C878] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                          {itemCount > 9 ? '9+' : itemCount}
                        </span>
                      )}
                    </Link>
                    <button onClick={handleLogout} className="p-2 text-white hover:text-red-400" title="Salir">
                      <HiLogout size={20} />
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="px-4 py-1.5 bg-[#50C878] text-white rounded text-xs font-bold uppercase hover:bg-[#40b065] transition">
                    Ingresar
                  </Link>
                )}
              </div>
            </div>

            {/* BOTÓN HAMBURGUESA (Solo Móvil) */}
            <div className="flex items-center gap-3 md:hidden">
              {/* Carrito visible en header móvil también */}
              {isAuthenticated && (
                <Link to="/carrito" className="text-white hover:text-[#50C878] relative p-1">
                   <HiShoppingCart size={24} />
                   {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#50C878] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                   )}
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 rounded-lg active:bg-white/10 transition-colors z-101" // Z-index crítico
                aria-label="Abrir menú"
              >
                {isMenuOpen ? <HiX size={28} /> : <HiMenu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* 📱 MENÚ MÓVIL (DRAWER) REPARADO */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 1. Backdrop (Fondo oscuro) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-99"
            />

            {/* 2. Drawer Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              // Usamos h-[100dvh] para móviles modernos, z-[100] para estar encima de todo
              className="fixed top-0 right-0 h-dvh w-[80%] max-w-[300px] bg-[#0f0f0f] border-l border-white/10 shadow-2xl z-100 overflow-y-auto"
            >
              <div className="flex flex-col min-h-full pb-10">
                
                {/* Cabecera del Drawer */}
                <div className="flex items-center justify-between p-5 border-b border-white/10">
                  <span className="font-orquidea text-xl font-bold text-white">Menú</span>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-white/60 hover:text-white"
                  >
                    <HiX size={24} />
                  </button>
                </div>

                {/* Lista de Enlaces */}
                <div className="flex-col flex py-4">
                  {menuItems.map((item) => (
                    item.href.startsWith('#') ? (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleHashLink(e, item.href)}
                        className="px-6 py-4 text-white hover:bg-white/5 border-l-4 border-transparent hover:border-[#50C878] transition-all text-sm font-medium uppercase tracking-widest"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="px-6 py-4 text-white hover:bg-white/5 border-l-4 border-transparent hover:border-[#50C878] transition-all text-sm font-medium uppercase tracking-widest"
                      >
                        {item.label}
                      </Link>
                    )
                  ))}
                </div>

                {/* Footer del Menú (Usuario / Login) */}
                <div className="mt-auto px-6 pt-6 border-t border-white/10">
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-white/80">
                        <HiUser className="text-[#50C878]" />
                        <span className="text-sm truncate">{nombreUsuario}</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-bold uppercase transition flex items-center justify-center gap-2"
                      >
                        <HiLogout /> Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-3 text-center border border-white/20 text-white rounded-lg text-xs font-bold uppercase hover:bg-white/5"
                      >
                        Iniciar Sesión
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-3 text-center bg-[#50C878] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#40b065]"
                      >
                        Registrarse
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};