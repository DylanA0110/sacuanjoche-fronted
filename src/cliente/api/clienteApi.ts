import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const clienteBaseURL = `${floristeriaApi.defaults.baseURL}/cliente`;

export const clienteApi = axios.create({
  baseURL: clienteBaseURL,
});
