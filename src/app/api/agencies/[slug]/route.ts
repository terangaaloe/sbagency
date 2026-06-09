import { NextResponse } from "next/server";
import { updateAgency, type UpdateAgencyInput } from "@/lib/store";

export const dynamic = "force-dynamic";

// PATCH /api/agencies/{slug} — met à jour un partenaire (ex. activer/désactiver
// la page publique). Persisté dans le registre serveur → la landing
// {slug}.domaine reflète immédiatement l'état (404 neutre si désactivée).
export async function PATCH(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let body: UpdateAgencyInput;
  try {
    body = (await req.json()) as UpdateAgencyInput;
  } catch {
    return NextResponse.json({ ok: false, error: "Corps de requête invalide." }, { status: 400 });
  }

  const result = updateAgency(slug, body);
  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }
  return NextResponse.json(result);
}
