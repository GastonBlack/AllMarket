import { LoaderCircle, RotateCcw, X } from "lucide-react";
import type { KeyboardEvent } from "react";

import type {
    AdminOrderDetailResponseDto,
    AdminOrderResponseDto,
    OrderStatus,
    PaginatedResponse,
} from "@/types";
import { formatDateTime, formatPrice } from "@/utils/formatters";
import { getOrderStatusStyle } from "@/utils/orderStatus";

import {
    getNextOrderStatuses,
    orderStatusOptions,
} from "./admin.helpers";
import {
    AdminPagination,
    AdminPanel,
    EmptyTableState,
    FilterField,
    FilterPanel,
    NumberInput,
    SearchInput,
    SectionState,
} from "./adminShared";

interface OrdersSectionProps {
    error: string;
    isLoading: boolean;
    onFilterSubmit: React.SubmitEventHandler<HTMLFormElement>;
    onGoToUser: (order: AdminOrderResponseDto) => void;
    onOpenOrder: (order: AdminOrderResponseDto) => void;
    onPageChange: (page: number) => void;
    onReset: () => void;
    onRetry: () => void;
    page: PaginatedResponse<AdminOrderResponseDto> | null;
    params: URLSearchParams;
}

function handleOrderRowKeyDown(
    event: KeyboardEvent<HTMLTableRowElement>,
    order: AdminOrderResponseDto,
    onOpenOrder: (order: AdminOrderResponseDto) => void,
) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onOpenOrder(order);
    }
}

