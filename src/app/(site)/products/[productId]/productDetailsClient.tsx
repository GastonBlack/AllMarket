"use client";

import {
    ArrowLeft,
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    Minus,
    Plus,
    ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import AddToCartButton from "@/components/products/AddToCartButton";
import ProductCard from "@/components/products/ProductCard";
import type { ProductResponseDto } from "@/types";
import { formatPrice } from "@/utils/formatters";
import {
    getProductDisplayPrice,
    hasProductDiscount,
} from "@/utils/productPricing";

interface ProductDetailsClientProps {
    product: ProductResponseDto;
    relatedProducts: ProductResponseDto[];
}

function getCarouselScrollState(carousel: HTMLDivElement) {
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    return {
        canScrollNext: carousel.scrollLeft < maxScrollLeft - 1,
        canScrollPrevious: carousel.scrollLeft > 1,
    };
}

function updateCarouselScrollState(
    carousel: HTMLDivElement | null,
    setCanScrollPrevious: (value: boolean) => void,
    setCanScrollNext: (value: boolean) => void,
) {
    if (!carousel) {
        return;
    }

    const { canScrollNext, canScrollPrevious } =
        getCarouselScrollState(carousel);

    setCanScrollPrevious(canScrollPrevious);
    setCanScrollNext(canScrollNext);
}

export default function ProductDetailsClient({
    product,
    relatedProducts,
}: ProductDetailsClientProps) {
    const [quantity, setQuantity] = useState(1);
    const [canScrollRelatedNext, setCanScrollRelatedNext] = useState(false);
    const [canScrollRelatedPrevious, setCanScrollRelatedPrevious] = useState(false);
    const relatedCarouselRef = useRef<HTMLDivElement>(null);
    const isOutOfStock = product.availableStock <= 0;
    const displayPrice = getProductDisplayPrice(product);
    const hasDiscount = hasProductDiscount(product);
    const maxQuantity = Math.max(product.availableStock, 1);

    const setRelatedCarouselRef = (carousel: HTMLDivElement | null) => {
        relatedCarouselRef.current = carousel;
        updateCarouselScrollState(
            carousel,
            setCanScrollRelatedPrevious,
            setCanScrollRelatedNext,
        );
    };

    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };

    const increaseQuantity = () => {
        setQuantity((current) => Math.min(maxQuantity, current + 1));
    };

    const scrollRelatedCarousel = (direction: "next" | "previous") => {
        const carousel = relatedCarouselRef.current;

        if (!carousel) {
            return;
        }

        carousel.scrollBy({
            behavior: "smooth",
            left:
                direction === "next"
                    ? carousel.clientWidth * 0.85
                    : carousel.clientWidth * -0.85,
        });
    };

    useEffect(() => {
        const handleResize = () => {
            updateCarouselScrollState(
                relatedCarouselRef.current,
                setCanScrollRelatedPrevious,
                setCanScrollRelatedNext,
            );
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-50 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
                >
                    <ArrowLeft aria-hidden="true" size={18} />
                    Back to products
                </Link>

                <section className="mt-6 grid gap-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm lg:grid-cols-[minmax(0,1fr)_420px] lg:p-8">
                    <div className="relative aspect-[4/3] rounded-lg bg-white p-6">
                        {product.imageUrl ? (
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                quality={75}
                                sizes="(max-width: 1024px) 100vw, 60vw"
                                className="object-contain p-6"
                                loading="eager"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                                No image available
                            </div>
                        )}

                        {hasDiscount && (
                            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-2 text-xs font-bold uppercase text-white shadow-lg shadow-red-500/30">
                                <BadgePercent aria-hidden="true" size={15} />
                                Sale
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                            {product.categoryName}
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
                            {product.name}
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-zinc-600">
                            {product.description}
                        </p>

                        <div className="mt-6">
                            <div className="flex flex-wrap items-center gap-3">
                                <p className="text-3xl font-semibold text-zinc-950">
                                    {formatPrice(displayPrice)}
                                </p>
                                {hasDiscount && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2.5 py-1.5 text-xs font-bold uppercase text-yellow-950 ring-1 ring-yellow-300">
                                        <BadgePercent aria-hidden="true" size={14} />
                                        Deal
                                    </span>
                                )}
                            </div>
                            {hasDiscount && (
                                <p className="mt-1 text-base text-zinc-400 line-through">
                                    {formatPrice(product.price)}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 rounded-lg border border-zinc-200 p-4">
                            <p
                                className={`text-sm font-medium ${isOutOfStock ? "text-red-600" : "text-green-600"
                                    }`}
                            >
                                {isOutOfStock
                                    ? "Out of stock"
                                    : `${product.availableStock} available`}
                            </p>

                            <div className="mt-4 flex items-center gap-3">
                                <button
                                    aria-label="Decrease quantity"
                                    className="flex size-10 cursor-pointer items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
                                    disabled={quantity <= 1}
                                    onClick={decreaseQuantity}
                                    type="button"
                                >
                                    <Minus aria-hidden="true" size={16} />
                                </button>
                                <span className="w-10 text-center text-sm font-semibold text-zinc-950">
                                    {quantity}
                                </span>
                                <button
                                    aria-label="Increase quantity"
                                    className="flex size-10 cursor-pointer items-center justify-center rounded-md border border-zinc-300 text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
                                    disabled={quantity >= maxQuantity || isOutOfStock}
                                    onClick={increaseQuantity}
                                    type="button"
                                >
                                    <Plus aria-hidden="true" size={16} />
                                </button>
                            </div>
                        </div>

                        <AddToCartButton
                            className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                            disabled={isOutOfStock}
                            maxQuantity={product.availableStock}
                            productId={product.id}
                            quantity={quantity}
                        >
                            <ShoppingCart aria-hidden="true" size={18} />
                            Add to cart
                        </AddToCartButton>
                    </div>
                </section>

                <section className="mx-[calc(50%-50vw)] mt-12 w-screen overflow-hidden bg-white py-10 shadow-inner shadow-zinc-100">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-1 text-center">
                            <span className="inline-flex items-center gap-2 rounded-md bg-yellow-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-yellow-950 ring-1 ring-yellow-300">
                                <BadgePercent aria-hidden="true" size={14} />
                                You may also like
                            </span>
                            <h2 className="mt-3 text-3xl font-semibold text-zinc-950">
                                Related products
                            </h2>
                            <p className="mt-2 text-sm text-zinc-600">
                                More picks from {product.categoryName}.
                            </p>
                        </div>
                    </div>

                    {relatedProducts.length > 0 ? (
                        <div className="relative mt-7 w-full px-4 sm:px-6 lg:px-8">
                            <div className="relative">
                                <button
                                    aria-label="Show previous related products"
                                    className="absolute left-2 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-800 shadow-lg shadow-zinc-950/10 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-35 sm:left-4"
                                    disabled={!canScrollRelatedPrevious}
                                    onClick={() => scrollRelatedCarousel("previous")}
                                    type="button"
                                >
                                    <ChevronLeft aria-hidden="true" size={18} />
                                </button>

                                <div
                                    className={`flex gap-5 overflow-hidden px-14 py-1 scroll-smooth sm:px-16 ${relatedProducts.length < 4
                                        ? "justify-center"
                                        : "justify-start"
                                        }`}
                                    key={product.id}
                                    onScroll={(event) => {
                                        updateCarouselScrollState(
                                            event.currentTarget,
                                            setCanScrollRelatedPrevious,
                                            setCanScrollRelatedNext,
                                        );
                                    }}
                                    ref={setRelatedCarouselRef}
                                >
                                    {relatedProducts.map((relatedProduct) => (
                                        <div
                                            className="min-w-72 max-w-72 flex-none"
                                            key={relatedProduct.id}
                                        >
                                            <ProductCard product={relatedProduct} />
                                        </div>
                                    ))}
                                </div>

                                <button
                                    aria-label="Show next related products"
                                    className="absolute right-2 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white/95 text-zinc-800 shadow-lg shadow-zinc-950/10 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-35 sm:right-4"
                                    disabled={!canScrollRelatedNext}
                                    onClick={() => scrollRelatedCarousel("next")}
                                    type="button"
                                >
                                    <ChevronRight aria-hidden="true" size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-5 rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
                            <p className="text-sm text-zinc-600">
                                There are no related products in this category yet.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
