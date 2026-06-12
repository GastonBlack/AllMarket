"use client";

import { Grid2X2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useNotification } from "@/components/ui/NotificationProvider";
import { getApiError } from "@/lib/axios";
import { adminService } from "@/services/admin.service";
import type {
    AdminCategoryResponseDto,
    AdminCreateProductDto,
    AdminOrderDetailResponseDto,
    AdminOrderResponseDto,
    AdminProductResponseDto,
    AdminUserResponseDto,
    OrderStatus,
    PaginatedResponse,
} from "@/types";

import {
    buildCategoryQuery,
    buildOrderQuery,
    buildProductQuery,
    buildUserQuery,
    getAdminErrorMessage,
    parseAdminSection,
    type AdminSection,
} from "./admin.helpers";
import { SectionTabs } from "./adminShared";
import CategoriesSection, { CategoryFormModal } from "./categoriesSection";
import OrdersSection, { OrderDetailsModal } from "./ordersSection";
import ProductCreateModal from "./productCreateModal";
import ProductsSection from "./productsSection";
import UsersSection from "./usersSection";

interface AdminClientProps {
    currentUserName: string;
}

export default function AdminClient({ currentUserName }: AdminClientProps) {
    const { replace } = useRouter();
    const { showNotification } = useNotification();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const paramsString = searchParams.toString();
    const params = new URLSearchParams(paramsString);
    const activeSection = parseAdminSection(params.get("section"));
    const [productsPage, setProductsPage] =
        useState<PaginatedResponse<AdminProductResponseDto> | null>(null);
    const [categoriesPage, setCategoriesPage] =
        useState<PaginatedResponse<AdminCategoryResponseDto> | null>(null);
    const [ordersPage, setOrdersPage] =
        useState<PaginatedResponse<AdminOrderResponseDto> | null>(null);
    const [usersPage, setUsersPage] =
        useState<PaginatedResponse<AdminUserResponseDto> | null>(null);
    const [categoryOptions, setCategoryOptions] = useState<
        AdminCategoryResponseDto[]
    >([]);
    const [selectedOrder, setSelectedOrder] =
        useState<AdminOrderDetailResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
    const [updatingProductId, setUpdatingProductId] = useState<number | null>(
        null,
    );
    const [isUpdatingOrderStatus, setIsUpdatingOrderStatus] = useState(false);
    const [orderStatusError, setOrderStatusError] = useState("");
    const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
    const [editingProduct, setEditingProduct] =
        useState<AdminProductResponseDto | null>(null);
    const [isCreatingProduct, setIsCreatingProduct] = useState(false);
    const [productCreateError, setProductCreateError] = useState("");
    const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<AdminCategoryResponseDto | null>(null);
    const [isSavingCategory, setIsSavingCategory] = useState(false);
    const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(
        null,
    );
    const [categoryMutationError, setCategoryMutationError] = useState("");

    function replaceParams(nextParams: URLSearchParams) {
        const nextQuery = nextParams.toString();
        replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
            scroll: false,
        });
    }

    function changeSection(section: AdminSection) {
        const nextParams = new URLSearchParams();
        nextParams.set("section", section);
        setSelectedOrder(null);
        setIsCreateProductOpen(false);
        setEditingProduct(null);
        setIsCategoryFormOpen(false);
        replaceParams(nextParams);
    }

    function resetFilters() {
        const nextParams = new URLSearchParams();
        nextParams.set("section", activeSection);
        replaceParams(nextParams);
    }

    function changePage(page: number) {
        const nextParams = new URLSearchParams(paramsString);
        nextParams.set("section", activeSection);
        nextParams.set("page", String(page));
        replaceParams(nextParams);
    }

    function handleFilterSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const nextParams = new URLSearchParams();

        nextParams.set("section", activeSection);
        formData.forEach((value, key) => {
            if (typeof value !== "string") {
                return;
            }

            const trimmedValue = value.trim();

            if (trimmedValue) {
                nextParams.set(key, trimmedValue);
            }
        });
        replaceParams(nextParams);
    }

    function retryActiveSection() {
        setReloadKey((current) => current + 1);
    }

    function goToUser(order: { userId: number }) {
        const nextParams = new URLSearchParams();
        nextParams.set("section", "users");
        nextParams.set("userId", String(order.userId));
        setSelectedOrder(null);
        replaceParams(nextParams);
    }

    async function openOrder(order: AdminOrderResponseDto) {
        setError("");
        setOrderStatusError("");

        try {
            const orderDetails = await adminService.getOrderById(order.id);
            setSelectedOrder(orderDetails);
        } catch (loadError) {
            const message =
                getApiError(loadError)?.message ??
                "We could not load this order.";
            setError(message);
            showNotification(message, "error");
        }
    }

    async function updateOrderStatus(status: OrderStatus) {
        if (!selectedOrder) {
            return;
        }

        setIsUpdatingOrderStatus(true);
        setOrderStatusError("");

        try {
            const updatedOrder = await adminService.updateOrderStatus(
                selectedOrder.id,
                { status },
            );
            setSelectedOrder(updatedOrder);
            setReloadKey((current) => current + 1);
            showNotification("Order status updated.", "success");
        } catch (updateError) {
            const message =
                getApiError(updateError)?.message ??
                "We could not update this order.";
            setOrderStatusError(message);
            showNotification(message, "error");
        }

        setIsUpdatingOrderStatus(false);
    }

    async function refundOrder() {
        if (!selectedOrder) {
            return;
        }

        setIsUpdatingOrderStatus(true);
        setOrderStatusError("");

        try {
            const updatedOrder = await adminService.refundOrder(
                selectedOrder.id,
            );
            setSelectedOrder(updatedOrder);
            setReloadKey((current) => current + 1);
            showNotification("The order has been refunded.", "success");
        } catch (refundError) {
            const message =
                getApiError(refundError)?.message ??
                "We could not refund this order.";
            setOrderStatusError(message);
            showNotification(message, "error");
        }

        setIsUpdatingOrderStatus(false);
    }

    function goToOrders(user: AdminUserResponseDto) {
        const nextParams = new URLSearchParams();
        nextParams.set("section", "orders");
        nextParams.set("userEmail", user.email);
        setSelectedOrder(null);
        replaceParams(nextParams);
    }

    async function toggleUserStatus(user: AdminUserResponseDto) {
        setUpdatingUserId(user.id);
        setError("");

        try {
            if (user.isActive) {
                await adminService.disableUser(user.id);
            } else {
                await adminService.enableUser(user.id);
            }
            setReloadKey((current) => current + 1);
            showNotification(
                user.isActive
                    ? "The user has been disabled."
                    : "The user has been enabled.",
                "success",
            );
        } catch (toggleError) {
            const message =
                getApiError(toggleError)?.message ??
                "We could not update this user.";
            setError(message);
            showNotification(message, "error");
        }

        setUpdatingUserId(null);
    }

    async function toggleProductStatus(product: AdminProductResponseDto) {
        setUpdatingProductId(product.id);
        setError("");

        try {
            await adminService.updateProductStatus(product.id, {
                isActive: !product.isActive,
            });
            setReloadKey((current) => current + 1);
            showNotification(
                product.isActive
                    ? "The product has been disabled."
                    : "The product has been enabled.",
                "success",
            );
        } catch (toggleError) {
            const message =
                getApiError(toggleError)?.message ??
                "We could not update this product.";
            setError(message);
            showNotification(message, "error");
        }

        setUpdatingProductId(null);
    }

    async function saveProduct(product: AdminCreateProductDto) {
        const isEditingProduct = editingProduct !== null;
        setIsCreatingProduct(true);
        setProductCreateError("");

        try {
            if (editingProduct) {
                await adminService.updateProduct(editingProduct.id, {
                    categoryId: product.categoryId,
                    description: product.description,
                    discountPrice: editingProduct.discountPrice,
                    hasDiscount: editingProduct.hasDiscount,
                    imageUrl: editingProduct.imageUrl,
                    isActive: editingProduct.isActive,
                    name: product.name,
                    price: product.price,
                    reservedStock: editingProduct.reservedStock,
                    stock: product.stock,
                });
            } else {
                await adminService.createProduct(product);
            }

            setIsCreateProductOpen(false);
            setEditingProduct(null);
            setReloadKey((current) => current + 1);
            showNotification(
                isEditingProduct
                    ? "The product has been updated successfully."
                    : "The product has been created successfully.",
                "success",
            );
        } catch (createError) {
            const message =
                getApiError(createError)?.message ??
                "We could not save this product.";
            setProductCreateError(message);
            showNotification(message, "error");
        }

        setIsCreatingProduct(false);
    }

    function openCreateCategory() {
        setEditingCategory(null);
        setCategoryMutationError("");
        setIsCategoryFormOpen(true);
    }

    function openEditCategory(category: AdminCategoryResponseDto) {
        setEditingCategory(category);
        setCategoryMutationError("");
        setIsCategoryFormOpen(true);
    }

    async function saveCategory(name: string) {
        const isEditingCategory = editingCategory !== null;
        setIsSavingCategory(true);
        setCategoryMutationError("");

        try {
            if (editingCategory) {
                await adminService.updateCategory({
                    id: editingCategory.id,
                    name,
                });
            } else {
                await adminService.createCategory({ name });
            }

            setIsCategoryFormOpen(false);
            setEditingCategory(null);
            setReloadKey((current) => current + 1);
            showNotification(
                isEditingCategory
                    ? "The category has been updated successfully."
                    : "The category has been created successfully.",
                "success",
            );
        } catch (saveError) {
            const message =
                getApiError(saveError)?.message ??
                "We could not save this category.";
            setCategoryMutationError(message);
            showNotification(message, "error");
        }

        setIsSavingCategory(false);
    }

    async function deleteCategory(category: AdminCategoryResponseDto) {
        const confirmed = window.confirm(
            `Delete the category "${category.name}"?`,
        );

        if (!confirmed) {
            return;
        }

        setDeletingCategoryId(category.id);
        setCategoryMutationError("");

        try {
            await adminService.deleteCategory(category.id);
            setReloadKey((current) => current + 1);
            showNotification(
                "The category has been deleted successfully.",
                "success",
            );
        } catch (deleteError) {
            const message =
                getApiError(deleteError)?.message ??
                "We could not delete this category.";
            setCategoryMutationError(message);
            showNotification(message, "error");
        }

        setDeletingCategoryId(null);
    }

    useEffect(() => {
        let isCurrent = true;

        async function loadCategoryOptions() {
            try {
                const response = await adminService.getCategories({
                    page: 1,
                    pageSize: 200,
                });

                if (isCurrent) {
                    setCategoryOptions(response.items);
                }
            } catch {
                if (isCurrent) {
                    setCategoryOptions([]);
                }
            }
        }

        void loadCategoryOptions();

        return () => {
            isCurrent = false;
        };
    }, [reloadKey]);

    useEffect(() => {
        let isCurrent = true;
        const currentParams = new URLSearchParams(paramsString);

        async function loadSection() {
            setIsLoading(true);
            setError("");

            try {
                if (activeSection === "products") {
                    const response = await adminService.getProducts(
                        buildProductQuery(currentParams),
                    );

                    if (isCurrent) setProductsPage(response);
                }

                if (activeSection === "categories") {
                    const response = await adminService.getCategories(
                        buildCategoryQuery(currentParams),
                    );

                    if (isCurrent) setCategoriesPage(response);
                }

                if (activeSection === "orders") {
                    const response = await adminService.getOrders(
                        buildOrderQuery(currentParams),
                    );

                    if (isCurrent) setOrdersPage(response);
                }

                if (activeSection === "users") {
                    const response = await adminService.getUsers(
                        buildUserQuery(currentParams),
                    );

                    if (isCurrent) setUsersPage(response);
                }

                if (isCurrent) setIsLoading(false);
            } catch (loadError) {
                if (isCurrent) {
                    setError(getAdminErrorMessage(loadError));
                    setIsLoading(false);
                }
            }
        }

        void loadSection();

        return () => {
            isCurrent = false;
        };
    }, [activeSection, paramsString, reloadKey]);

    return (
        <main className="min-h-screen bg-zinc-100 px-4 pb-16 text-zinc-950 sm:px-6 lg:px-8">
            <header className="mx-[calc(50%-50vw)] border-b border-zinc-200 bg-zinc-100 px-4 py-3 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
                    <div className="flex items-center justify-center gap-2 lg:justify-start">
                        <Grid2X2 aria-hidden={true} size={20} />
                        <h1 className="text-xl font-semibold">Admin Panel</h1>
                    </div>

                    <SectionTabs
                        activeSection={activeSection}
                        onSectionChange={changeSection}
                    />

                    <div className="flex items-center justify-center gap-3 lg:justify-end">
                        <p className="text-sm text-zinc-500 text-center">
                            Signed in as{" "}
                            <br/>
                            <span className="font-semibold text-zinc-800">
                                {currentUserName}
                            </span>
                        </p>
                        <Link
                            className="inline-flex h-9 shrink-0 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 shadow-sm transition hover:bg-zinc-50"
                            href="/"
                        >
                            Back to store
                        </Link>
                    </div>
                </div>
            </header>

            {activeSection === "products" && (
                <ProductsSection
                    categories={categoryOptions}
                    error={error}
                    isLoading={isLoading}
                    onCreateProduct={() => {
                        setEditingProduct(null);
                        setProductCreateError("");
                        setIsCreateProductOpen(true);
                    }}
                    onEditProduct={(product) => {
                        setEditingProduct(product);
                        setProductCreateError("");
                        setIsCreateProductOpen(true);
                    }}
                    onFilterSubmit={handleFilterSubmit}
                    onPageChange={changePage}
                    onReset={resetFilters}
                    onRetry={retryActiveSection}
                    onToggleProduct={(product) =>
                        void toggleProductStatus(product)
                    }
                    page={productsPage}
                    params={params}
                    updatingProductId={updatingProductId}
                />
            )}

            {activeSection === "categories" && (
                <CategoriesSection
                    deletingCategoryId={deletingCategoryId}
                    error={error}
                    isLoading={isLoading}
                    mutationError={
                        isCategoryFormOpen ? "" : categoryMutationError
                    }
                    onCreateCategory={openCreateCategory}
                    onDeleteCategory={(category) =>
                        void deleteCategory(category)
                    }
                    onEditCategory={openEditCategory}
                    onFilterSubmit={handleFilterSubmit}
                    onPageChange={changePage}
                    onReset={resetFilters}
                    onRetry={retryActiveSection}
                    page={categoriesPage}
                    params={params}
                />
            )}

            {activeSection === "orders" && (
                <OrdersSection
                    error={error}
                    isLoading={isLoading}
                    onFilterSubmit={handleFilterSubmit}
                    onGoToUser={goToUser}
                    onOpenOrder={(order) => void openOrder(order)}
                    onPageChange={changePage}
                    onReset={resetFilters}
                    onRetry={retryActiveSection}
                    page={ordersPage}
                    params={params}
                />
            )}

            {activeSection === "users" && (
                <UsersSection
                    error={error}
                    isLoading={isLoading}
                    onFilterSubmit={handleFilterSubmit}
                    onGoToOrders={goToOrders}
                    onPageChange={changePage}
                    onReset={resetFilters}
                    onRetry={retryActiveSection}
                    onToggleUser={toggleUserStatus}
                    page={usersPage}
                    params={params}
                    updatingUserId={updatingUserId}
                />
            )}

            {selectedOrder && (
                <OrderDetailsModal
                    error={orderStatusError}
                    isUpdatingStatus={isUpdatingOrderStatus}
                    onClose={() => {
                        setSelectedOrder(null);
                        setOrderStatusError("");
                    }}
                    onGoToUser={goToUser}
                    onRefund={() => void refundOrder()}
                    onStatusChange={(status) => void updateOrderStatus(status)}
                    order={selectedOrder}
                />
            )}

            {isCreateProductOpen && (
                <ProductCreateModal
                    categories={categoryOptions}
                    error={productCreateError}
                    isSubmitting={isCreatingProduct}
                    onClose={() => {
                        if (!isCreatingProduct) {
                            setIsCreateProductOpen(false);
                            setEditingProduct(null);
                            setProductCreateError("");
                        }
                    }}
                    onSubmit={(product) => void saveProduct(product)}
                    product={editingProduct}
                />
            )}

            {isCategoryFormOpen && (
                <CategoryFormModal
                    category={editingCategory}
                    error={categoryMutationError}
                    isSubmitting={isSavingCategory}
                    onClose={() => {
                        if (!isSavingCategory) {
                            setIsCategoryFormOpen(false);
                            setEditingCategory(null);
                            setCategoryMutationError("");
                        }
                    }}
                    onSubmit={(name) => void saveCategory(name)}
                />
            )}
        </main>
    );
}
