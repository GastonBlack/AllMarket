import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/currentUser";

export default async function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const currentUser = await getCurrentUser();
    const initialUser = currentUser
        ? {
            email: currentUser.email,
            username: currentUser.fullName || currentUser.email,
        }
        : null;

    return (
        <div className="flex min-h-screen flex-col">
            <Header
                initialUser={initialUser}
                isAdmin={currentUser?.rol === "Admin"}
            />
            <div className="flex-1">{children}</div>
            <Footer />
        </div>
    );
}
