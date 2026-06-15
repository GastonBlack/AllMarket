import { Clock3, Mail, MapPin, Phone } from "lucide-react";

const frequentlyAskedQuestions = [
    {
        answer:
            "Orders are prepared after payment confirmation. Delivery times vary by destination, but most orders arrive within 3 to 7 business days.",
        question: "How long does delivery take?",
    },
    {
        answer:
            "You can review the latest status from My Orders. Each order shows whether it is paid, preparing, shipped, delivered, cancelled or refunded.",
        question: "How can I track my order?",
    },
    {
        answer:
            "Yes. Products can be returned within 30 days when they are unused and include their original packaging. Contact support before sending an item back.",
        question: "Can I return a product?",
    },
    {
        answer:
            "Payments are processed securely through Stripe. This portfolio environment uses Stripe Sandbox, so no real charges are created.",
        question: "Are payments secure?",
    },
    {
        answer:
            "Yes, available stock is updated in real time.",
        question: "Is the displayed stock up to date?",
    },
] as const;

const contactDetails = [
    { Icon: Mail, label: "Email", value: "contact@allmarket.com" },
    { Icon: Phone, label: "Phone", value: "+598 99 123 456" },
    { Icon: MapPin, label: "Location", value: "Montevideo, Uruguay" },
    {
        Icon: Clock3,
        label: "Support hours",
        value: "Monday to Friday, 9:00 AM to 6:00 PM",
    },
] as const;

export default function HomeInformationSections() {
    return (
        <div className="mx-auto grid w-[92%] gap-8 sm:w-[88%] lg:w-[85%] lg:grid-cols-2">
            <section
                className="scroll-mt-24 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
                id="faq"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
                    Help center
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                    Frequently asked questions
                </h2>

                <div className="mt-6 divide-y divide-zinc-200">
                    {frequentlyAskedQuestions.map((item, index) => (
                        <details
                            className="group py-4"
                            key={item.question}
                            open={index === 0}
                        >
                            <summary className="cursor-pointer list-none text-sm font-semibold text-zinc-950 marker:hidden">
                                <span className="flex items-center justify-between gap-4">
                                    {item.question}
                                    <span className="text-lg font-normal text-zinc-400 transition group-open:rotate-45">
                                        +
                                    </span>
                                </span>
                            </summary>
                            <p className="mt-3 pr-6 text-sm leading-6 text-zinc-600">
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            <section
                className="scroll-mt-24 rounded-lg bg-zinc-950 p-6 text-white shadow-sm sm:p-8"
                id="contact"
            >
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
                    Contact
                </p>
                <h2 className="mt-3 text-2xl font-semibold">
                    We are here to help
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">
                    Contact our support team for questions about products,
                    orders, returns or your account.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    {contactDetails.map(({ Icon, label, value }) => (
                        <div
                            className="rounded-lg border border-zinc-700 bg-zinc-900 p-4"
                            key={label}
                        >
                            <Icon
                                aria-hidden="true"
                                className="text-yellow-300"
                                size={20}
                            />
                            <p className="mt-4 text-xs uppercase tracking-wide text-zinc-400">
                                {label}
                            </p>
                            <p className="mt-1 text-sm font-medium leading-6 text-white">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 rounded-lg border border-yellow-400/30 bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
                    Demo contact information for the AllMarket portfolio project.
                    Messages are not delivered to a real support inbox.
                </div>
            </section>
        </div>
    );
}
