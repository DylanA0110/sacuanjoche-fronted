import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const pedidoBaseURL = `${floristeriaApi.defaults.baseURL}/pedido`;

export const pedidoApi = axios.create({
  baseURL: pedidoBaseURL,
});
