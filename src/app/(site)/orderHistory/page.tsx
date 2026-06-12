import { AlertCircle, PackageCheck, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

import SessionRecovery from "@/components/auth/SessionRecovery";
import type { UserOrderHistoryDto } from "@/types";

import OrderHistoryClient, {
    ClearCartOnPaymentSuccess,
    PaymentSuccessBanner,
} from "./orderHistoryClient";

export const metadata: Metadata = {
    description: "Review your AllMarket order history and purchase status.",
    title: "Order History | AllMarket",
};

type OrderHistoryResult =
    | { history: UserOrderHistoryDto; status: "ok" }
    | { status: "empty" }
    | { status: "error" }
    | { status: "unauthenticated" };

interface OrderHistoryPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleSearchParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

async function getOrderHistory(): Promise<OrderHistoryResult> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!apiBaseUrl) {
        return { status: "error" };
    }

    const cookieStore = await cookies();
    const response = await fetch(`${apiBaseUrl}/api/users/me/history`, {
        cache: "no-store",
        headers: {
            cookie: cookieStore.toString(),
        },
    }).catch(() => null);

    if (!response) {
        return { status: "error" };
    }

    if (response.status === 401 || response.status === 403) {
        return { status: "unauthenticated" };
    }

    if (!response.ok) {
        return { status: "error" };
    }

    const history = (await response.json()) as UserOrderHistoryDto;

    return history.orders.length > 0
        ? { history, status: "ok" }
        : { status: "empty" };
}

function EmptyOrders() {
    return (
        <div className="mt-6 flex min-h-80 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
            <div>
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-950 ring-1 ring-yellow-300">
                    <PackageCheck aria-hidden="true" size={24} />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-zinc-950">
                    No orders yet
                </h2>
                <p className="mt-2 text-sm text-zinc-600">
                    Your completed purchases will show up here.
                </p>
            </div>
        </div>
    );
}

function MessageState({
    href,
    icon,
    message,
    title,
}: {
    href: string;
    icon: React.ReactNode;
    message: string;
    title: string;
}) {
    return (
        <div className="mt-6 flex min-h-80 items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <div>
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-600 ring-1 ring-red-200">
                    {icon}
                </div>
                <h2 className="mt-5 text-lg font-semibold text-zinc-950">
                    {title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600">{message}</p>
                <Link
                    className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                    href={href}
                >
                    Continue
                </Link>
            </div>
        </div>
    );
}

export default async function OrderHistoryPage({
    searchParams,
}: OrderHistoryPageProps) {
    const params = await searchParams;
    const paymentStatus = getSingleSearchParam(params.payment);
    const paidOrderId = getSingleSearchParam(params.orderId);
    const paymentSucceeded = paymentStatus === "success";
    const result = await getOrderHistory();

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <section className="mx-auto max-w-5xl">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-950">
                                Order history
                            </h1>
                            <p className="mt-2 text-sm text-zinc-600">
                                Review your purchases and order status.
                            </p>
                        </div>
                        <Link
                            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
                            href="/products"
                        >
                            Continue shopping
                        </Link>
                    </div>
                </div>

                <ClearCartOnPaymentSuccess enabled={paymentSucceeded} />

                {paymentSucceeded && (
                    <PaymentSuccessBanner orderId={paidOrderId} />
                )}

                {result.status === "ok" && (
                    <OrderHistoryClient orders={result.history.orders} />
                )}

                {result.status === "empty" && <EmptyOrders />}

                {result.status === "unauthenticated" && (
                    <SessionRecovery
                        failureContent={
                            <MessageState
                                href="/login"
                                icon={
                                    <ShoppingBag
                                        aria-hidden="true"
                                        size={24}
                                    />
                                }
                                message="Sign in to see the orders linked to your account."
                                title="Sign in required"
                            />
                        }
                    />
                )}

                {result.status === "error" && (
                    <MessageState
                        href="/products"
                        icon={<AlertCircle aria-hidden="true" size={24} />}
                        message="We could not load your order history right now."
                        title="Order history unavailable"
                    />
                )}
            </section>
        </main>
    );
}
