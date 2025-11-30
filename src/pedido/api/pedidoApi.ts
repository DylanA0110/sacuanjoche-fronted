import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const pedidoBaseURL = `${floristeriaApi.defaults.baseURL}/pedido`;

export const pedidoApi = axios.create({
  baseURL: pedidoBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(pedidoApi);
