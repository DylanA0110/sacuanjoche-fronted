import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const arregloBaseURL = `${floristeriaApi.defaults.baseURL}/arreglos`;

export const arregloApi = axios.create({
  baseURL: arregloBaseURL,
});

