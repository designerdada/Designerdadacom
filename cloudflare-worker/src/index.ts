export interface Env {
	PHOTOS_BUCKET: R2Bucket;
	ADMIN_PASSWORD_HASH: string;
	CORS_ORIGIN: string;
	R2_PUBLIC_URL: string;
}

interface Photo {
	id: string;
	title: string;
	description?: string;
	date: string;
	camera?: string;
	film?: string;
	location?: string;
	category: "Street" | "Portrait" | "Travel" | "Architecture" | "Other";
	aspectRatio: number;
	urls: {
		thumbnail: string;
		medium: string;
		large: string;
	};
	createdAt: string;
}

interface PhotosData {
	photos: Photo[];
}

// Simple password validation (for production, use proper JWT/session tokens)
async function validatePassword(password: string, hash: string): Promise<boolean> {
	// Simple comparison - in production use bcrypt or similar
	// For now, we'll use a simple hash comparison
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return computedHash === hash;
}

// Generate a simple session token
async function generateToken(password: string): Promise<string> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password + Date.now().toString());
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// CORS headers
function corsHeaders(origin: string): HeadersInit {
	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Allow-Credentials": "true",
	};
}

// Check if origin is allowed
function getAllowedOrigin(requestOrigin: string | null, corsOrigins: string): string {
	// Parse CORS_ORIGIN as comma-separated list of allowed origins
	const allowedOrigins = corsOrigins.split(",").map((o) => o.trim());

	// If request origin is in allowed list, return it (enables credentials)
	if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
		return requestOrigin;
	}

	// If wildcard is allowed, return wildcard
	if (allowedOrigins.includes("*")) {
		return "*";
	}

	// Default to first allowed origin
	return allowedOrigins[0] || "*";
}

// Get photos.json from R2
async function getPhotosData(bucket: R2Bucket): Promise<PhotosData> {
	const object = await bucket.get("photos.json");
	if (!object) {
		return { photos: [] };
	}
	const text = await object.text();
	return JSON.parse(text);
}

// Save photos.json to R2
async function savePhotosData(bucket: R2Bucket, data: PhotosData): Promise<void> {
	await bucket.put("photos.json", JSON.stringify(data, null, 2), {
		httpMetadata: { contentType: "application/json" },
	});
}

// Generate unique ID
function generateId(): string {
	return crypto.randomUUID();
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method;
		const requestOrigin = request.headers.get("Origin");
		const origin = getAllowedOrigin(requestOrigin, env.CORS_ORIGIN || "*");

		// Handle CORS preflight
		if (method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders(origin) });
		}

		try {
			// POST /api/auth - Authenticate admin
			if (path === "/api/auth" && method === "POST") {
				const body = (await request.json()) as { password: string };
				const isValid = await validatePassword(body.password, env.ADMIN_PASSWORD_HASH);

				if (!isValid) {
					return new Response(JSON.stringify({ error: "Invalid password" }), {
						status: 401,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				const token = await generateToken(body.password);
				return new Response(JSON.stringify({ token }), {
					headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
				});
			}

			// GET /api/photos - Get all photos (public)
			if (path === "/api/photos" && method === "GET") {
				const data = await getPhotosData(env.PHOTOS_BUCKET);
				return new Response(JSON.stringify(data), {
					headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
				});
			}

			// POST /api/photos - Upload a photo (requires auth)
			if (path === "/api/photos" && method === "POST") {
				// Check authorization
				const authHeader = request.headers.get("Authorization");
				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				// Parse multipart form data
				const formData = await request.formData();
				const file = formData.get("file") as File | null;
				const metadata = formData.get("metadata") as string | null;

				if (!file || !metadata) {
					return new Response(JSON.stringify({ error: "Missing file or metadata" }), {
						status: 400,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				const photoMetadata = JSON.parse(metadata) as Omit<Photo, "id" | "urls" | "createdAt">;
				const id = generateId();
				const extension = file.name.split(".").pop() || "jpg";

				// Upload original image
				const arrayBuffer = await file.arrayBuffer();
				await env.PHOTOS_BUCKET.put(`photos/${id}/original.${extension}`, arrayBuffer, {
					httpMetadata: { contentType: file.type },
				});

				// For now, use the same image for all sizes (resize can be done client-side or with a separate service)
				// In production, you'd want to resize images here or use Cloudflare Image Resizing
				const baseUrl = env.R2_PUBLIC_URL;
				const photoPath = `photos/${id}/original.${extension}`;

				const newPhoto: Photo = {
					id,
					...photoMetadata,
					urls: {
						thumbnail: `${baseUrl}/${photoPath}`,
						medium: `${baseUrl}/${photoPath}`,
						large: `${baseUrl}/${photoPath}`,
					},
					createdAt: new Date().toISOString(),
				};

				// Add to photos.json
				const data = await getPhotosData(env.PHOTOS_BUCKET);
				data.photos.unshift(newPhoto);
				await savePhotosData(env.PHOTOS_BUCKET, data);

				return new Response(JSON.stringify({ photo: newPhoto }), {
					status: 201,
					headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
				});
			}

			// DELETE /api/photos/:id - Delete a photo (requires auth)
			if (path.startsWith("/api/photos/") && method === "DELETE") {
				const authHeader = request.headers.get("Authorization");
				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					return new Response(JSON.stringify({ error: "Unauthorized" }), {
						status: 401,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				const id = path.split("/").pop();
				if (!id) {
					return new Response(JSON.stringify({ error: "Missing photo ID" }), {
						status: 400,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				// Remove from photos.json
				const data = await getPhotosData(env.PHOTOS_BUCKET);
				const photoIndex = data.photos.findIndex((p) => p.id === id);

				if (photoIndex === -1) {
					return new Response(JSON.stringify({ error: "Photo not found" }), {
						status: 404,
						headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
					});
				}

				data.photos.splice(photoIndex, 1);
				await savePhotosData(env.PHOTOS_BUCKET, data);

				// Delete files from R2
				const objects = await env.PHOTOS_BUCKET.list({ prefix: `photos/${id}/` });
				for (const object of objects.objects) {
					await env.PHOTOS_BUCKET.delete(object.key);
				}

				return new Response(JSON.stringify({ success: true }), {
					headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
				});
			}

			// 404 for unknown routes
			return new Response(JSON.stringify({ error: "Not found" }), {
				status: 404,
				headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
			});
		} catch (error) {
			console.error("Error:", error);
			return new Response(JSON.stringify({ error: "Internal server error" }), {
				status: 500,
				headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
			});
		}
	},
};
