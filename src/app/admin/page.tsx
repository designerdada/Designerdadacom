import { ArticlesDashboard } from "@/components/admin/ArticlesDashboard";

export const instant = false; // see src/app/admin/login/page.tsx

export const metadata = { title: "Articles" };

export default function AdminHome() {
	return <ArticlesDashboard />;
}
