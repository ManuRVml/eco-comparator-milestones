import { editorRoute } from "@/lib/api";
import { db } from "@/db/client";
import { mutarContrato } from "@/lib/milestone-contract/mutations";
export const POST = editorRoute((rol, body) => mutarContrato(db, rol, body));
export const runtime = "nodejs";
