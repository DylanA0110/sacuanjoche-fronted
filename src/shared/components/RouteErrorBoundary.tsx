import { useRouteError, isRouteErrorResponse, Link } from 'react-router';
import { MdErrorOutline, MdRefresh, MdHome } from 'react-icons/md';

export function RouteErrorBoundary() {
  const error = useRouteError();

  // Determinar el tipo de error
  let errorTitle = 'Error inesperado';
  let errorMessage = 'Ocurrió un error al cargar esta página.';
  let isNetworkError = false;
  let isParseError = false;

  if (isRouteErrorResponse(error)) {
    errorTitle = `Error ${error.status}`;
    errorMessage = error.statusText || errorMessage;
    
    if (error.status === 404) {
      errorTitle = 'Página no encontrada';
      errorMessage = 'La página que buscas no existe.';
    } else if (error.status === 500) {
      errorTitle = 'Error del servidor';
      errorMessage = 'Hubo un problema en el servidor. Por favor, intenta más tarde.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
    
    // Detectar errores de parsing JSON
    if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
      isParseError = true;
      errorTitle = 'Error al procesar datos';
      errorMessage = 'El servidor devolvió una respuesta en formato incorrecto. Esto puede deberse a un problema de conexión o del servidor.';
    }
    
    // Detectar errores de red
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      isNetworkError = true;
      errorTitle = 'Error de conexión';
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <MdErrorOutline className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorTitle}
          </h1>
          
          <p className="text-sm text-gray-600 mb-6">
            {errorMessage}
          </p>

          {/* Mostrar detalles del error solo en desarrollo */}
          {import.meta.env.DEV && error instanceof Error && (
            <div className="w-full mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-left">
              <p className="text-xs font-semibold text-gray-700 mb-2">Detalles técnicos:</p>
              <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                {error.stack || error.message}
              </pre>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#50C878] text-white rounded-lg hover:bg-[#45B068] transition-colors font-medium"
            >
              <MdRefresh className="w-5 h-5" />
              Reintentar
            </button>
            
            <Link
              to="/admin"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <MdHome className="w-5 h-5" />
              Ir al inicio
            </Link>
          </div>

          {(isNetworkError || isParseError) && (
            <div className="mt-6 w-full p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-blue-800 mb-2">Sugerencias:</p>
            <ul className="text-xs text-blue-700 space-y-1 text-left list-disc list-inside">
              {isNetworkError && (
                <>
                  <li>Verifica tu conexión a internet</li>
                  <li>Intenta recargar la página</li>
                </>
              )}
              {isParseError && (
                <>
                  <li>El servidor puede estar experimentando problemas</li>
                  <li>Intenta nuevamente en unos momentos</li>
                  <li>Si el problema persiste, contacta al administrador</li>
                </>
              )}
            </ul>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

