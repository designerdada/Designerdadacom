import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	cacheComponents: true,
	env: {
		// Keep the existing Vercel env var working after the move off Vite.
		NEXT_PUBLIC_WORKER_API_URL:
			process.env.NEXT_PUBLIC_WORKER_API_URL ?? process.env.VITE_WORKER_API_URL ?? "",
	},
	images: {
		remotePatterns: [{ protocol: "https", hostname: "*.convex.cloud" }],
	},
};

export default nextConfig;
