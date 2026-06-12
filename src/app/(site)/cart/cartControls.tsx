"use client";

import { Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import {
    clearCartItems,
    removeCartItem,
    updateCartItemQuantity,
} from "@/utils/cartCookie";

interface CartItemControlsProps {
    maxQuantity: number;
    productId: number;
    quantity: number;
}

const quantityUpdateDebounceMs = 550;

export function CartItemControls({
    maxQuantity,
    productId,
    quantity,
}: CartItemControlsProps) {
    const { refresh } = useRouter();
    const { showNotification } = useNotification();
    const [quantityDelta, setQuantityDelta] = useState(0);
    const [isPending, startTransition] = useTransition();
    const didMountRef = useRef(false);
    const safeMaxQuantity = Math.max(1, maxQuantity);
    const localQuantity = Math.min(
        Math.max(1, quantity + quantityDelta),
        safeMaxQuantity,
    );
    const canIncrease = localQuantity < safeMaxQuantity;
    const canDecrease = localQuantity > 1;

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }

        const timeoutId = window.setTimeout(() => {
            updateCartItemQuantity(productId, localQuantity, safeMaxQuantity);
            startTransition(() => {
                refresh();
            });
        }, quantityUpdateDebounceMs);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [localQuantity, productId, refresh, safeMaxQuantity, startTransition]);

    function refreshCart(action: () => void) {
        action();
        startTransition(() => {
            refresh();
        });
    }

    function changeQuantity(nextQuantity: number) {
        const clampedQuantity = Math.min(
            Math.max(1, nextQuantity),
            safeMaxQuantity,
        );

        setQuantityDelta(clampedQuantity - quantity);
    }

    return (
        <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex h-10 items-center rounded-md border border-zinc-300 bg-white">
                <button
                    aria-label="Decrease quantity"
                    className="flex size-10 cursor-pointer items-center justify-center text-zinc-700 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
                    disabled={!canDecrease || isPending}
                    onClick={() => changeQuantity(localQuantity - 1)}
                    type="button"
                >
                    <Minus aria-hidden="true" size={16} />
                </button>
                <span className="w-10 text-center text-sm font-semibold text-zinc-950">
                    {localQuantity}
                </span>
                <button
                    aria-label="Increase quantity"
                    className="flex size-10 cursor-pointer items-center justify-center text-zinc-700 transition hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
                    disabled={!canIncrease || isPending}
                    onClick={() => changeQuantity(localQuantity + 1)}
                    type="button"
                >
                    <Plus aria-hidden="true" size={16} />
                </button>
            </div>

            <button
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
                disabled={isPending}
                onClick={() => {
                    refreshCart(() => removeCartItem(productId));
                    showNotification("Product removed from cart.", "success");
                }}
                type="button"
            >
                <Trash2 aria-hidden="true" size={15} />
                Remove
            </button>
        </div>
    );
}

export function ClearCartButton() {
    const { refresh } = useRouter();
    const { showNotification } = useNotification();
    const [isPending, startTransition] = useTransition();

    function handleClearCart() {
        clearCartItems();
        showNotification("Cart cleared.", "success");
        startTransition(() => {
            refresh();
        });
    }

    return (
        <button
            className="mt-3 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
            disabled={isPending}
            onClick={handleClearCart}
            type="button"
        >
            <RotateCcw aria-hidden="true" size={16} />
            Reset cart
        </button>
    );
}
