import { BadgePercent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ProductResponseDto } from "@/types";
import { formatPrice } from "@/utils/formatters";
import {
    getProductDisplayPrice,
    hasProductDiscount,
} from "@/utils/productPricing";

import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
    product: ProductResponseDto;
}

export default function ProductCard({ product }: ProductCardProps) {
    const displayPrice = getProductDisplayPrice(product);
    const hasDiscount = hasProductDiscount(product);
    const isOutOfStock = product.availableStock <= 0;

    return (
        <article className="relative flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:scale-102 hover:border-zinc-300 hover:shadow-md">
            <Link
                aria-label={`View details for ${product.name}`}
                className="absolute inset-0 z-10"
                href={`/products/${product.id}`}
            />
            <div className="relative aspect-[4/3] bg-white p-4">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        quality={75}
                        sizes="(max-width: 640px) 80vw, (max-width: 1280px) 33vw, 280px"
                        className="object-contain p-4"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-zinc-500">
                        No image available
                    </div>
                )}

                {hasDiscount && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-bold uppercase text-white shadow-lg shadow-red-500/30">
                        <BadgePercent aria-hidden="true" size={14} />
                        Sale
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-4">
                <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {product.categoryName}
                    </p>
                    <h2 className="mt-1 line-clamp-2 text-base font-semibold text-zinc-950">
                        {product.name}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                        {product.description}
                    </p>
                </div>

                <div className="mt-auto pt-4">
                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-lg font-semibold text-zinc-950">
                                    {formatPrice(displayPrice)}
                                </p>
                                {hasDiscount && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-1 text-xs font-bold uppercase text-yellow-950 ring-1 ring-yellow-300">
                                        <BadgePercent aria-hidden="true" size={13} />
                                        Deal
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="text-sm text-zinc-400 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                        </div>
                        <p
                            className={`text-xs font-medium ${
                                isOutOfStock ? "text-red-600" : "text-green-600"
                            }`}
                        >
                            {isOutOfStock
                                ? "Out of stock"
                                : `${product.availableStock} left`}
                        </p>
                    </div>

                    <AddToCartButton
                        className="relative z-20 mt-4 h-10 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                        disabled={isOutOfStock}
                        maxQuantity={product.availableStock}
                        productId={product.id}
                    >
                        Add to cart
                    </AddToCartButton>
                </div>
            </div>
        </article>
    );
}
