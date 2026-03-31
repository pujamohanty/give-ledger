import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// NAICS prefix → sector label for prompt context
const NAICS_SECTORS: Record<string, string> = {
  "5415": "Technology & Software",
  "5112": "Technology & Software",
  "5182": "Technology & Software",
  "5418": "Marketing & Advertising",
  "5221": "Financial Services",
  "5231": "Financial Services",
  "5241": "Insurance & Financial Services",
  "6211": "Healthcare",
  "6212": "Healthcare",
  "6216": "Home Health Care",
  "5411": "Legal Services",
  "6113": "Education",
  "6114": "Education & Training",
  "5312": "Real Estate",
  "5313": "Real Estate",
  "5613": "HR & Staffing",
  "4841": "Logistics & Supply Chain",
  "4922": "Logistics & Delivery",
  "5151": "Media & Entertainment",
  "5191": "Digital Media & Information",
  "4541": "E-commerce & Retail",
  "5416": "Professional & Management Consulting",
  "5412": "Accounting & Financial Services",
};

function sectorFromNaics(naicsPrimary?: string | null): string {
  if (!naicsPrimary) return "Technology & Software";
  const prefix4 = naicsPrimary.slice(0, 4);
  const prefix3 = naicsPrimary.slice(0, 3);
  return NAICS_SECTORS[prefix4] ?? NAICS_SECTORS[prefix3] ?? "Professional Services";
}

interface GeneratedRole {
  title: string;
  description: string;
  skills: string;
  timeCommitment: string;
  salaryMin?: number;
  salaryMax?: number;
  isAiAugmented: boolean;
  aiTools?: string;
}

