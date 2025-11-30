import { floristeriaApi } from "@/shared/api/FloristeriaApi";
import type { AuthResponse } from "../types/Auth.response";
import { clearTokenCache } from "@/shared/utils/tokenUtils";

export const checkAuthAction = async (): Promise<AuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  const { data } = await floristeriaApi.get<AuthResponse>('/auth/check-status');

  // Solo actualizar el token si el servidor devuelve uno nuevo
  if (data.token) {
    localStorage.setItem('token', data.token);
    // Limpiar caché del token anterior
    clearTokenCache();
  }
  return data;
};