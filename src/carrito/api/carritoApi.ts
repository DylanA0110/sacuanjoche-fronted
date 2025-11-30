import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const carritoBaseURL = `${floristeriaApi.defaults.baseURL}/carrito`;

export const carritoApi = axios.create({
  baseURL: carritoBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(carritoApi);

