import { spawn } from "node:child_process";

const port = process.env.PORTAL_SMOKE_PORT || "3100";
const configuredBaseUrl = process.env.PORTAL_SMOKE_BASE_URL?.replace(/\/$/, "");
const defaultBaseUrl = `http://127.0.0.1:${port}`;
const existingDevBaseUrl = "http://127.0.0.1:3000";
const timeoutMs = 45_000;
let baseUrl = configuredBaseUrl || defaultBaseUrl;

if (!/^\d+$/.test(port)) {
  throw new Error(`PORTAL_SMOKE_PORT must be numeric, received ${port}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnServer() {
  if (configuredBaseUrl) return null;

  const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
  const args = process.platform === "win32"
    ? ["/d", "/s", "/c", `pnpm exec next dev --port ${port}`]
    : ["exec", "next", "dev", "--port", port];

  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: port },
    detached: process.platform !== "win32",
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

function waitForExit(child, timeout = 5_000) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(resolve, timeout);
    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function stopServer(child) {
  if (!child) return;

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
        stdio: "ignore",
      }).once("exit", resolve);
    });
    await waitForExit(child);
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }

  await waitForExit(child);

  if (child.exitCode === null && child.signalCode === null) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
    await waitForExit(child);
  }
}

async function isReady(url) {
  try {
    const response = await fetch(`${url}/de/login`, { redirect: "manual" });
    return response.status === 200;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isReady(baseUrl)) return;
    await sleep(750);
  }
  throw new Error(`Server did not become ready on ${baseUrl}`);
}

async function expectStatus(path, expected, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
  if (response.status !== expected) {
    throw new Error(`${path} expected ${expected}, received ${response.status}`);
  }
  return response;
}

if (!configuredBaseUrl && baseUrl !== existingDevBaseUrl && await isReady(existingDevBaseUrl)) {
  baseUrl = existingDevBaseUrl;
}

const server = await isReady(baseUrl) ? null : spawnServer();

try {
  await waitForServer();
  await expectStatus("/de/login", 200);

  const portal = await expectStatus("/de/portal", 307);
  const location = portal.headers.get("location") || "";
  if (!location.includes("/de/login")) {
    throw new Error(`/de/portal should redirect to login, got ${location}`);
  }

  await expectStatus("/api/portal/files/does-not-exist", 401);
  await expectStatus("/api/portal/projects/does-not-exist/export?type=final", 401);

  console.log("Portal smoke tests passed.");
} finally {
  await stopServer(server);
}
