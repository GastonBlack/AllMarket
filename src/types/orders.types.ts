export type OrderStatus =
  | "Awaiting for payment"
  | "Paid"
  | "Preparing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Expired"
  | "Refunding"
  | "Refunded";

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CheckoutOrderDto {
  items: CreateOrderItemDto[];
}

export interface OrderItemResponseDto {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: number;
  userId: number;
  status: OrderStatus;
  totalPrice: number;
  createdAt: string;
  reservationExpiresAt?: string | null;
  items: OrderItemResponseDto[];
}
