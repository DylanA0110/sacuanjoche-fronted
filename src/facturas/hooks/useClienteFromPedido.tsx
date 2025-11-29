import { useQuery } from '@tanstack/react-query';
import { getClienteById } from '@/cliente/actions/getClienteById';
import type { Cliente } from '@/cliente/types/cliente.interface';

/**
 * Hook para obtener el cliente cuando solo tenemos el idCliente del pedido
 */
export const useClienteFromPedido = (idCliente?: number) => {
  const { data: cliente, isLoading } = useQuery<Cliente>({
    queryKey: ['cliente', idCliente],
    queryFn: () => getClienteById(idCliente!),
    enabled: !!idCliente,
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
  });

  return { cliente, isLoading };
};

