"use client";

import type { Id } from "@convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { ArticleEditor } from "./ArticleEditor";

export function EditArticleRoute() {
	const { id } = useParams<{ id: string }>();
	// Remount per article so editor state never leaks between documents.
	return <ArticleEditor key={id} id={id as Id<"articles">} />;
}
