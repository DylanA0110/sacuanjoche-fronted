import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const arregloMediaBaseURL = `${floristeriaApi.defaults.baseURL}/arreglos`;

export const arregloMediaApi = axios.create({
  baseURL: arregloMediaBaseURL,
});

