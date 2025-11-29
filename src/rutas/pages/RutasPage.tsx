import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { MdLocalShipping } from 'react-icons/md';

const RutasPage = () => {
  return (
    <div className="space-y-6 sm:space-y-8 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F9F9F7] pb-4 -mt-6 pt-6 border-b border-gray-200/50 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-title-large mb-2 sm:mb-3 text-gray-900 tracking-tight truncate">
              Rutas & Envíos
            </h1>
            <p className="text-sm sm:text-base text-gray-500 font-light">
              Administra las rutas y envíos de tus pedidos
            </p>
          </div>
        </div>
      </div>

      {/* Card con mensaje "en proceso" */}
      <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl shadow-black/10 rounded-2xl sm:rounded-3xl overflow-hidden min-w-0">
        <CardHeader className="pb-4 sm:pb-5 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 border-b border-gray-100">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate flex items-center gap-3">
            <MdLocalShipping className="h-6 w-6 sm:h-7 sm:w-7 text-[#50C878]" />
            <span>Rutas & Envíos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 md:p-12">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-[#50C878]/20 to-[#00A87F]/20 flex items-center justify-center border-2 border-[#50C878]/30">
              <MdLocalShipping className="h-10 w-10 sm:h-12 sm:w-12 text-[#50C878]" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                En Proceso
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto">
                Esta sección está en desarrollo. Pronto podrás gestionar las rutas y envíos de tus pedidos desde aquí.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RutasPage;

