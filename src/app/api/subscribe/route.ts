import { createHmac } from "crypto";
import disposableDomains from "@/data/disposable-domains.json";

const API_URL = "https://api.autosend.com/v1";
const API_KEY = process.env.AUTOSEND_API_KEY!;
const FROM_EMAIL = "aka@designerdada.com";
const FROM_NAME = "Designerdada";
const TOKEN_SECRET = process.env.NEWSLETTER_TOKEN_SECRET!;
const CONFIRMATION_TEMPLATE_ID = "A-8361941152306b900290";


// Rate limiting: 5 requests per IP per hour
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const entry = ipRequests.get(ip);
	if (!entry || now > entry.resetAt) {
		ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
		return false;
	}
	if (entry.count >= RATE_LIMIT) return true;
	entry.count++;
	return false;
}

function generateToken(email: string): string {
	const payload = `${Buffer.from(email).toString("base64url")}:${Date.now()}`;
	const hmac = createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
	return `${payload}:${hmac}`;
}

const json = (body: object, status = 200) => Response.json(body, { status });

export async function POST(req: Request) {
	if (!API_KEY) {
		console.error("AUTOSEND_API_KEY is not set");
		return json({ error: "Internal server error" }, 500);
	}
	if (!TOKEN_SECRET) {
		console.error("NEWSLETTER_TOKEN_SECRET is not set");
		return json({ error: "Internal server error" }, 500);
	}

	const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
	if (process.env.NODE_ENV !== "development" && isRateLimited(ip)) {
		return json({ error: "Whoa, slow down! Try after some time." }, 429);
	}

	const { email } = ((await req.json().catch(() => null)) ?? {}) as { email?: unknown };

	if (!email || typeof email !== "string") {
		return json({ error: "Email is required" }, 400);
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return json({ error: "Invalid email address" }, 400);
	}

	const normalizedEmail = email.trim().toLowerCase();
	const domain = normalizedEmail.split("@")[1];
	if (disposableDomains.includes(domain)) {
		return json({ error: "Disposable email addresses aren't allowed. Use your real email :)" }, 400);
	}

	try {
		// Create/update contact as pending (no list yet)
		const contactRes = await fetch(`${API_URL}/contacts/email`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: normalizedEmail,
				customFields: { confirmed: false },
			}),
		});

		const contactBody = await contactRes.json();
		if (!contactRes.ok) {
			console.error("AutoSend contact error:", JSON.stringify(contactBody));
			return json({ error: "Failed to create contact" }, 500);
		}
		console.log("AutoSend contact response:", JSON.stringify(contactBody));

		// Generate confirmation token and send email
		const token = generateToken(normalizedEmail);
		const confirmUrl = `https://designerdada.com/api/confirm?token=${encodeURIComponent(token)}`;

		const mailRes = await fetch(`${API_URL}/mails/send`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: { email: FROM_EMAIL, name: FROM_NAME },
				to: { email: normalizedEmail },
				templateId: CONFIRMATION_TEMPLATE_ID,
				dynamicData: { confirmUrl },
			}),
		});

		const mailBody = await mailRes.json();
		if (!mailRes.ok) {
			console.error("AutoSend mail error:", mailBody);
			return json({ error: "Failed to send confirmation email" }, 500);
		}
		console.log("AutoSend mail response:", JSON.stringify(mailBody));

		return json({ success: true });
	} catch (err) {
		console.error("Subscribe error:", err);
		return json({ error: "Internal server error" }, 500);
	}
}
