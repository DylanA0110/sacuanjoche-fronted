import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const rutaBaseURL = `${floristeriaApi.defaults.baseURL}/rutas`;

export const rutaApi = axios.create({
  baseURL: rutaBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(rutaApi);

