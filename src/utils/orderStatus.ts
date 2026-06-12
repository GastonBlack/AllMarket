import type { OrderStatus } from "@/types";

export function getOrderStatusStyle(status: OrderStatus) {
    switch (status) {
        case "Paid":
        case "Delivered":
            return "bg-green-50 text-green-700 ring-green-200";
        case "Awaiting for payment":
        case "Preparing":
        case "Shipped":
            return "bg-yellow-50 text-yellow-800 ring-yellow-200";
        case "Cancelled":
        case "Expired":
            return "bg-zinc-100 text-zinc-600 ring-zinc-200";
        case "Refunding":
            return "bg-blue-50 text-blue-700 ring-blue-200";
        case "Refunded":
            return "bg-red-50 text-red-700 ring-red-200";
    }
}
