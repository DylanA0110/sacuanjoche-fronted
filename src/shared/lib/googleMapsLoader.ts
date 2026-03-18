let googleMapsPromise: Promise<void> | null = null;

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/js';

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_API_KEY ||
  '';

export function loadGoogleMapsApi(libraries: string[] = []): Promise<void> {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error(
        'Falta VITE_GOOGLE_MAPS_API_KEY (o VITE_GOOGLE_MAPS_FRONTEND_API_KEY) en .env.'
      )
    );
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps solo se puede cargar en el navegador.'));
  }

  const gmaps = (window as any).google?.maps;
  if (gmaps) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      GOOGLE_MAPS_SCRIPT_ID
    ) as HTMLScriptElement | null;

    if (existingScript) {
      const loadedMaps = (window as any).google?.maps;
      if (loadedMaps) {
        resolve();
        return;
      }

      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => {
          googleMapsPromise = null;
          reject(new Error('No se pudo cargar Google Maps.'));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    const params = new URLSearchParams({
      key: GOOGLE_MAPS_API_KEY,
      language: 'es',
      region: 'NI',
      loading: 'async',
      v: 'weekly',
    });

    if (libraries.length > 0) {
      params.set('libraries', libraries.join(','));
    }

    script.src = `${GOOGLE_MAPS_BASE_URL}?${params.toString()}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const loadedMaps = (window as any).google?.maps;
      if (loadedMaps) {
        resolve();
        return;
      }
      googleMapsPromise = null;
      reject(new Error('Google Maps se cargo pero no inicializo correctamente.'));
    };

    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('No se pudo cargar el script de Google Maps.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
