import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const metodoPagoBaseURL = `${floristeriaApi.defaults.baseURL}/metodo-pago`;

export const metodoPagoApi = axios.create({
  baseURL: metodoPagoBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(metodoPagoApi);

