import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const clienteBaseURL = `${floristeriaApi.defaults.baseURL}/cliente`;

export const clienteApi = axios.create({
  baseURL: clienteBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(clienteApi);
