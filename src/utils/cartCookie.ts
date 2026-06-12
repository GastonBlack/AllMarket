export interface CartCookieItem {
    productId: number;
    quantity: number;
}

const CART_COOKIE_NAME = "cartItems";
const cartCookieMaxAge = 60 * 60 * 24 * 30;

export function getCartItems(): CartCookieItem[] {
    const cookie = document.cookie
        .split("; ")
        .find((item) => item.startsWith(`${CART_COOKIE_NAME}=`));

    if (!cookie) {
        return [];
    }

    try {
        const items = JSON.parse(
            decodeURIComponent(cookie.split("=").slice(1).join("=")),
        ) as CartCookieItem[];

        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

function setCartItems(items: CartCookieItem[]) {
    if (items.length === 0) {
        document.cookie = `${CART_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
        return;
    }

    document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(
        JSON.stringify(items),
    )}; path=/; max-age=${cartCookieMaxAge}; SameSite=Lax`;
}

export function addCartItem(
    productId: number,
    quantity = 1,
    maxQuantity?: number,
) {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const items = getCartItems();
    const existingItem = items.find((item) => item.productId === productId);
    const nextQuantity = Math.min(
        safeQuantity,
        maxQuantity ?? Number.MAX_SAFE_INTEGER,
    );

    if (existingItem) {
        existingItem.quantity = Math.min(
            existingItem.quantity + nextQuantity,
            maxQuantity ?? Number.MAX_SAFE_INTEGER,
        );
    } else {
        items.push({
            productId,
            quantity: nextQuantity,
        });
    }

    setCartItems(items);
}

export function updateCartItemQuantity(
    productId: number,
    quantity: number,
    maxQuantity?: number,
) {
    const items = getCartItems();
    const safeMaxQuantity = Math.max(
        1,
        maxQuantity ?? Number.MAX_SAFE_INTEGER,
    );
    const safeQuantity = Math.min(
        Math.max(1, Math.floor(quantity)),
        safeMaxQuantity,
    );

    setCartItems(
        items.map((item) =>
            item.productId === productId
                ? { ...item, quantity: safeQuantity }
                : item,
        ),
    );
}

export function removeCartItem(productId: number) {
    setCartItems(getCartItems().filter((item) => item.productId !== productId));
}

export function clearCartItems() {
    setCartItems([]);
}
