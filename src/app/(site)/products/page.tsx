import type { Metadata } from "next";
import { Suspense } from "react";

import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { ProductQueryParams, ProductSortBy } from "@/types";

import ProductsClient from "./productsClient";

export const metadata: Metadata = {
    description: "Browse AllMarket products by category, price, and popularity.",
    title: "Products | AllMarket",
};

interface ProductsPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const productSortValues: ProductSortBy[] = [
    "popular",
    "newest",
    "price_asc",
    "price_desc",
    "name_asc",
    "name_desc",
];

function getSingleSearchParam(value: string | string[] | undefined) {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
}

function parsePositiveNumber(value: string | string[] | undefined) {
    const singleValue = getSingleSearchParam(value);

    if (!singleValue) {
        return undefined;
    }

    const parsedValue = Number(singleValue);

    return Number.isFinite(parsedValue) && parsedValue >= 0
        ? parsedValue
        : undefined;
}

function parsePositiveInteger(value: string | string[] | undefined) {
    const parsedValue = parsePositiveNumber(value);

    if (parsedValue === undefined) {
        return undefined;
    }

    return Number.isInteger(parsedValue) && parsedValue > 0
        ? parsedValue
        : undefined;
}

function parseProductSortBy(value: string | string[] | undefined) {
    const singleValue = getSingleSearchParam(value);

    if (!singleValue) {
        return "popular";
    }

    return productSortValues.includes(singleValue as ProductSortBy)
        ? (singleValue as ProductSortBy)
        : "popular";
}

function getProductQueryParams(
    params: Record<string, string | string[] | undefined>,
): ProductQueryParams {
    const search = getSingleSearchParam(params.search)?.trim();
    const categoryId = parsePositiveInteger(params.categoryId ?? params.category);
    const minPrice = parsePositiveNumber(params.minPrice);
    const maxPrice = parsePositiveNumber(params.maxPrice);
    const page = parsePositiveInteger(params.page);
    const pageSize = parsePositiveInteger(params.pageSize);
    const sortBy = parseProductSortBy(params.sortBy);

    return {
        categoryId,
        maxPrice,
        minPrice,
        page,
        pageSize,
        search: search || undefined,
        sortBy,
    };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const queryParams = getProductQueryParams(await searchParams);

    const [productPage, categories] = await Promise.all([
        productsService.getAll(queryParams),
        categoriesService.getAll(),
    ]);

    return (
        <Suspense
            fallback={
                <main className="min-h-[calc(100vh-4rem)] bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
                    <div className="h-40 rounded-lg border border-zinc-200 bg-white" />
                </main>
            }
        >
            <ProductsClient
                productPage={productPage}
                initialCategories={categories}
            />
        </Suspense>
    );
}
