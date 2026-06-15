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

export const isApiError = (error: unknown) => axios.isAxiosError(error);

function getStringProperty(
    value: Record<string, unknown>,
    property: string,
) {
    const propertyValue = value[property];

    return typeof propertyValue === "string" && propertyValue.trim()
        ? propertyValue
        : null;
}

function getValidationMessage(value: Record<string, unknown>) {
    const errors = value.errors;

    if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
        return null;
    }

    const messages = Object.values(errors).flatMap((fieldErrors) => {
        if (typeof fieldErrors === "string") {
            return fieldErrors.trim() ? [fieldErrors] : [];
        }

        if (!Array.isArray(fieldErrors)) {
            return [];
        }

        return fieldErrors.filter(
            (fieldError): fieldError is string =>
                typeof fieldError === "string" && Boolean(fieldError.trim()),
        );
    });

    return [...new Set(messages)].join(" ") || null;
}

export const getApiError = (error: unknown): ErrorResponse | null => {
    if (!isApiError(error)) {
        return null;
    }

    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) {
        return {
            error: "request_failed",
            message: data,
            statusCode: error.response?.status ?? 0,
            timestamp: "",
            traceId: "",
        };
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        return null;
    }

    const response = data as Record<string, unknown>;
    const message =
        getValidationMessage(response) ??
        getStringProperty(response, "message") ??
        getStringProperty(response, "detail") ??
        getStringProperty(response, "title");

    if (!message) {
        return null;
    }

    return {
        error: getStringProperty(response, "error") ?? "request_failed",
        message,
        statusCode:
            typeof response.statusCode === "number"
                ? response.statusCode
                : typeof response.status === "number"
                  ? response.status
                  : error.response?.status ?? 0,
        timestamp: getStringProperty(response, "timestamp") ?? "",
        traceId: getStringProperty(response, "traceId") ?? "",
    };
};
