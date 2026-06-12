import type { ProductResponseDto } from "@/types";

export function hasProductDiscount(product: ProductResponseDto) {
    return product.hasDiscount && product.discountPrice != null;
}

export function getProductDisplayPrice(product: ProductResponseDto) {
    return hasProductDiscount(product) && product.discountPrice != null
        ? product.discountPrice
        : product.price;
}
