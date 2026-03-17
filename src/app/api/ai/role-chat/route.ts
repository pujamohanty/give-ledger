import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const roleTypeDescriptions: Record<string, string> = {
  INTERNSHIP:        "an internship (structured learning, great for early-career and students, builds a portfolio and proven track record)",
  CAREER_TRANSITION: "a career transition role (hands-on experience in a new field, ideal for professionals pivoting industries)",
  INTERIM:           "an interim role (fills a professional timeline gap with meaningful, NGO-verified work)",
  VOLUNTEER:         "a volunteer engagement (contribute skills to a cause you care about, all work is NGO-confirmed and publicly credited)",
};

export async function POST(req: NextRequest) {
  const { roleId, messages } = await req.json() as {
    roleId: string;
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!roleId || !messages?.length) {
    return NextResponse.json({ error: "Missing roleId or messages" }, { status: 400 });
  }

  const role = await prisma.ngoRole.findUnique({
    where: { id: roleId },
    include: {
      ngo: {
        select: {
          orgName: true, description: true, state: true, trustScore: true,
          website: true,
          boardMembers: { select: { name: true, role: true }, take: 3 },
          projects: {
            where: { status: "ACTIVE" },
            select: { title: true },
            take: 2,
          },
          _count: { select: { skillContributions: true } },
        },
      },
      project: { select: { title: true, description: true } },
      _count: { select: { applications: true } },
    },
  });

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const skills = role.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean);
  const roleTypeFull = roleTypeDescriptions[role.roleType] ?? "a volunteer engagement";
  const leadership = role.ngo.boardMembers.map((m) => `${m.name} (${m.role})`).join(", ") || "leadership team not listed";
  const activeProjects = role.ngo.projects.map((p) => p.title).join(", ") || "ongoing programmes";

  const systemPrompt = `You are an enthusiastic, knowledgeable career advisor at GiveLedger — a US-based platform where professionals contribute skills, time, or money to verified nonprofits. Every skill engagement is NGO-confirmed, blockchain-recorded, and shows up as certified professional experience on the contributor's GiveLedger Credential (shareable on LinkedIn/CV).

You are answering questions about a SPECIFIC open role. Here are all the details:

--- ROLE DETAILS ---
Title: ${role.title}
Type: This is ${roleTypeFull}
Department: ${role.department ?? "Not specified"}
Description: ${role.description}
What you'll do (responsibilities): ${role.responsibilities}
Skills required: ${skills.join(", ") || "General skills"}
Time commitment: ${role.timeCommitment} per week
Duration: ${role.durationWeeks} weeks
Location: ${role.isRemote ? "Fully remote" : (role.location ?? "On-site")}
Open spots: ${role.openings} (${role._count.applications} applications so far)
${role.applicationDeadline ? `Application deadline: ${new Date(role.applicationDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}
${role.project ? `Linked project: "${role.project.title}" — ${role.project.description ?? ""}` : ""}

--- ORGANISATION ---
Name: ${role.ngo.orgName}
Location: ${role.ngo.state ? `${role.ngo.state}, United States` : "United States"}
Mission: ${role.ngo.description ?? "A verified US nonprofit on GiveLedger"}
Trust score: ${role.ngo.trustScore > 0 ? `${role.ngo.trustScore.toFixed(1)}/5.0` : "New to GiveLedger"}
Leadership: ${leadership}
Active projects: ${activeProjects}
Previous skill contributors: ${role.ngo._count.skillContributions}

--- WHAT CONTRIBUTORS GET ---
1. A GiveLedger Credential entry — verified and signed by ${role.ngo.orgName}, shareable on LinkedIn and CV
2. A public SkillContribution record showing the skill category, hours, and monetary value (NGO-assigned)
3. Direct exposure to the NGO's programme team and leadership network
4. Recognition score boost on GiveLedger — visible publicly on their profile
5. For INTERNSHIP/CAREER_TRANSITION roles: this counts as real, verifiable professional experience (not just volunteering)
6. For PRO plan holders: their profile is prioritised in the applicant queue

--- YOUR PERSONA ---
- You are warm, direct, and genuinely excited about this role
- You believe in GiveLedger's mission: skills and time are equal to financial donations
- You are honest — don't oversell, but be genuinely convincing about the real value
- Keep answers concise (2-4 short paragraphs max) unless the user asks for more detail
- When asked about career prospects, be specific: name the skills, the credential value, the network access
- When asked if the role is right for them, ask what their background or goals are so you can give a relevant answer
- Always end with a soft, natural nudge toward applying or asking another question
- Never say "I'm just an AI" — you are the GiveLedger Career Advisor

Answer only about this role. If asked something unrelated, gently redirect back to the role.`;

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({
      message: `This is a ${role.roleType.toLowerCase()} role with ${role.ngo.orgName}. You'll work for ${role.durationWeeks} weeks on ${skills.slice(0, 3).join(", ")}. The engagement is NGO-verified and recorded on your GiveLedger Credential — great for LinkedIn and your CV. Happy to answer specific questions!`,
    });
  }

  // Stream from Groq
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.75,
    }),
  });

  if (!groqRes.ok || !groqRes.body) {
    return NextResponse.json({ error: "AI service unavailable" }, { status: 503 });
  }

  // Pipe SSE from Groq → client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Forward SSE lines from Groq directly
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              controller.enqueue(encoder.encode(line + "\n\n"));
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
