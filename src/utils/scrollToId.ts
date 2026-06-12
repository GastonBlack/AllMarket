interface ScrollToIdOptions {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
}

export function scrollToId(
    id: string,
    { behavior = "smooth", block = "start" }: ScrollToIdOptions = {},
) {
    const element = document.getElementById(id);

    if (!element) {
        return;
    }

    element.scrollIntoView({
        behavior,
        block,
    });
}
