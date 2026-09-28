import { Email } from "@convex-dev/auth/providers/Email";
import { convexAuth } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import { isAdminEmail } from "./lib/admin";
import { sendMagicLink } from "./lib/magicLink";

const MagicLink = Email({
	id: "magic-link",
	maxAge: 60 * 60, // 1 hour
	// Magic-link behaviour: the (32-char random) code in the link is enough to sign in.
	authorize: undefined,
	async sendVerificationRequest({ identifier, url, expires }) {
		// createOrUpdateUser already rejects other emails before this runs; this is belt and braces.
		if (!isAdminEmail(identifier)) throw new Error("This site only allows its author to sign in.");
		await sendMagicLink({ to: identifier, url, expires });
	},
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
	providers: [MagicLink],
	callbacks: {
		// Single-author site: only the ADMIN_EMAIL account may ever exist.
		async createOrUpdateUser(genericCtx, { existingUserId, profile, type }) {
			const ctx = genericCtx as unknown as MutationCtx;
			const email = typeof profile.email === "string" ? profile.email.toLowerCase() : undefined;
			if (!isAdminEmail(email)) {
				throw new Error("This site only allows its author to sign in.");
			}
			const userId =
				existingUserId ??
				(
					await ctx.db
						.query("users")
						.withIndex("email", (q) => q.eq("email", email))
						.unique()
				)?._id ??
				(await ctx.db.insert("users", { email }));
			// Clicking the magic link proves the address.
			if (type === "verification") await ctx.db.patch(userId, { emailVerificationTime: Date.now() });
			return userId;
		},
	},
});
