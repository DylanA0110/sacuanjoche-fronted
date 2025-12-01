import { carritoApi } from '../api/carritoApi';
import { getArregloById } from '@/arreglo/actions/getArregloById';
import { getCarritoArreglo } from './getCarritoArreglo';
import type { Carrito, CarritoArreglo } from '../types/carrito.interface';
import { logger } from '@/shared/utils/logger';

export const getCarrito = async (idCarrito: number): Promise<Carrito> => {
  try {
    const response = await carritoApi.get<Carrito>(`/${idCarrito}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Obtener el carrito activo del usuario actual
export const getCarritoActivo = async (): Promise<Carrito | null> => {
  try {
    // El backend puede devolver:
    // 1. Un array de Carrito[]
    // 2. Un objeto { data: Carrito[], total: number }
    // 3. Un array de CarritoArreglo[] directamente (con carrito anidado)
    const response = await carritoApi.get<any>('/', {
      params: { limit: 1, offset: 0 },
    });

    logger.debug('📦 [getCarritoActivo] Respuesta del backend:', response.data);
    logger.debug(
      '📦 [getCarritoActivo] Tipo de respuesta:',
      Array.isArray(response.data) ? 'Array' : typeof response.data
    );

    // Si la respuesta es un array
    if (response.data && Array.isArray(response.data)) {
      const firstItem = response.data[0];
      logger.debug('📦 [getCarritoActivo] Primer item:', firstItem);
      logger.debug(
        '📦 [getCarritoActivo] Tiene idCarritoArreglo?',
        'idCarritoArreglo' in firstItem
      );
      logger.debug(
        '📦 [getCarritoActivo] Tiene carrito?',
        'carrito' in firstItem
      );
      logger.debug(
        '📦 [getCarritoActivo] Tiene carritosArreglo?',
        'carritosArreglo' in firstItem
      );
      logger.debug(
        '📦 [getCarritoActivo] carritosArreglo:',
        firstItem?.carritosArreglo
      );

      // Verificar si es un CarritoArreglo (tiene idCarritoArreglo y carrito anidado)
      if (
        firstItem &&
        'idCarritoArreglo' in firstItem &&
        'carrito' in firstItem
      ) {
        logger.debug(
          '✅ [getCarritoActivo] Respuesta es array de CarritoArreglo, construyendo Carrito...'
        );
        logger.debug(
          '📦 [getCarritoActivo] Primer item completo:',
          JSON.stringify(firstItem, null, 2)
        );
        logger.debug(
          '📦 [getCarritoActivo] Primer item.arreglo:',
          firstItem.arreglo
        );

        // Es un array de CarritoArreglo, construir el objeto Carrito
        const carritoArreglo = firstItem as any;

        // Mapear los carritosArreglo preservando el objeto arreglo completo
        const carritosArregloMapeados = (response.data as any[]).map(
          (item: any) => {
            logger.debug('🔄 [getCarritoActivo] Mapeando item:', {
              idCarritoArreglo: item.idCarritoArreglo,
              tieneArreglo: !!item.arreglo,
              arreglo: item.arreglo,
            });

            return {
              idCarritoArreglo: item.idCarritoArreglo,
              idCarrito: item.idCarrito,
              idArreglo: item.idArreglo,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              totalLinea: item.totalLinea,
              fechaCreacion: item.fechaCreacion,
              fechaUltAct: item.fechaUltAct,
              // Preservar el objeto arreglo completo - usar spread para mantener todos los campos
              arreglo: item.arreglo
                ? {
                    ...item.arreglo, // Preservar todos los campos del arreglo
                    idArreglo: item.arreglo.idArreglo,
                    nombre: item.arreglo.nombre,
                    descripcion: item.arreglo.descripcion,
                    url: item.arreglo.url,
                    precioUnitario: item.arreglo.precioUnitario,
                    estado: item.arreglo.estado,
                    media: item.arreglo.media || [],
                  }
                : undefined,
            };
          }
        );

        logger.debug(
          '📦 [getCarritoActivo] CarritosArreglo mapeados:',
          carritosArregloMapeados
        );
        logger.debug(
          '📦 [getCarritoActivo] Primer carritoArreglo mapeado:',
          carritosArregloMapeados[0]
        );
        logger.debug(
          '📦 [getCarritoActivo] Primer carritoArreglo.arreglo:',
          carritosArregloMapeados[0]?.arreglo
        );

        const carrito: Carrito = {
          idCarrito: carritoArreglo.carrito.idCarrito,
          idUser: carritoArreglo.carrito.idUser,
          idPago: carritoArreglo.carrito.idPago,
          fechaCreacion: carritoArreglo.carrito.fechaCreacion,
          fechaUltAct: carritoArreglo.carrito.fechaUltAct,
          estado: carritoArreglo.carrito.estado,
          user: carritoArreglo.carrito.user,
          pago: carritoArreglo.carrito.pago,
          carritosArreglo: carritosArregloMapeados as CarritoArreglo[],
        };

        logger.debug('✅ [getCarritoActivo] Carrito construido:', carrito);
        logger.debug(
          '📦 [getCarritoActivo] Primer carritoArreglo final:',
          carrito.carritosArreglo?.[0]
        );
        logger.debug(
          '📦 [getCarritoActivo] Primer carritoArreglo.arreglo final:',
          carrito.carritosArreglo?.[0]?.arreglo
        );
        return carrito;
      }

      // Si es un array de Carrito normal
      logger.debug('✅ [getCarritoActivo] Respuesta es array de Carrito');
      logger.debug(
        '📦 [getCarritoActivo] Carrito completo:',
        JSON.stringify(firstItem, null, 2)
      );

      const carrito = firstItem as any;

      // Si el Carrito tiene carritosArreglo pero no tienen el objeto arreglo completo,
      // necesitamos cargar los arreglos por separado
      if (carrito?.carritosArreglo && Array.isArray(carrito.carritosArreglo)) {
        logger.debug('📦 [getCarritoActivo] Verificando carritosArreglo...');
        logger.debug(
          '📦 [getCarritoActivo] Total carritosArreglo:',
          carrito.carritosArreglo.length
        );

        // Verificar si algún carritoArreglo no tiene el objeto arreglo
        const necesitaCargarArreglos = carrito.carritosArreglo.some(
          (item: any) => !item.arreglo
        );

        if (necesitaCargarArreglos) {
          logger.debug(
            '📥 [getCarritoActivo] Algunos arreglos no tienen datos completos. Cargando...'
          );

          // Cargar los carritos arreglo completos usando el endpoint específico
          // Esto es más eficiente porque el endpoint devuelve el objeto arreglo completo
          const carritosArregloCompletos = await Promise.all(
            carrito.carritosArreglo.map(async (item: any) => {
              // Si ya tiene arreglo completo, usarlo
              if (item.arreglo && item.arreglo.nombre && item.arreglo.url) {
                logger.debug(
                  `✅ [getCarritoActivo] CarritoArreglo ${item.idCarritoArreglo} ya tiene datos completos`
                );
                return item;
              }

              // Si no tiene arreglo completo, cargar el carrito arreglo completo desde el endpoint
              if (item.idCarritoArreglo) {
                logger.debug(
                  `📥 [getCarritoActivo] Cargando carrito arreglo ${item.idCarritoArreglo}...`
                );
                try {
                  const carritoArregloCompleto = await getCarritoArreglo(
                    item.idCarritoArreglo
                  );
                  logger.debug(
                    `✅ [getCarritoArreglo] CarritoArreglo ${item.idCarritoArreglo} cargado:`,
                    {
                      tieneArreglo: !!carritoArregloCompleto.arreglo,
                      nombre: carritoArregloCompleto.arreglo?.nombre,
                      url: carritoArregloCompleto.arreglo?.url,
                      descripcion: carritoArregloCompleto.arreglo?.descripcion,
                    }
                  );

                  // Usar el carrito arreglo completo que viene del endpoint
                  return carritoArregloCompleto;
                } catch (error) {
                  // Fallback: intentar cargar solo el arreglo por ID
                  if (item.idArreglo) {
                    try {
                      logger.debug(
                        `📥 [getCarritoActivo] Fallback: Cargando arreglo ${item.idArreglo} por ID...`
                      );
                      const arregloCompleto = await getArregloById(
                        item.idArreglo
                      );
                      return {
                        ...item,
                        arreglo: {
                          idArreglo: arregloCompleto.idArreglo,
                          nombre: arregloCompleto.nombre,
                          descripcion: arregloCompleto.descripcion,
                          url: arregloCompleto.url,
                          precioUnitario: arregloCompleto.precioUnitario,
                          estado: arregloCompleto.estado,
                          media: arregloCompleto.media || [],
                        },
                      };
                    } catch (fallbackError) {
                    }
                  }

                  return item; // Devolver el item sin arreglo si falla todo
                }
              }

              return item;
            })
          );

          // Actualizar el carrito con los arreglos completos
          carrito.carritosArreglo = carritosArregloCompletos;
          logger.debug(
            '✅ [getCarritoActivo] Carrito actualizado con arreglos completos'
          );
          logger.debug(
            '📦 [getCarritoActivo] Primer carritoArreglo actualizado:',
            carritosArregloCompletos[0]
          );
          logger.debug(
            '📦 [getCarritoActivo] Primer carritoArreglo.arreglo actualizado:',
            carritosArregloCompletos[0]?.arreglo
          );
        } else {
          logger.debug(
            '✅ [getCarritoActivo] Todos los arreglos ya tienen datos completos'
          );
        }
      }

      return (carrito as Carrito) || null;
    }

    // Si el backend devuelve un objeto con data
    if (response.data && 'data' in response.data) {
      const data = response.data as { data: any[]; total: number };

      if (data.data && data.data.length > 0) {
        const firstItem = data.data[0];

        // Verificar si es un CarritoArreglo
        if (
          firstItem &&
          'idCarritoArreglo' in firstItem &&
          'carrito' in firstItem
        ) {
          logger.debug(
            '✅ [getCarritoActivo] Respuesta paginada es array de CarritoArreglo, construyendo Carrito...'
          );
          const carritoArreglo = firstItem as any;
          const carrito: Carrito = {
            idCarrito: carritoArreglo.carrito.idCarrito,
            idUser: carritoArreglo.carrito.idUser,
            idPago: carritoArreglo.carrito.idPago,
            fechaCreacion: carritoArreglo.carrito.fechaCreacion,
            fechaUltAct: carritoArreglo.carrito.fechaUltAct,
            estado: carritoArreglo.carrito.estado,
            user: carritoArreglo.carrito.user,
            pago: carritoArreglo.carrito.pago,
            // Preservar todos los datos de carritosArreglo incluyendo el objeto arreglo completo
            carritosArreglo: (data.data as any[]).map((item: any) => ({
              idCarritoArreglo: item.idCarritoArreglo,
              idCarrito: item.idCarrito,
              idArreglo: item.idArreglo,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              totalLinea: item.totalLinea,
              fechaCreacion: item.fechaCreacion,
              fechaUltAct: item.fechaUltAct,
              // Preservar el objeto arreglo completo con todos sus datos
              arreglo: item.arreglo
                ? {
                    idArreglo: item.arreglo.idArreglo,
                    nombre: item.arreglo.nombre,
                    descripcion: item.arreglo.descripcion,
                    url: item.arreglo.url,
                    precioUnitario: item.arreglo.precioUnitario,
                    estado: item.arreglo.estado,
                    media: item.arreglo.media || [],
                  }
                : undefined,
            })) as CarritoArreglo[],
          };
          logger.debug(
            '✅ [getCarritoActivo] Carrito construido desde respuesta paginada:',
            carrito
          );
          return carrito;
        }

        return (firstItem as Carrito) || null;
      }
    }

    logger.warn('⚠️ [getCarritoActivo] No se pudo procesar la respuesta');
    return null;
  } catch (error: any) {
    // Si no hay carrito (404), no tiene permisos (403), o error de validación (400), no es un error crítico
    // El usuario puede no tener carrito aún o no tener permisos para verlo
    // El 400 puede ocurrir cuando el usuario no tiene carrito y el backend rechaza la petición
    if (
      error.response?.status === 404 ||
      error.response?.status === 403 ||
      error.response?.status === 400
    ) {
      return null;
    }
    // Para otros errores, lanzar el error
    throw error;
  }
};
