import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const arregloMediaBaseURL = `${floristeriaApi.defaults.baseURL}/arreglos`;

export const arregloMediaApi = axios.create({
  baseURL: arregloMediaBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(arregloMediaApi);

