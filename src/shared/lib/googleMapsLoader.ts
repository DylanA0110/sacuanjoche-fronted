let googleMapsPromise: Promise<void> | null = null;

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-script';
const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api/js';
const GOOGLE_MAPS_LOAD_TIMEOUT_MS = 12000;
const GOOGLE_MAPS_READY_POLL_MS = 120;

export const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  import.meta.env.VITE_GOOGLE_MAPS_FRONTEND_API_KEY ||
  '';

function isGoogleMapsReady(): boolean {
  const gmaps = (window as any).google?.maps;
  return !!gmaps && typeof gmaps.Map === 'function';
}

function waitForGoogleMapsReady(timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const tick = () => {
      if (isGoogleMapsReady()) {
        resolve();
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error('Google Maps se cargo pero no inicializo correctamente.'));
        return;
      }

      window.setTimeout(tick, GOOGLE_MAPS_READY_POLL_MS);
    };

    tick();
  });
}

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

  if (isGoogleMapsReady()) {
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
      if (isGoogleMapsReady()) {
        resolve();
        return;
      }

      let settled = false;
      const finish = (fn: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        existingScript.removeEventListener('load', onLoad);
        existingScript.removeEventListener('error', onError);
        clearTimeout(timeoutId);
        fn();
      };

      const onLoad = () => {
        void waitForGoogleMapsReady(GOOGLE_MAPS_LOAD_TIMEOUT_MS)
          .then(() => finish(() => resolve()))
          .catch((error) => {
            googleMapsPromise = null;
            finish(() =>
              reject(
                error instanceof Error
                  ? error
                  : new Error('Google Maps se cargo parcialmente y no expuso Map.')
              )
            );
          });
      };

      const onError = () => {
        googleMapsPromise = null;
        finish(() => reject(new Error('No se pudo cargar Google Maps.')));
      };

      const timeoutId = window.setTimeout(() => {
        googleMapsPromise = null;
        finish(() =>
          reject(new Error('Tiempo de espera agotado al cargar Google Maps.'))
        );
      }, GOOGLE_MAPS_LOAD_TIMEOUT_MS);

      existingScript.addEventListener('load', onLoad);
      existingScript.addEventListener('error', onError);
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

    const timeoutId = window.setTimeout(() => {
      googleMapsPromise = null;
      reject(new Error('Tiempo de espera agotado al cargar Google Maps.'));
    }, GOOGLE_MAPS_LOAD_TIMEOUT_MS);

    script.onload = () => {
      void waitForGoogleMapsReady(GOOGLE_MAPS_LOAD_TIMEOUT_MS)
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch((error) => {
          googleMapsPromise = null;
          clearTimeout(timeoutId);
          reject(
            error instanceof Error
              ? error
              : new Error('Google Maps se cargo pero no inicializo correctamente.')
          );
        });
    };

    script.onerror = () => {
      googleMapsPromise = null;
      clearTimeout(timeoutId);
      reject(new Error('No se pudo cargar el script de Google Maps.'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
