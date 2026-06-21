export type UserRole = "Admin" | "User";

export interface AuthResponseDto {
  id: number;
  fullName: string;
  email: string;
  rol: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  address: string;
  phone?: string | null;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendEmailVerificationDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}
