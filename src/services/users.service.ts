import { api } from "@/lib/axios";

import type {
  ChangePasswordDto,
  UpdateUserProfileDto,
  UserOrderHistoryDto,
  UserProfileDto,
} from "@/types";

export const usersService = {
  async getMe(): Promise<UserProfileDto> {
    const response = await api.get<UserProfileDto>("/api/users/me");

    return response.data;
  },

  async getMyOrderHistory(): Promise<UserOrderHistoryDto> {
    const response =
      await api.get<UserOrderHistoryDto>("/api/users/me/history");

    return response.data;
  },

  async updateMe(dto: UpdateUserProfileDto): Promise<UserProfileDto> {
    const response = await api.patch<UserProfileDto>("/api/users/update", dto);

    return response.data;
  },

  async changePassword(dto: ChangePasswordDto): Promise<boolean> {
    const response = await api.put<boolean>("/api/users/me/password", dto);

    return response.data;
  },
};
