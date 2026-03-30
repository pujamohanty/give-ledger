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
}

// POST /api/ngo/suggest-roles
// Body: { ein: string }
// Returns: { roles: SuggestedRole[] }
export async function POST(req: NextRequest) {
  const { ein } = await req.json() as { ein: string };
  if (!ein) return NextResponse.json({ error: "Missing ein" }, { status: 400 });

  const cleanEin = ein.replace(/-/g, "").trim();

  // Return cached roles if still valid
  const now = new Date();
  const cached = await prisma.suggestedRole.findMany({
    where: { ein: cleanEin, expiresAt: { gt: now } },
    orderBy: { generatedAt: "desc" },
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
  const employeeCount = null; // not fetched here to keep it simple
  void employeeCount;

  const groqKey = process.env.GROQ_API_KEY;
  let generated: GeneratedRole[] = [];

  if (groqKey) {
    const prompt = `You are an expert nonprofit HR consultant. Based on the information below about a US nonprofit organization, generate exactly 5 realistic potential role profiles that this organization would likely need — a mix of paid staff roles and volunteer/internship opportunities.

Organization: ${orgName}
Mission area: ${ntee}
Organization size: ${sizeLabel}
State: ${state}
${description ? `About: ${description}` : ""}

Return ONLY a valid JSON array (no explanation, no markdown) with exactly 5 objects. Each object must have these exact fields:
- "title": job title (string, max 60 chars)
- "description": 2-sentence role overview focused on impact (string)
- "skills": comma-separated skill tags, 3-6 tags (string), e.g. "Grant Writing,Financial Analysis,Excel"
- "roleType": one of "VOLUNTEER", "INTERNSHIP", "CAREER_TRANSITION", "INTERIM"
- "timeCommitment": e.g. "10 hours/week" or "Full-time"
- "salaryMin": annual USD salary as integer for paid roles, omit for volunteer/internship
- "salaryMax": annual USD salary as integer for paid roles, omit for volunteer/internship

Rules:
- Include at least 2 volunteer or internship roles
- Include at least 1 paid staff role relevant to this org's mission
- Skills should be specific and professionally useful (e.g. "Salesforce CRM" not just "Tech")
- Descriptions should mention the mission area specifically
- Salary ranges should be realistic for US nonprofits in this size category`;

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          stream: false,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1200,
          temperature: 0.7,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json() as { choices?: { message?: { content?: string } }[] };
        const raw = data?.choices?.[0]?.message?.content ?? "";
        // Extract JSON array from response (handle any surrounding text)
        const match = raw.match(/\[[\s\S]*\]/);
        if (match) {
          const parsed = JSON.parse(match[0]) as GeneratedRole[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            generated = parsed.slice(0, 5);
          }
        }
      }
    } catch {
      // Groq failed — fall through to fallback
    }
  }

  // Fallback: generate plausible roles from NTEE category if Groq is unavailable or failed
  if (generated.length === 0) {
    generated = buildFallbackRoles(ntee, orgName, revenue);
  }

  // Delete any stale cached roles for this EIN
  await prisma.suggestedRole.deleteMany({ where: { ein: cleanEin } });

  // Save new roles to DB
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
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
          source: groqKey ? "AI" : "TEMPLATE",
          expiresAt,
        },
      })
    )
  );

  return NextResponse.json({ roles: created, cached: false });
}

function buildFallbackRoles(ntee: string, orgName: string, revenue: number | null): GeneratedRole[] {
  void orgName;
  const isPaid = (revenue ?? 0) > 500_000;
  const roles: GeneratedRole[] = [
    {
      title: "Volunteer Programme Coordinator",
      description: `Support the coordination of volunteers contributing to ${ntee} programmes. Help onboard, schedule, and recognise volunteer contributions across active initiatives.`,
      skills: "Volunteer Management,Scheduling,Communication,Google Workspace",
      roleType: "VOLUNTEER",
      timeCommitment: "8 hours/week",
    },
    {
      title: "Fundraising & Grants Intern",
      description: `Research grant opportunities and support proposal writing for ${ntee} projects. Gain hands-on experience with nonprofit fundraising strategy and donor reporting.`,
      skills: "Grant Writing,Research,Microsoft Word,Nonprofit Finance",
      roleType: "INTERNSHIP",
      timeCommitment: "15 hours/week",
    },
    {
      title: "Social Media & Communications Volunteer",
      description: `Create and schedule content across social platforms to amplify the organisation's ${ntee} mission. Help build community engagement and grow digital reach.`,
      skills: "Social Media,Copywriting,Canva,Content Strategy",
      roleType: "VOLUNTEER",
      timeCommitment: "5 hours/week",
    },
    {
      title: "Data & Impact Analyst",
      description: `Analyse programme data to measure impact and prepare reporting for donors and the board. Support evidence-based decision-making across ${ntee} initiatives.`,
      skills: "Data Analysis,Excel,Google Sheets,Impact Measurement",
      roleType: "CAREER_TRANSITION",
      timeCommitment: "10 hours/week",
    },
  ];

  if (isPaid) {
    roles.push({
      title: "Programme Manager",
      description: `Lead day-to-day delivery of ${ntee} programmes, manage budgets, and coordinate staff and volunteers. Report directly to senior leadership on outcomes and milestones.`,
      skills: "Programme Management,Budget Management,Stakeholder Engagement,Reporting",
      roleType: "CAREER_TRANSITION",
      timeCommitment: "Full-time",
      salaryMin: 52000,
      salaryMax: 72000,
    });
  } else {
    roles.push({
      title: "Website & Digital Volunteer",
      description: `Maintain and improve the organisation's digital presence to support ${ntee} outreach goals. Assist with content updates, SEO, and user experience improvements.`,
      skills: "Web Development,WordPress,SEO,HTML/CSS",
      roleType: "VOLUNTEER",
      timeCommitment: "5 hours/week",
    });
  }

  return roles;
}