export function OrderDetailsModal({
    error,
    isUpdatingStatus,
    onClose,
    onGoToUser,
    onRefund,
    onStatusChange,
    order,
}: {
    error: string;
    isUpdatingStatus: boolean;
    onClose: () => void;
    onGoToUser: (order: AdminOrderDetailResponseDto) => void;
    onRefund: () => void;
    onStatusChange: (status: OrderStatus) => void;
    order: AdminOrderDetailResponseDto;
}) {
    const nextStatuses = getNextOrderStatuses(order.status);

    function handleRefund() {
        const confirmed = window.confirm(
            "Cancel this order and issue a full refund through Stripe?",
        );

        if (confirmed) {
            onRefund();
        }
    }

    function getActionLabel(status: OrderStatus) {
        switch (status) {
            case "Paid":
                return "Mark as paid";
            case "Preparing":
                return "Mark as preparing";
            case "Shipped":
                return "Mark as shipped";
            case "Delivered":
                return "Mark as delivered";
            case "Cancelled":
                return "Cancel order";
            case "Expired":
                return "Expire order";
            default:
                return status;
        }
    }

    function getActionClassName(status: OrderStatus) {
        if (status === "Cancelled") {
            return "border-red-300 bg-white text-red-700 hover:bg-red-50";
        }

        if (status === "Expired") {
            return "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50";
        }

        return "border-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800";
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
            onClick={onClose}
        >
            <section
                aria-labelledby="admin-order-details-title"
                aria-modal="true"
                className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
            >
                <header className="flex items-start justify-between gap-4 border-b border-zinc-200 p-6">
                    <div>
                        <h2
                            className="text-xl font-semibold text-zinc-950"
                            id="admin-order-details-title"
                        >
                            Order details
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Order #{order.id}
                        </p>
                    </div>
                    <button
                        aria-label="Close order details"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                        onClick={onClose}
                        type="button"
                    >
                        <X aria-hidden={true} size={20} />
                    </button>
                </header>

                <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 md:grid-cols-4">
                    <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500">User</p>
                        <button
                            className="mt-2 text-left text-sm font-semibold text-zinc-950 underline-offset-2 hover:underline"
                            onClick={() => onGoToUser(order)}
                            type="button"
                        >
                            {order.userFullName}
                        </button>
                        {order.userEmail && (
                            <p className="mt-1 text-xs text-zinc-500">
                                {order.userEmail}
                            </p>
                        )}
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500">Date</p>
                        <p className="mt-2 text-sm font-semibold text-zinc-950">
                            {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500">Status</p>
                        <span
                            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getOrderStatusStyle(order.status)}`}
                        >
                            {order.status}
                        </span>
                    </div>
                    <div className="rounded-lg border border-zinc-200 p-4">
                        <p className="text-xs text-zinc-500">Total</p>
                        <p className="mt-2 text-lg font-semibold text-zinc-950">
                            {formatPrice(order.totalPrice)}
                        </p>
                    </div>
                </div>

                <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                        <h3 className="text-sm font-semibold text-zinc-950">
                            Status actions
                        </h3>
                        {nextStatuses.length > 0 || order.canRefund ? (
                            <div className="mt-3 grid gap-3 sm:flex sm:flex-wrap">
                                {nextStatuses.map((status) => (
                                    <button
                                        className={`inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${getActionClassName(status)}`}
                                        disabled={isUpdatingStatus}
                                        key={status}
                                        onClick={() => onStatusChange(status)}
                                        type="button"
                                    >
                                        {isUpdatingStatus && (
                                            <LoaderCircle
                                                aria-hidden={true}
                                                className="animate-spin"
                                                size={16}
                                            />
                                        )}
                                        {getActionLabel(status)}
                                    </button>
                                ))}
                                {order.canRefund && (
                                    <button
                                        className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                        disabled={isUpdatingStatus}
                                        onClick={handleRefund}
                                        type="button"
                                    >
                                        {isUpdatingStatus ? (
                                            <LoaderCircle
                                                aria-hidden={true}
                                                className="animate-spin"
                                                size={16}
                                            />
                                        ) : (
                                            <RotateCcw
                                                aria-hidden={true}
                                                size={16}
                                            />
                                        )}
                                        Cancel and refund
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-zinc-600">
                                {order.status === "Refunding"
                                    ? "The refund is being processed by Stripe."
                                    : order.status === "Refunded"
                                      ? "This order has been refunded."
                                      : "This order has reached a final status and cannot be changed."}
                            </p>
                        )}
                        {error && (
                            <p
                                className="mt-3 text-sm font-medium text-red-700"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                </div>

                <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <h3 className="text-base font-semibold text-zinc-950">
                        Products
                    </h3>
                    {order.items.length > 0 ? (
                        <>
                            <div className="mt-4 grid gap-3 sm:hidden">
                                {order.items.map((item) => (
                                    <article
                                        className="rounded-lg border border-zinc-200 p-4"
                                        key={item.id}
                                    >
                                        <p className="font-semibold text-zinc-950">
                                            {item.productName}
                                        </p>
                                        <p className="mt-1 text-xs text-zinc-500">
                                            Product ID: {item.productId}
                                        </p>
                                        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <dt className="text-xs text-zinc-500">
                                                    Quantity
                                                </dt>
                                                <dd className="mt-1">{item.quantity}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-zinc-500">
                                                    Price
                                                </dt>
                                                <dd className="mt-1">
                                                    {formatPrice(item.priceAtPurchase)}
                                                </dd>
                                            </div>
                                        </dl>
                                        <p className="mt-4 border-t border-zinc-100 pt-3 text-right font-semibold text-zinc-950">
                                            {formatPrice(item.subtotal)}
                                        </p>
                                    </article>
                                ))}
                            </div>
                            <div className="mt-4 hidden overflow-x-auto rounded-lg border border-zinc-200 sm:block">
                            <div className="min-w-[620px]">
                                <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase text-zinc-500">
                                    <span>Product</span>
                                    <span>Quantity</span>
                                    <span>Price</span>
                                    <span className="text-right">Subtotal</span>
                                </div>
                                {order.items.map((item) => (
                                    <div
                                        className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px] border-t border-zinc-100 px-4 py-4 text-sm"
                                        key={item.id}
                                    >
                                        <div>
                                            <p className="font-semibold text-zinc-950">
                                                {item.productName}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500">
                                                Product ID: {item.productId}
                                            </p>
                                        </div>
                                        <span>{item.quantity}</span>
                                        <span>
                                            {formatPrice(item.priceAtPurchase)}
                                        </span>
                                        <span className="text-right font-semibold text-zinc-950">
                                            {formatPrice(item.subtotal)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            </div>
                        </>
                    ) : (
                        <p className="mt-3 rounded-lg border border-dashed border-zinc-300 p-5 text-sm text-zinc-600">
                            This response does not include product line items.
                        </p>
                    )}
                </div>

                <footer className="flex justify-end border-t border-zinc-200 p-4 sm:p-6">
                    <button
                        className="h-10 w-full cursor-pointer rounded-md bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-auto"
                        onClick={onClose}
                        type="button"
                    >
                        Close
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default function OrdersSection({
    error,
    isLoading,
    onFilterSubmit,
    onGoToUser,
    onOpenOrder,
    onPageChange,
    onReset,
    onRetry,
    page,
    params,
}: OrdersSectionProps) {
    return (
        <AdminPanel
            subtitle={
                page
                    ? `Oldest first - page ${page.page} of ${page.totalPages || 1}`
                    : "Customer orders"
            }
            title="Orders"
        >
            <FilterPanel
                key={`orders-${params.toString()}`}
                onSubmit={onFilterSubmit}
                onReset={onReset}
            >
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <SearchInput
                        defaultValue={params.get("search") ?? ""}
                        label="Order"
                        placeholder="ID, name, or email"
                    />
                    <SearchInput
                        defaultValue={params.get("userName") ?? ""}
                        label="Customer name"
                        name="userName"
                        placeholder="Name"
                    />
                    <SearchInput
                        defaultValue={params.get("userEmail") ?? ""}
                        label="Customer email"
                        name="userEmail"
                        placeholder="Email"
                    />
                    <FilterField label="Status">
                        <select
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("status") ?? ""}
                            name="status"
                        >
                            <option value="">All statuses</option>
                            {orderStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </FilterField>
                    <NumberInput
                        defaultValue={params.get("orderId") ?? ""}
                        label="Exact order ID"
                        name="orderId"
                        placeholder="ID"
                    />
                    <FilterField label="From date">
                        <input
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("fromDate") ?? ""}
                            name="fromDate"
                            type="date"
                        />
                    </FilterField>
                    <FilterField label="To date">
                        <input
                            className="h-9 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-100"
                            defaultValue={params.get("toDate") ?? ""}
                            name="toDate"
                            type="date"
                        />
                    </FilterField>
                </div>
            </FilterPanel>

            {!page || error ? (
                <SectionState error={error} isLoading={isLoading} onRetry={onRetry} />
            ) : page.items.length === 0 ? (
                <EmptyTableState label="orders" />
            ) : (
                <>
                    <div className="grid gap-3 p-4 md:hidden">
                        {page.items.map((order) => (
                            <article
                                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
                                key={order.id}
                            >
                                <button
                                    className="w-full text-left"
                                    onClick={() => onOpenOrder(order)}
                                    type="button"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-zinc-500">Order</p>
                                            <p className="mt-1 text-xl font-semibold text-zinc-950">
                                                #{order.id}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getOrderStatusStyle(order.status)}`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                    <dl className="mt-4 grid gap-3 text-sm">
                                        <div>
                                            <dt className="text-xs text-zinc-500">Customer</dt>
                                            <dd className="mt-1 font-semibold text-zinc-950">
                                                {order.userFullName}
                                            </dd>
                                            {order.userEmail && (
                                                <dd className="mt-1 break-all text-xs text-zinc-500">
                                                    {order.userEmail}
                                                </dd>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <dt className="text-xs text-zinc-500">Date</dt>
                                                <dd className="mt-1">{formatDateTime(order.createdAt)}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-zinc-500">Products</dt>
                                                <dd className="mt-1">{order.productCount}</dd>
                                            </div>
                                        </div>
                                    </dl>
                                    <p className="mt-4 border-t border-zinc-100 pt-4 text-right text-lg font-semibold text-zinc-950">
                                        {formatPrice(order.totalPrice)}
                                    </p>
                                </button>
                                <button
                                    className="mt-3 h-10 w-full rounded-md border border-zinc-200 text-sm font-medium text-zinc-700"
                                    onClick={() => onGoToUser(order)}
                                    type="button"
                                >
                                    View customer
                                </button>
                            </article>
                        ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[1080px] text-left text-sm">
                            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                                <tr>
                                    <th className="px-5 py-4 font-semibold">
                                        Order
                                    </th>
                                    <th className="px-5 py-4 font-semibold">User</th>
                                    <th className="px-5 py-4 font-semibold">Date</th>
                                    <th className="px-5 py-4 font-semibold">
                                        Products
                                    </th>
                                    <th className="px-5 py-4 font-semibold">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 font-semibold">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {page.items.map((order) => (
                                    <tr
                                        className="cursor-pointer transition duration-[0.1s] hover:bg-zinc-200"
                                        key={order.id}
                                        onClick={() => onOpenOrder(order)}
                                        onKeyDown={(event) =>
                                            handleOrderRowKeyDown(
                                                event,
                                                order,
                                                onOpenOrder,
                                            )
                                        }
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <td className="px-5 py-4 font-semibold text-zinc-950">
                                            #{order.id}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button
                                                className="text-left font-semibold text-zinc-950 underline-offset-2 hover:underline"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onGoToUser(order);
                                                }}
                                                type="button"
                                            >
                                                {order.userFullName}
                                            </button>
                                            {order.userEmail && (
                                                <p className="mt-1 text-xs text-zinc-500">
                                                    {order.userEmail}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            {formatDateTime(order.createdAt)}
                                        </td>
                                        <td className="px-5 py-4">
                                            {order.productCount}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getOrderStatusStyle(order.status)}`}
                                            >
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-semibold">
                                            {formatPrice(order.totalPrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <AdminPagination onPageChange={onPageChange} page={page} />
                </>
            )}
        </AdminPanel>
    );
}
