import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number) {
    const pages = new Set<number>([1, totalPages]);

    for (let currentPage = page - 1; currentPage <= page + 1; currentPage += 1) {
        if (currentPage >= 1 && currentPage <= totalPages) {
            pages.add(currentPage);
        }
    }

    return Array.from(pages).sort((firstPage, secondPage) => firstPage - secondPage);
}

export default function Pagination({
    page,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const visiblePages = getVisiblePages(page, totalPages);

    return (
        <nav
            aria-label="Products pagination"
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
            <button
                aria-label="Previous page"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-300"
                disabled={!hasPreviousPage}
                onClick={() => onPageChange(page - 1)}
                type="button"
            >
                <ChevronLeft aria-hidden="true" size={16} />
                Previous
            </button>

            <div className="flex items-center gap-2">
                {visiblePages.map((visiblePage, index) => {
                    const previousPage = visiblePages[index - 1];
                    const shouldShowGap =
                        previousPage !== undefined && visiblePage - previousPage > 1;

                    return (
                        <div className="flex items-center gap-2" key={visiblePage}>
                            {shouldShowGap && (
                                <span className="px-1 text-sm text-zinc-400">...</span>
                            )}
                            <button
                                aria-current={visiblePage === page ? "page" : undefined}
                                className={`size-10 cursor-pointer rounded-md border text-sm font-semibold transition ${
                                    visiblePage === page
                                        ? "border-zinc-950 bg-zinc-950 text-white"
                                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-950 hover:text-zinc-950"
                                }`}
                                onClick={() => onPageChange(visiblePage)}
                                type="button"
                            >
                                {visiblePage}
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                aria-label="Next page"
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:text-zinc-950 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-300"
                disabled={!hasNextPage}
                onClick={() => onPageChange(page + 1)}
                type="button"
            >
                Next
                <ChevronRight aria-hidden="true" size={16} />
            </button>
        </nav>
    );
}
