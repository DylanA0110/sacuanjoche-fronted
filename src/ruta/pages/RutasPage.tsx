import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConductorColumn } from '../components/ConductorColumn';
import { PedidosDisponibles } from '../components/PedidosDisponibles';
import { getConductores } from '../actions/getConductores';
import { createRuta } from '../actions/createRuta';
import { useRutaStore } from '../store/ruta.store';
import { getPedidos } from '@/pedido/actions/getPedidos';
import type { EmpleadoConductor, PedidoRuta, CreateRutaDto } from '../types/ruta.interface';
import type { Pedido } from '@/pedido/types/pedido.interface';
import { hasAdminPanelAccess } from '@/shared/api/interceptors';
import { useAuthStore } from '@/auth/store/auth.store';
import { Navigate } from 'react-router';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';
import Swal from 'sweetalert2';
import { IoStatsChartOutline, IoTrashOutline, IoInformationCircleOutline } from 'react-icons/io5';

export default function RutasPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const asignaciones = useRutaStore((state) => state.asignaciones);
  const clearAsignaciones = useRutaStore((state) => state.clearAsignaciones);
  const clearAsignacionesByConductor = useRutaStore((state) => state.clearAsignacionesByConductor);
  const [selectedConductor, setSelectedConductor] = useState<EmpleadoConductor | null>(null);

  // Verificar permisos (solo admin y vendedor)
  const canAccess = useMemo(() => {
    if (!user?.roles) return false;
    return hasAdminPanelAccess(user.roles) && 
           (user.roles.includes('admin') || user.roles.includes('vendedor'));
  }, [user?.roles]);

  // Obtener conductores
  const {
    data: conductores = [],
    isLoading: isLoadingConductores,
    isError: isErrorConductores,
  } = useQuery<EmpleadoConductor[]>({
    queryKey: ['conductores'],
    queryFn: getConductores,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1,
  });

  // Obtener pedidos
  const {
    data: pedidosData,
    isLoading: isLoadingPedidos,
    isError: isErrorPedidos,
  } = useQuery<Pedido[]>({
    queryKey: ['pedidos', 'rutas'],
    queryFn: async () => {
      const data = await getPedidos();
      return Array.isArray(data) ? data : data.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });

  // Mapear pedidos a formato PedidoRuta
  const pedidos: PedidoRuta[] = useMemo(() => {
    if (!pedidosData) return [];
    
    return pedidosData.map((pedido: Pedido): PedidoRuta => ({
      idPedido: pedido.idPedido,
      numeroPedido: pedido.numeroPedido || undefined,
      cliente: pedido.cliente
        ? {
            idCliente: pedido.cliente.idCliente,
            primerNombre: pedido.cliente.primerNombre,
            primerApellido: pedido.cliente.primerApellido,
          }
        : undefined,
      direccion: pedido.direccion
        ? {
            idDireccion: pedido.direccion.idDireccion,
            direccionTxt: pedido.direccionTxt || pedido.direccion.formattedAddress || '',
            lat: pedido.direccion.lat ? parseFloat(pedido.direccion.lat) : undefined,
            lng: pedido.direccion.lng ? parseFloat(pedido.direccion.lng) : undefined,
          }
        : undefined,
      estado: pedido.estado,
      fechaEntregaEstimada: pedido.fechaEntregaEstimada,
    }));
  }, [pedidosData]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const totalPedidosAsignados = Object.values(asignaciones).reduce((acc, ids) => acc + ids.length, 0);
    const totalConductores = conductores.length;
    const conductoresConPedidos = Object.keys(asignaciones).filter(id => asignaciones[Number(id)].length > 0).length;
    
    return {
      totalPedidos: pedidos.length,
      totalPedidosAsignados,
      totalPedidosDisponibles: pedidos.length - totalPedidosAsignados,
      totalConductores,
      conductoresConPedidos,
    };
  }, [pedidos, asignaciones, conductores]);

  // Mutación para crear ruta
  const createRutaMutation = useMutation({
    mutationFn: async (data: CreateRutaDto) => {
      return createRuta(data);
    },
    onSuccess: (ruta) => {
      toast.success('Ruta creada exitosamente', {
        description: `Ruta "${ruta.nombre}" creada para ${ruta.empleado?.nombreCompleto || 'conductor'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['rutas'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos', 'rutas'] });
    },
    onError: (error: any) => {
      const message = cleanErrorMessage(error);
      toast.error('Error al crear la ruta', {
        description: message,
        duration: 5000,
      });
    },
  });

  const handleCrearRuta = async (idEmpleado: number) => {
    const pedidosIds = asignaciones[idEmpleado] || [];
    
    if (pedidosIds.length === 0) {
      toast.error('No hay pedidos asignados', {
        description: 'Debes asignar al menos un pedido al conductor antes de crear la ruta',
      });
      return;
    }

    // Buscar el conductor
    const conductor = conductores.find((c) => c.idEmpleado === idEmpleado);
    if (!conductor) {
      toast.error('Conductor no encontrado');
      return;
    }

    // Pedir nombre de la ruta
    const { isConfirmed, value: nombreRuta } = await Swal.fire({
      title: 'Crear Ruta',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Conductor:</strong> ${conductor.nombreCompleto || `${conductor.primerNombre} ${conductor.primerApellido}`}</p>
          <p class="mb-4"><strong>Pedidos asignados:</strong> ${pedidosIds.length}</p>
        </div>
      `,
      input: 'text',
      inputLabel: 'Nombre de la ruta',
      inputPlaceholder: 'Ej: Ruta matutina',
      inputValue: `Ruta ${conductor.primerNombre} - ${new Date().toLocaleDateString('es-ES')}`,
      showCancelButton: true,
      confirmButtonText: 'Crear Ruta',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Debes ingresar un nombre para la ruta';
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
      },
    });

    if (!isConfirmed || !nombreRuta) return;

    // Pedir fecha programada
    const { isConfirmed: confirmFecha, value: fechaProgramada } = await Swal.fire({
      title: 'Fecha Programada',
      input: 'datetime-local',
      inputLabel: 'Fecha y hora de la ruta',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar una fecha y hora';
        }
        const fecha = new Date(value);
        if (fecha < new Date()) {
          return 'La fecha no puede ser en el pasado';
        }
      },
    });

    if (!confirmFecha || !fechaProgramada) return;

    // Crear la ruta
    const rutaData: CreateRutaDto = {
      nombre: nombreRuta.trim(),
      idEmpleado,
      pedidoIds: pedidosIds,
      fechaProgramada: new Date(fechaProgramada).toISOString(),
      profile: 'driving', // Por defecto
      roundTrip: false, // Por defecto
    };

    try {
      await createRutaMutation.mutateAsync(rutaData);
      // Limpiar asignaciones de este conductor después de crear la ruta
      clearAsignacionesByConductor(idEmpleado);
    } catch (error) {
      // El error ya se maneja en onError
    }
  };

  const handleEditarRuta = (_idEmpleado: number) => {
    // TODO: Implementar edición de ruta
    toast.info('Funcionalidad de edición en desarrollo');
  };

  // Si no tiene permisos, redirigir
  if (!canAccess) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1800px] mx-auto">
      {/* Header simplificado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Rutas</h1>
          <p className="text-sm text-gray-600 mt-1">
            Asigna pedidos a conductores arrastrando
          </p>
        </div>
        <button
          onClick={() => {
            if (Object.keys(asignaciones).length > 0) {
              Swal.fire({
                title: '¿Limpiar todas las asignaciones?',
                text: 'Esto eliminará todas las asignaciones temporales',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, limpiar',
                cancelButtonText: 'Cancelar',
              }).then((result) => {
                if (result.isConfirmed) {
                  clearAsignaciones();
                  toast.success('Asignaciones limpiadas');
                }
              });
            } else {
              toast.info('No hay asignaciones para limpiar');
            }
          }}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          <IoTrashOutline className="w-4 h-4" />
          Limpiar Todo
        </button>
      </div>

      {/* Errores mejorados */}
      {isErrorConductores && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="w-5 h-5 text-red-500" />
            <p className="text-red-800 text-sm font-medium">
              Error al cargar conductores. Verifica que el endpoint /api/empleado exista y devuelva empleados con rol "conductor".
            </p>
          </div>
        </div>
      )}

      {isErrorPedidos && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <IoInformationCircleOutline className="w-5 h-5 text-red-500" />
            <p className="text-red-800 text-sm font-medium">Error al cargar pedidos</p>
          </div>
        </div>
      )}

      {/* Contenido principal - Layout horizontal: pedidos izquierda, conductores derecha */}
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)]">
        {/* Sección de pedidos disponibles - Izquierda */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <PedidosDisponibles
            pedidos={pedidos}
            isLoading={isLoadingPedidos}
          />
        </div>

        {/* Sección de conductores - Derecha (scroll horizontal) */}
        <div className="flex-1 min-w-0">
          {isLoadingConductores ? (
            <div className="flex items-center justify-center h-full bg-white rounded-lg border border-gray-200">
              <div className="w-10 h-10 border-2 border-[#50C878] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conductores.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border border-gray-200 p-8">
              <p className="text-gray-600 text-center mb-2">
                No hay conductores disponibles
              </p>
              <p className="text-sm text-gray-400 text-center">
                Verifica que existan empleados con rol "conductor"
              </p>
            </div>
          ) : (
            <div className="h-full overflow-x-auto pb-4">
              <div className="flex gap-4 h-full min-w-max">
                {conductores.map((conductor) => (
                  <ConductorColumn
                    key={conductor.idEmpleado}
                    conductor={conductor}
                    pedidos={pedidos}
                    allPedidos={pedidos}
                    onCrearRuta={handleCrearRuta}
                    onEditarRuta={handleEditarRuta}
                    onVerDetalles={(c) => setSelectedConductor(c)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del conductor */}
      {selectedConductor && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedConductor(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Detalles del Conductor</h3>
              <button
                onClick={() => setSelectedConductor(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-600">
                    {selectedConductor.primerNombre[0]}{selectedConductor.primerApellido[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">
                    {selectedConductor.nombreCompleto || 
                      `${selectedConductor.primerNombre} ${selectedConductor.primerApellido}`}
                  </h4>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">{selectedConductor.telefono || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Estado</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedConductor.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedConductor.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {selectedConductor.roles && selectedConductor.roles.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedConductor.roles.map((rol, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {rol}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">Pedidos Asignados</p>
                  <p className="text-lg font-bold text-indigo-600">
                    {asignaciones[selectedConductor.idEmpleado]?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

