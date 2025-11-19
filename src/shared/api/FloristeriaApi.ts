import axios from 'axios';

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  return envUrl;
};

const BASE_URL = getBaseURL();
const API_BASE_URL = `${BASE_URL}/api`;

export const floristeriaApi = axios.create({
  baseURL: API_BASE_URL,
});
