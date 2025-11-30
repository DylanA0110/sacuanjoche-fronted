import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const formaArregloBaseURL = `${floristeriaApi.defaults.baseURL}/forma-arreglo`;

export const formaArregloApi = axios.create({
  baseURL: formaArregloBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(formaArregloApi);

