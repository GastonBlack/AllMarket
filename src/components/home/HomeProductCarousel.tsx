"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

import ProductCard from "@/components/products/ProductCard";
import type { ProductResponseDto } from "@/types";

interface HomeProductCarouselProps {
    ctaHref?: string;
    ctaLabel?: string;
    products: ProductResponseDto[];
    title: string;
}

export default function HomeProductCarousel({
    ctaHref,
    ctaLabel = "Go to category",
    products,
    title,
}: HomeProductCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);

    function scrollCarousel(direction: "left" | "right") {
        carouselRef.current?.scrollBy({
            behavior: "smooth",
            left: direction === "left" ? -360 : 360,
        });
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto w-[92%] rounded-lg border border-zinc-200 bg-white px-4 py-6 shadow-sm sm:w-[88%] sm:px-6 lg:w-[85%] lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
                {ctaHref && (
                    <Link
                        className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-yellow-400 px-3 text-sm font-semibold text-yellow-950 ring-1 ring-yellow-500 transition hover:bg-yellow-300"
                        href={ctaHref}
                    >
                        {ctaLabel}
                    </Link>
                )}
            </div>

            <div className="relative">
                <button
                    aria-label="Scroll left"
                    className="absolute left-0 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 shadow-md transition hover:bg-zinc-50"
                    onClick={() => scrollCarousel("left")}
                    type="button"
                >
                    <ChevronLeft aria-hidden="true" size={20} />
                </button>

                <div
                    className="flex snap-x gap-4 overflow-x-auto scroll-smooth px-14 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    ref={carouselRef}
                >
                    {products.map((product) => (
                        <div
                            className="min-w-[240px] max-w-[240px] snap-start sm:min-w-[260px] sm:max-w-[260px]"
                            key={product.id}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <button
                    aria-label="Scroll right"
                    className="absolute right-0 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-950 shadow-md transition hover:bg-zinc-50"
                    onClick={() => scrollCarousel("right")}
                    type="button"
                >
                    <ChevronRight aria-hidden="true" size={20} />
                </button>
            </div>
        </section>
    );
}
