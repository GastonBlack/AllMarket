import { api } from "@/lib/axios";
import type {
    AdminCategoryQueryParams,
    AdminCategoryResponseDto,
    AdminCreateCategoryDto,
    AdminCreateProductDto,
    AdminOrderDetailResponseDto,
    AdminOrderQueryParams,
    AdminOrderResponseDto,
    AdminProductQueryParams,
    AdminProductResponseDto,
    AdminUpdateProductDto,
    AdminUserQueryParams,
    AdminUserResponseDto,
    AdminUpdateCategoryDto,
    PaginatedResponse,
    UpdateAdminOrderStatusDto,
    UpdateAdminProductStatusDto,
    UpdateAdminUserStatusDto,
    UpdateAdminProductDiscount,
} from "@/types";

export const adminService = {
    async createProduct(
        product: AdminCreateProductDto,
    ): Promise<AdminProductResponseDto> {
        const formData = new FormData();

        formData.append("name", product.name);
        formData.append("description", product.description);
        formData.append("price", String(product.price));
        formData.append("stock", String(product.stock));
        formData.append("categoryId", String(product.categoryId));
        formData.append("hasDiscount", "false");
        formData.append("isActive", "true");

        if (product.image) {
            formData.append("image", product.image);
        }

        const response = await api.post<AdminProductResponseDto>(
            "/api/admin/products",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        return response.data;
    },

    async getProducts(
        params: AdminProductQueryParams,
    ): Promise<PaginatedResponse<AdminProductResponseDto>> {
        const response = await api.get<
            PaginatedResponse<AdminProductResponseDto>
        >("/api/admin/products", { params });

        return response.data;
    },

    async updateProductStatus(
        productId: number,
        dto: UpdateAdminProductStatusDto,
    ): Promise<AdminProductResponseDto> {
        const response = await api.put<AdminProductResponseDto>(
            `/api/admin/products/${productId}/status`,
            dto,
        );

        return response.data;
    },

    async updateProduct(
        productId: number,
        dto: AdminUpdateProductDto,
    ): Promise<AdminProductResponseDto> {
        const response = await api.put<AdminProductResponseDto>(
            `/api/admin/products/${productId}`,
            dto,
        );

        return response.data;
    },

    async updateProductDiscount(
        productId: number,
        dto: UpdateAdminProductDiscount,
    ): Promise<boolean> {
        const response = await api.patch<boolean>(
            `/api/admin/products/${productId}/discount`,
            dto,
        );

        return response.data;
    },

    async getCategories(
        params: AdminCategoryQueryParams,
    ): Promise<PaginatedResponse<AdminCategoryResponseDto>> {
        const response = await api.get<
            PaginatedResponse<AdminCategoryResponseDto>
        >("/api/admin/categories", { params });

        return response.data;
    },

    async createCategory(
        dto: AdminCreateCategoryDto,
    ): Promise<AdminCategoryResponseDto> {
        const response = await api.post<AdminCategoryResponseDto>(
            "/api/admin/categories",
            dto,
        );

        return response.data;
    },

    async updateCategory(
        dto: AdminUpdateCategoryDto,
    ): Promise<AdminCategoryResponseDto> {
        const response = await api.put<AdminCategoryResponseDto>(
            "/api/admin/categories",
            dto,
        );

        return response.data;
    },

    async deleteCategory(categoryId: number): Promise<boolean> {
        const response = await api.delete<boolean>(
            `/api/admin/categories/${categoryId}`,
        );

        return response.data;
    },

    async getOrders(
        params: AdminOrderQueryParams,
    ): Promise<PaginatedResponse<AdminOrderResponseDto>> {
        const response = await api.get<
            PaginatedResponse<AdminOrderResponseDto>
        >("/api/admin/orders", { params });

        return response.data;
    },

    async getOrderById(orderId: number): Promise<AdminOrderDetailResponseDto> {
        const response = await api.get<AdminOrderDetailResponseDto>(
            `/api/admin/orders/${orderId}`,
        );

        return response.data;
    },

    async updateOrderStatus(
        orderId: number,
        dto: UpdateAdminOrderStatusDto,
    ): Promise<AdminOrderDetailResponseDto> {
        const response = await api.put<AdminOrderDetailResponseDto>(
            `/api/admin/orders/${orderId}/status`,
            dto,
        );

        return response.data;
    },

    async refundOrder(orderId: number): Promise<AdminOrderDetailResponseDto> {
        const response = await api.post<AdminOrderDetailResponseDto>(
            `/api/admin/orders/${orderId}/refund`,
        );

        return response.data;
    },

    async getUsers(
        params: AdminUserQueryParams,
    ): Promise<PaginatedResponse<AdminUserResponseDto>> {
        const response = await api.get<
            PaginatedResponse<AdminUserResponseDto>
        >("/api/admin/users", { params });

        return response.data;
    },

    async disableUser(userId: number): Promise<void> {
        await api.put(`/api/admin/users/${userId}/disable`);
    },

    async enableUser(userId: number): Promise<void> {
        await api.put(`/api/admin/users/${userId}/enable`);
    },

    async updateUserStatus(
        userId: number,
        dto: UpdateAdminUserStatusDto,
    ): Promise<void> {
        await api.put(`/api/admin/users/${userId}/status`, dto);
    },
};
