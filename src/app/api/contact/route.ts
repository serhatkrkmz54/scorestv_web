import { NextResponse, type NextRequest } from "next/server";
import { backendJson } from "@/lib/backend";

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export async function POST(req: NextRequest) {
  let payload: ContactPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const name = (payload.name ?? "").trim();
  const email = (payload.email ?? "").trim();
  const subject = (payload.subject ?? "").trim();
  const message = (payload.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ message: "Eksik alan." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Geçersiz e-posta." }, { status: 400 });
  }

  const r = await backendJson("/api/v1/contact", {
    method: "POST",
    body: JSON.stringify({
      name: name.slice(0, 120),
      email: email.slice(0, 180),
      subject: subject.slice(0, 160),
      message: message.slice(0, 4000),
    }),
  });

  return NextResponse.json(
    r.body ?? { message: r.ok ? "ok" : "Sunucuya ulaşılamıyor." },
    { status: r.ok ? 200 : r.status },
  );
}
