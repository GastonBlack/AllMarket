"use client";

import { useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { getApiError } from "@/lib/axios";
import { ordersService } from "@/services/orders.service";
import { paymentsService } from "@/services/payments.service";
import { getCartItems } from "@/utils/cartCookie";

export default function CheckoutButton() {
    const { showNotification } = useNotification();
    const [error, setError] = useState("");
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    async function handleCheckout() {
        setError("");
        const items = getCartItems().map(({ productId, quantity }) => ({
            productId,
            quantity,
        }));

        if (items.length === 0) {
            const message =
                "Your cart is empty. Add products before checkout.";
            setError(message);
            showNotification(message, "error");
            return;
        }

        setIsCheckingOut(true);

        try {
            const order = await ordersService.checkout({ items });
            const payment = await paymentsService.checkout(order.id);

            window.location.href = payment.checkoutUrl;
        } catch (checkoutError) {
            const message =
                getApiError(checkoutError)?.message ??
                "We could not start checkout. Please try again.";
            setError(message);
            showNotification(message, "error");
            setIsCheckingOut(false);
        }
    }

    return (
        <div className="mt-6">
            <button
                className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={isCheckingOut}
                onClick={handleCheckout}
                type="button"
            >
                {isCheckingOut ? "Processing..." : "Proceed to checkout"}
            </button>
            {error && (
                <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm leading-6 text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}
