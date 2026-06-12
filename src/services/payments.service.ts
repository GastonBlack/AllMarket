import { api } from "@/lib/axios";

import type { PaymentCheckoutResponseDto } from "@/types";

export const paymentsService = {
  async checkout(orderId: number): Promise<PaymentCheckoutResponseDto> {
    const response = await api.post<PaymentCheckoutResponseDto>(
      `/api/payments/checkout/${orderId}`,
    );

    return response.data;
  },
};
