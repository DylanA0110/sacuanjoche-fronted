import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  console.log('VITE_API_URL from env:', envUrl);

  // Si no hay URL configurada, usar localhost por defecto
  if (!envUrl || envUrl === 'undefined' || envUrl === '') {
    console.log('No VITE_API_URL found, using default: http://localhost:3000');
    return 'http://localhost:3000';
  }

  // Si ya tiene protocolo, usarlo tal cual
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    console.log('Using VITE_API_URL as is:', envUrl);
    return envUrl;
  }

  // Si no tiene protocolo, agregar http://
  const urlWithProtocol = `http://${envUrl}`;
  console.log('Added protocol to VITE_API_URL:', urlWithProtocol);
  return urlWithProtocol;
};

const BASE_URL = getBaseURL();
const API_BASE_URL = `${BASE_URL}/api`;

console.log('Final API baseURL:', API_BASE_URL);

export const floristeriaApi = axios.create({
  baseURL: API_BASE_URL,
});
