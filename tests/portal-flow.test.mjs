import assert from "node:assert/strict";
import { spawn, execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const wrangler = join(root, "node_modules/wrangler/bin/wrangler.js");
const config = join(root, "dist/server/wrangler.json");
const migration = join(root, "drizzle/0000_furry_roland_deschain.sql");
const run = promisify(execFile);

async function availablePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test("database-backed dealer and admin flow enforces authorization", async () => {
  const stateDir = await mkdtemp(join(tmpdir(), "schoolsell-test-"));
  const environment = { ...process.env, WRANGLER_LOG_PATH: join(stateDir, "wrangler.log"), WRANGLER_SEND_METRICS: "false" };
  let child;
  try {
    await run(process.execPath, [wrangler, "d1", "execute", "dealer-approval-portal-d1", "--local", `--file=${migration}`, `--config=${config}`, `--persist-to=${stateDir}`], { cwd: root, env: environment });
    const port = await availablePort();
    child = spawn(process.execPath, [wrangler, "dev", "--local", `--config=${config}`, `--persist-to=${stateDir}`, "--ip=127.0.0.1", `--port=${port}`, "--inspector-port=0", "--var=ADMIN_EMAILS:admin@example.com"], { cwd: root, env: environment, stdio: "ignore" });
    const base = `http://127.0.0.1:${port}`;
    let homepage;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (child.exitCode !== null) throw new Error(`Worker exited with ${child.exitCode}`);
      try {
        homepage = await fetch(base);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    assert.ok(homepage, "Worker did not start within 20 seconds");
    assert.equal(homepage.status, 200);
    const html = await homepage.text();
    assert.match(html, /SchoolSell \| Dealer Approval Portal/);
    assert.match(html, /Request permission/);
    assert.doesNotMatch(html, /Your site is taking shape/);

    const adminHeaders = { "oai-authenticated-user-email": "admin@example.com" };
    assert.equal((await fetch(`${base}/api/requests`)).status, 403);
    assert.equal((await fetch(`${base}/api/requests`, { headers: { "oai-authenticated-user-email": "other@example.com" } })).status, 403);
    const invalid = await fetch(`${base}/api/requests`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ dealer: "Incomplete" }) });
    assert.equal(invalid.status, 400);

    const created = await fetch(`${base}/api/requests`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ dealer: "Northstar Learning", email: "demo@example.com", school: "Roosevelt Middle School", district: "Portland Public Schools", product: "STEM Robotics Lab", quantity: 12, reason: "Sample request for a school robotics lab." }),
    });
    assert.equal(created.status, 201);
    const { id } = await created.json();
    assert.match(id, /^REQ-[A-F0-9]{8}$/);

    const listed = await fetch(`${base}/api/requests`, { headers: adminHeaders });
    assert.equal(listed.status, 200);
    assert.equal((await listed.json()).requests[0].id, id);
    const decision = { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: "Approved" }) };
    assert.equal((await fetch(`${base}/api/requests/${id}`, decision)).status, 403);
    assert.equal((await fetch(`${base}/api/requests/${id}`, { ...decision, headers: { ...decision.headers, ...adminHeaders } })).status, 200);
    assert.equal((await fetch(`${base}/api/requests/${id}`, { ...decision, headers: { ...decision.headers, ...adminHeaders } })).status, 409);
    const updated = await fetch(`${base}/api/requests`, { headers: adminHeaders });
    assert.equal((await updated.json()).requests[0].status, "Approved");
  } finally {
    child?.kill("SIGTERM");
    await rm(stateDir, { recursive: true, force: true });
  }
});
