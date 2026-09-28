import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminProviders } from "@/components/admin/AdminProviders";
import "./admin.css";

// The admin renders entirely on the client behind the sign-in gate, so there is no server UI for
// Next.js to validate for instant navigation. Public pages keep the default validation.
export const instant = false;

export const metadata: Metadata = {
	title: { default: "Admin", template: "%s | Admin" },
	robots: { index: false, follow: false },
};

/** Auth lives only here, so public pages stay fully static and cached. */
export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className='min-h-screen bg-olive-50 dark:bg-olive-950 text-olive-800 dark:text-olive-100'>
			{/* The admin is entirely client-rendered; nothing here is prerendered with URL data. */}
			<Suspense>
				<AdminProviders>{children}</AdminProviders>
			</Suspense>
		</div>
	);
}
