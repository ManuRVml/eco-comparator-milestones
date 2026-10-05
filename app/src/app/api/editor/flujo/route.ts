import { editorRoute } from "@/lib/api";
import { db } from "@/db/client";
import { mutarTarea } from "@/lib/workflow/task-mutations";
export const POST = editorRoute((rol, body) => mutarTarea(db, rol, body));
export const runtime = "nodejs";
