import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const clienteDireccionBaseURL = `${floristeriaApi.defaults.baseURL}/cliente-direccion`;

export const clienteDireccionApi = axios.create({
  baseURL: clienteDireccionBaseURL,
});

