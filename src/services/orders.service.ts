import { api } from "@/lib/axios";

import type { CheckoutOrderDto, OrderResponseDto } from "@/types";

export const ordersService = {
  async checkout(dto: CheckoutOrderDto): Promise<OrderResponseDto> {
    const response = await api.post<OrderResponseDto>(
      "/api/orders/checkout",
      dto,
    );

    return response.data;
  },
};
