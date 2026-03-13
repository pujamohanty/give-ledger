/**
 * Groq proxy for PageAgent
 *
 * PageAgent runs in the browser and needs an OpenAI-compatible endpoint.
 * This route acts as a server-side proxy so the GROQ_API_KEY never reaches
 * the client.  Only authenticated users (valid session) can use it.
 *
 * PageAgent calls: POST /api/ai-proxy   (baseURL = "/api/ai-proxy")
 * which resolves to POST /api/ai-proxy  → forwarded to Groq's chat/completions.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GROQ_BASE = "https://api.groq.com/openai/v1";

// PageAgent appends /chat/completions to baseURL — handle both
// POST /api/ai-proxy            (if PageAgent sends here)
// POST /api/ai-proxy/...        (catch-all handled by Next.js routing)
export async function POST(req: NextRequest) {
  // Auth guard — only sessions can use this proxy
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI assistant not configured (GROQ_API_KEY missing)" },
      { status: 503 }
    );
  }

  // Determine the Groq endpoint from the incoming request path
  const url = new URL(req.url);
  const pathSuffix = url.pathname.replace(/^\/api\/ai-proxy\/?/, "") || "chat/completions";
  const groqUrl = `${GROQ_BASE}/${pathSuffix}`;

  const body = await req.text();

  const groqRes = await fetch(groqUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  // Transparently stream the response back (handles both streaming and non-streaming)
  return new Response(groqRes.body, {
    status: groqRes.status,
    headers: {
      "Content-Type": groqRes.headers.get("Content-Type") ?? "application/json",
      "Transfer-Encoding": groqRes.headers.get("Transfer-Encoding") ?? "",
    },
  });
}
