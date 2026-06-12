"use client";

import { CheckCircle2, Clock3, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { OrderResponseDto } from "@/types";
import { formatDateTime, formatPrice } from "@/utils/formatters";
import { clearCartItems } from "@/utils/cartCookie";
import { getOrderStatusStyle } from "@/utils/orderStatus";

import {
    getOrderItemCount,
    getOrderStatusDescription,
} from "./orderHistory.helpers";

interface OrderHistoryClientProps {
    orders: OrderResponseDto[];
}

export function ClearCartOnPaymentSuccess({ enabled }: { enabled: boolean }) {
    useEffect(() => {
        if (enabled) {
            clearCartItems();
        }
    }, [enabled]);

    return null;
}

export function PaymentSuccessBanner({ orderId }: { orderId?: string }) {
    return (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <div className="flex gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-0.5" size={20} />
                <div>
                    <p className="font-semibold">Payment completed</p>
                    <p className="mt-1 text-sm leading-6">
                        Your purchase was completed
                        {orderId ? ` for order #${orderId}` : ""}. Your order details are now available below.
                    </p>
                </div>
            </div>
        </div>
    );
}

function OrderCard({
    onSelect,
    order,
}: {
    onSelect: (order: OrderResponseDto) => void;
    order: OrderResponseDto;
}) {
    const itemCount = getOrderItemCount(order);

    return (
        <button
            aria-label={`View details for order ${order.id}`}
            className="w-full rounded-lg border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            onClick={() => onSelect(order)}
            type="button"
        >
            <div className="grid gap-4 md:grid-cols-[120px_minmax(0,1fr)_220px_140px] md:items-center">
                <div>
                    <p className="text-sm text-zinc-500">Order</p>
                    <p className="mt-1 text-xl font-semibold text-zinc-950">
                        #{order.id}
                    </p>
                </div>
                <div>
                    <p className="text-sm font-medium text-zinc-950">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                        {formatDateTime(order.createdAt)}
                    </p>
                </div>
                <div>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getOrderStatusStyle(order.status)}`}
                    >
                        {order.status}
                    </span>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                        {getOrderStatusDescription(order.status)}
                    </p>
                </div>
                <p className="text-lg font-semibold text-zinc-950 md:text-right">
                    {formatPrice(order.totalPrice)}
                </p>
            </div>
        </button>
    );
}

function OrderDetailsModal({
    onClose,
    order,
}: {
    onClose: () => void;
    order: OrderResponseDto;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onClick={onClose}
        >
            <section
                aria-labelledby="order-details-title"
                aria-modal="true"
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-6">
                    <div>
                        <h2
                            className="text-xl font-semibold text-zinc-950"
                            id="order-details-title"
                        >
                            Order details
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Order #{order.id}
                        </p>
                    </div>
                    <button
                        aria-label="Close order details"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden="true" size={20} />
                    </button>
                </header>

                <div className="grid gap-4 p-6 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 p-4 text-center">
                        <p className="text-xs text-zinc-500">Date</p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4 text-center">
                        <p className="text-xs text-zinc-500">Status</p>
                        <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getOrderStatusStyle(order.status)}`}
                        >
                            {order.status}
                        </span>
                        <p className="mt-2 text-xs leading-5 text-zinc-600">
                            {getOrderStatusDescription(order.status)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4 text-center">
                        <p className="text-xs text-zinc-500">Products</p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            {getOrderItemCount(order)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4 text-center">
                        <p className="text-xs text-zinc-500">Total</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">
                            {formatPrice(order.totalPrice)}
                        </p>
                    </div>
                </div>

                {order.reservationExpiresAt && (
                    <div className="mx-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                        <span className="inline-flex items-center gap-2">
                            <Clock3 aria-hidden="true" size={16} />
                            Reservation expires{" "}
                            {formatDateTime(order.reservationExpiresAt)}
                        </span>
                    </div>
                )}

                <div className="p-6">
                    <h3 className="text-base font-semibold text-zinc-950">
                        Products
                    </h3>
                    <div className="mt-4 overflow-x-auto rounded-lg border border-zinc-200">
                        <div className="min-w-[620px]">
                            <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500">
                                <span>Product</span>
                                <span>Quantity</span>
                                <span>Price</span>
                                <span className="text-right">Subtotal</span>
                            </div>
                            {order.items.map((item) => (
                                <div
                                    className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] border-t border-zinc-100 px-4 py-4 text-sm"
                                    key={item.id}
                                >
                                    <div>
                                        <p className="font-semibold text-zinc-950">
                                            {item.productName}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Product ID: {item.productId}
                                        </p>
                                    </div>
                                    <span>{item.quantity}</span>
                                    <span>
                                        {formatPrice(item.priceAtPurchase)}
                                    </span>
                                    <span className="text-right font-semibold text-zinc-950">
                                        {formatPrice(item.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <footer className="flex justify-end border-t border-zinc-200 p-6">
                    <button
                        className="h-10 rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                        onClick={onClose}
                        type="button"
                    >
                        Close
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default function OrderHistoryClient({
    orders,
}: OrderHistoryClientProps) {
    const [selectedOrder, setSelectedOrder] =
        useState<OrderResponseDto | null>(null);

    return (
        <>
            <div className="mt-6 grid gap-4">
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        onSelect={setSelectedOrder}
                        order={order}
                    />
                ))}
            </div>

            {selectedOrder && (
                <OrderDetailsModal
                    onClose={() => setSelectedOrder(null)}
                    order={selectedOrder}
                />
            )}
        </>
    );
}
