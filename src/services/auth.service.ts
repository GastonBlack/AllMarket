import { api } from "@/lib/axios";

import type {
    AuthResponseDto,
    ForgotPasswordDto,
    LoginDto,
    RegisterDto,
    ResendEmailVerificationDto,
    ResetPasswordDto,
    VerifyEmailDto,
} from "@/types";

export const authService = {
    async register(dto: RegisterDto): Promise<AuthResponseDto> {
        const response = await api.post<AuthResponseDto>("/api/auth/register", dto);

        return response.data;
    },

    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const response = await api.post<AuthResponseDto>("/api/auth/login", dto);

        return response.data;
    },

    async verifyEmail(dto: VerifyEmailDto): Promise<boolean> {
        const response = await api.post<boolean>("/api/auth/verify-email", dto);

        return response.data;
    },

    async resendEmailVerificationCode(
        dto: ResendEmailVerificationDto,
    ): Promise<boolean> {
        const response = await api.post<boolean>(
            "/api/auth/resend-verification-code",
            dto,
        );

        return response.data;
    },

    async forgotPassword(dto: ForgotPasswordDto): Promise<boolean> {
        const response = await api.post<boolean>("/api/auth/forgot-password", dto);

        return response.data;
    },

    async resetPassword(dto: ResetPasswordDto): Promise<boolean> {
        const response = await api.post<boolean>("/api/auth/reset-password", dto);

        return response.data;
    },

    async logout(): Promise<boolean> {
        const response = await api.post<boolean>("/api/auth/logout");

        return response.data;
    },
};
