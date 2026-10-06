import { env } from "cloudflare:workers";
import { getAdmin } from "@/lib/admin";
import { parseRequestInput } from "@/lib/request-model";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getAdmin()) return Response.json({ error: "Administrator access required." }, { status: 403 });
  try {
    const result = await env.DB.prepare(
      "SELECT id, dealer, email, school, district, product, quantity, reason, submitted_at AS submittedAt, status, decided_at AS decidedAt FROM dealer_requests ORDER BY submitted_at DESC LIMIT 200"
    ).all();
    return Response.json({ requests: result.results }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to load dealer requests", error);
    return Response.json({ error: "Requests are temporarily unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  if (body.length > 8000) return Response.json({ error: "Request is too large." }, { status: 413 });
  let parsed: unknown;
  try { parsed = JSON.parse(body); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const input = parseRequestInput(parsed);
  if (!input) return Response.json({ error: "Please check all required fields." }, { status: 400 });

  const id = `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const submittedAt = Date.now();
  try {
    await env.DB.prepare(
      "INSERT INTO dealer_requests (id, dealer, email, school, district, product, quantity, reason, submitted_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')"
    ).bind(id, input.dealer, input.email, input.school, input.district, input.product, input.quantity, input.reason, submittedAt).run();
    return Response.json({ id, status: "Pending" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to save dealer request", error);
    return Response.json({ error: "Your request could not be saved. Please try again." }, { status: 503 });
  }
}
