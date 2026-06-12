import { ShoppingCart } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";

import { productsService } from "@/services/products.service";
import type { ProductResponseDto } from "@/types";
import { formatPrice } from "@/utils/formatters";
import { getProductDisplayPrice } from "@/utils/productPricing";

import { CartItemControls, ClearCartButton } from "./cartControls";
import CheckoutButton from "./checkoutButton";

export const metadata: Metadata = {
    description: "Review the products saved in your AllMarket shopping cart.",
    title: "Shopping Cart | AllMarket",
};

interface CartItem {
    product: ProductResponseDto;
    quantity: number;
}

function parseCartCookie(value?: string) {
    if (!value) {
        return [];
    }

    try {
        const items = JSON.parse(decodeURIComponent(value)) as Array<{
            productId: number;
            quantity: number;
        }>;

        return Array.isArray(items)
            ? items.filter(
                (item) =>
                    Number.isInteger(item.productId) &&
                    Number.isInteger(item.quantity) &&
                    item.productId > 0 &&
                    item.quantity > 0,
            )
            : [];
    } catch {
        return [];
    }
}

async function getCartItems(): Promise<CartItem[]> {
    const cookieStore = await cookies();
    const cartCookie = cookieStore.get("cartItems")?.value;
    const cartItems = parseCartCookie(cartCookie);
    const products = await Promise.all(
        cartItems.map(async (item) => {
            try {
                const product = await productsService.getById(item.productId);

                return {
                    product,
                    quantity: item.quantity,
                };
            } catch {
                return null;
            }
        }),
    );

    return products.filter((item): item is CartItem => item !== null);
}

function EmptyCart() {
    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <section className="mx-auto flex min-h-96 max-w-3xl items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm">
                <div>
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-yellow-100 text-yellow-950 ring-1 ring-yellow-300">
                        <ShoppingCart aria-hidden="true" size={24} />
                    </div>
                    <h1 className="mt-5 text-2xl font-semibold text-zinc-950">
                        Your cart is empty
                    </h1>
                    <p className="mt-2 text-sm text-zinc-600">
                        Products you add to your cart will appear here.
                    </p>
                    <Link
                        className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800"
                        href="/products"
                    >
                        Browse products
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default async function CartPage() {
    const cookieStore = await cookies();
    const isLoggedIn =
        Boolean(cookieStore.get("username")?.value) ||
        Boolean(cookieStore.get("user_email")?.value);
    const cartItems = await getCartItems();

    if (cartItems.length === 0) {
        return <EmptyCart />;
    }

    const cartTotal = cartItems.reduce(
        (total, item) =>
            total + getProductDisplayPrice(item.product) * item.quantity,
        0,
    );

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-10 sm:px-6 lg:px-8">
            <section className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-5">
                        <div className="flex size-11 items-center justify-center rounded-full bg-yellow-100 text-yellow-950 ring-1 ring-yellow-300">
                            <ShoppingCart aria-hidden="true" size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-950">
                                Shopping cart
                            </h1>
                            <p className="mt-1 text-sm text-zinc-600">
                                {cartItems.length} product
                                {cartItems.length === 1 ? "" : "s"} in your cart.
                            </p>
                        </div>
                    </div>

                    <div className="divide-y divide-zinc-100">
                        {cartItems.map(({ product, quantity }) => {
                            const price = getProductDisplayPrice(product);
                            const subtotal = price * quantity;

                            return (
                                <article
                                    className="grid gap-4 py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto]"
                                    key={product.id}
                                >
                                    <Link
                                        className="relative aspect-square overflow-hidden rounded-md border border-zinc-200 bg-white"
                                        href={`/products/${product.id}`}
                                    >
                                        {product.imageUrl ? (
                                            <Image
                                                alt={product.name}
                                                className="object-contain p-3"
                                                fill
                                                sizes="120px"
                                                src={product.imageUrl}
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center px-3 text-center text-xs text-zinc-500">
                                                No image
                                            </div>
                                        )}
                                    </Link>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                                            {product.categoryName}
                                        </p>
                                        <Link
                                            className="mt-1 block text-base font-semibold text-zinc-950 transition hover:text-zinc-700"
                                            href={`/products/${product.id}`}
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                                            {product.description}
                                        </p>
                                        <p className="mt-3 text-sm text-zinc-600">
                                            Stock available:{" "}
                                            <span className="font-semibold text-zinc-950">
                                                {product.availableStock}
                                            </span>
                                        </p>
                                        <CartItemControls
                                            key={`${product.id}-${quantity}`}
                                            maxQuantity={product.availableStock}
                                            productId={product.id}
                                            quantity={quantity}
                                        />
                                    </div>

                                    <div className="text-left sm:text-right">
                                        <p className="text-sm text-zinc-500">
                                            {formatPrice(price)} each
                                        </p>
                                        <p className="mt-2 text-lg font-semibold text-zinc-950">
                                            {formatPrice(subtotal)}
                                        </p>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
                    <h2 className="text-lg font-semibold text-zinc-950">
                        Summary
                    </h2>
                    <div className="mt-5 space-y-3 border-b border-zinc-100 pb-5 text-sm">
                        <div className="flex items-center justify-between gap-4 text-zinc-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-zinc-950">
                                {formatPrice(cartTotal)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-zinc-600">
                            <span>Shipping</span>
                            <span>Calculated later</span>
                        </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between gap-4">
                        <span className="text-base font-semibold text-zinc-950">
                            Total
                        </span>
                        <span className="text-xl font-semibold text-zinc-950">
                            {formatPrice(cartTotal)}
                        </span>
                    </div>
                    {isLoggedIn ? (
                        <CheckoutButton />
                    ) : (
                        <>
                            <button
                                className="mt-6 h-11 w-full cursor-not-allowed rounded-md bg-zinc-300 px-5 text-sm font-medium text-white"
                                disabled
                                type="button"
                            >
                                Proceed to checkout
                            </button>
                            <p className="mt-3 text-sm leading-6 text-zinc-600">
                                Sign in to proceed to checkout.
                            </p>
                            <Link
                                className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950"
                                href="/login"
                            >
                                Sign in
                            </Link>
                        </>
                    )}
                    <ClearCartButton />
                </aside>
            </section>
        </main>
    );
}
