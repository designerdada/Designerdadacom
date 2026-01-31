var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-tBcrX0/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/index.ts
async function validatePassword(password, hash) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return computedHash === hash;
}
__name(validatePassword, "validatePassword");
async function generateToken(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + Date.now().toString());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
__name(generateToken, "generateToken");
function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}
__name(corsHeaders, "corsHeaders");
async function getPhotosData(bucket) {
  const object = await bucket.get("photos.json");
  if (!object) {
    return { photos: [] };
  }
  const text = await object.text();
  return JSON.parse(text);
}
__name(getPhotosData, "getPhotosData");
async function savePhotosData(bucket, data) {
  await bucket.put("photos.json", JSON.stringify(data, null, 2), {
    httpMetadata: { contentType: "application/json" }
  });
}
__name(savePhotosData, "savePhotosData");
function generateId() {
  return crypto.randomUUID();
}
__name(generateId, "generateId");
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const origin = env.CORS_ORIGIN || "*";
    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    try {
      if (path === "/api/auth" && method === "POST") {
        const body = await request.json();
        const isValid = await validatePassword(body.password, env.ADMIN_PASSWORD_HASH);
        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid password" }), {
            status: 401,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        const token = await generateToken(body.password);
        return new Response(JSON.stringify({ token }), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }
      if (path === "/api/photos" && method === "GET") {
        const data = await getPhotosData(env.PHOTOS_BUCKET);
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }
      if (path === "/api/photos" && method === "POST") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        const formData = await request.formData();
        const file = formData.get("file");
        const metadata = formData.get("metadata");
        if (!file || !metadata) {
          return new Response(JSON.stringify({ error: "Missing file or metadata" }), {
            status: 400,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        const photoMetadata = JSON.parse(metadata);
        const id = generateId();
        const extension = file.name.split(".").pop() || "jpg";
        const arrayBuffer = await file.arrayBuffer();
        await env.PHOTOS_BUCKET.put(`photos/${id}/original.${extension}`, arrayBuffer, {
          httpMetadata: { contentType: file.type }
        });
        const baseUrl = env.R2_PUBLIC_URL;
        const photoPath = `photos/${id}/original.${extension}`;
        const newPhoto = {
          id,
          ...photoMetadata,
          urls: {
            thumbnail: `${baseUrl}/${photoPath}`,
            medium: `${baseUrl}/${photoPath}`,
            large: `${baseUrl}/${photoPath}`
          },
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const data = await getPhotosData(env.PHOTOS_BUCKET);
        data.photos.unshift(newPhoto);
        await savePhotosData(env.PHOTOS_BUCKET, data);
        return new Response(JSON.stringify({ photo: newPhoto }), {
          status: 201,
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }
      if (path.startsWith("/api/photos/") && method === "DELETE") {
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        const id = path.split("/").pop();
        if (!id) {
          return new Response(JSON.stringify({ error: "Missing photo ID" }), {
            status: 400,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        const data = await getPhotosData(env.PHOTOS_BUCKET);
        const photoIndex = data.photos.findIndex((p) => p.id === id);
        if (photoIndex === -1) {
          return new Response(JSON.stringify({ error: "Photo not found" }), {
            status: 404,
            headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
          });
        }
        data.photos.splice(photoIndex, 1);
        await savePhotosData(env.PHOTOS_BUCKET, data);
        const objects = await env.PHOTOS_BUCKET.list({ prefix: `photos/${id}/` });
        for (const object of objects.objects) {
          await env.PHOTOS_BUCKET.delete(object.key);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders(origin), "Content-Type": "application/json" }
      });
    }
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-tBcrX0/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-tBcrX0/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
