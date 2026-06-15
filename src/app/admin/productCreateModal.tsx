"use client";

import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type {
    AdminCategoryResponseDto,
    AdminCreateProductDto,
    AdminProductResponseDto,
} from "@/types";

interface ProductFormModalProps {
    categories: AdminCategoryResponseDto[];
    error: string;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (product: AdminCreateProductDto) => void;
    product: AdminProductResponseDto | null;
}

export default function ProductFormModal({
    categories,
    error,
    isSubmitting,
    onClose,
    onSubmit,
    product,
}: ProductFormModalProps) {
    const [image, setImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState("");
    const [previewUrl, setPreviewUrl] = useState(product?.imageUrl ?? "");
    const previewUrlRef = useRef("");
    const isEditing = product !== null;

    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    function clearImage() {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = "";
        }

        setImage(null);
        setPreviewUrl("");
    }

    function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedImage = event.target.files?.[0] ?? null;

        if (!selectedImage) {
            clearImage();
            setImageError("");
            return;
        }

        if (!selectedImage.type.startsWith("image/")) {
            clearImage();
            setImageError("Choose a valid image file.");
            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            clearImage();
            setImageError("The image must be 5 MB or smaller.");
            return;
        }

        clearImage();
        const nextPreviewUrl = URL.createObjectURL(selectedImage);
        previewUrlRef.current = nextPreviewUrl;
        setImage(selectedImage);
        setPreviewUrl(nextPreviewUrl);
        setImageError("");
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        onSubmit({
            categoryId: Number(formData.get("categoryId")),
            description: String(formData.get("description") ?? "").trim(),
            image,
            name: String(formData.get("name") ?? "").trim(),
            price: Number(formData.get("price")),
            stock: Number(formData.get("stock")),
        });
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onClick={onClose}
        >
            <section
                aria-labelledby="product-form-title"
                aria-modal="true"
                className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-zinc-200 px-5 py-5 sm:px-6">
                    <div>
                        <h2
                            className="text-xl font-semibold text-zinc-950"
                            id="product-form-title"
                        >
                            {isEditing ? "Edit product" : "New product"}
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            {isEditing
                                ? "Update the product details."
                                : "Complete the details to create a product."}
                        </p>
                    </div>
                    <button
                        aria-label="Close product form"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                        disabled={isSubmitting}
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden={true} size={20} />
                    </button>
                </header>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-5 px-5 py-6 sm:px-6">
                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-zinc-700">
                                Name
                            </span>
                            <input
                                className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                defaultValue={product?.name}
                                maxLength={120}
                                name="name"
                                required
                                type="text"
                            />
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-zinc-700">
                                Description
                            </span>
                            <textarea
                                className="min-h-28 w-full resize-y rounded-md border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                defaultValue={product?.description}
                                maxLength={1000}
                                name="description"
                                required
                            />
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label>
                                <span className="mb-2 block text-sm font-medium text-zinc-700">
                                    Price (USD)
                                </span>
                                <input
                                    className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    defaultValue={product?.price}
                                    min="0.01"
                                    name="price"
                                    required
                                    step="0.01"
                                    type="number"
                                />
                            </label>
                            <label>
                                <span className="mb-2 block text-sm font-medium text-zinc-700">
                                    Stock
                                </span>
                                <input
                                    className="h-11 w-full rounded-md border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                    defaultValue={product?.stock}
                                    min="0"
                                    name="stock"
                                    required
                                    step="1"
                                    type="number"
                                />
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-2 block text-sm font-medium text-zinc-700">
                                Category
                            </span>
                            <select
                                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-200"
                                defaultValue={product?.categoryId ?? ""}
                                name="categoryId"
                                required
                            >
                                <option disabled value="">
                                    Choose a category...
                                </option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="rounded-lg border border-zinc-200 p-4">
                            <p className="text-sm font-medium text-zinc-700">
                                Product image
                            </p>
                            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                                <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                                    {previewUrl ? (
                                        <Image
                                            alt="Product preview"
                                            className="object-contain p-2"
                                            fill
                                            sizes="112px"
                                            src={previewUrl}
                                            unoptimized
                                        />
                                    ) : (
                                        <ImagePlus
                                            aria-hidden={true}
                                            className="text-zinc-300"
                                            size={30}
                                        />
                                    )}
                                </div>
                                <div>
                                    {isEditing ? (
                                        <p className="text-sm text-zinc-500">
                                            The current image is preserved when
                                            editing.
                                        </p>
                                    ) : (
                                        <>
                                            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50">
                                                <Upload
                                                    aria-hidden={true}
                                                    size={16}
                                                />
                                                Choose image
                                                <input
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="sr-only"
                                                    onChange={handleImageChange}
                                                    type="file"
                                                />
                                            </label>
                                            <p className="mt-2 text-xs text-zinc-500">
                                                PNG, JPG or WEBP. Maximum 5 MB.
                                            </p>
                                            {image && (
                                                <p className="mt-1 max-w-sm truncate text-xs font-medium text-zinc-700">
                                                    {image.name}
                                                </p>
                                            )}
                                            {imageError && (
                                                <p
                                                    className="mt-2 text-sm text-red-700"
                                                    role="alert"
                                                >
                                                    {imageError}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <p
                                className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>

                    <footer className="grid grid-cols-2 gap-3 border-t border-zinc-200 px-5 py-4 sm:flex sm:justify-end sm:px-6">
                        <button
                            className="h-10 cursor-pointer rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                            disabled={isSubmitting}
                            onClick={onClose}
                            type="button"
                        >
                            Cancel
                        </button>
                        <button
                            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                            disabled={isSubmitting || Boolean(imageError)}
                            type="submit"
                        >
                            {isSubmitting && (
                                <LoaderCircle
                                    aria-hidden={true}
                                    className="animate-spin"
                                    size={16}
                                />
                            )}
                            {isEditing ? "Save changes" : "Create product"}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
