import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const facturaBaseURL = `${floristeriaApi.defaults.baseURL}/factura`;

export const facturaApi = axios.create({
  baseURL: facturaBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(facturaApi);
