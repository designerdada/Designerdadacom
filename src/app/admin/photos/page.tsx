import { AdminPhotos } from "@/components/admin/AdminPhotos";

export const instant = false; // see src/app/admin/login/page.tsx

export const metadata = { title: "Photos" };

export default function AdminPhotosPage() {
	return <AdminPhotos />;
}
