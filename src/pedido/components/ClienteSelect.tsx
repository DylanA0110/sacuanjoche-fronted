import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getClientes } from '@/cliente/actions';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { MdPerson, MdCheck } from 'react-icons/md';
import type { Cliente } from '@/cliente/types/cliente.interface';

interface ClienteSelectProps {
  value: string;
  onChange: (clienteId: string) => void;
  required?: boolean;
}

export function ClienteSelect({
  value,
  onChange,
  required = false,
}: ClienteSelectProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchCliente, setSearchCliente] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  // Debounce para la búsqueda usando URL params
  const [debouncedSearch, setDebouncedSearch] = useState(searchCliente);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchCliente);
      const newParams = new URLSearchParams(searchParams);
      if (searchCliente.trim()) {
        newParams.set('qCliente', searchCliente.trim());
      } else {
        newParams.delete('qCliente');
      }
      setSearchParams(newParams, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchCliente, searchParams, setSearchParams]);

  // Buscar clientes con parámetro q - solo cuando hay interacción del usuario
  const { data: clientesData, isLoading } = useQuery({
    queryKey: ['clientes', 'search', debouncedSearch],
    queryFn: () =>
      getClientes({
        limit: debouncedSearch ? 50 : 5,
        q: debouncedSearch || undefined,
      }),
    enabled: showResults && hasInteracted, // Solo buscar cuando el usuario interactúa
  });

  // Buscar el cliente seleccionado si hay un value pero no está en la lista de búsqueda
  const { data: selectedClienteData } = useQuery({
    queryKey: ['cliente', 'byId', value],
    queryFn: () => {
      // Buscar el cliente por ID en la lista completa
      return getClientes({
        limit: 100,
        q: undefined,
      }).then((data) => {
        const allClientes = Array.isArray(data) ? data : data?.data || [];
        return allClientes.find(
          (c: Cliente) => String(c.idCliente) === value && c.estado === 'activo'
        );
      });
    },
    enabled: !!value && !showResults, // Solo buscar cuando hay value y no se está buscando
  });

  const clientes = useMemo(() => {
    if (!clientesData) return [];
    if (Array.isArray(clientesData)) {
      return clientesData.filter((c: Cliente) => c.estado === 'activo');
    }
    if ('data' in clientesData) {
      return clientesData.data.filter((c: Cliente) => c.estado === 'activo');
    }
    return [];
  }, [clientesData]);

  // El cliente seleccionado puede venir de la búsqueda o de la consulta individual
  const selectedCliente = useMemo(() => {
    // Primero buscar en la lista de búsqueda
    const fromSearch = clientes.find(
      (c: Cliente) => String(c.idCliente) === value
    );
    if (fromSearch) return fromSearch;
    
    // Si no está en la búsqueda, usar el cliente obtenido por ID
    if (selectedClienteData) return selectedClienteData;
    
    return undefined;
  }, [clientes, value, selectedClienteData]);

  // Cuando hay un cliente seleccionado, limpiar el input de búsqueda
  // El cliente se mostrará como badge abajo, no en el input
  useEffect(() => {
    if (value && selectedCliente) {
      // Si hay un cliente seleccionado, limpiar el input para que solo se use para buscar
      if (searchCliente && searchCliente === `${selectedCliente.primerNombre} ${selectedCliente.primerApellido}`) {
        setSearchCliente('');
      }
      setShowResults(false);
    } else if (!value) {
      // Si no hay value, limpiar el searchCliente
      setSearchCliente('');
      setHasInteracted(false);
      setShowResults(false);
    }
  }, [value, selectedCliente]);

  const handleSelectCliente = (cliente: Cliente) => {
    onChange(String(cliente.idCliente));
    setShowResults(false);
    setSearchCliente(`${cliente.primerNombre} ${cliente.primerApellido}`);
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label htmlFor="cliente" className="text-sm font-semibold text-gray-700">
        Buscar y Seleccionar Cliente {required && '*'}
      </Label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10"></div>
        <Input
          type="text"
          value={searchCliente}
          onChange={(e) => {
            setSearchCliente(e.target.value);
            setHasInteracted(true);
            setShowResults(true);
          }}
          onFocus={() => {
            if (hasInteracted || searchCliente.length > 0) {
              setShowResults(true);
            }
          }}
          onClick={() => {
            setHasInteracted(true);
            if (searchCliente.length > 0) {
              setShowResults(true);
            }
          }}
          placeholder="Buscar cliente por nombre o teléfono..."
          className="bg-white border-gray-300 text-gray-900 h-11 text-base pl-10 pr-4"
        />

        {/* Lista de resultados - solo mostrar cuando hay focus o búsqueda */}
        {showResults && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Buscando...</div>
            ) : clientes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchCliente
                  ? 'No se encontraron clientes'
                  : 'Escribe para buscar clientes'}
              </div>
            ) : (
              <div className="py-1">
                {clientes.map((cliente: Cliente) => {
                  const isSelected = String(cliente.idCliente) === value;
                  return (
                    <button
                      key={cliente.idCliente}
                      type="button"
                      onClick={() => handleSelectCliente(cliente)}
                      className={`w-full text-left px-4 py-3 hover:bg-[#50C878]/10 transition-colors ${
                        isSelected
                          ? 'bg-[#50C878]/20 border-l-4 border-[#50C878]'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MdPerson
                            className={`h-5 w-5 ${
                              isSelected ? 'text-[#50C878]' : 'text-gray-400'
                            }`}
                          />
                          <div>
                            <p
                              className={`font-semibold ${
                                isSelected ? 'text-[#50C878]' : 'text-gray-900'
                              }`}
                            >
                              {cliente.primerNombre} {cliente.primerApellido}
                            </p>
                            <p className="text-sm text-gray-600">
                              {cliente.telefono}
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <MdCheck className="h-5 w-5 text-[#50C878]" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cliente seleccionado - Mostrar siempre cuando hay un cliente seleccionado */}
      {selectedCliente && (
        <div className="mt-2 p-3 bg-[#50C878]/10 border-2 border-[#50C878]/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#50C878]/20 rounded-lg">
              <MdPerson className="h-5 w-5 text-[#50C878]" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {selectedCliente.primerNombre} {selectedCliente.primerApellido}
              </p>
              <p className="text-sm text-gray-600">
                {selectedCliente.telefono}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setSearchCliente('');
              setShowResults(false);
              setHasInteracted(false);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm font-medium"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
}

