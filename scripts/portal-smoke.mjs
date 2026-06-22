import { spawn } from "node:child_process";

const port = process.env.PORTAL_SMOKE_PORT || "3100";
const baseUrl = `http://127.0.0.1:${port}`;
const timeoutMs = 45_000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnServer() {
  const child = spawn("npm", ["run", "dev", "--", "--port", port], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PORT: port },
  });

  child.stdout.on("data", (chunk) => process.stdout.write(chunk));
  child.stderr.on("data", (chunk) => process.stderr.write(chunk));
  return child;
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/de/login`, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // Server is still booting.
    }
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

const server = spawnServer();

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
  server.kill("SIGTERM");
}
