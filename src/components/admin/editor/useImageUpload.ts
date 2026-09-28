"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useCallback } from "react";

/** Uploads a file to Convex storage and returns its storage ID. */
export function useStorageUpload() {
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	return useCallback(
		async (file: File) => {
			const url = await generateUploadUrl();
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});
			if (!res.ok) throw new Error("Upload failed");
			const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
			return storageId;
		},
		[generateUploadUrl],
	);
}

/** Uploads an image for use inside an article body and returns its public URL. */
export function useArticleImageUpload(articleId: Id<"articles">) {
	const uploadToStorage = useStorageUpload();
	const saveImage = useMutation(api.files.saveImage);
	return useCallback(
		async (file: File) => saveImage({ storageId: await uploadToStorage(file), articleId }),
		[uploadToStorage, saveImage, articleId],
	);
}
