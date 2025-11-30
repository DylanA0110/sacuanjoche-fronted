import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const accesorioBaseURL = `${floristeriaApi.defaults.baseURL}/accesorio`;

export const accesorioApi = axios.create({
  baseURL: accesorioBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(accesorioApi);
