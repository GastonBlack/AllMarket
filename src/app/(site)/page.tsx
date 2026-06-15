import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import HomeProductCarousel from "@/components/home/HomeProductCarousel";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { CategoryResponseDto, ProductResponseDto } from "@/types";
import { hasProductDiscount } from "@/utils/productPricing";

export const metadata: Metadata = {
    description: "Shop popular categories and discounted products at AllMarket.",
    title: "AllMarket",
};

export const dynamic = "force-dynamic";

interface HomeCategorySection {
    category: CategoryResponseDto;
    products: ProductResponseDto[];
}

function shuffleItems<T>(items: T[]) {
    return items.toSorted(() => Math.random() - 0.5);
}

function chunkItems<T>(items: T[], size: number) {
    const chunks: T[][] = [];

    for (let index = 0; index < items.length; index += size) {
        chunks.push(items.slice(index, index + size));
    }

    return chunks;
}

function CategoryPromoCards({ sections }: { sections: HomeCategorySection[] }) {
    if (sections.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto grid w-[92%] gap-6 sm:w-[88%] lg:w-[75%] lg:grid-cols-2">
            {sections.map(({ category, products }) => {
                const featuredProduct = products.find((product) => product.imageUrl);

                return (
                    <article
                        className="grid min-h-64 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm sm:grid-cols-[minmax(0,1fr)_260px]"
                        key={category.id}
                    >
                        <div className="flex flex-col justify-center p-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.45em] text-zinc-500">
                                {category.name}
                            </p>
                            <h2 className="mt-4 text-2xl font-semibold text-zinc-950">
                                Find products in {category.name}
                            </h2>
                            <Link
                                className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-md bg-yellow-400 px-5 text-sm font-semibold text-black transition hover:bg-yellow-300"
                                href={`/products?categoryId=${category.id}&sortBy=popular`}
                            >
                                See more
                            </Link>
                        </div>

                        <div className="relative min-h-56 bg-white">
                            {featuredProduct?.imageUrl ? (
                                <Image
                                    alt={featuredProduct.name}
                                    className="object-contain p-8"
                                    fill
                                    sizes="(max-width: 1024px) 85vw, 260px"
                                    src={featuredProduct.imageUrl}
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-zinc-500">
                                    No image available
                                </div>
                            )}
                        </div>
                    </article>
                );
            })}
        </section>
    );
}

async function getPopularCategorySections() {
    const categories = shuffleItems(await categoriesService.getAll());
    const categoryPages = await Promise.all(
        categories.map(async (category) => {
            const productPage = await productsService.getAll({
                categoryId: category.id,
                onlyAvailable: true,
                page: 1,
                pageSize: 12,
                sortBy: "popular",
            });

            return {
                category,
                totalItems: productPage.totalItems,
                products: productPage.items,
            };
        }),
    );

    return categoryPages
        .filter((section) => section.totalItems >= 8)
        .map<HomeCategorySection>(({ category, products }) => ({
            category,
            products,
        }))
        .slice(0, 4);
}

async function getDiscountProducts() {
    const productPage = await productsService.getAll({
        onlyAvailable: true,
        page: 1,
        pageSize: 40,
        sortBy: "popular",
    });

    return productPage.items.filter(hasProductDiscount);
}

export default async function Home() {
    const [categorySections, discountProducts] = await Promise.all([
        getPopularCategorySections(),
        getDiscountProducts(),
    ]);
    const sectionGroups = chunkItems(categorySections, 2);

    return (
        <main className="min-h-[calc(100vh-4rem)] bg-zinc-100">
            <section className="w-full bg-zinc-950 h-2 text-white sm:px-6 lg:px-8">
            </section>

            <div className="space-y-8 py-8">
                {sectionGroups.map((group) => (
                    <div className="space-y-8" key={group[0]?.category.id}>
                        <CategoryPromoCards sections={group} />
                        {group.map(({ category, products }) => (
                            <HomeProductCarousel
                                ctaHref={`/products?categoryId=${category.id}&sortBy=popular`}
                                key={category.id}
                                products={products}
                                title={`Most popular in ${category.name}`}
                            />
                        ))}
                    </div>
                ))}

                <HomeProductCarousel
                    ctaHref="/products?sortBy=popular"
                    ctaLabel="View products"
                    products={discountProducts}
                    title="ON SALE"
                />
            </div>
        </main>
    );
}
