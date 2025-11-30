import axios from 'axios';
import { registerAxiosInstance } from './interceptors';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  return envUrl;
};

const BASE_URL = getBaseURL();
const API_BASE_URL = `${BASE_URL}/api`;

export const floristeriaApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'ngrok-skip-browser-warning': 'true', // Necesario para ngrok
  },
});

// Registrar la instancia para aplicar interceptores
registerAxiosInstance(floristeriaApi);
