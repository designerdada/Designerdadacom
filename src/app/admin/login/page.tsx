import { LoginForm } from "@/components/admin/LoginForm";

// Admin pages render on the client behind the sign-in gate; each page opts out of
// instant-navigation validation individually (the layout's setting doesn't cover pages).
export const instant = false;

export const metadata = { title: "Sign in" };

export default function AdminLoginPage() {
	return <LoginForm />;
}
