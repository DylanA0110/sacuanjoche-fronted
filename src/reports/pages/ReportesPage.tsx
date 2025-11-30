import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  MdDescription,
  MdShoppingCart,
  MdReceipt,
  MdLocalFlorist,
  MdDownload,
  MdCalendarToday,
  MdSearch,
  MdFilterList,
} from 'react-icons/md';
import {
  getPedidosReportPdf,
  getFacturasReportPdf,
  getArreglosReportPdf,
  getPedidosDetalladoReportPdf,
} from '../actions';
import { cleanErrorMessage } from '@/shared/utils/toastHelpers';

interface ReporteBasicoForm {
  cantidadRegistros?: number; // Cantidad de registros a incluir (más intuitivo que limit)
  q?: string;
}

interface ReporteDetalladoForm {
  fechaInicio?: string;
  fechaFin?: string;
}

export default function ReportesPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  // Formularios separados para cada reporte básico
  const formPedidos = useForm<ReporteBasicoForm>({
    defaultValues: {
      cantidadRegistros: 50, // Valor por defecto razonable
      q: '',
    },
  });

  const formFacturas = useForm<ReporteBasicoForm>({
    defaultValues: {
      cantidadRegistros: 50,
      q: '',
    },
  });

  const formArreglos = useForm<ReporteBasicoForm>({
    defaultValues: {
      cantidadRegistros: 50,
      q: '',
    },
  });

  // Formulario para reporte detallado
  const formDetallado = useForm<ReporteDetalladoForm>({
    defaultValues: {
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: new Date().toISOString().split('T')[0],
    },
  });

  const handleDownload = async (
    tipo: string,
    downloadFn: (params?: any) => Promise<Blob>,
    params?: any
  ) => {
    try {
      setDownloading(tipo);
      await downloadFn(params);
      toast.success(`Reporte ${tipo} descargado exitosamente`);
    } catch (error: any) {
      toast.error(`Error al descargar reporte ${tipo}`, {
        description: cleanErrorMessage(error),
        duration: 5000,
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleReporteBasico = (
    tipo: string,
    downloadFn: (params?: any) => Promise<Blob>,
    form: ReturnType<typeof useForm<ReporteBasicoForm>>
  ) => {
    const params = form.getValues();
    // Convertir cantidadRegistros a limit (el API espera limit)
    const apiParams: any = {};
    if (params.cantidadRegistros && params.cantidadRegistros > 0) {
      apiParams.limit = params.cantidadRegistros;
      apiParams.offset = 0; // Siempre desde el inicio
    }
    if (params.q && params.q.trim()) {
      apiParams.q = params.q.trim();
    }
    handleDownload(
      tipo,
      downloadFn,
      Object.keys(apiParams).length > 0 ? apiParams : undefined
    );
  };

  const handleReporteDetallado = () => {
    const params = formDetallado.getValues();
    const cleanParams: ReporteDetalladoForm = {};
    if (params.fechaInicio) cleanParams.fechaInicio = params.fechaInicio;
    if (params.fechaFin) cleanParams.fechaFin = params.fechaFin;
    handleDownload(
      'Pedidos Detallado',
      getPedidosDetalladoReportPdf,
      Object.keys(cleanParams).length > 0 ? cleanParams : undefined
    );
  };

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
          <MdDescription className="h-10 w-10 text-[#50C878]" />
          Reportes
        </h1>
        <p className="text-gray-600 mt-2">
          Genera y descarga reportes en formato PDF de pedidos, facturas y arreglos
        </p>
      </div>

      {/* Grid de Reportes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reporte de Pedidos */}
        <Card className="border-2 border-gray-200 hover:border-[#50C878]/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MdShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Reporte de Pedidos</CardTitle>
                <CardDescription>
                  Genera un PDF con el reporte de todos los pedidos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReporteBasico('Pedidos', getPedidosReportPdf, formPedidos);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cantidad-pedidos" className="text-sm font-medium">
                  Cantidad de Registros
                </Label>
                <Input
                  id="cantidad-pedidos"
                  type="number"
                  min="1"
                  max="1000"
                  {...formPedidos.register('cantidadRegistros', {
                    valueAsNumber: true,
                    min: 1,
                    max: 1000,
                  })}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  Número máximo de registros a incluir en el reporte (máximo 1000)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-pedidos" className="text-sm font-medium flex items-center gap-2">
                  <MdSearch className="h-4 w-4" />
                  Búsqueda
                </Label>
                <Input
                  id="q-pedidos"
                  {...formPedidos.register('q')}
                  placeholder="Buscar por dirección, cliente, empleado..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={downloading === 'Pedidos'}
              >
                <MdDownload className="h-5 w-5 mr-2" />
                {downloading === 'Pedidos' ? 'Generando...' : 'Descargar Reporte'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reporte de Facturas */}
        <Card className="border-2 border-gray-200 hover:border-[#50C878]/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <MdReceipt className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Reporte de Facturas</CardTitle>
                <CardDescription>
                  Genera un PDF con el reporte de todas las facturas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReporteBasico('Facturas', getFacturasReportPdf, formFacturas);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cantidad-facturas" className="text-sm font-medium">
                  Cantidad de Registros
                </Label>
                <Input
                  id="cantidad-facturas"
                  type="number"
                  min="1"
                  max="1000"
                  {...formFacturas.register('cantidadRegistros', {
                    valueAsNumber: true,
                    min: 1,
                    max: 1000,
                  })}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  Número máximo de registros a incluir en el reporte (máximo 1000)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-facturas" className="text-sm font-medium flex items-center gap-2">
                  <MdSearch className="h-4 w-4" />
                  Búsqueda
                </Label>
                <Input
                  id="q-facturas"
                  {...formFacturas.register('q')}
                  placeholder="Buscar por número, estado, pedido..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={downloading === 'Facturas'}
              >
                <MdDownload className="h-5 w-5 mr-2" />
                {downloading === 'Facturas' ? 'Generando...' : 'Descargar Reporte'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reporte de Arreglos */}
        <Card className="border-2 border-gray-200 hover:border-[#50C878]/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MdLocalFlorist className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Reporte de Arreglos</CardTitle>
                <CardDescription>
                  Genera un PDF con el reporte de todos los arreglos, incluyendo flores y accesorios
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReporteBasico('Arreglos', getArreglosReportPdf, formArreglos);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="cantidad-arreglos" className="text-sm font-medium">
                  Cantidad de Registros
                </Label>
                <Input
                  id="cantidad-arreglos"
                  type="number"
                  min="1"
                  max="1000"
                  {...formArreglos.register('cantidadRegistros', {
                    valueAsNumber: true,
                    min: 1,
                    max: 1000,
                  })}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  Número máximo de registros a incluir en el reporte (máximo 1000)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-arreglos" className="text-sm font-medium flex items-center gap-2">
                  <MdSearch className="h-4 w-4" />
                  Búsqueda
                </Label>
                <Input
                  id="q-arreglos"
                  {...formArreglos.register('q')}
                  placeholder="Buscar por nombre, descripción, forma..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={downloading === 'Arreglos'}
              >
                <MdDownload className="h-5 w-5 mr-2" />
                {downloading === 'Arreglos' ? 'Generando...' : 'Descargar Reporte'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Reporte Detallado de Pedidos */}
        <Card className="border-2 border-[#50C878]/30 hover:border-[#50C878] transition-colors bg-linear-to-br from-[#50C878]/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#50C878]/20 rounded-lg">
                <MdCalendarToday className="h-6 w-6 text-[#50C878]" />
              </div>
              <div>
                <CardTitle className="text-[#50C878]">Reporte Detallado de Pedidos</CardTitle>
                <CardDescription>
                  Genera un PDF detallado con descripción del pedido y arreglos florales completos
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleReporteDetallado();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio" className="text-sm font-medium flex items-center gap-2">
                    <MdCalendarToday className="h-4 w-4" />
                    Fecha Inicio
                  </Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    {...formDetallado.register('fechaInicio')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin" className="text-sm font-medium flex items-center gap-2">
                    <MdCalendarToday className="h-4 w-4" />
                    Fecha Fin
                  </Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    {...formDetallado.register('fechaFin')}
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800 flex items-start gap-2">
                  <MdFilterList className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Si no especificas fechas, se usará la fecha de hoy por defecto
                  </span>
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#50C878] hover:bg-[#63d68b] text-white"
                disabled={downloading === 'Pedidos Detallado'}
              >
                <MdDownload className="h-5 w-5 mr-2" />
                {downloading === 'Pedidos Detallado'
                  ? 'Generando...'
                  : 'Descargar Reporte Detallado'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="bg-linear-to-r from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MdDescription className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Información sobre los Reportes</h3>
              <p className="text-sm text-gray-600">
                Todos los reportes se generan en formato PDF y se descargan automáticamente. Puedes
                especificar la cantidad de registros a incluir y opcionalmente filtrar por búsqueda.
                Si no especificas parámetros, se generará el reporte con los valores por defecto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

