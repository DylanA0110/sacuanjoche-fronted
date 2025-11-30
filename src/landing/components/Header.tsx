import { motion, useScroll, useTransform } from 'framer-motion';
import { HiMenu, HiX } from 'react-icons/hi';
import { HiLogout, HiUser } from 'react-icons/hi';
import { GiRose } from 'react-icons/gi';
import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '@/auth/store/auth.store';
import { toast } from 'sonner';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Transformaciones FUERA del JSX (muy importante - evita recreación constante)
  const headerHeight = useTransform(scrollY, [0, 100], [64, 56]);

  // Fondo fijo sin cambio de color - más simple y moderno
  const backgroundColor = 'rgba(15, 15, 15, 0.95)';

  // Hashes válidos
  const VALID_HASHES = ['#inicio', '#servicios', '#galeria', '#historia', '#contacto'];

  const menuItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Catálogo', href: '/catalogo' },
    { label: 'Servicios', href: '#servicios' },
    { label: 'Galería', href: '#galeria' },
    { label: 'Historia', href: '#historia' },
    { label: 'Contacto', href: '#contacto' },
  ];

  // Handler para enlaces con hash
  const handleHashLink = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      
      // Validar que el hash sea válido
      if (!VALID_HASHES.includes(hash)) {
        // Limpiar URL y redirigir a inicio
        window.history.replaceState(null, '', '/');
        navigate('/', { replace: true });
        setIsMenuOpen(false);
        return;
      }
      
      if (location.pathname !== '/') {
        // Si no estamos en la landing, navegar primero
        navigate(`/${hash}`);
      } else {
        // Si estamos en la landing, actualizar la URL con el hash y hacer scroll suave
        window.history.pushState(null, '', hash);
        
        const element = document.querySelector(hash);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }
      setIsMenuOpen(false);
    },
    [location.pathname, navigate]
  );

  // Obtener nombre del usuario
  const nombreUsuario = user?.empleado?.nombreCompleto || 
    (user?.empleado?.primerNombre && user?.empleado?.primerApellido
      ? `${user.empleado.primerNombre} ${user.empleado.primerApellido}`
      : user?.empleado?.primerNombre || user?.cliente?.nombreCompleto ||
        (user?.cliente?.primerNombre && user?.cliente?.primerApellido
          ? `${user.cliente.primerNombre} ${user.cliente.primerApellido}`
          : user?.cliente?.primerNombre || user?.email || 'Usuario'));

  // Manejar cierre de sesión
  const handleLogout = useCallback(() => {
    logout();
    toast.success('Sesión cerrada correctamente');
    setIsMenuOpen(false);
    navigate('/', { replace: true });
  }, [logout, navigate]);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        height: headerHeight,
        backgroundColor: backgroundColor,
        '--header-height': headerHeight.get() + 'px',
      } as React.CSSProperties & { '--header-height': string }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 shadow-lg backdrop-blur-xl"
    >
      {/* Fondo sutil que combina con el Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-[#50C878]/20 opacity-[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-[#50C878]/15 opacity-[0.02] rounded-full blur-3xl" />
      </div>

      <nav className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 h-full flex items-center">
        <div className="flex items-center justify-between w-full py-2">
          {/* Logo con más vida */}
          <motion.a
            href="#inicio"
            onClick={(e) => handleHashLink(e, '#inicio')}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 group relative"
          >
            <motion.div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br from-[#50C878]/40 to-[#50C878]/25 border-2 border-[#50C878]/50 flex items-center justify-center backdrop-blur-sm group-hover:from-[#50C878]/50 group-hover:to-[#50C878]/35 transition-all shadow-lg group-hover:shadow-[0_0_20px_rgba(80,200,120,0.4)]"
              whileHover={{ rotate: 10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <GiRose className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#50C878] group-hover:scale-110 transition-transform" />
            </motion.div>
            <span className="font-orquidea text-base sm:text-lg font-bold text-white group-hover:text-[#50C878] transition-colors">
              Sacuanjoche
            </span>
          </motion.a>

          {/* Menú desktop con más vida */}
          <div className="hidden md:flex items-center space-x-0.5">
            {menuItems.map((item) => {
              const isHashLink = item.href.startsWith('#');
              
              if (isHashLink) {
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleHashLink(e, item.href)}
                    className="px-3 py-1.5 text-white/80 hover:text-[#50C878] transition-colors font-medium text-xs uppercase tracking-wider relative group cursor-pointer"
                    whileHover={{ y: -1 }}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#50C878] to-[#3aa85c] group-hover:w-full transition-all duration-300" />
                    <span className="absolute inset-0 bg-[#50C878]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                  </motion.a>
                );
              }

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-3 py-1.5 text-white/80 hover:text-[#50C878] transition-colors font-medium text-xs uppercase tracking-wider relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#50C878] to-[#3aa85c] group-hover:w-full transition-all duration-300" />
                  <span className="absolute inset-0 bg-[#50C878]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </Link>
              );
            })}

            {/* Usuario autenticado - Solo mostrar correo y botón cerrar sesión */}
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 ml-1.5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-white/80 font-medium text-xs uppercase tracking-wider">
                  <HiUser className="w-3.5 h-3.5 text-[#50C878]" />
                  <span className="hidden sm:inline text-[#50C878]">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-white/80 hover:text-red-400 transition-colors font-medium text-xs uppercase tracking-wider relative group"
                >
                  <HiLogout className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cerrar sesión</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-400 group-hover:w-full transition-all duration-300" />
                </button>
              </div>
            )}

            {/* Botones de login/registro si no está autenticado */}
            {!isAuthenticated && (
              <div className="ml-1.5 flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-white/80 hover:text-[#50C878] transition-colors font-medium text-xs uppercase tracking-wider relative group"
                >
                  Iniciar sesión
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-linear-to-r from-[#50C878] to-[#3aa85c] group-hover:w-full transition-all duration-300" />
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-[#50C878] text-white rounded-md hover:bg-[#00A87F] transition-colors font-medium text-xs uppercase tracking-wider"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Botón menú móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white p-1.5 hover:text-[#50C878] transition-colors relative z-10 rounded-lg hover:bg-white/5"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <HiX size={22} /> : <HiMenu size={22} />}
          </button>
        </div>

        {/* Menú móvil - Drawer lateral moderno */}
        {isMenuOpen && (
          <>
            {/* Overlay oscuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Drawer lateral */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-[#0D0D0D] border-l border-white/10 shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                {/* Header del drawer */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#50C878]/40 to-[#50C878]/25 border-2 border-[#50C878]/50 flex items-center justify-center">
                      <GiRose className="w-4 h-4 text-[#50C878]" />
                    </div>
                    <span className="font-orquidea text-base font-bold text-white">Sacuanjoche</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <HiX size={20} />
                  </button>
                </div>

                {/* Contenido del menú */}
                <div className="flex-1 py-4">
                  {menuItems.map((item) => {
                    const isHashLink = item.href.startsWith('#');
                    
                    if (isHashLink) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleHashLink(e, item.href)}
                          className="block py-2.5 px-6 text-white/80 hover:text-[#50C878] hover:bg-white/5 transition-all font-medium text-sm uppercase tracking-wider cursor-pointer border-l-2 border-transparent hover:border-[#50C878]"
                        >
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2.5 px-6 text-white/80 hover:text-[#50C878] hover:bg-white/5 transition-all font-medium text-sm uppercase tracking-wider border-l-2 border-transparent hover:border-[#50C878]"
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  {/* Opciones de usuario en menú móvil */}
                  {isAuthenticated && user && (
                    <>
                      <div className="border-t border-white/10 my-4 mx-4"></div>
                      <div className="px-6 py-3 mb-2">
                        <p className="text-sm font-semibold text-white">{nombreUsuario}</p>
                        <p className="text-xs text-white/60 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 py-2.5 px-6 text-white/80 hover:text-[#50C878] hover:bg-white/5 transition-all font-medium text-sm uppercase tracking-wider border-l-2 border-transparent hover:border-red-500"
                      >
                        <HiLogout className="w-4 h-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </>
                  )}

                  {/* Botones de login/registro en menú móvil si no está autenticado */}
                  {!isAuthenticated && (
                    <>
                      <div className="border-t border-white/10 my-4 mx-4"></div>
                      <div className="px-4 space-y-2">
                        <Link
                          to="/login"
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2.5 px-4 text-center text-white/80 hover:text-[#50C878] hover:bg-white/5 rounded-lg transition-all font-medium text-sm uppercase tracking-wider border border-white/10 hover:border-[#50C878]"
                        >
                          Iniciar sesión
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setIsMenuOpen(false)}
                          className="block py-2.5 px-4 bg-[#50C878] text-white rounded-lg hover:bg-[#00A87F] transition-all font-medium text-sm uppercase tracking-wider text-center"
                        >
                          Registrarse
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </nav>

    </motion.header>
  );
};
