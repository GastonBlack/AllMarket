import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { productsService } from "@/services/products.service";
import type { ProductResponseDto } from "@/types";

import ProductDetailsClient from "./productDetailsClient";

export const metadata: Metadata = {
    description: "View product details, pricing, availability, and related items.",
    title: "Product Details | AllMarket",
};

interface ProductDetailsPageProps {
    params: Promise<{
        productId: string;
    }>;
}

export default async function ProductDetailsPage({
    params,
}: ProductDetailsPageProps) {
    const { productId } = await params;
    const parsedProductId = Number(productId);

    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0) {
        notFound();
    }

    let product: ProductResponseDto | null = null;

    try {
        product = await productsService.getById(parsedProductId);
    } catch {
        product = null;
    }

    if (!product) {
        notFound();
    }

    const products = await productsService.getAll({
        categoryId: product.categoryId,
        pageSize: 9,
    });
    const relatedProducts = products.items.filter(
        (relatedProduct) =>
            relatedProduct.categoryId === product.categoryId &&
            relatedProduct.id !== product.id,
    ).slice(0, 8);

    return (
        <ProductDetailsClient
            product={product}
            relatedProducts={relatedProducts}
        />
    );
}
