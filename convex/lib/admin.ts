import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export function isAdminEmail(email: string | undefined | null): boolean {
	const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
	return !!admin && !!email && email.trim().toLowerCase() === admin;
}

/** Throws unless the caller is the signed-in site author. Call at the top of every admin function. */
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
	const userId = await getAuthUserId(ctx);
	if (!userId) throw new Error("Not signed in");
	const user = await ctx.db.get(userId);
	if (!user || !isAdminEmail(user.email)) throw new Error("Not authorized");
	return user;
}
