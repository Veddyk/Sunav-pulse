// backend/src/__tests__/logger.test.js
//
// Unit tests for the structured JSON logger.
// Tests that log entries are well-formed and routed to the correct streams.
// ─────────────────────────────────────────────────────────────────────────────

import logger from "../logger.js";

describe("logger — development mode (human-readable)", () => {
  let stdoutSpy, stderrSpy;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    stderrSpy = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it("writes info to stdout", () => {
    logger.info("test info message");
    expect(stdoutSpy).toHaveBeenCalled();
    const written = stdoutSpy.mock.calls[0][0];
    expect(written).toContain("test info message");
    expect(written).toContain("[INFO ]");
  });

  it("writes error to stderr", () => {
    logger.error("test error message");
    expect(stderrSpy).toHaveBeenCalled();
    const written = stderrSpy.mock.calls[0][0];
    expect(written).toContain("test error message");
  });

  it("includes metadata in the output", () => {
    logger.info("request completed", { status: 200, durationMs: 42 });
    const written = stdoutSpy.mock.calls[0][0];
    expect(written).toContain("200");
    expect(written).toContain("42");
  });
});

describe("logger — production mode (JSON lines)", () => {
  let stdoutSpy;

  beforeEach(() => {
    process.env.NODE_ENV = "production";
    stdoutSpy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
    process.env.NODE_ENV = "test";
  });

  it("emits valid JSON", () => {
    logger.info("production log entry", { userId: "abc123" });
    const written = stdoutSpy.mock.calls[0][0];
    const parsed = JSON.parse(written.trim());
    expect(parsed).toHaveProperty("ts");
    expect(parsed).toHaveProperty("lvl", "info");
    expect(parsed).toHaveProperty("msg", "production log entry");
    expect(parsed).toHaveProperty("userId", "abc123");
    expect(parsed).toHaveProperty("svc", "sunav-pulse-backend");
  });

  it("ts is a valid ISO 8601 timestamp", () => {
    logger.warn("timing check");
    const written = stdoutSpy.mock.calls[0][0];
    const { ts } = JSON.parse(written.trim());
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it("does not include undefined fields", () => {
    logger.info("clean entry");
    const written = stdoutSpy.mock.calls[0][0];
    expect(written).not.toContain("undefined");
  });
});

describe("logger — all four levels exist", () => {
  it("exposes debug, info, warn, error methods", () => {
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });
});
