import type { OrderResponseDto, OrderStatus } from "@/types";

export function getOrderItemCount(order: OrderResponseDto) {
    return order.items.reduce((total, item) => total + item.quantity, 0);
}

export function getOrderStatusDescription(status: OrderStatus) {
    switch (status) {
        case "Awaiting for payment":
            return "We are waiting for your payment.";
        case "Paid":
            return "Payment confirmed. We will prepare your order soon.";
        case "Preparing":
            return "Your order is being prepared!";
        case "Shipped":
            return "Your order is on the way!";
        case "Delivered":
            return "Your order has been delivered.";
        case "Cancelled":
            return "This order was cancelled.";
        case "Expired":
            return "The payment window for this order expired.";
        case "Refunding":
            return "Your refund is being processed.";
        case "Refunded":
            return "Your payment has been refunded.";
    }
}
