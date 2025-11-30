import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { MdEdit, MdDelete, MdVisibility, MdImage } from 'react-icons/md';

export interface CardItem {
  id: number | string;
  imageUrl?: string;
  title: string;
  subtitle?: string;
  price?: number | string;
  status?: 'activo' | 'inactivo';
  [key: string]: any;
}

interface CardsViewProps {
  items: CardItem[];
  onView?: (item: CardItem) => void;
  onEdit?: (item: CardItem) => void;
  onDelete?: (item: CardItem) => void;
  customActions?: (item: CardItem) => React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  getImageUrl?: (item: CardItem) => string | undefined;
  getTitle?: (item: CardItem) => string;
  getSubtitle?: (item: CardItem) => string;
  getPrice?: (item: CardItem) => number | string | undefined;
}

export function CardsView({
  items,
  onView,
  onEdit,
  onDelete,
  customActions,
  isLoading = false,
  isError = false,
  emptyMessage = 'No se encontraron resultados',
  getImageUrl = (item) => item.imageUrl,
  getTitle = (item) => item.title,
  getSubtitle = (item) => item.subtitle,
  getPrice = (item) => item.price,
}: CardsViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#4CAF50]/20 border-t-[#4CAF50] rounded-full animate-spin" />
          <span className="text-sm text-gray-600 font-medium">
            Cargando datos...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <span className="text-sm text-red-600 font-medium">
            Error al cargar los datos
          </span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
            <span className="text-2xl">📭</span>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {emptyMessage}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => {
        const imageUrl = getImageUrl(item);
        const title = getTitle(item);
        const subtitle = getSubtitle(item);
        const price = getPrice(item);
        const status = item.status;

        return (
          <div
            key={item.id}
            className="bg-white rounded-2xl border-2 border-gray-200/60 shadow-lg hover:shadow-2xl hover:border-[#50C878]/30 transition-all duration-300 overflow-hidden group backdrop-blur-sm"
          >
            {/* Imagen */}
            <div className="relative w-full h-48 bg-linear-to-br from-gray-50 to-gray-100 overflow-hidden">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#50C878]/5 to-[#00A87F]/5">
                  <MdImage className="h-12 w-12 text-[#50C878]/40" />
                </div>
              )}
              {/* Badge de estado */}
              {status && (
                <div className="absolute top-3 right-3">
                  <Badge
                    className={
                      status === 'activo'
                        ? 'bg-linear-to-r from-[#50C878] to-[#00A87F] text-white border-2 border-[#50C878]/40 shadow-sm'
                        : 'bg-red-50 text-red-600 border-2 border-red-200'
                    }
                  >
                    {status === 'activo' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-4 sm:p-5">
              <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
                {title}
              </h3>
              {subtitle && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {subtitle}
                </p>
              )}
              {price !== undefined && (
                <p className="text-xl font-bold bg-linear-to-r from-[#50C878] to-[#00A87F] bg-clip-text text-transparent mb-4">
                  C$
                  {typeof price === 'string'
                    ? parseFloat(price).toFixed(2)
                    : price.toFixed(2)}
                </p>
              )}

              {/* Acciones */}
              {(onView || onEdit || onDelete || customActions) && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100/50">
                  {customActions && customActions(item)}
                  {onView && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(item)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[#50C878] hover:bg-[#50C878]/10 rounded-lg transition-all duration-200"
                      title="Ver detalles"
                    >
                      <MdVisibility className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-[#50C878] hover:bg-[#50C878]/10 rounded-lg transition-all duration-200"
                      title="Editar"
                    >
                      <MdEdit className="h-4 w-4" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <MdDelete className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

