import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { FunctionReturnType } from "convex/server";
import { cacheLife, cacheTag } from "next/cache";

/** Favorite links for public pages, cached until Convex revalidates the `favorites` tag. */
export async function getFavorites() {
	"use cache";
	cacheLife("max");
	cacheTag("favorites");
	return fetchQuery(api.favorites.list, {});
}

export type Favorite = FunctionReturnType<typeof api.favorites.list>[number];
