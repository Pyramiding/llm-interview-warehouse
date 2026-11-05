import {database} from "@/lib/server";
import {failure, issueChallenge, json, preflight} from "@/lib/analytics-core.mjs";
export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) {return preflight(request);}
export async function POST(request: Request) {
  try {return json(await issueChallenge(request,database()),200,request.headers.get("origin") || "");}
  catch (error) {return failure(error,request);}
}
