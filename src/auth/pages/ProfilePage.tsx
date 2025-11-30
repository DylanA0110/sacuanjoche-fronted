import { useAuthStore } from '@/auth/store/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { 
  MdEmail, 
  MdPerson, 
  MdSecurity, 
  MdCheckCircle, 
  MdCancel,
  MdBusiness,
  MdShoppingBag,
  MdAdminPanelSettings,
  MdLocalShipping,
  MdAccountCircle,
  MdPhone,
  MdCalendarToday
} from 'react-icons/md';
import { getTokenExpiration } from '@/shared/utils/tokenUtils';

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No hay información de usuario disponible</p>
      </div>
    );
  }

  // Obtener información del usuario
  const nombreCompleto = 
    user.empleado?.nombreCompleto || 
    user.cliente?.nombreCompleto ||
    (user.empleado?.primerNombre && user.empleado?.primerApellido
      ? `${user.empleado.primerNombre} ${user.empleado.primerApellido}`
      : user.cliente?.primerNombre && user.cliente?.primerApellido
      ? `${user.cliente.primerNombre} ${user.cliente.primerApellido}`
      : user.email.split('@')[0]);

  const iniciales = nombreCompleto
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user.email.charAt(0).toUpperCase();

  // Obtener información del token
  const token = localStorage.getItem('token');
  const tokenExpiration = token ? getTokenExpiration(token) : null;
  const expirationDate = tokenExpiration ? new Date(tokenExpiration) : null;

  // Mapear roles a iconos y colores más sutiles
  const getRoleInfo = (role: string) => {
    const roleMap: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
      admin: {
        icon: <MdAdminPanelSettings className="h-4 w-4" />,
        color: 'bg-slate-100 text-slate-700 border-slate-300',
        label: 'Administrador'
      },
      vendedor: {
        icon: <MdShoppingBag className="h-4 w-4" />,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Vendedor'
      },
      conductor: {
        icon: <MdLocalShipping className="h-4 w-4" />,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'Conductor'
      },
      cliente: {
        icon: <MdAccountCircle className="h-4 w-4" />,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Cliente'
      },
    };

    return roleMap[role.toLowerCase()] || {
      icon: <MdPerson className="h-4 w-4" />,
      color: 'bg-gray-50 text-gray-700 border-gray-200',
      label: role
    };
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header con Avatar - Diseño más limpio */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b border-gray-200">
        <div className="relative">
          <Avatar className="h-20 w-20 md:h-28 md:w-28 ring-2 ring-gray-200 shadow-md">
            <AvatarFallback className="bg-linear-to-br from-slate-700 to-slate-900 text-white text-xl md:text-2xl font-semibold">
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-gray-200">
            {user.estado === 'activo' ? (
              <MdCheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <MdCancel className="h-5 w-5 text-red-500" />
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {nombreCompleto}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <MdEmail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                user.estado === 'activo' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-red-50 text-red-700 border-red-300'
              }`}
            >
              {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid de Información - Diseño más profesional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Personal */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MdPerson className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">Información Personal</CardTitle>
            </div>
            <CardDescription>
              Detalles de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <MdEmail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 mb-1">Correo Electrónico</p>
                  <p className="text-sm text-gray-900 wrap-break-word">{user.email}</p>
                </div>
              </div>

              {user.empleado && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <MdBusiness className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Tipo de Usuario</p>
                      <p className="text-sm font-medium text-gray-900">Empleado</p>
                    </div>
                  </div>

                  {user.empleado.primerNombre && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Primer Nombre</p>
                        <p className="text-sm text-gray-900">{user.empleado.primerNombre}</p>
                      </div>
                    </div>
                  )}

                  {user.empleado.segundoNombre && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Segundo Nombre</p>
                        <p className="text-sm text-gray-900">{user.empleado.segundoNombre}</p>
                      </div>
                    </div>
                  )}

                  {user.empleado.primerApellido && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Primer Apellido</p>
                        <p className="text-sm text-gray-900">{user.empleado.primerApellido}</p>
                      </div>
                    </div>
                  )}

                  {user.empleado.segundoApellido && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Segundo Apellido</p>
                        <p className="text-sm text-gray-900">{user.empleado.segundoApellido}</p>
                      </div>
                    </div>
                  )}

                  {user.empleado.nombreCompleto && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <MdPerson className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-600 mb-1">Nombre Completo</p>
                        <p className="text-sm font-semibold text-blue-900">{user.empleado.nombreCompleto}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {user.cliente && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <MdAccountCircle className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-500 mb-1">Tipo de Usuario</p>
                      <p className="text-sm font-medium text-gray-900">Cliente</p>
                    </div>
                  </div>

                  {user.cliente.primerNombre && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Primer Nombre</p>
                        <p className="text-sm text-gray-900">{user.cliente.primerNombre}</p>
                      </div>
                    </div>
                  )}

                  {user.cliente.segundoNombre && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Segundo Nombre</p>
                        <p className="text-sm text-gray-900">{user.cliente.segundoNombre}</p>
                      </div>
                    </div>
                  )}

                  {user.cliente.primerApellido && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Primer Apellido</p>
                        <p className="text-sm text-gray-900">{user.cliente.primerApellido}</p>
                      </div>
                    </div>
                  )}

                  {user.cliente.segundoApellido && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                      <MdPerson className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 mb-1">Segundo Apellido</p>
                        <p className="text-sm text-gray-900">{user.cliente.segundoApellido}</p>
                      </div>
                    </div>
                  )}

                  {user.cliente.nombreCompleto && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <MdPerson className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-600 mb-1">Nombre Completo</p>
                        <p className="text-sm font-semibold text-blue-900">{user.cliente.nombreCompleto}</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <MdSecurity className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Estado de la Cuenta</p>
                  <Badge 
                    variant="outline" 
                    className={`${
                      user.estado === 'activo' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles y Permisos */}
        <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <MdSecurity className="h-5 w-5 text-gray-600" />
              <CardTitle className="text-gray-900">Roles y Permisos</CardTitle>
            </div>
            <CardDescription>
              Permisos asignados a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role, index) => {
                  const roleInfo = getRoleInfo(role);
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-4 rounded-lg border ${roleInfo.color}`}
                    >
                      <div className="shrink-0">
                        {roleInfo.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{roleInfo.label}</p>
                        <p className="text-xs text-gray-600 mt-0.5">Rol: {role}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay roles asignados
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información de Sesión */}
        {expirationDate && (
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <MdCalendarToday className="h-5 w-5 text-gray-600" />
                <CardTitle className="text-gray-900">Información de Sesión</CardTitle>
              </div>
              <CardDescription>
                Detalles de tu sesión actual
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Sesión Expira</p>
                  <p className="text-sm font-medium text-gray-900">
                    {expirationDate.toLocaleString('es-ES', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes
                  </p>
                </div>

                {user.blockedUntil && (
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs font-medium text-red-600 mb-2">Cuenta Bloqueada Hasta</p>
                    <p className="text-sm font-medium text-red-900">
                      {new Date(user.blockedUntil).toLocaleString('es-ES', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