export async function POST(req: NextRequest) {
  const { companyId } = await req.json() as { companyId: string };
  if (!companyId) return NextResponse.json({ error: "Missing companyId" }, { status: 400 });

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  // Return cached roles if still valid
  const now = new Date();
  const cached = await prisma.companySuggestedRole.findMany({
    where: { companyId, expiresAt: { gt: now } },
    orderBy: [{ isAiAugmented: "asc" }, { generatedAt: "desc" }],
  });
  if (cached.length >= 3) {
    return NextResponse.json({ roles: cached, cached: true });
  }

  const sector = sectorFromNaics(company.naicsPrimary);
  const companyName = company.dbaName ?? company.legalName;
  const state = company.state ?? "United States";
  const entityType = company.entityStructure ?? company.businessTypes[0] ?? "company";
  const sbaLabels = company.sbaDesignations.join(", ");

  const groqKey = process.env.GROQ_API_KEY;
  let generated: GeneratedRole[] = [];

  if (groqKey) {
    const prompt = `You are an expert HR consultant who specialises in how AI tools (Claude, Gemini, ChatGPT, Perplexity) are changing which roles are accessible to generalist professionals.

Based on the company below, generate exactly 8 role profiles in two groups:

GROUP 1 — 5 standard roles that the company would typically hire for in their sector
GROUP 2 — 3 AI-Augmented roles: roles specifically designed for generalists who use AI tools to cross domain barriers. These should be roles that traditionally required a specialist degree or years of experience, but AI tools make them accessible to smart, motivated generalists.

Company: ${companyName}
Sector: ${sector}
Entity type: ${entityType}
State: ${state}${sbaLabels ? `\nDesignations: ${sbaLabels}` : ""}
${company.naicsDescription ? `Primary business: ${company.naicsDescription}` : ""}

Return ONLY a valid JSON array (no explanation, no markdown) with exactly 8 objects. Each object must have:
- "title": job title (string, max 60 chars)
- "description": 2-sentence overview. For AI-augmented roles, explicitly say what the AI tool enables the person to do.
- "skills": comma-separated skill tags, 3-6 tags. AI-augmented roles must include the AI tool as a skill.
- "timeCommitment": e.g. "Full-time", "Part-time 20h/week", "Contract 6 months"
- "isAiAugmented": false for group 1, true for group 2
- "aiTools": for AI-augmented roles only, comma-sep string e.g. "Claude,Perplexity" — omit for standard roles
- "salaryMin": annual USD integer — realistic for this sector and state
- "salaryMax": annual USD integer

Rules:
- Standard roles must be realistic for a company in ${sector} in ${state}
- AI-Augmented roles should state clearly that "no prior specialist experience required — AI fluency is the core qualification"
- All salary ranges must be realistic US market rates for 2025-2026
- AI-Augmented roles should be accessible alongside learning — part-time or contract preferred`;

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
    generated = buildFallbackRoles(sector);
  }

  // Delete stale cache
  await prisma.companySuggestedRole.deleteMany({ where: { companyId } });

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const created = await Promise.all(
    generated.map((r) =>
      prisma.companySuggestedRole.create({
        data: {
          companyId,
          title: r.title,
          description: r.description,
          skills: r.skills,
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

function buildFallbackRoles(sector: string): GeneratedRole[] {
  const standard: GeneratedRole[] = [
    {
      title: "Operations Coordinator",
      description: `Support day-to-day operations across ${sector} teams. Coordinate schedules, manage communications, and ensure smooth workflow.`,
      skills: "Operations,Project Management,Communication,Google Workspace",
      timeCommitment: "Full-time",
      salaryMin: 45000,
      salaryMax: 62000,
      isAiAugmented: false,
    },
    {
      title: "Marketing & Content Specialist",
      description: `Create and manage content across digital channels for this ${sector} company. Grow brand awareness and generate qualified leads.`,
      skills: "Content Marketing,SEO,Social Media,Copywriting",
      timeCommitment: "Full-time",
      salaryMin: 50000,
      salaryMax: 70000,
      isAiAugmented: false,
    },
    {
      title: "Customer Success Manager",
      description: `Own the customer relationship post-sale, ensuring clients get maximum value. Drive renewals, expansions, and referrals.`,
      skills: "Customer Success,CRM,Communication,Problem Solving",
      timeCommitment: "Full-time",
      salaryMin: 55000,
      salaryMax: 80000,
      isAiAugmented: false,
    },
    {
      title: "Data & Reporting Analyst",
      description: `Analyse business performance data and produce clear, actionable reports for leadership. Own dashboards and KPI tracking.`,
      skills: "Data Analysis,Excel,SQL,Business Intelligence",
      timeCommitment: "Full-time",
      salaryMin: 60000,
      salaryMax: 85000,
      isAiAugmented: false,
    },
    {
      title: "Business Development Representative",
      description: `Identify and qualify new business opportunities in ${sector}. Conduct outreach, book discovery calls, and feed a healthy sales pipeline.`,
      skills: "Sales,CRM,Prospecting,Communication",
      timeCommitment: "Full-time",
      salaryMin: 50000,
      salaryMax: 75000,
      isAiAugmented: false,
    },
  ];

  const aiAugmented: GeneratedRole[] = [
    {
      title: "AI-Assisted Market Research Analyst",
      description: `Use Perplexity and Claude to research competitors, trends, and market sizing for this ${sector} company. No prior research background required — AI fluency is the core qualification.`,
      skills: "Perplexity AI,Claude,Research,Report Writing",
      timeCommitment: "Part-time 20h/week",
      salaryMin: 35000,
      salaryMax: 50000,
      isAiAugmented: true,
      aiTools: "Perplexity,Claude",
    },
    {
      title: "AI-Powered Content Producer",
      description: `Use Claude and Gemini to produce high-quality blog posts, case studies, and email sequences at scale. No copywriting degree required — strong editorial judgement and great prompting are all you need.`,
      skills: "Claude AI,Gemini,Content Strategy,Editing",
      timeCommitment: "Part-time 15h/week",
      salaryMin: 30000,
      salaryMax: 45000,
      isAiAugmented: true,
      aiTools: "Claude,Gemini",
    },
    {
      title: "AI-Augmented Operations Analyst",
      description: `Use Make.com, Notion AI, and Claude to audit, document, and automate business processes. No operations background required — comfort with AI workflow tools is the entry point.`,
      skills: "Make.com,Notion AI,Claude,Process Mapping",
      timeCommitment: "Contract 3 months",
      salaryMin: 40000,
      salaryMax: 60000,
      isAiAugmented: true,
      aiTools: "Make.com,Notion AI,Claude",
    },
  ];

  return [...standard, ...aiAugmented];
}
