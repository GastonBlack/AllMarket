import { LayoutDashboard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import HeaderUserMenu from "./HeaderUserMenu";
import MobileHeaderMenu from "./MobileHeaderMenu";

interface HeaderProps {
    initialUser: {
        email: string;
        username: string;
    } | null;
    isAdmin?: boolean;
}

const navigationLinks = [
    {
        href: "/",
        label: "Home",
    },
    {
        href: "/products",
        label: "Products",
    },
    {
        href: "/#faq",
        label: "FAQ",
    },
    {
        href: "/#contact",
        label: "Contact",
    },
] as const;

export default function Header({ initialUser, isAdmin = false }: HeaderProps) {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white"
            id="site-header"
        >
            <div className="mx-auto flex h-16 w-full max-w-[90%] items-center justify-between px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] lg:px-8">
                <Link
                    href="/"
                    aria-label="AllMarket home"
                    className="flex w-fit items-center gap-3"
                >
                    <Image
                        src="/favicon.ico"
                        alt="AllMarket"
                        width={36}
                        height={36}
                        className="size-9"
                    />
                    <span className="hidden text-lg font-semibold text-zinc-950 sm:inline">
                        AllMarket
                    </span>
                </Link>

                <nav aria-label="Primary navigation" className="hidden md:block">
                    <ul className="flex items-center gap-8 text-sm font-medium text-zinc-700">
                        {navigationLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="transition-colors hover:text-zinc-950"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden justify-self-end md:block">
                    <HeaderUserMenu
                        adminMenuItem={
                            isAdmin ? (
                                <Link
                                    className="flex items-center gap-2 rounded-md px-3 py-2 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-950"
                                    href="/admin"
                                    role="menuitem"
                                >
                                    <LayoutDashboard aria-hidden="true" size={16} />
                                    Admin panel
                                </Link>
                            ) : null
                        }
                        initialUser={initialUser}
                    />
                </div>
                <MobileHeaderMenu isAdmin={isAdmin} user={initialUser} />
            </div>
        </header>
    );
}
