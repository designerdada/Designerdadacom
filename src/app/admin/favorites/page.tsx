import { AdminFavorites } from "@/components/admin/AdminFavorites";

export const instant = false; // see src/app/admin/login/page.tsx

export const metadata = { title: "Favorites" };

export default function AdminFavoritesPage() {
	return <AdminFavorites />;
}
