const AUTOSEND_URL = "https://api.autosend.com/v1/mails/send";
const FROM = { email: "aka@designerdada.com", name: "Designerdada" };

/** Sends the /admin sign-in link through AutoSend. */
export async function sendMagicLink({ to, url, expires }: { to: string; url: string; expires: Date }) {
	const apiKey = process.env.AUTOSEND_API_KEY;
	if (!apiKey) {
		// Local development without an API key: print the link instead of emailing it.
		if (process.env.SITE_URL?.startsWith("http://localhost")) {
			console.log(`Magic link for ${to}: ${url}`);
			return;
		}
		throw new Error("AUTOSEND_API_KEY is not set on the Convex deployment");
	}

	const minutes = Math.round((expires.getTime() - Date.now()) / 60_000);
	const res = await fetch(AUTOSEND_URL, {
		method: "POST",
		headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			from: FROM,
			to: { email: to },
			subject: "Your sign-in link for designerdada.com",
			text: `Sign in to your writing desk:\n\n${url}\n\nThis link expires in ${minutes} minutes. If you didn't request it, ignore this email.`,
			html: emailHtml(url, minutes),
		}),
	});
	if (!res.ok) {
		console.error("AutoSend error", res.status, await res.text());
		throw new Error("Could not send the sign-in email");
	}
}

function emailHtml(url: string, minutes: number) {
	const href = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
	return `<!doctype html>
<html><body style="margin:0;padding:40px 16px;background:#fbfbf7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#2b2b24">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:420px" cellpadding="0" cellspacing="0">
<tr><td style="font-size:20px;font-style:italic;font-family:Georgia,serif;padding-bottom:16px">Writing desk</td></tr>
<tr><td style="font-size:15px;line-height:1.6;padding-bottom:24px">Click the button below to sign in to designerdada.com. The link expires in ${minutes} minutes and can only be used once.</td></tr>
<tr><td style="padding-bottom:24px"><a href="${href}" style="display:inline-block;background:#2b2b24;color:#fbfbf7;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600">Sign in</a></td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#7c7c67">If you didn't request this, you can ignore this email.</td></tr>
</table></td></tr></table></body></html>`;
}
