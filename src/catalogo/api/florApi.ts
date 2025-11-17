import { floristeriaApi } from '@/shared/api/FloristeriaApi';
import axios from 'axios';

const florBaseURL = `${floristeriaApi.defaults.baseURL}/flor`;

export const florApi = axios.create({
  baseURL: florBaseURL,
});
