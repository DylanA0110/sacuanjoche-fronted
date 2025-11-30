import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GiRose } from 'react-icons/gi';
import { HiMail, HiLockClosed, HiEye, HiEyeOff, HiUser, HiPhone } from 'react-icons/hi';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { checkAuthAction } from '../actions/check-status';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { createCliente } from '@/cliente/actions/createCliente';
import { registerAction } from '../actions/register.action';
import type { CreateClienteDto } from '@/cliente/types/cliente.interface';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';

interface RegisterFormData {
  primerNombre: string;
  primerApellido: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, isAuthenticated } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      primerNombre: '',
      primerApellido: '',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const password = watch('password');

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

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    try {
      const clienteData: CreateClienteDto = {
        primerNombre: data.primerNombre.trim(),
        primerApellido: data.primerApellido.trim(),
        telefono: data.telefono.trim(),
        estado: 'activo',
      };

      let nuevoCliente;
      try {
        nuevoCliente = await createCliente(clienteData);
      } catch (error: any) {
        const message = cleanErrorMessage(error);
        toast.error(message);
        setIsLoading(false);
        return;
      }

      const userData = await registerAction({
        email: data.email.trim(),
        password: data.password,
        clienteId: nuevoCliente.idCliente,
        empleadoId: null,
        estado: 'activo',
      });

      setUser(userData);
      
      const nombreCompleto = `${data.primerNombre} ${data.primerApellido}`;
      toast.success(`¡Cuenta creada exitosamente, ${nombreCompleto}!`);

      navigate('/', { replace: true });
    } catch (error: any) {
      const message = cleanErrorMessage(error);
      toast.error(message);
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
          className="w-full max-w-lg"
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
              Crear Cuenta
            </p>
            <p className="text-slate-600 text-sm sm:text-base">
              Únete a nuestra comunidad
            </p>
          </div>

          {/* Formulario mejorado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-900/5"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Grid de 2 columnas para nombre y apellido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Primer Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Primer Nombre
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('primerNombre', {
                        required: 'El primer nombre es requerido',
                        minLength: {
                          value: 2,
                          message: 'El nombre debe tener al menos 2 caracteres',
                        },
                      })}
                      placeholder="Juan"
                      className={`w-full px-4 py-3 pl-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.primerNombre ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  {errors.primerNombre && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.primerNombre.message}</p>
                  )}
                </div>

                {/* Primer Apellido */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Primer Apellido
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register('primerApellido', {
                        required: 'El primer apellido es requerido',
                        minLength: {
                          value: 2,
                          message: 'El apellido debe tener al menos 2 caracteres',
                        },
                      })}
                      placeholder="Pérez"
                      className={`w-full px-4 py-3 pl-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.primerApellido ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  {errors.primerApellido && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.primerApellido.message}</p>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^[0-9+\-\s()]+$/,
                        message: 'Teléfono inválido',
                      },
                    })}
                    placeholder="+505 1234-5678"
                    className={`w-full px-4 py-3 pl-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      errors.telefono ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  <HiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                {errors.telefono && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.telefono.message}</p>
                )}
              </div>

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

              {/* Grid de 2 columnas para contraseñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Por favor confirma tu contraseña',
                        validate: (value) =>
                          value === password || 'Las contraseñas no coinciden',
                      })}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.confirmPassword ? 'border-red-400 focus:border-red-400' : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <HiEyeOff className="w-5 h-5" />
                      ) : (
                        <HiEye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Botón submit mejorado */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3.5 bg-linear-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transform hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creando cuenta...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </form>

            {/* Links mejorados */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-sm text-slate-600">
                ¿Ya tienes una cuenta?{' '}
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                >
                  Inicia sesión
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
