import { useNavigate } from 'react-router';
import { useCarrito } from '../hooks/useCarrito';
import { useAuthStore } from '@/auth/store/auth.store';
import { Button } from '@/shared/components/ui/button';
import { MdDelete, MdAdd, MdRemove, MdShoppingCart, MdArrowBack } from 'react-icons/md';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getArregloMedia } from '@/arreglo/actions/arregloMedia/getArregloMedia';
import type { ArregloMedia } from '@/arreglo/types/arreglo-media.interface';
import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

// Componente para mostrar la imagen del arreglo, cargándola si no está disponible
function ArregloImage({ 
  arreglo, 
  idArreglo 
}: { 
  arreglo: any; 
  idArreglo: number;
}) {
  // Prioridad 1: Usar arreglo.url directamente (el backend lo devuelve así)
  // Prioridad 2: Buscar en arreglo.media si existe
  // Prioridad 3: Cargar desde el endpoint si no hay nada
  
  const hasDirectUrl = arreglo?.url && arreglo.url.trim() !== '';
  const hasValidMedia = arreglo?.media && 
                        Array.isArray(arreglo.media) && 
                        arreglo.media.length > 0 &&
                        arreglo.media.some((m: any) => m?.url && m.url.trim() !== '');
  
  // Solo cargar desde el endpoint si no hay URL directa ni media válida
  const shouldLoadMedia = !!idArreglo && !hasDirectUrl && !hasValidMedia;
  
  const { data: mediaData = [], isLoading: isLoadingMedia } = useQuery<ArregloMedia[]>({
    queryKey: ['arreglo-media', idArreglo],
    queryFn: async () => {
      console.log('🖼️ [ArregloImage] Cargando media para arreglo:', idArreglo);
      try {
        const media = await getArregloMedia(idArreglo);
        console.log('✅ [ArregloImage] Media cargada:', media);
        return media;
      } catch (error) {
        console.error('❌ [ArregloImage] Error al cargar media:', error);
        return [];
      }
    },
    enabled: shouldLoadMedia,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Determinar la URL de la imagen con prioridad:
  // 1. arreglo.url (directo del backend)
  // 2. arreglo.media (array de media)
  // 3. mediaData (cargado desde endpoint)
  let imagenUrl: string | null = null;
  
  if (hasDirectUrl) {
    imagenUrl = arreglo.url.trim();
  } else if (hasValidMedia) {
    const mediaArray = arreglo.media;
    const imagenPrincipal = mediaArray.find((m: any) => m?.isPrimary && m?.url && m.url.trim() !== '') || 
                            mediaArray.find((m: any) => m?.url && m.url.trim() !== '');
    imagenUrl = imagenPrincipal?.url || null;
  } else if (mediaData && mediaData.length > 0) {
    const imagenPrincipal = mediaData.find((m: any) => m?.isPrimary && m?.url && m.url.trim() !== '') || 
                            mediaData.find((m: any) => m?.url && m.url.trim() !== '');
    imagenUrl = imagenPrincipal?.url || null;
  }

  // Debug en desarrollo
  if (import.meta.env.DEV) {
    console.log('🖼️ [ArregloImage] Estado:', {
      idArreglo,
      hasDirectUrl,
      hasValidMedia,
      shouldLoadMedia,
      imagenUrl,
      isLoadingMedia,
      arregloUrl: arreglo?.url,
      arregloMedia: arreglo?.media,
    });
  }

  return (
    <div className="shrink-0">
      {isLoadingMedia ? (
        // Mostrar loading mientras carga
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      ) : imagenUrl ? (
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          <img
            src={imagenUrl}
            alt={arreglo?.nombre || 'Arreglo'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              console.error('❌ [ArregloImage] Error al cargar imagen:', imagenUrl);
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'w-full h-full flex items-center justify-center bg-gray-100 placeholder';
                placeholder.innerHTML = '<span class="text-xs text-gray-400 text-center px-2">Sin imagen</span>';
                parent.appendChild(placeholder);
              }
            }}
            onLoad={() => {
              console.log('✅ [ArregloImage] Imagen cargada exitosamente:', imagenUrl);
            }}
          />
        </div>
      ) : (
        <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
          <span className="text-xs text-gray-400 text-center px-2">Sin imagen</span>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    carrito,
    isLoading,
    subtotal,
    itemCount,
    updateCantidad,
    removeProducto,
    isUpdating,
    isRemoving,
  } = useCarrito();

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/carrito' } });
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-[#50C878]/30 border-t-[#50C878] rounded-full animate-spin" />
          <p className="text-sm font-medium text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Asegúrate de que 'carrito' tiene la forma correcta o es undefined/null
  // y accede de forma segura a carritosArreglo para evitar errores de tipado.
  const productos = carrito && Array.isArray((carrito as any).carritosArreglo)
    ? (carrito as any).carritosArreglo
    : [];
  const isEmpty = productos.length === 0;

  // Debug: Log de los productos para verificar estructura
  if (import.meta.env.DEV && productos.length > 0) {
    console.log('🛒 [CartPage] Productos en carrito:', productos);
    productos.forEach((item: any, index: number) => {
      console.log(`📦 [CartPage] Producto ${index + 1}:`, {
        idCarritoArreglo: item.idCarritoArreglo,
        idArreglo: item.idArreglo,
        arreglo: item.arreglo, // Mostrar el objeto arreglo completo
        nombre: item.arreglo?.nombre,
        descripcion: item.arreglo?.descripcion,
        url: item.arreglo?.url,
        media: item.arreglo?.media,
        tieneArreglo: !!item.arreglo,
      });
    });
  }

  const handleQuantityChange = (idCarritoArreglo: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeProducto(idCarritoArreglo);
    } else {
      updateCantidad({ idCarritoArreglo, cantidad });
    }
  };

  const handleCheckout = () => {
    if (isEmpty) {
      toast.error('Tu carrito está vacío');
      return;
    }
    
    // Verificar que el carrito tenga un pago asociado
    if (!carrito || !(carrito as any).idPago) {
      // Si no tiene pago, redirigir a checkout para crear pago PayPal
      navigate('/carrito/checkout');
    } else {
      // Si ya tiene pago, redirigir a checkout para crear pedido
      navigate('/carrito/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/catalogo"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MdArrowBack className="h-5 w-5" />
              <span className="text-sm font-medium">Continuar comprando</span>
            </Link>
            <div className="flex-1" />
            <h1 className="text-2xl font-bold text-gray-900">Carrito de Compras</h1>
            <div className="flex-1" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          // Carrito vacío
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MdShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Agrega productos para comenzar a comprar</p>
            <Link to="/catalogo">
              <Button className="bg-[#50C878] hover:bg-[#00A87F] text-white">
                Ver Catálogo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Lista de productos - Estilo Amazon */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {productos.map((item: { arreglo: { media: any[]; url: any; nombre: any; descripcion: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; idArreglo: number; }; precioUnitario: string; cantidad: number; totalLinea: string; idCarritoArreglo: Key | null | undefined; }) => {
                    // Asegurar que precioUnitario sea un número
                    const precio = typeof item.precioUnitario === 'string' 
                      ? parseFloat(item.precioUnitario) 
                      : Number(item.precioUnitario) || 0;
                    const cantidad = item.cantidad || 1;
                    // Asegurar que totalLinea sea un número
                    const totalLinea = typeof item.totalLinea === 'string'
                      ? parseFloat(item.totalLinea)
                      : Number(item.totalLinea) || 0;
                    const total = totalLinea || precio * cantidad;
                    const idArreglo = item.arreglo?.idArreglo;

                    return (
                      <div key={item.idCarritoArreglo} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-4">
                          {/* Imagen - Cargada dinámicamente si no está disponible */}
                          {idArreglo ? (
                            <ArregloImage arreglo={item.arreglo} idArreglo={idArreglo} />
                          ) : (
                            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                              <span className="text-xs text-gray-400 text-center px-2">Sin imagen</span>
                            </div>
                          )}

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-2">
                                  {item.arreglo?.nombre || 'Arreglo'}
                                </h3>
                                {/* Mostrar descripción del arreglo - siempre mostrar si existe */}
                                {item.arreglo?.descripcion ? (
                                  <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                                    {item.arreglo.descripcion}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-400 italic mb-2">
                                    Sin descripción disponible
                                  </p>
                                )}
                                
                                {/* Precio unitario */}
                                <p className="text-sm text-gray-500 mb-3">
                                  Precio unitario: C${(precio || 0).toFixed(2)}
                                </p>

                                {/* Controles de cantidad */}
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-gray-700 font-medium">Cantidad:</span>
                                  <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                      onClick={() => handleQuantityChange(Number(item.idCarritoArreglo), cantidad - 1)}
                                      disabled={isUpdating || isRemoving}
                                      className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      aria-label="Reducir cantidad"
                                    >
                                      <MdRemove className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <span className="px-4 py-1.5 text-sm font-medium text-gray-900 min-w-12 text-center">
                                      {cantidad}
                                    </span>
                                    <button
                                      onClick={() => handleQuantityChange(Number(item.idCarritoArreglo), cantidad + 1)}
                                      disabled={isUpdating || isRemoving}
                                      className="p-1.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                      aria-label="Aumentar cantidad"
                                    >
                                      <MdAdd className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Precio total y acciones */}
                              <div className="flex flex-col items-end gap-3">
                                <p className="text-lg font-semibold text-gray-900">
                                  C${(total || 0).toFixed(2)}
                                </p>
                                <button
                                  onClick={() => removeProducto(Number(item.idCarritoArreglo))}
                                  disabled={isRemoving}
                                  className="text-sm text-[#50C878] hover:text-[#00A87F] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                >
                                  <MdDelete className="h-4 w-4" />
                                  Eliminar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">
                        Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'}):
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        C${(Number(subtotal) || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resumen de pedido - Estilo Amazon */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({itemCount} {itemCount === 1 ? 'producto' : 'productos'}):</span>
                    <span className="text-gray-900 font-medium">C${(Number(subtotal) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="text-gray-900 font-medium">Se calcula al finalizar</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-base font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-gray-900">C${(Number(subtotal) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  className="w-full bg-[#50C878] hover:bg-[#00A87F] text-white font-semibold py-3 text-base"
                  disabled={isEmpty}
                >
                  Proceder al pago
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Al proceder, serás redirigido a PayPal para completar el pago
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

