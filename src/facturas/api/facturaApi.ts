import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const facturaBaseURL = `${floristeriaApi.defaults.baseURL}/factura`;
console.log('Factura API baseURL:', facturaBaseURL);

export const facturaApi = axios.create({
  baseURL: facturaBaseURL,
});
