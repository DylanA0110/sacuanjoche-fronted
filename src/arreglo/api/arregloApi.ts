import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const arregloBaseURL = `${floristeriaApi.defaults.baseURL}/arreglos`;

export const arregloApi = axios.create({
  baseURL: arregloBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(arregloApi);

