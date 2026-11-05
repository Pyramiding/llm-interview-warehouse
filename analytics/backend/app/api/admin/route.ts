import {database, ownerAccess} from "@/lib/server";
import {adminData,failure,json,parseLogQuery} from "@/lib/analytics-core.mjs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const access = await ownerAccess();
    if (!access.allowed) return json({error:access.user ? "forbidden" : "authentication_required"},access.user ? 403 : 401);
    return json(await adminData(database(),parseLogQuery(request.url)));
  } catch (error) {return failure(error,request);}
}
