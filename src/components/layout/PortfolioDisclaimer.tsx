import { TriangleAlert } from "lucide-react";

export default function PortfolioDisclaimer() {
    return (
        <div className="border-t border-yellow-300 bg-yellow-300 px-4 py-4 text-zinc-950">
            <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 text-center">
                <TriangleAlert
                    aria-hidden="true"
                    className="hidden shrink-0 sm:block"
                    size={20}
                />
                <p className="text-xs font-bold uppercase tracking-wide sm:text-sm">
                    This is not a real place to buy products. AllMarket is a
                    portfolio project.
                </p>
            </div>
        </div>
    );
}
