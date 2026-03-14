import { NextRequest, NextResponse } from "next/server";

// DEV-ONLY route — sets a test session cookie and redirects to the portal
// Test session tokens are pre-created in the DB by the test setup script

const TEST_SESSIONS: Record<string, { token: string; redirect: string }> = {
  donor: {
    token: "test-donor-priya-abc123",   // priya.sharma@gmail.com (DONOR)
    redirect: "/donor/dashboard",
  },
  donor2: {
    token: "test-donor-sarah-abc456",  // sarah.mitchell@gmail.com (DONOR)
    redirect: "/donor/dashboard",
  },
  ngo: {
    token: "test-ngo-water-abc789",    // david.ochieng@waterbridge.ke (NGO - WaterBridge Kenya)
    redirect: "/ngo/dashboard",
  },
  ngo2: {
    token: "test-ngo-prag-abcdef",     // anjali.krishnan@pragati.org (NGO - Pragati Foundation)
    redirect: "/ngo/dashboard",
  },
  admin: {
    token: "test-admin-platform-abcd", // platform@giveledger.com (ADMIN)
    redirect: "/admin/dashboard",
  },
};

export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? "donor";
  const session = TEST_SESSIONS[role];

  if (!session) {
    return NextResponse.json(
      { error: "Unknown role. Use: donor, donor2, ngo, ngo2, admin" },
      { status: 400 }
    );
  }

  const res = NextResponse.redirect(new URL(session.redirect, req.url));

  res.cookies.set("authjs.session-token", session.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    // No maxAge = session cookie (clears on browser close)
  });

  return res;
}
