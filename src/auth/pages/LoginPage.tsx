import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GiRose } from 'react-icons/gi';
import { HiMail, HiLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import { toast } from 'sonner';
import { loginAction } from '../actions/login.action';
import { useAuthStore } from '../store/auth.store';
import { checkAuthAction } from '../actions/check-status';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Verificar si ya está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && !isAuthenticated) {
        try {
          const userData = await checkAuthAction();
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
        }
      }
    };
    checkAuth();
  }, [isAuthenticated, setUser]);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const { user } = useAuthStore.getState();
      if (user) {
        const from = (location.state as any)?.from?.pathname;
        
        if (hasAdminPanelAccess(user.roles)) {
          navigate(from || '/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [isAuthenticated, navigate, location]);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const userData = await loginAction({ email: data.email, password: data.password });

      // Asegurar que el token esté guardado antes de actualizar el store
      if (userData.token) {
        localStorage.setItem('token', userData.token);
      }

      // Actualizar el store de Zustand
      setUser(userData);
      
      // Verificar acceso al panel
      const tieneAccesoPanel = hasAdminPanelAccess(userData.roles);
      
      let welcomeMessage = '¡Bienvenido de nuevo!';
      const nombreCompleto = userData.empleado?.nombreCompleto || 
        (userData.empleado?.primerNombre && userData.empleado?.primerApellido
          ? `${userData.empleado.primerNombre} ${userData.empleado.primerApellido}`
          : userData.empleado?.primerNombre || userData.cliente?.nombreCompleto ||
            (userData.cliente?.primerNombre && userData.cliente?.primerApellido
              ? `${userData.cliente.primerNombre} ${userData.cliente.primerApellido}`
              : userData.cliente?.primerNombre || null));
      
      if (nombreCompleto) {
        welcomeMessage = `¡Bienvenido de nuevo, ${nombreCompleto}!`;
      }
      
      toast.success(welcomeMessage);

      // Pequeño delay para asegurar que el store se actualice
      await new Promise(resolve => setTimeout(resolve, 100));

      const from = (location.state as any)?.from?.pathname;
      
      if (tieneAccesoPanel) {
        navigate(from || '/admin', { replace: true });
      } else {
        // Si venía del catálogo, redirigir al catálogo
        navigate(from === '/catalogo' ? '/catalogo' : from || '/', { replace: true });
      }
    } catch (error: any) {
      // Obtener el mensaje del backend directamente de la respuesta
      // El loginAction ya extrae el mensaje del backend, así que usamos error.message
      const errorMessage =
        error instanceof Error
          ? error.message
          : error?.response?.data?.message
          ? error.response.data.message
          : error?.response?.data?.error
          ? error.response.data.error
          : 'Error al iniciar sesión. Verifica tus credenciales.';

      console.error('❌ [LoginPage] Error al iniciar sesión:', {
        message: errorMessage,
        status: error.status || error.response?.status,
        responseData: error.response?.data,
      });

      toast.error(errorMessage, {
        position: 'top-right',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-linear-to-br from-slate-50 via-white to-emerald-50/30 overflow-hidden">
      {/* Efectos de fondo mejorados */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-pink-200/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-300/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo y título mejorado */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-6"
            >
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
                <GiRose className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-sans text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Sacuanjoche
              </h1>
            </motion.div>
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-emerald-600 mb-3">
              Iniciar Sesión
            </p>
            <p className="text-slate-600 text-sm sm:text-base">
              Bienvenido de vuelta
            </p>
          </div>

          {/* Formulario mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-900/5"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    {...register('email', {
                      required: 'El correo electrónico es requerido',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Correo electrónico inválido',
                      },
                    })}
                    placeholder="tu@email.com"
                    className={`w-full px-4 py-3 pl-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      errors.email ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 4,
                        message: 'La contraseña debe tener al menos 4 caracteres',
                      },
                    })}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      errors.password ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <HiEyeOff className="w-5 h-5" />
                    ) : (
                      <HiEye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Botón submit mejorado */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Links mejorados */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-sm text-slate-600">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Regístrate
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/"
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Volver al inicio
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
