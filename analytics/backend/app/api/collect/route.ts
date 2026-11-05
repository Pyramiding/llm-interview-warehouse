import {database} from "@/lib/server";
import {collect, failure, json, preflight, requireCollector, smallJson} from "@/lib/analytics-core.mjs";
export const dynamic = "force-dynamic";
export function OPTIONS(request: Request) {return preflight(request);}
export async function POST(request: Request) {
  try {requireCollector(request); return json(await collect(request,database(),await smallJson(request)),200,request.headers.get("origin") || "");}
  catch (error) {return failure(error,request);}
}
