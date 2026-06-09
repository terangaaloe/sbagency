import { NextResponse } from "next/server";
import { getAgencies, createAgency, type CreateAgencyInput } from "@/lib/store";

// Registre volatile en mémoire → toujours rendu dynamiquement.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ agencies: getAgencies() });
}

export async function POST(req: Request) {
  let body: CreateAgencyInput;
  try {
    body = (await req.json()) as CreateAgencyInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Corps de requête invalide." }, { status: 400 });
  }

  const result = createAgency(body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }
  return NextResponse.json(result, { status: 201 });
}
