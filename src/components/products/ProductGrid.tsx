import type { ProductResponseDto } from "@/types";

import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: ProductResponseDto[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
                <div>
                    <h2 className="text-lg font-semibold text-zinc-950">
                        No products found
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600">
                        Try changing the search or category filters.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <section className="grid min-w-0 self-start content-start items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </section>
    );
}
