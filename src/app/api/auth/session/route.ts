import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readToken, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const acc = readToken(jar.get(SESSION_COOKIE)?.value);
  if (!acc) return NextResponse.json({ authenticated: false });
  return NextResponse.json({
    authenticated: true,
    role: acc.role,
    email: acc.email,
    name: acc.name,
    tenantSlug: acc.tenantSlug ?? null,
  });
}
