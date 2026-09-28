"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function AdminProviders({ children }: { children: ReactNode }) {
	return (
		<ConvexAuthProvider client={convex}>
			<AuthGate>{children}</AuthGate>
		</ConvexAuthProvider>
	);
}

/** UX-only gate; every admin Convex function enforces access on the server via requireAdmin. */
function AuthGate({ children }: { children: ReactNode }) {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const pathname = usePathname();
	const router = useRouter();
	const isLogin = pathname === "/admin/login";

	useEffect(() => {
		if (isLoading) return;
		if (!isAuthenticated && !isLogin) router.replace("/admin/login");
		if (isAuthenticated && isLogin) router.replace("/admin");
	}, [isLoading, isAuthenticated, isLogin, router]);

	if (isLogin) return children;
	if (isLoading || !isAuthenticated) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<p className='text-sm text-olive-500'>Loading…</p>
			</div>
		);
	}
	return children;
}
