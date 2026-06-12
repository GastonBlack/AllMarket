import { Frown } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <section className="flex max-w-md flex-col items-center text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-zinc-900 text-white">
                    <Frown aria-hidden="true" size={32} strokeWidth={1.8} />
                </div>

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    Error 404
                </p>
                <h1 className="text-3xl font-semibold text-zinc-950">
                    Page not found
                </h1>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                    The page you are looking for does not exist or was moved.
                </p>

                <Link
                    href="/"
                    className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
                >
                    Back to home
                </Link>
            </section>
        </main>
    );
}
