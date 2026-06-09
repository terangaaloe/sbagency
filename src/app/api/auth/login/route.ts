import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyCredentials, createToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const acc = verifyCredentials(body.email || "", body.password || "");
  if (!acc) {
    return NextResponse.json({ ok: false, error: "E-mail ou mot de passe incorrect." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createToken(acc.email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return NextResponse.json({ ok: true, role: acc.role, email: acc.email, name: acc.name, tenantSlug: acc.tenantSlug ?? null });
}
