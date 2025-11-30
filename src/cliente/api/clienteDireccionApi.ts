import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const clienteDireccionBaseURL = `${floristeriaApi.defaults.baseURL}/cliente-direccion`;

export const clienteDireccionApi = axios.create({
  baseURL: clienteDireccionBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(clienteDireccionApi);

