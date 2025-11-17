import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const arregloBaseURL = `${floristeriaApi.defaults.baseURL}/arreglo`;

export const arregloApi = axios.create({
  baseURL: arregloBaseURL,
});

