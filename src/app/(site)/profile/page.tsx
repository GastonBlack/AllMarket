import type { Metadata } from "next";

import ProfileClient from "./profileClient";

export const metadata: Metadata = {
    description: "Manage your AllMarket profile details and account security.",
    title: "Profile | AllMarket",
};

export default function ProfilePage() {
    return <ProfileClient />;
}
