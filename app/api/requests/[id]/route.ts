import { env } from "cloudflare:workers";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "Administrator access required." }, { status: 403 });
  const { id } = await context.params;
  if (!/^REQ-[A-F0-9]{8}$/.test(id)) return Response.json({ error: "Invalid request ID." }, { status: 400 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON." }, { status: 400 }); }
  const status = (body as { status?: unknown } | null)?.status;
  if (status !== "Approved" && status !== "Denied") {
    return Response.json({ error: "Choose Approve or Deny." }, { status: 400 });
  }

  try {
    const result = await env.DB.prepare(
      "UPDATE dealer_requests SET status = ?, decided_at = ?, decided_by = ? WHERE id = ? AND status = 'Pending'"
    ).bind(status, Date.now(), admin.email, id).run();
    if (result.meta.changes !== 1) {
      return Response.json({ error: "Request not found or already decided. Refresh and try again." }, { status: 409 });
    }
    return Response.json({ id, status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Failed to update dealer request", error);
    return Response.json({ error: "Decision could not be saved. Please try again." }, { status: 503 });
  }
}
