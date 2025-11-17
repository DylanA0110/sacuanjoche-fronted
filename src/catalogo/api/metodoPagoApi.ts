import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const metodoPagoBaseURL = `${floristeriaApi.defaults.baseURL}/metodo-pago`;

export const metodoPagoApi = axios.create({
  baseURL: metodoPagoBaseURL,
});

