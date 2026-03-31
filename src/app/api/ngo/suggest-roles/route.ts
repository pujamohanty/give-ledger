import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const NTEE_CATEGORIES: Record<string, string> = {
  A: "Arts & Culture", B: "Education", C: "Environment", D: "Animal-Related",
  E: "Health Care", F: "Mental Health", G: "Disease & Medical Research", H: "Medical Research",
  I: "Crime & Legal Services", J: "Employment & Job Training", K: "Food & Agriculture",
  L: "Housing & Shelter", M: "Public Safety", N: "Recreation & Sports", O: "Youth Development",
  P: "Human Services", Q: "International Affairs", R: "Civil Rights & Advocacy",
  S: "Community Improvement", T: "Philanthropy & Grantmaking", U: "Science & Technology",
  V: "Social Science Research", W: "Public & Societal Benefit", X: "Religion",
  Y: "Mutual Benefit", Z: "Other",
};

function nteeLabel(code?: string | null): string {
  if (!code) return "Human Services";
  return NTEE_CATEGORIES[code.charAt(0).toUpperCase()] ?? "Nonprofit Services";
}

function orgSizeLabel(revenue?: number | null): string {
  if (!revenue) return "small";
  if (revenue >= 50_000_000) return "large ($50M+ revenue)";
  if (revenue >= 5_000_000) return "mid-size ($5M–$50M revenue)";
  if (revenue >= 500_000) return "growing ($500K–$5M revenue)";
  return "small (under $500K revenue)";
}

interface GeneratedRole {
  title: string;
  description: string;
  skills: string;
  roleType: "VOLUNTEER" | "INTERNSHIP" | "CAREER_TRANSITION" | "INTERIM";
  timeCommitment: string;
  salaryMin?: number;
  salaryMax?: number;
  isAiAugmented: boolean;
  aiTools?: string;
}

export async function POST(req: NextRequest) {
  const { ein } = await req.json() as { ein: string };
  if (!ein) return NextResponse.json({ error: "Missing ein" }, { status: 400 });

  const cleanEin = ein.replace(/-/g, "").trim();

  // Return cached roles if still valid
  const now = new Date();
  const cached = await prisma.suggestedRole.findMany({
    where: { ein: cleanEin, expiresAt: { gt: now } },
    orderBy: [{ isAiAugmented: "asc" }, { generatedAt: "desc" }],
  });
  if (cached.length >= 3) {
    return NextResponse.json({ roles: cached, cached: true });
  }

  // Fetch org context
  const irsOrg = await prisma.irsOrganization.findUnique({ where: { ein: cleanEin } });
  const ngo = await prisma.ngo.findFirst({
    where: { ein: cleanEin },
    select: { description: true, orgName: true },
  });

  const orgName = irsOrg?.name ?? ngo?.orgName ?? "This nonprofit";
  const ntee = nteeLabel(irsOrg?.nteeCode);
  const revenue = irsOrg?.revenueAmount ? Number(irsOrg.revenueAmount) : null;
  const sizeLabel = orgSizeLabel(revenue);
  const state = irsOrg?.state ?? "United States";
  const description = ngo?.description ?? "";

  const groqKey = process.env.GROQ_API_KEY;
  let generated: GeneratedRole[] = [];

  if (groqKey) {
    const prompt = `You are an expert nonprofit HR consultant with deep knowledge of how AI tools (Claude, Gemini, ChatGPT, Perplexity) are changing who can do specialist work.

Based on the nonprofit below, generate exactly 8 role profiles in two groups:

GROUP 1 — 5 standard roles that require domain expertise (grant writers, programme managers, etc.)
GROUP 2 — 3 AI-Augmented Universal Skill roles: roles specifically designed for generalists who use AI tools to cross domain barriers. These are remote-first, flexible roles that would NOT normally be accessible to someone without specialist credentials — but become accessible with AI fluency. Think: someone who has never written a grant before but can use Claude to research, structure and draft one; or someone with no legal background who can use AI to review compliance documents.

Organization: ${orgName}
Mission area: ${ntee}
Organization size: ${sizeLabel}
State: ${state}
${description ? `About: ${description}` : ""}

Return ONLY a valid JSON array (no explanation, no markdown) with exactly 8 objects total. Each object must have:
- "title": job title (string, max 60 chars)
- "description": 2-sentence role overview. For AI-augmented roles, explicitly state what AI enables the person to do.
- "skills": comma-separated skill tags, 3-6 tags. For AI-augmented roles, include the AI tool as a skill e.g. "Claude AI,Research,Writing"
- "roleType": one of "VOLUNTEER", "INTERNSHIP", "CAREER_TRANSITION", "INTERIM"
- "timeCommitment": e.g. "10 hours/week" or "Full-time"
- "isAiAugmented": false for group 1, true for group 2
- "aiTools": for AI-augmented roles only, comma-sep string of recommended tools e.g. "Claude,Gemini" — omit for standard roles
- "salaryMin": annual USD integer for paid roles only — omit for volunteer/internship
- "salaryMax": annual USD integer for paid roles only — omit for volunteer/internship

Rules:
- All AI-Augmented roles must be fully remote and flexible
- AI-Augmented roles should have timeCommitment of 5-15 hours/week (accessible alongside a day job)
- AI-Augmented roles should state clearly in the description that "no prior specialist experience required — AI fluency is the core qualification"
- Standard roles should include at least 1 paid staff role realistic for this org size
- Salary ranges should be realistic for US nonprofits`;

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          stream: false,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1800,
          temperature: 0.7,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json() as { choices?: { message?: { content?: string } }[] };
        const raw = data?.choices?.[0]?.message?.content ?? "";
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]) as GeneratedRole[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            generated = parsed.slice(0, 8);
          }
        }
      }
    } catch {
      // fall through to fallback
    }
  }

  if (generated.length === 0) {
    generated = buildFallbackRoles(ntee, revenue);
  }

  // Delete stale cache
  await prisma.suggestedRole.deleteMany({ where: { ein: cleanEin } });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const created = await Promise.all(
    generated.map((r) =>
      prisma.suggestedRole.create({
        data: {
          ein: cleanEin,
          title: r.title,
          description: r.description,
          skills: r.skills,
          roleType: r.roleType,
          timeCommitment: r.timeCommitment,
          salaryMin: r.salaryMin ?? null,
          salaryMax: r.salaryMax ?? null,
          isAiAugmented: r.isAiAugmented,
          aiTools: r.aiTools ?? null,
          source: groqKey ? "AI" : "TEMPLATE",
          expiresAt,
        },
      })
    )
  );

  return NextResponse.json({ roles: created, cached: false });
}

