import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const [user, admin] = await Promise.all([getChatGPTUser(), getAdmin()]);
  return Response.json({ signedIn: Boolean(user), isAdmin: Boolean(admin), displayName: user?.displayName ?? null }, {
    headers: { "Cache-Control": "no-store" },
  });
}
