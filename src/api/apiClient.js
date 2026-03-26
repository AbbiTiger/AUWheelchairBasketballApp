/**
 * apiClient.js
 * Replaces @base44/sdk — all requests now go to your own Azure Functions
 * (or any backend you wire up). The base URL reads from a Vite env variable
 * so you never hard-code it.
 *
 * VITE_API_BASE_URL examples:
 *   local dev  → http://localhost:7071/api
 *   Azure SWA  → /api   (SWA proxies /api/* to your Function App automatically)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------
async function request(method, path, body) {
  const headers = { "Content-Type": "application/json" };

  // If you add auth later (e.g. Azure AD / MSAL), attach the bearer token here:
  // const token = localStorage.getItem("access_token");
  // if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

// ---------------------------------------------------------------------------
// Generic entity factory — mirrors the base44 entity API surface:
//   Entity.list(sort?)           GET /entities?sort=…
//   Entity.filter(where)         GET /entities?field=value&…
//   Entity.get(id)               GET /entities/:id
//   Entity.create(data)          POST /entities
//   Entity.update(id, data)      PUT /entities/:id
//   Entity.delete(id)            DELETE /entities/:id
// ---------------------------------------------------------------------------
function makeEntity(resource) {
  const base = `/${resource}`;

  return {
    /**
     * List all records, optionally sorted.
     * @param {string} [sort] - field name; prefix with "-" for DESC  e.g. "-date"
     */
    list(sort) {
      const qs = sort ? `?sort=${encodeURIComponent(sort)}` : "";
      return request("GET", `${base}${qs}`);
    },

    /**
     * Filter records by field equality.
     * @param {Record<string,string>} where - e.g. { game_id: "abc123" }
     */
    filter(where) {
      const qs = new URLSearchParams(where).toString();
      return request("GET", `${base}?${qs}`);
    },

    /**
     * Fetch a single record by id.
     */
    get(id) {
      return request("GET", `${base}/${id}`);
    },

    /**
     * Create a new record.
     */
    create(data) {
      return request("POST", base, data);
    },

    /**
     * Update an existing record (partial update).
     */
    update(id, data) {
      return request("PUT", `${base}/${id}`, data);
    },

    /**
     * Delete a record.
     */
    delete(id) {
      return request("DELETE", `${base}/${id}`);
    },
  };
}

// ---------------------------------------------------------------------------
// Named entities — drop-in replacements for base44.entities.*
// ---------------------------------------------------------------------------
export const api = {
  entities: {
    Game:   makeEntity("games"),
    Player: makeEntity("players"),
    Event:  makeEntity("events"),
  },
};

// Default export for convenience (matches old `import { base44 } from …` pattern
// — just change the import alias in each page file)
export default api;
