"use client";

import { api } from "@convex/_generated/api";
import { useAction } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useEffect, useRef, useState } from "react";

export type LinkDetails = FunctionReturnType<typeof api.favorites.inspect>;

export type Inspection =
	| { status: "idle" }
	| { status: "loading" }
	| { status: "done"; details: LinkDetails }
	| { status: "error" };

export function isHttpUrl(value: string) {
	try {
		const { protocol, hostname } = new URL(value.trim());
		return (protocol === "https:" || protocol === "http:") && hostname.includes(".");
	} catch {
		return false;
	}
}

/**
 * Looks up a link's name and preview image shortly after it stops changing. `onDetails` runs once per
 * finished lookup; answers for a link that has since changed are dropped.
 */
export function useLinkInspection(url: string, enabled: boolean, onDetails: (details: LinkDetails) => void) {
	const inspect = useAction(api.favorites.inspect);
	const [inspection, setInspection] = useState<Inspection>({ status: "idle" });
	const latest = useRef(0);
	const onDetailsRef = useRef(onDetails);
	useEffect(() => {
		onDetailsRef.current = onDetails;
	});

	useEffect(() => {
		const request = ++latest.current;
		if (!enabled || !isHttpUrl(url)) {
			setInspection({ status: "idle" });
			return;
		}
		setInspection({ status: "loading" });
		const timer = setTimeout(async () => {
			try {
				const details = await inspect({ url: url.trim() });
				if (request !== latest.current) return;
				setInspection({ status: "done", details });
				onDetailsRef.current(details);
			} catch {
				if (request === latest.current) setInspection({ status: "error" });
			}
		}, 500);
		return () => clearTimeout(timer);
	}, [url, enabled, inspect]);

	return inspection;
}
