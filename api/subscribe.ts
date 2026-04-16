import { createHmac } from "crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import disposableDomains from "./disposable-domains.json";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}

	const ip =
		(req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
		req.socket.remoteAddress ||
		"unknown";
	if (process.env.NODE_ENV !== "development" && isRateLimited(ip)) {
		return res.status(429).json({ error: "Whoa, slow down! Try after some time." });
	}

	const { email } = req.body ?? {};

	if (!email || typeof email !== "string") {
		return res.status(400).json({ error: "Email is required" });
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email address" });
	}

	const normalizedEmail = email.trim().toLowerCase();
	const domain = normalizedEmail.split("@")[1];
	if (disposableDomains.includes(domain)) {
		return res
			.status(400)
			.json({ error: "Disposable email addresses aren't allowed. Use your real email :)" });
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

		if (!contactRes.ok) {
			const err = await contactRes.json();
			console.error("AutoSend contact error:", err);
			return res.status(500).json({ error: "Failed to create contact" });
		}

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
			return res.status(500).json({ error: "Failed to send confirmation email" });
		}
		console.log("AutoSend mail response:", JSON.stringify(mailBody));

		return res.status(200).json({ success: true });
	} catch (err) {
		console.error("Subscribe error:", err);
		return res.status(500).json({ error: "Internal server error" });
	}
}
