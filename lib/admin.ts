import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

export async function getAdmin() {
  const user = await getChatGPTUser();
  if (!user) return null;
  const configured = (env as typeof env & { ADMIN_EMAILS?: string }).ADMIN_EMAILS ?? "";
  const allowed = configured.split(",").map((email) => email.trim().toLowerCase());
  return allowed.includes(user.email.toLowerCase()) ? user : null;
}
