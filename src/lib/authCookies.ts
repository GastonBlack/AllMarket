import type { AuthResponseDto } from "@/types";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function setUserDisplayCookie(name: string, value: string) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function setUserDisplayCookies(user: AuthResponseDto) {
    setUserDisplayCookie("user_email", user.email);
    setUserDisplayCookie("username", user.fullName);
    window.dispatchEvent(new Event("user-cookie-change"));
}

export function clearUserDisplayCookies() {
    document.cookie = "username=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "user_email=; path=/; max-age=0; SameSite=Lax";
    window.dispatchEvent(new Event("user-cookie-change"));
}
