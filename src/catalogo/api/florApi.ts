import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';
import { registerAxiosInstance } from '@/shared/api/interceptors';

const florBaseURL = `${floristeriaApi.defaults.baseURL}/flor`;

export const florApi = axios.create({
  baseURL: florBaseURL,
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(florApi);
