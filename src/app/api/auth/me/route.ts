import { NextResponse } from "next/server";
import { resolveUser } from "@/lib/auth-server";

export async function GET() {
  const user = await resolveUser();
  if (!user) {
    return NextResponse.json({ message: "Oturum yok." }, { status: 401 });
  }
  return NextResponse.json(user);
}
