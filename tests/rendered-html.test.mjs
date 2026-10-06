import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import test from "node:test";

async function availablePort() {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test("production server renders the dealer request flow, not the starter", async () => {
  const port = await availablePort();
  const child = spawn("pnpm", ["exec", "vinext", "start", "--port", String(port), "--hostname", "127.0.0.1"], {
    cwd: new URL("../", import.meta.url),
    stdio: "ignore",
  });

  try {
    let response;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (child.exitCode !== null) throw new Error(`Production server exited with ${child.exitCode}`);
      try {
        response = await fetch(`http://127.0.0.1:${port}/`, { headers: { accept: "text/html" } });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
    assert.ok(response, "Production server did not start within 15 seconds");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

    const html = await response.text();
    assert.match(html, /SchoolSell \| Dealer Approval Portal/);
    assert.match(html, /Dealer portal/);
    assert.match(html, /Admin review/);
    assert.match(html, /Request permission/);
    assert.match(html, /to sell to a school\./);
    assert.match(html, /<form\b/i);
    assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
  } finally {
    child.kill("SIGTERM");
  }
});
