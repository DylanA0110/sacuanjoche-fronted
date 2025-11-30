import { useState, useMemo, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import { MdEdit, MdDelete, MdSearch, MdVisibility, MdVisibilityOff, MdPersonAdd } from 'react-icons/md';
import { useEmpleado } from '../hook/useEmpleado';
import { EmpleadoForm } from '../components/EmpleadoForm';
import type { Empleado, CreateEmpleadoDto, UpdateEmpleadoDto } from '../types/empleado.interface';
import {
  createEmpleado,
  updateEmpleado,
  registerEmployeeUser,
  updateUserRoles,
} from '../actions';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAuthStore } from '@/auth/store/auth.store';

export default function EmpleadosPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Formulario para crear empleado (directo en la página)
  const [empleadoForm, setEmpleadoForm] = useState<CreateEmpleadoDto>({
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    sexo: 'M',
    telefono: '',
    fechaNac: '',
    estado: 'activo',
  });

  // Formulario para crear usuario
  const [usuarioForm, setUsuarioForm] = useState({
    email: '',
    password: '',
    empleadoId: '',
  });

  // Formulario para actualizar roles
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { empleados, isLoading } = useEmpleado({ usePagination: false });

  // Filtrar empleados
  const filteredEmpleados = useMemo(() => {
    if (!empleados) return [];
    if (!debouncedSearch) return empleados;

    return empleados.filter((empleado) => {
      const search = debouncedSearch.toLowerCase();
      const nombre = `${empleado.primerNombre} ${empleado.primerApellido}`.toLowerCase();
      const telefono = empleado.telefono?.toLowerCase() || '';
      const estado = empleado.estado?.toLowerCase() || '';
      const email = empleado.user?.email?.toLowerCase() || '';

      return (
        nombre.includes(search) ||
        telefono.includes(search) ||
        estado.includes(search) ||
        email.includes(search)
      );
    });
  }, [empleados, debouncedSearch]);

  // Extraer usuarios de empleados
  const users = useMemo(() => {
    if (!empleados) return [];
    const usuarios: Array<{
      id: string;
      email: string;
      roles: string[];
      empleado: { idEmpleado: number; primerNombre: string; primerApellido: string };
    }> = [];
    empleados.forEach((empleado) => {
      if (empleado.user && empleado.user.id) {
        usuarios.push({
          id: empleado.user.id,
          email: empleado.user.email,
          roles: empleado.user.roles || [],
          empleado: {
            idEmpleado: empleado.idEmpleado,
            primerNombre: empleado.primerNombre,
            primerApellido: empleado.primerApellido,
          },
        });
      }
    });
    return usuarios;
  }, [empleados]);

  // Mutaciones
  const createEmpleadoMutation = useMutation({
    mutationFn: createEmpleado,
    onSuccess: (data) => {
      toast.success('Empleado creado exitosamente');
      // Limpiar formulario
      setEmpleadoForm({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        sexo: 'M',
        telefono: '',
        fechaNac: '',
        estado: 'activo',
      });
      // Auto-seleccionar el empleado recién creado en el formulario de usuario
      if (data?.idEmpleado) {
        setUsuarioForm((prev) => ({
          ...prev,
          empleadoId: String(data.idEmpleado),
        }));
      }
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al crear empleado';
      toast.error(message);
    },
  });

  const updateEmpleadoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmpleadoDto }) =>
      updateEmpleado(id, data),
    onSuccess: () => {
      toast.success('Empleado actualizado exitosamente');
      setIsEditFormOpen(false);
      setEditingEmpleado(null);
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al actualizar empleado';
      toast.error(message);
    },
  });

  const deleteEmpleadoMutation = useMutation({
    mutationFn: (id: number) =>
      updateEmpleado(id, { estado: 'inactivo' }),
    onSuccess: () => {
      toast.success('Empleado marcado como inactivo');
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al eliminar empleado';
      toast.error(message);
    },
  });

  const registerUsuarioMutation = useMutation({
    mutationFn: registerEmployeeUser,
    onSuccess: () => {
      toast.success('Usuario creado correctamente');
      setUsuarioForm({ email: '', password: '', empleadoId: '' });
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al crear usuario';
      toast.error(message);
    },
  });

  const updateRolesMutation = useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      updateUserRoles(userId, { roles }),
    onSuccess: () => {
      toast.success('Roles actualizados correctamente');
      setSelectedUserId('');
      setSelectedRoles([]);
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al actualizar roles';
      toast.error(message);
    },
  });

  // Handlers
  const handleEdit = useCallback((empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setIsEditFormOpen(true);
  }, []);

  const handleDelete = useCallback(
    (empleado: Empleado) => {
      if (
        window.confirm(
          `¿Estás seguro de que deseas marcar como inactivo al empleado ${empleado.primerNombre} ${empleado.primerApellido}?`
        )
      ) {
        deleteEmpleadoMutation.mutate(empleado.idEmpleado);
      }
    },
    [deleteEmpleadoMutation]
  );

  const handleCreateEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !empleadoForm.primerNombre ||
      !empleadoForm.primerApellido ||
      !empleadoForm.telefono ||
      !empleadoForm.fechaNac
    ) {
      toast.error('Todos los campos requeridos deben estar completos');
      return;
    }
    // Formatear teléfono: agregar 505 si no lo tiene
    const telefonoLimpio = empleadoForm.telefono.replace(/\D/g, '');
    if (telefonoLimpio.length !== 8) {
      toast.error('El teléfono debe tener 8 dígitos');
      return;
    }
    const telefonoBackend = `505${telefonoLimpio}`;
    createEmpleadoMutation.mutate({
      ...empleadoForm,
      telefono: telefonoBackend,
    });
  };

  const handleEditSubmit = useCallback(
    (data: UpdateEmpleadoDto) => {
      if (editingEmpleado) {
        updateEmpleadoMutation.mutate({
          id: editingEmpleado.idEmpleado,
          data,
        });
      }
    },
    [editingEmpleado, updateEmpleadoMutation]
  );

  const handleRegisterUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioForm.email || !usuarioForm.password || !usuarioForm.empleadoId) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    registerUsuarioMutation.mutate({
      email: usuarioForm.email.trim().toLowerCase(),
      password: usuarioForm.password,
      empleadoId: Number(usuarioForm.empleadoId),
    });
  };

  const handleUpdateRoles = () => {
    if (!selectedUserId || selectedRoles.length === 0) {
      toast.error('Selecciona un usuario y al menos un rol');
      return;
    }
    updateRolesMutation.mutate({
      userId: selectedUserId,
      roles: selectedRoles.map((r) => r.trim().toLowerCase()),
    });
  };

  const formatTelefono = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 8);
    return cleaned;
  };

  const handleTelefonoChange = (value: string) => {
    const cleaned = formatTelefono(value);
    setEmpleadoForm((prev) => ({
      ...prev,
      telefono: cleaned,
    }));
  };

  // Verificar si es admin
  const isAdmin = user?.roles?.includes('admin');

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso Denegado
          </h2>
          <p className="text-gray-600">
            Solo los administradores pueden acceder a esta sección
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
        <p className="text-sm text-gray-600 mt-1">
          Administra los empleados del sistema
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulario para crear empleado */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MdPersonAdd className="h-5 w-5 text-[#50C878]" />
              <CardTitle className="text-lg">Crear Empleado</CardTitle>
            </div>
            <CardDescription>
              Registra un nuevo empleado en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateEmpleado} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primerNombre">Primer Nombre *</Label>
                <Input
                  id="primerNombre"
                  value={empleadoForm.primerNombre}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, primerNombre: e.target.value })
                  }
                  placeholder="Juan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segundoNombre">Segundo Nombre</Label>
                <Input
                  id="segundoNombre"
                  value={empleadoForm.segundoNombre || ''}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, segundoNombre: e.target.value || undefined })
                  }
                  placeholder="Pedro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primerApellido">Primer Apellido *</Label>
                <Input
                  id="primerApellido"
                  value={empleadoForm.primerApellido}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, primerApellido: e.target.value })
                  }
                  placeholder="Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="segundoApellido">Segundo Apellido</Label>
                <Input
                  id="segundoApellido"
                  value={empleadoForm.segundoApellido || ''}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, segundoApellido: e.target.value || undefined })
                  }
                  placeholder="González"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sexo">Sexo *</Label>
                <Select
                  value={empleadoForm.sexo}
                  onValueChange={(value) =>
                    setEmpleadoForm({ ...empleadoForm, sexo: value as 'M' | 'F' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono *</Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    +505
                  </div>
                  <Input
                    id="telefono"
                    type="tel"
                    value={empleadoForm.telefono}
                    onChange={(e) => handleTelefonoChange(e.target.value)}
                    className="pl-14"
                    placeholder="12345678"
                    maxLength={8}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNac">Fecha de Nacimiento *</Label>
                <Input
                  id="fechaNac"
                  type="date"
                  value={empleadoForm.fechaNac}
                  onChange={(e) =>
                    setEmpleadoForm({ ...empleadoForm, fechaNac: e.target.value })
                  }
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createEmpleadoMutation.isPending}
              >
                {createEmpleadoMutation.isPending
                  ? 'Creando...'
                  : 'Crear Empleado'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Formulario para crear usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crear Usuario</CardTitle>
            <CardDescription>
              Crea un usuario para un empleado existente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegisterUsuario} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={usuarioForm.email}
                  onChange={(e) =>
                    setUsuarioForm({ ...usuarioForm, email: e.target.value })
                  }
                  placeholder="empleado@empresa.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={usuarioForm.password}
                    onChange={(e) =>
                      setUsuarioForm({ ...usuarioForm, password: e.target.value })
                    }
                    placeholder="ClaveTemporal123"
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <MdVisibilityOff className="h-4 w-4" />
                    ) : (
                      <MdVisibility className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="empleadoId">Empleado *</Label>
                <Select
                  value={usuarioForm.empleadoId}
                  onValueChange={(value) =>
                    setUsuarioForm({ ...usuarioForm, empleadoId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <SelectItem value="loading" disabled>
                        Cargando...
                      </SelectItem>
                    ) : empleados && empleados.length > 0 ? (
                      (() => {
                        const empleadosSinUsuario = empleados.filter(
                          (e) => !e.user || !e.user.id
                        );
                        return empleadosSinUsuario.length > 0 ? (
                          empleadosSinUsuario.map((empleado) => (
                            <SelectItem
                              key={empleado.idEmpleado}
                              value={empleado.idEmpleado.toString()}
                            >
                              {empleado.primerNombre} {empleado.primerApellido}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-empleados" disabled>
                            Todos los empleados ya tienen usuario
                          </SelectItem>
                        );
                      })()
                    ) : (
                      <SelectItem value="no-empleados" disabled>
                        No hay empleados disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={registerUsuarioMutation.isPending || !usuarioForm.empleadoId}
              >
                {registerUsuarioMutation.isPending
                  ? 'Creando...'
                  : 'Crear Usuario'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Formulario para actualizar roles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actualizar Roles</CardTitle>
            <CardDescription>
              Cambia los roles de un usuario existente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Usuario</Label>
              <Select
                value={selectedUserId}
                onValueChange={(value) => {
                  setSelectedUserId(value);
                  const user = users.find((u) => u.id === value);
                  if (user?.roles) {
                    setSelectedRoles(
                      user.roles
                        .map((r) => r.trim().toLowerCase())
                        .filter((r) => ['vendedor', 'conductor'].includes(r))
                    );
                  } else {
                    setSelectedRoles([]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent>
                  {users.length > 0 ? (
                    users.map((user) => {
                      const empleadoName = `${user.empleado.primerNombre} ${user.empleado.primerApellido}`;
                      const rolesText =
                        user.roles.length > 0 ? user.roles.join(', ') : 'Sin roles';
                      return (
                        <SelectItem key={user.id} value={user.id}>
                          {user.email} - {empleadoName} ({rolesText})
                        </SelectItem>
                      );
                    })
                  ) : (
                    <SelectItem value="no-users" disabled>
                      No hay usuarios disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedUserId && (
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {['vendedor', 'conductor'].map((role) => {
                    const roleLower = role.toLowerCase();
                    return (
                      <div key={roleLower} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={roleLower}
                          checked={selectedRoles.includes(roleLower)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRoles([...selectedRoles, roleLower]);
                            } else {
                              setSelectedRoles(
                                selectedRoles.filter((r) => r !== roleLower)
                              );
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label
                          htmlFor={roleLower}
                          className="font-normal cursor-pointer"
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <Button
              onClick={handleUpdateRoles}
              className="w-full"
              disabled={updateRolesMutation.isPending || !selectedUserId}
            >
              {updateRolesMutation.isPending
                ? 'Actualizando...'
                : 'Actualizar Roles'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de empleados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empleados</CardTitle>
          <CardDescription>
            Todos los empleados registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por nombre, teléfono, email o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando empleados...
                    </TableCell>
                  </TableRow>
                ) : filteredEmpleados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      {searchTerm
                        ? 'No se encontraron empleados que coincidan con la búsqueda'
                        : 'No hay empleados registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmpleados.map((empleado) => {
                    const associatedUser = users.find(
                      (u) => u.empleado.idEmpleado === empleado.idEmpleado
                    );
                    const email = associatedUser?.email || '—';
                    const roles = associatedUser?.roles || [];

                    return (
                      <TableRow key={empleado.idEmpleado}>
                        <TableCell className="font-medium">
                          {empleado.primerNombre} {empleado.primerApellido}
                        </TableCell>
                        <TableCell className="text-sm">{email}</TableCell>
                        <TableCell>
                          {roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {roles.map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{empleado.telefono}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              empleado.estado === 'activo' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {empleado.estado === 'activo' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(empleado)}
                            >
                              <MdEdit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(empleado)}
                              disabled={
                                deleteEmpleadoMutation.isPending ||
                                empleado.estado === 'inactivo'
                              }
                              className="text-destructive hover:text-destructive"
                            >
                              <MdDelete className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de formulario para editar */}
      <EmpleadoForm
        open={isEditFormOpen}
        onOpenChange={(open) => {
          setIsEditFormOpen(open);
          if (!open) {
            setEditingEmpleado(null);
          }
        }}
        empleado={editingEmpleado}
        onSubmit={handleEditSubmit}
        isLoading={updateEmpleadoMutation.isPending}
      />
    </div>
  );
}
