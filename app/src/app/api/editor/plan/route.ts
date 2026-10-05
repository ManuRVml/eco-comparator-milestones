import { editorRoute } from "@/lib/api";
import { db } from "@/db/client";
import { mutarPlan } from "@/lib/workflow/planning-mutations";
export const POST = editorRoute((rol, body) => mutarPlan(db, rol, body));
export const runtime = "nodejs";
