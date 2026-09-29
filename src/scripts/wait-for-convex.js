// Holds `next dev` until a local Convex backend accepts connections, so the first render's
// cached fetches don't fail with ECONNREFUSED. No-op for cloud deployments.
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const isLocal = url && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/.test(url);
const timeoutMs = 120_000;

if (isLocal) {
	const started = Date.now();
	while (true) {
		try {
			await fetch(`${url}/version`);
			break;
		} catch {
			if (Date.now() - started > timeoutMs) {
				console.error(`Convex backend at ${url} did not start within ${timeoutMs / 1000}s`);
				process.exit(1);
			}
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
}
