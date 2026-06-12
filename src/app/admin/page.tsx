import type { Metadata } from "next";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/currentUser";

import AdminClient from "./adminClient";

export const metadata: Metadata = {
    description: "Administrative dashboard for AllMarket operators.",
    title: "Admin Panel | AllMarket",
};

function AdminLoadingState() {
    return (
        <main className="min-h-screen bg-zinc-100 px-4 py-10 text-center text-sm text-zinc-600">
            Loading admin panel...
        </main>
    );
}

export default async function AdminPage() {
    const currentUser = await getCurrentUser();

    return (
        <Suspense fallback={<AdminLoadingState />}>
            <AdminClient currentUserName={currentUser?.fullName ?? "Admin"} />
        </Suspense>
    );
}
