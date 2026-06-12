import { cookies } from "next/headers";

import type { UserProfileDto } from "@/types";

export async function getCurrentUser(): Promise<UserProfileDto | null> {
    const apiBaseUrl =
        process.env.API_ORIGIN ?? process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
        return null;
    }

    const cookieStore = await cookies();
    const response = await fetch(`${apiBaseUrl}/api/users/me`, {
        cache: "no-store",
        headers: {
            cookie: cookieStore.toString(),
        },
    }).catch(() => null);

    if (!response?.ok) {
        return null;
    }

    return response.json() as Promise<UserProfileDto>;
}
