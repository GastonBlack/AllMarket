import {
    Globe,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Share2,
    X,
} from "lucide-react";
import Link from "next/link";

import PortfolioDisclaimer from "./PortfolioDisclaimer";

const helpLinks = [
    "Help center",
    "Order tracking",
    "Returns and refunds",
    "Payment methods",
    "Shipping",
] as const;

const companyLinks = [
    "About us",
    "Careers",
    "Terms and conditions",
    "Privacy policy",
] as const;

export default function Footer() {
    return (
        <footer className="bg-zinc-950 text-white">
            <div className="mx-auto grid w-full max-w-[90%] gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.2fr] lg:px-8">
                <div className="text-center lg:text-left">
                    <Link
                        aria-label="AllMarket home"
                        className="inline-flex items-center text-2xl font-bold"
                        href="/"
                    >
                        AllMarket
                    </Link>
                    <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-zinc-200 lg:mx-0">
                        Your online store for everyday products.
                    </p>
                    <p className="mx-auto mt-1 max-w-xs text-sm leading-6 text-zinc-200 lg:mx-0">
                        Shop fast, simple, and secure.
                    </p>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-white">Help</h2>
                    <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                        {helpLinks.map((label) => (
                            <li key={label}>
                                <Link
                                    className="transition hover:text-yellow-300"
                                    href="/#faq"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-white">Company</h2>
                    <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                        {companyLinks.map((label) => (
                            <li key={label}>
                                <Link
                                    className="transition hover:text-red-400"
                                    href="/#contact"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-white">Contact</h2>
                    <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                        <li className="flex items-center gap-3">
                            <MapPin aria-hidden="true" className="text-zinc-300" size={18} />
                            Montevideo, Uruguay
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail aria-hidden="true" className="text-zinc-300" size={18} />
                            contact@allmarket.com
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone aria-hidden="true" className="text-zinc-300" size={18} />
                            +598 99 123 456
                        </li>
                    </ul>

                    <div className="mt-6 flex items-center gap-5 text-zinc-200">
                        <Link
                            aria-label="AllMarket website"
                            className="transition hover:text-yellow-300"
                            href="/"
                        >
                            <Globe aria-hidden="true" size={20} />
                        </Link>
                        <Link
                            aria-label="AllMarket community"
                            className="transition hover:text-yellow-300"
                            href="/"
                        >
                            <MessageCircle aria-hidden="true" size={20} />
                        </Link>
                        <Link
                            aria-label="Share AllMarket"
                            className="transition hover:text-yellow-300"
                            href="/"
                        >
                            <Share2 aria-hidden="true" size={20} />
                        </Link>
                        <Link
                            aria-label="AllMarket X"
                            className="transition hover:text-yellow-300"
                            href="/"
                        >
                            <X aria-hidden="true" size={20} />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[90%] border-t border-zinc-700 px-4 py-6 text-center text-xs text-zinc-300 sm:px-6 lg:px-8">
                © 2026 AllMarket. All rights reserved.
            </div>
            <PortfolioDisclaimer />
        </footer>
    );
}
