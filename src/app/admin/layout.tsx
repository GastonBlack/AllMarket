import { notFound } from "next/navigation";

import SessionRecovery from "@/components/auth/SessionRecovery";
import { getCurrentUser } from "@/lib/currentUser";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const currentUser = await getCurrentUser();

    if (currentUser && currentUser.rol !== "Admin") {
        notFound();
    }

    if (!currentUser) {
        return (
            <SessionRecovery
                failureContent={
                    <main className="flex min-h-screen items-center justify-center bg-zinc-100 text-sm text-zinc-600">
                        You do not have access to the admin panel.
                    </main>
                }
            />
        );
    }

    return (
        <section className="min-h-screen bg-zinc-100 text-zinc-950">
            {children}
        </section>
    );
}
