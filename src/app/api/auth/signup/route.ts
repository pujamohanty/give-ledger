import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json() as {
    name: string;
    email: string;
    password: string;
    role?: "DONOR" | "NGO";
  };

  // Basic validation
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  // Check for existing account
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try signing in instead." },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: role === "NGO" ? "NGO" : "DONOR",
      emailVerified: new Date(), // mark verified on creation for credentials users
    },
  });

  return NextResponse.json({ ok: true });
}
