import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const facturaBaseURL = `${floristeriaApi.defaults.baseURL}/factura`;

export const facturaApi = axios.create({
  baseURL: facturaBaseURL,
});
