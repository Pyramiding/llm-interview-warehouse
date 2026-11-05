import {env} from "cloudflare:workers";
import {getChatGPTUser} from "@/app/chatgpt-auth";
import {isOwner} from "./analytics-core.mjs";

export function database(): D1Database {
  if (!env.DB) throw new Error("Database unavailable");
  return env.DB;
}
export async function ownerAccess() {
  const user = await getChatGPTUser();
  return {user, allowed:isOwner(user, env.ANALYTICS_OWNER_EMAIL)};
}
