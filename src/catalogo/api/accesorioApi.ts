import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const accesorioBaseURL = `${floristeriaApi.defaults.baseURL}/accesorio`;

export const accesorioApi = axios.create({
  baseURL: accesorioBaseURL,
});
