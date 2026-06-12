import { api } from "@/lib/axios";

import type { AuthResponseDto, LoginDto, RegisterDto } from "@/types";

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const response = await api.post<AuthResponseDto>("/api/auth/register", dto);

    return response.data;
  },

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const response = await api.post<AuthResponseDto>("/api/auth/login", dto);

    return response.data;
  },

  async logout(): Promise<boolean> {
    const response = await api.post<boolean>("/api/auth/logout");

    return response.data;
  },
};
