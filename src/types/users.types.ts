import type { OrderResponseDto } from "./orders.types";
import type { UserRole } from "./auth.types";

export interface UserProfileDto {
  id: number;
  fullName: string;
  email: string;
  rol: UserRole;
  address: string;
  phone?: string | null;
  createdAt: string;
}

export interface UpdateUserProfileDto {
  fullName: string;
  address: string;
  phone?: string | null;
}

export interface UserOrderHistoryDto {
  userId: number;
  orders: OrderResponseDto[];
}

export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
    code: string;
}
