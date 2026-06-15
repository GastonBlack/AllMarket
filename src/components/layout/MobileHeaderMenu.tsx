"use client";

import {
    LayoutDashboard,
    LogIn,
    LogOut,
    Menu,
    PackageSearch,
    ShoppingCart,
    UserRound,
    X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { clearUserDisplayCookies } from "@/lib/authCookies";
import { authService } from "@/services/auth.service";

interface MobileHeaderMenuProps {
    isAdmin: boolean;
    user: {
        email: string;
        username: string;
    } | null;
}

const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/#faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
] as const;

export default function MobileHeaderMenu({
    isAdmin,
    user,
}: MobileHeaderMenuProps) {
    const { push, refresh } = useRouter();
    const { showNotification } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (
                event.target instanceof Node &&
                !menuRef.current?.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
        };
    }, [isOpen]);

    async function handleLogout() {
        setIsLoggingOut(true);

        try {
            await authService.logout();
        } catch {
            // Local session cleanup still applies when the API session is gone.
        }

        clearUserDisplayCookies();
        setIsOpen(false);
        setIsLoggingOut(false);
        showNotification("Signed out successfully.", "success");
        push("/");
        refresh();
    }

    return (
        <div className="relative flex items-center gap-2 md:hidden" ref={menuRef}>
            <Link
                aria-label="Shopping cart"
                className="flex size-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700"
                href="/cart"
            >
                <ShoppingCart aria-hidden="true" size={18} />
            </Link>
            <button
                aria-expanded={isOpen}
                aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                className="flex size-10 items-center justify-center rounded-md border border-zinc-200 text-zinc-800"
                onClick={() => setIsOpen((current) => !current)}
                type="button"
            >
                {isOpen ? (
                    <X aria-hidden="true" size={20} />
                ) : (
                    <Menu aria-hidden="true" size={20} />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-[min(19rem,calc(100vw-2rem))] rounded-lg border border-zinc-200 bg-white p-2 shadow-xl shadow-zinc-950/10">
                    {user && (
                        <div className="border-b border-zinc-100 px-3 py-3">
                            <p className="truncate text-sm font-semibold text-zinc-950">
                                {user.username}
                            </p>
                            <p className="mt-1 truncate text-xs text-zinc-500">
                                {user.email}
                            </p>
                        </div>
                    )}

                    <nav aria-label="Mobile navigation" className="py-2">
                        {navigationLinks.map((link) => (
                            <Link
                                className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                                href={link.href}
                                key={link.href}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-zinc-100 pt-2">
                        {user ? (
                            <>
                                <Link
                                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <UserRound aria-hidden="true" size={17} />
                                    My profile
                                </Link>
                                <Link
                                    className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                                    href="/orderHistory"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <PackageSearch aria-hidden="true" size={17} />
                                    My orders
                                </Link>
                                {isAdmin && (
                                    <Link
                                        className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-100"
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <LayoutDashboard aria-hidden="true" size={17} />
                                        Admin panel
                                    </Link>
                                )}
                                <button
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:text-red-300"
                                    disabled={isLoggingOut}
                                    onClick={handleLogout}
                                    type="button"
                                >
                                    <LogOut aria-hidden="true" size={17} />
                                    {isLoggingOut ? "Logging out..." : "Log out"}
                                </button>
                            </>
                        ) : (
                            <Link
                                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-100"
                                href="/login"
                                onClick={() => setIsOpen(false)}
                            >
                                <LogIn aria-hidden="true" size={17} />
                                Sign in
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