function buildFallbackRoles(ntee: string, revenue: number | null): GeneratedRole[] {
  const isPaid = (revenue ?? 0) > 500_000;
  const standard: GeneratedRole[] = [
    {
      title: "Volunteer Programme Coordinator",
      description: `Support volunteer coordination across ${ntee} programmes. Help onboard, schedule, and recognise contributor efforts.`,
      skills: "Volunteer Management,Scheduling,Communication,Google Workspace",
      roleType: "VOLUNTEER",
      timeCommitment: "8 hours/week",
      isAiAugmented: false,
    },
    {
      title: "Fundraising & Grants Intern",
      description: `Research grant opportunities and support proposal writing for ${ntee} projects. Gain hands-on nonprofit fundraising experience.`,
      skills: "Grant Writing,Research,Microsoft Word,Nonprofit Finance",
      roleType: "INTERNSHIP",
      timeCommitment: "15 hours/week",
      isAiAugmented: false,
    },
    {
      title: "Social Media Manager",
      description: `Create and manage content across social platforms for this ${ntee} organisation. Grow community engagement and digital presence.`,
      skills: "Social Media,Content Strategy,Canva,Copywriting",
      roleType: "CAREER_TRANSITION",
      timeCommitment: "10 hours/week",
      isAiAugmented: false,
    },
    {
      title: "Data & Impact Analyst",
      description: `Analyse programme data and prepare impact reports for donors and the board. Support evidence-based decision-making across ${ntee} initiatives.`,
      skills: "Data Analysis,Excel,Impact Measurement,Google Sheets",
      roleType: "CAREER_TRANSITION",
      timeCommitment: "10 hours/week",
      isAiAugmented: false,
    },
    {
      title: isPaid ? "Programme Manager" : "Website & Digital Volunteer",
      description: isPaid
        ? `Lead day-to-day delivery of ${ntee} programmes, manage budgets and coordinate staff. Report on outcomes and milestones to senior leadership.`
        : `Maintain and improve the organisation's digital presence to support ${ntee} outreach. Assist with content updates, SEO, and UX improvements.`,
      skills: isPaid ? "Programme Management,Budget Management,Stakeholder Engagement" : "Web Development,WordPress,SEO,HTML/CSS",
      roleType: "CAREER_TRANSITION",
      timeCommitment: isPaid ? "Full-time" : "5 hours/week",
      salaryMin: isPaid ? 52000 : undefined,
      salaryMax: isPaid ? 72000 : undefined,
      isAiAugmented: false,
    },
  ];

  const aiAugmented: GeneratedRole[] = [
    {
      title: "AI-Assisted Grant Researcher",
      description: `Use Claude or ChatGPT to research funding opportunities, analyse grant criteria, and draft initial proposals for this ${ntee} organisation. No prior grant writing experience required — AI fluency is the core qualification.`,
      skills: "Claude AI,Grant Research,Writing,Prompting",
      roleType: "VOLUNTEER",
      timeCommitment: "6 hours/week",
      isAiAugmented: true,
      aiTools: "Claude,ChatGPT",
    },
    {
      title: "AI-Powered Content Creator",
      description: `Use Gemini or Claude to generate, edit, and repurpose mission-driven content across blogs, newsletters, and social media for this ${ntee} organisation. No marketing degree required — strong prompting skills and a good editorial eye are all you need.`,
      skills: "Gemini AI,Content Creation,Editing,Social Media",
      roleType: "INTERNSHIP",
      timeCommitment: "5 hours/week",
      isAiAugmented: true,
      aiTools: "Gemini,Claude",
    },
    {
      title: "AI-Augmented Impact Report Analyst",
      description: `Use AI tools to synthesise programme data, generate narrative impact summaries, and format donor-ready reports for this ${ntee} organisation. No data science background required — comfort with AI analysis tools is the entry point.`,
      skills: "Claude AI,Data Interpretation,Report Writing,Prompting",
      roleType: "CAREER_TRANSITION",
      timeCommitment: "8 hours/week",
      isAiAugmented: true,
      aiTools: "Claude,ChatGPT,Perplexity",
    },
  ];

  return [...standard, ...aiAugmented];
}
