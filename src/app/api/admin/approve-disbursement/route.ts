import { NextResponse } from "next/server";

// Disbursements are now auto-approved when NGOs submit milestone evidence.
// Admin approval of fund releases has been removed from the platform.
export async function POST() {
  return NextResponse.json({ error: "Disbursements are now processed automatically." }, { status: 410 });
}
