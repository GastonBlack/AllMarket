import { SlidersHorizontal } from "lucide-react";

import type { CategoryResponseDto } from "@/types";

interface FilterSectionProps {
    categories: CategoryResponseDto[];
    productCount: number;
    minPrice: string;
    maxPrice: string;
    hasActiveFilters: boolean;
    selectedCategoryId: number | null;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void;
    onCategoryChange: (categoryId: number | null) => void;
    onApplyPriceFilter: () => void;
    onResetFilters: () => void;
}

export default function FilterSection({
    categories,
    productCount,
    minPrice,
    maxPrice,
    hasActiveFilters,
    selectedCategoryId,
    onMinPriceChange,
    onMaxPriceChange,
    onCategoryChange,
    onApplyPriceFilter,
    onResetFilters,
}: FilterSectionProps) {
    return (
        <aside className="w-full self-start rounded-lg border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-[280px]">
            <div className="flex items-center gap-2 text-zinc-950">
                <SlidersHorizontal aria-hidden="true" size={18} />
                <h2 className="text-sm font-semibold">Filters</h2>
            </div>

            {hasActiveFilters && (
                <button
                    className="mt-4 h-10 w-full cursor-pointer rounded-md border border-red-200 bg-red-50 text-sm font-medium text-red-700 transition hover:bg-red-100"
                    onClick={onResetFilters}
                    type="button"
                >
                    Reset filters
                </button>
            )}

            <div className="mt-6">
                <p className="text-sm font-medium text-zinc-800">Price range</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                        <label className="sr-only" htmlFor="min-price">
                            Minimum price
                        </label>
                        <input
                            aria-label="Minimum price"
                            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                            id="min-price"
                            inputMode="decimal"
                            min="0"
                            onChange={(event) => onMinPriceChange(event.target.value)}
                            placeholder="Min"
                            type="number"
                            value={minPrice}
                        />
                    </div>
                    <div>
                        <label className="sr-only" htmlFor="max-price">
                            Maximum price
                        </label>
                        <input
                            aria-label="Maximum price"
                            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                            id="max-price"
                            inputMode="decimal"
                            min="0"
                            onChange={(event) => onMaxPriceChange(event.target.value)}
                            placeholder="Max"
                            type="number"
                            value={maxPrice}
                        />
                    </div>
                </div>
                <button
                    className="mt-3 h-10 w-full cursor-pointer rounded-md bg-zinc-950 text-sm font-medium text-white transition hover:bg-zinc-800"
                    onClick={onApplyPriceFilter}
                    type="button"
                >
                    Apply price
                </button>
            </div>

            <div className="mt-6">
                <p className="text-sm font-medium text-zinc-800">Category</p>
                <div className="mt-3 flex flex-col gap-2">
                    <button
                        className={`h-10 cursor-pointer rounded-md border px-3 text-left text-sm transition ${
                            selectedCategoryId === null
                                ? "border-zinc-950 bg-zinc-950 text-white"
                                : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                        }`}
                        onClick={() => onCategoryChange(null)}
                        type="button"
                    >
                        All categories
                    </button>
                    {categories.map((category) => (
                        <button
                            className={`h-10 cursor-pointer rounded-md border px-3 text-left text-sm transition ${
                                selectedCategoryId === category.id
                                    ? "border-zinc-950 bg-zinc-950 text-white"
                                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                            }`}
                            key={category.id}
                            onClick={() => onCategoryChange(category.id)}
                            type="button"
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            <p className="mt-6 text-sm text-zinc-500">
                Found {productCount} {productCount === 1 ? "product" : "products"}
            </p>
        </aside>
    );
}
