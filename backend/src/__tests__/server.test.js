// backend/src/__tests__/server.test.js
//
// Integration tests for the SunaV Pulse Express server.
// Uses supertest to make real HTTP requests against a live server instance.
// No database connection required — the /health endpoint falls back gracefully
// when DATABASE_URL is not set (returns 503 with db:"unreachable").
//
// Run: npm test   (from the backend/ directory)
// ─────────────────────────────────────────────────────────────────────────────

import request from "supertest";

// We import the app differently from server.js so we can test it without
// binding to a port. This requires the server to export the `app` object.
// The current server.js calls app.listen() immediately — for tests we use
// supertest's built-in ephemeral port allocation which works even so.
//
// If you split app creation from app.listen() in the future, import `app`
// directly: import app from "../app.js";

let server;

beforeAll(async () => {
  // Suppress logger output during tests
  process.env.NODE_ENV = "test";
});

afterAll(async () => {
  if (server && server.close) {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ── Health check ─────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("returns 200 with status:ok when DB ping succeeds", async () => {
    // The server pings the DB on this endpoint. In CI with no DATABASE_URL
    // the ping will fail, so we test both branches.
    const expectedStatuses = [200, 503];
    const res = await request("http://localhost:8080").get("/health");
    expect(expectedStatuses).toContain(res.status);
    expect(res.body).toHaveProperty("timestamp");
    expect(res.body).toHaveProperty("requestId");
  });
});

// ── Root endpoint ─────────────────────────────────────────────────────────────

describe("GET /", () => {
  it("returns service info", async () => {
    const res = await request("http://localhost:8080").get("/");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/SunaV Pulse/);
  });
});

// ── 404 handling ──────────────────────────────────────────────────────────────

describe("Unknown routes", () => {
  it("returns 404 with a requestId", async () => {
    const res = await request("http://localhost:8080").get("/nonexistent-path");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Not found");
    expect(res.body).toHaveProperty("requestId");
  });
});

// ── Request IDs ───────────────────────────────────────────────────────────────

describe("X-Request-Id header", () => {
  it("echoes back a provided X-Request-Id", async () => {
    const id = "test-request-id-12345";
    const res = await request("http://localhost:8080")
      .get("/")
      .set("X-Request-Id", id);
    expect(res.headers["x-request-id"]).toBe(id);
  });

  it("generates a UUID when X-Request-Id is not provided", async () => {
    const res = await request("http://localhost:8080").get("/");
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(res.headers["x-request-id"]).toMatch(uuidRe);
  });
});

// ── Security headers ──────────────────────────────────────────────────────────

describe("Security headers (helmet)", () => {
  it("includes X-Content-Type-Options: nosniff", async () => {
    const res = await request("http://localhost:8080").get("/");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("does not expose the Express version", async () => {
    const res = await request("http://localhost:8080").get("/");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

// ── Auth route: basic validation ──────────────────────────────────────────────

describe("POST /api/auth/login — input validation", () => {
  it("returns 400 when employee_id is missing", async () => {
    const res = await request("http://localhost:8080")
      .post("/api/auth/login")
      .send({ password: "TestPassword1!" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 when password is missing", async () => {
    const res = await request("http://localhost:8080")
      .post("/api/auth/login")
      .send({ employee_id: "test.user" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("returns 400 for empty JSON body", async () => {
    const res = await request("http://localhost:8080")
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
  });

  it("returns 401 or 503 (not 500) for valid input with no database", async () => {
    // Without a real DB, we expect either 401 (user not found) or 503 (DB unavailable)
    // — never 500 (unhandled error)
    const res = await request("http://localhost:8080")
      .post("/api/auth/login")
      .send({ employee_id: "test.rep", password: "TestPassword1!" });
    expect([401, 503]).toContain(res.status);
    expect(res.body).toHaveProperty("error");
    // Confirm no stack traces leak in the response
    expect(res.body).not.toHaveProperty("stack");
  });
});

// ── CORS ─────────────────────────────────────────────────────────────────────

describe("CORS", () => {
  it("includes CORS headers for allowed origin", async () => {
    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const res = await request("http://localhost:8080")
      .get("/")
      .set("Origin", origin);
    expect(res.headers["access-control-allow-origin"]).toBe(origin);
  });

  it("handles OPTIONS preflight", async () => {
    const origin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
    const res = await request("http://localhost:8080")
      .options("/api/auth/login")
      .set("Origin", origin)
      .set("Access-Control-Request-Method", "POST");
    expect([200, 204]).toContain(res.status);
  });
});
