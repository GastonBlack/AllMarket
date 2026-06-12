"use client";

import type { ReactNode } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { addCartItem } from "@/utils/cartCookie";

interface AddToCartButtonProps {
    children?: ReactNode;
    className: string;
    disabled?: boolean;
    maxQuantity?: number;
    productId: number;
    quantity?: number;
}

export default function AddToCartButton({
    children = "Add to cart",
    className,
    disabled = false,
    maxQuantity,
    productId,
    quantity = 1,
}: AddToCartButtonProps) {
    const { showNotification } = useNotification();

    function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        event.stopPropagation();
        addCartItem(productId, quantity, maxQuantity);
        showNotification("Product added to cart.", "success");
    }

    return (
        <button
            className={className}
            disabled={disabled}
            onClick={handleAddToCart}
            type="button"
        >
            {children}
        </button>
    );
}
