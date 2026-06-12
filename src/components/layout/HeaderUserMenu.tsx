"use client";

import {
    ChevronDown,
    LogOut,
    ShoppingCart,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { clearUserDisplayCookies } from "@/lib/authCookies";
import { authService } from "@/services/auth.service";

interface UserDisplayData {
    email: string;
    username: string;
}

interface HeaderUserMenuProps {
    adminMenuItem?: ReactNode;
    initialUser: UserDisplayData | null;
}

function getCookieValue(cookieString: string, name: string) {
    const cookie = cookieString
        .split("; ")
        .find((item) => item.startsWith(`${name}=`));

    if (!cookie) {
        return "";
    }

    return decodeURIComponent(cookie.split("=").slice(1).join("="));
}

function getUserDisplayData(cookieString: string): UserDisplayData | null {
    const username = getCookieValue(cookieString, "username");
    const email = getCookieValue(cookieString, "user_email");

    if (!username && !email) {
        return null;
    }

    return {
        email,
        username: username || email,
    };
}

function subscribeToUserCookieChanges(onStoreChange: () => void) {
    window.addEventListener("focus", onStoreChange);
    window.addEventListener("pageshow", onStoreChange);
    window.addEventListener("user-cookie-change", onStoreChange);

    return () => {
        window.removeEventListener("focus", onStoreChange);
        window.removeEventListener("pageshow", onStoreChange);
        window.removeEventListener("user-cookie-change", onStoreChange);
    };
}

function getClientCookieSnapshot() {
    return document.cookie;
}

export default function HeaderUserMenu({
    adminMenuItem = null,
    initialUser,
}: HeaderUserMenuProps) {
    const { push, refresh } = useRouter();
    const { showNotification } = useNotification();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const getServerSnapshot = () => {
        if (!initialUser) {
            return "";
        }

        return [
            `username=${encodeURIComponent(initialUser.username)}`,
            `user_email=${encodeURIComponent(initialUser.email)}`,
        ].join("; ");
    };
    const cookieSnapshot = useSyncExternalStore(
        subscribeToUserCookieChanges,
        getClientCookieSnapshot,
        getServerSnapshot,
    );
    const user = getUserDisplayData(cookieSnapshot) ?? initialUser;

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (
                event.target instanceof Node &&
                !menuRef.current?.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [isMenuOpen]);

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            await authService.logout();
        } catch {
            // Local logout cleanup should still run if the API session is already gone.
        }

        clearUserDisplayCookies();
        setIsMenuOpen(false);
        setIsLoggingOut(false);
        showNotification("Signed out successfully.", "success");
        push("/");
        refresh();
    };

    if (!user) {
        return (
            <div className="flex items-center justify-end gap-4 justify-self-end">
                <Link
                    href="/login"
                    className="text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950"
                >
                    Sign in
                </Link>
                <Link
                    aria-label="Shopping cart"
                    className="flex size-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                    href="/cart"
                >
                    <ShoppingCart aria-hidden="true" size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-w-0 items-center justify-end gap-4 justify-self-end">
            <div className="relative hidden sm:block" ref={menuRef}>
                <button
                    aria-expanded={isMenuOpen}
                    aria-haspopup="menu"
                    className="flex max-w-48 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-100"
                    onClick={() => setIsMenuOpen((current) => !current)}
                    type="button"
                >
                    <span className="truncate">{user.username}</span>
                    <ChevronDown
                        aria-hidden="true"
                        className={`shrink-0 transition-transform ${
                            isMenuOpen ? "rotate-180" : ""
                        }`}
                        size={16}
                    />
                </button>

                {isMenuOpen && (
                    <div
                        className="absolute left-1/2 top-full z-50 mt-2 w-48 -translate-x-1/2 rounded-lg border border-zinc-200 bg-white p-1.5 text-sm shadow-xl shadow-zinc-950/10"
                        role="menu"
                    >
                        <Link
                            className="flex items-center gap-2 rounded-md px-3 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                            href="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            role="menuitem"
                        >
                            <UserRound aria-hidden="true" size={16} />
                            Profile options
                        </Link>

                        {adminMenuItem}

                        <button
                            className="flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                            disabled={isLoggingOut}
                            onClick={handleLogout}
                            role="menuitem"
                            type="button"
                        >
                            <LogOut aria-hidden="true" size={16} />
                            {isLoggingOut ? "Logging out..." : "Log Out"}
                        </button>
                    </div>
                )}
            </div>

            <Link
                className="whitespace-nowrap text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-950"
                href="/orderHistory"
            >
                My Orders
            </Link>

            <Link
                aria-label="Shopping cart"
                className="flex size-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                href="/cart"
            >
                <ShoppingCart aria-hidden="true" size={18} />
            </Link>
        </div>
    );
}
