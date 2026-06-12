const usdPriceFormatter = new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
});

export function formatPrice(value: number) {
    return usdPriceFormatter.format(value);
}

export function formatDate(value: string) {
    return shortDateFormatter.format(new Date(value));
}

export function formatDateTime(value: string) {
    return dateTimeFormatter.format(new Date(value));
}
