import {database} from "@/lib/server";
import {failure,json,preflight,publicStats} from "@/lib/analytics-core.mjs";
export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) {return preflight(request);}
export async function GET(request: Request) {
  try {return json(await publicStats(database()),200,request.headers.get("origin") || "");}
  catch (error) {return failure(error,request);}
}
