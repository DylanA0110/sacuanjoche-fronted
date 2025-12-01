import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GiRose } from 'react-icons/gi';
import {
  HiMail,
  HiLockClosed,
  HiEye,
  HiEyeOff,
  HiUser,
} from 'react-icons/hi';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { checkAuthAction } from '../actions/check-status';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { registerAction } from '../actions/register.action';
import { loginAction } from '../actions/login.action';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import {
  formatTelefono,
  formatTelefonoForBackend,
} from '@/shared/utils/validation';

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
    setValue,
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

  // Handler para formatear teléfono
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefono(e.target.value);
    setValue('telefono', formatted);
  };

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
    // Guardar en localStorage para que no se pierda
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'REGISTRO_INICIADO',
      data: { email: data.email, primerNombre: data.primerNombre },
    };
    const existingLogs = JSON.parse(
      localStorage.getItem('register_logs') || '[]'
    );
    existingLogs.push(logEntry);
    localStorage.setItem(
      'register_logs',
      JSON.stringify(existingLogs.slice(-20))
    ); // Guardar últimos 20

    setIsLoading(true);

    try {
      // Preparar clienteData para el registro
      // El usuario solo escribe 8 dígitos, el 505 se agrega internamente
      const telefonoBackend = formatTelefonoForBackend(data.telefono);

      const clienteData = {
        primerNombre: data.primerNombre.trim(),
        primerApellido: data.primerApellido.trim(),
        // No se pide dirección en el formulario actual
        telefono: telefonoBackend,
      };

      // 1. Registrar al usuario con clienteData (el backend crea el cliente automáticamente)
      // Solo enviar email, password y clienteData (sin clienteId ni empleadoId)
      const registerData = {
        email: data.email.trim(),
        password: data.password,
        clienteData: clienteData, // Enviar clienteData directamente
      };

      try {
        await registerAction(registerData);

        // Guardar en localStorage
        const logEntry = {
          timestamp: new Date().toISOString(),
          action: 'USUARIO_REGISTRADO',
        };
        const existingLogs = JSON.parse(
          localStorage.getItem('register_logs') || '[]'
        );
        existingLogs.push(logEntry);
        localStorage.setItem(
          'register_logs',
          JSON.stringify(existingLogs.slice(-20))
        );
      } catch (error: any) {
        // Guardar error en localStorage
        const logEntry = {
          timestamp: new Date().toISOString(),
          action: 'ERROR_REGISTRAR_USUARIO',
          error: {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          },
        };
        const existingLogs = JSON.parse(
          localStorage.getItem('register_logs') || '[]'
        );
        existingLogs.push(logEntry);
        localStorage.setItem(
          'register_logs',
          JSON.stringify(existingLogs.slice(-20))
        );

        // Extraer mensaje del backend de forma más específica
        let errorMessage = 'Error al crear la cuenta';

        if (error.response?.data) {
          const errorData = error.response.data;
          // Intentar obtener el mensaje de diferentes formas
          errorMessage =
            errorData.message ||
            errorData.error ||
            (Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : null) ||
            (typeof errorData === 'string' ? errorData : null) ||
            errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Limpiar y mostrar el mensaje con sonner (pasar el error completo)
        const cleanMessage = cleanErrorMessage(error);
        toast.error(cleanMessage, {
          duration: 5000,
        });

        setIsLoading(false);
        return;
      }

      // 3. Después del registro exitoso, hacer login automático
      const loginData = {
        email: data.email.trim(),
        password: data.password,
      };

      let loginResponse;
      try {
        loginResponse = await loginAction(loginData);
      } catch (error: any) {
        // Extraer mensaje del backend de forma más específica
        let errorMessage = 'Error al iniciar sesión';

        if (error.response?.data) {
          const errorData = error.response.data;
          errorMessage =
            errorData.message ||
            errorData.error ||
            (Array.isArray(errorData.message)
              ? errorData.message.join(', ')
              : null) ||
            (typeof errorData === 'string' ? errorData : null) ||
            errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Limpiar y mostrar el mensaje con sonner (pasar el error completo)
        const cleanMessage = cleanErrorMessage(error);
        toast.error(cleanMessage, {
          duration: 5000,
        });

        setIsLoading(false);
        return;
      }

      // 4. El login devuelve { token, id, email, roles, cliente: {...}, empleado: {...} }
      const { token, id, roles, cliente } = loginResponse;

      if (token && cliente) {
        // Obtener datos del cliente
        const clienteNombre =
          cliente.nombreCompleto ||
          [cliente.primerNombre, cliente.primerApellido]
            .filter(Boolean)
            .join(' ') ||
          `${data.primerNombre} ${data.primerApellido}`;

        // Guardar token en localStorage (ya lo hace loginAction, pero nos aseguramos)
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);
        }

        // Establecer el usuario en el store con los datos del login
        setUser(loginResponse);

        // También guardar datos adicionales en localStorage para compatibilidad
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'user',
              JSON.stringify({
                id: id,
                email: data.email.trim(),
                cliente: cliente,
                roles: roles || [],
              })
            );
          }
        } catch (error) {
          // Error al guardar - continuar de todas formas
        }

        toast.success(
          `¡Bienvenido, ${clienteNombre}! Tu cuenta ha sido creada exitosamente.`
        );

        // Redirigir a la landing page (ya está autenticado)
        navigate('/', { replace: true });
      } else {
        // Si no viene el token o cliente, mostrar error pero NO redirigir
        toast.error(
          'Error: No se pudo completar el inicio de sesión automático. Por favor, intenta iniciar sesión manualmente.',
          {
            duration: 5000,
          }
        );
        // NO redirigir al login, quedarse en la página de registro
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      // Guardar error en localStorage
      const logEntry = {
        timestamp: new Date().toISOString(),
        action: 'ERROR_GENERAL_REGISTRO',
        error: {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        },
      };
      const existingLogs = JSON.parse(
        localStorage.getItem('register_logs') || '[]'
      );
      existingLogs.push(logEntry);
      localStorage.setItem(
        'register_logs',
        JSON.stringify(existingLogs.slice(-20))
      );

      // Extraer mensaje del backend de forma más específica
      let errorMessage = 'Error al procesar el registro';

      if (error.response?.data) {
        const errorData = error.response.data;
        errorMessage =
          errorData.message ||
          errorData.error ||
          (Array.isArray(errorData.message)
            ? errorData.message.join(', ')
            : null) ||
          (typeof errorData === 'string' ? errorData : null) ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Limpiar y mostrar el mensaje con sonner (pasar el error completo)
      const cleanMessage = cleanErrorMessage(error);
      toast.error(cleanMessage, {
        duration: 5000,
      });

      // NO redirigir al login cuando hay error, quedarse en la página de registro
      setIsLoading(false);
      // NO hacer return aquí, dejar que el finally se ejecute
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
            <form
              onSubmit={(e) => {
                // PREVENIR RECARGA DE PÁGINA
                e.preventDefault();
                e.stopPropagation();

                // Guardar en localStorage
                const logEntry = {
                  timestamp: new Date().toISOString(),
                  action: 'FORMULARIO_ENVIADO',
                };
                const existingLogs = JSON.parse(
                  localStorage.getItem('register_logs') || '[]'
                );
                existingLogs.push(logEntry);
                localStorage.setItem(
                  'register_logs',
                  JSON.stringify(existingLogs.slice(-20))
                );

                // Ejecutar handleSubmit sin recargar
                handleSubmit(onSubmit)(e);
              }}
              className="space-y-5"
            >
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
                        errors.primerNombre
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  {errors.primerNombre && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.primerNombre.message}
                    </p>
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
                          message:
                            'El apellido debe tener al menos 2 caracteres',
                        },
                      })}
                      placeholder="Pérez"
                      className={`w-full px-4 py-3 pl-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.primerApellido
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                  {errors.primerApellido && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.primerApellido.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Teléfono * (8 dígitos)
                </label>
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-[52px] px-3 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-sm font-medium text-slate-700">
                    +505
                  </div>
                  <input
                    type="tel"
                    {...register('telefono', {
                      required: 'El teléfono es requerido',
                      pattern: {
                        value: /^\d{8}$/,
                        message: 'El teléfono debe tener 8 dígitos',
                      },
                    })}
                    onChange={handleTelefonoChange}
                    placeholder="12345678"
                    maxLength={8}
                    className={`flex-1 px-4 py-3 border rounded-r-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                      errors.telefono
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.telefono && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.telefono.message}
                  </p>
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
                      errors.email
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
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
                          message:
                            'La contraseña debe tener al menos 4 caracteres',
                        },
                      })}
                      placeholder="••••••••"
                      className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl text-sm text-slate-900 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                        errors.password
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-slate-300 focus:border-emerald-500'
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
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.password.message}
                    </p>
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
                        errors.confirmPassword
                          ? 'border-red-400 focus:border-red-400'
                          : 'border-slate-300 focus:border-emerald-500'
                      }`}
                    />
                    <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.confirmPassword.message}
                    </p>
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
