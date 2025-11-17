import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const formaArregloBaseURL = `${floristeriaApi.defaults.baseURL}/forma-arreglo`;

export const formaArregloApi = axios.create({
  baseURL: formaArregloBaseURL,
});

