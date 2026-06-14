import axios, { type InternalAxiosRequestConfig } from "axios";

import { clearUserDisplayCookies, setUserDisplayCookies } from "@/lib/authCookies";
import type { AuthResponseDto, ErrorResponse } from "@/types";

const apiBaseUrl =
    typeof window === "undefined"
        ? process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_BASE_URL
        : undefined;

const apiConfig = {
    baseURL: apiBaseUrl,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
    },
};

export const api = axios.create(apiConfig);
const refreshApi = axios.create(apiConfig);
const csrfApi = axios.create(apiConfig);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshRequest: Promise<AuthResponseDto> | null = null;
let csrfToken: string | null = null;
let csrfRequest: Promise<string> | null = null;

function requiresCsrfToken(method?: string) {
    return ["post", "put", "patch", "delete"].includes(
        method?.toLowerCase() ?? "",
    );
}

function getCsrfToken() {
    if (csrfToken) {
        return Promise.resolve(csrfToken);
    }

    csrfRequest ??= csrfApi
        .get<{ csrfToken: string }>("/api/auth/csrf")
        .then((response) => {
            csrfToken = response.data.csrfToken;
            return csrfToken;
        })
        .finally(() => {
            csrfRequest = null;
        });

    return csrfRequest;
}

async function addCsrfHeader(config: InternalAxiosRequestConfig) {
    if (!requiresCsrfToken(config.method)) {
        return config;
    }

    const token = await getCsrfToken();
    config.headers.set("X-CSRF-Token", token);

    return config;
}

function refreshSession() {
    refreshRequest ??= refreshApi
        .post<AuthResponseDto>("/api/auth/refresh")
        .then((response) => {
            setUserDisplayCookies(response.data);
            return response.data;
        })
        .finally(() => {
            refreshRequest = null;
        });

    return refreshRequest;
}

function isAuthRequest(url?: string) {
    return url?.startsWith("/api/auth/") ?? false;
}

if (typeof window !== "undefined") {
    api.interceptors.request.use(addCsrfHeader);
    refreshApi.interceptors.request.use(addCsrfHeader);

    api.interceptors.response.use(
        (response) => response,
        async (error: unknown) => {
            if (!axios.isAxiosError(error)) {
                return Promise.reject(error);
            }

            const config = error.config as RetryableRequestConfig | undefined;

            if (
                error.response?.status !== 401 ||
                !config ||
                config._retry ||
                isAuthRequest(config.url)
            ) {
                return Promise.reject(error);
            }

            config._retry = true;

            try {
                await refreshSession();
                return api(config);
            } catch (refreshError) {
                if (
                    axios.isAxiosError(refreshError) &&
                    (refreshError.response?.status === 401 ||
                        refreshError.response?.status === 403)
                ) {
                    clearUserDisplayCookies();
                }

                return Promise.reject(refreshError);
            }
        },
    );
}

export const isApiError = (error: unknown) =>
    axios.isAxiosError<ErrorResponse>(error);

export const getApiError = (error: unknown): ErrorResponse | null => {
    if (!isApiError(error)) {
        return null;
    }

    return error.response?.data ?? null;
};
