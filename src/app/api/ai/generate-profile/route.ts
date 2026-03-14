import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetId, targetType } = await req.json(); // targetType: "USER" | "NGO"

  let profileText = "";

  if (targetType === "USER") {
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      include: {
        skillContributions: {
          where: { status: "APPROVED" },
          include: { ngo: { select: { orgName: true } } },
        },
        donations: {
          include: { project: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        documents: {
          select: { fileName: true, category: true },
        },
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const totalDonated = user.donations.reduce((s, d) => s + d.amount, 0);
    const skills = user.skills?.split(",").filter(Boolean) ?? [];

    profileText = `
Name: ${user.name ?? "Unknown"}
Job Title: ${user.jobTitle ?? "Not provided"}
Company: ${user.company ?? "Not provided"}
Location: ${user.city ?? "Not provided"}
Bio: ${user.bio ?? "Not provided"}
Skills offered to NGOs: ${skills.join(", ") || "None listed"}
LinkedIn: ${user.linkedinUrl ?? "Not provided"}
Portfolio: ${user.portfolioUrl ?? "Not provided"}
Total donated on GiveLedger: $${totalDonated.toLocaleString()} across ${new Set(user.donations.map(d => d.projectId)).size} projects
Verified skill contributions: ${user.skillContributions.length} (for NGOs: ${user.skillContributions.map(c => c.ngo.orgName).join(", ") || "none"})
Uploaded documents: ${user.documents.map(d => `${d.fileName} (${d.category})`).join(", ") || "None"}
    `.trim();
  } else {
    const ngo = await prisma.ngo.findUnique({
      where: { id: targetId },
      include: {
        boardMembers: { orderBy: { orderIndex: "asc" } },
        projects: {
          include: { milestones: true, donations: true },
        },
        documents: { select: { fileName: true, category: true, caption: true } },
      },
    });
    if (!ngo) return NextResponse.json({ error: "NGO not found" }, { status: 404 });

    const totalRaised = ngo.projects.reduce((s, p) => s + p.raisedAmount, 0);
    const completedMilestones = ngo.projects.reduce(
      (s, p) => s + p.milestones.filter(m => m.status === "COMPLETED").length, 0
    );
    const founders = ngo.boardMembers.filter(m => m.memberType === "FOUNDER");
    const board = ngo.boardMembers.filter(m => m.memberType === "BOARD_MEMBER");

    profileText = `
Organisation: ${ngo.orgName}
Description: ${ngo.description ?? "Not provided"}
EIN: ${(ngo as { ein?: string }).ein ?? "Not provided"}
State: ${(ngo as { state?: string }).state ?? "Not provided"}
Website: ${ngo.website ?? "Not provided"}
Total raised: $${totalRaised.toLocaleString()} across ${ngo.projects.length} projects
Milestones completed and verified on-chain: ${completedMilestones}
Founders: ${founders.map(f => `${f.name} (${f.role})`).join(", ") || "Not listed"}
Board members: ${board.map(b => `${b.name} (${b.role})`).join(", ") || "Not listed"}
Uploaded documents: ${ngo.documents.map(d => `${d.fileName} (${d.category}${d.caption ? ': ' + d.caption : ''})`).join(", ") || "None"}
    `.trim();
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    // Graceful fallback: template-based summary
    const summary = targetType === "USER"
      ? generateDonorSummary(profileText)
      : generateNgoSummary(profileText);

    if (targetType === "USER") {
      await prisma.user.update({ where: { id: targetId }, data: { aiSummary: summary } }).catch(() => {});
    } else {
      await prisma.ngo.update({ where: { id: targetId }, data: { aiSummary: summary } }).catch(() => {});
    }
    return NextResponse.json({ summary });
  }

  try {
    const systemPrompt = targetType === "USER"
      ? "You are a professional bio writer. Write a compelling 2-3 paragraph public profile for a donor/contributor on GiveLedger, a US nonprofit platform. Highlight their professional background, skills, and verified impact. Be specific, warm, and credible. Output plain text only."
      : "You are a professional writer. Write a compelling 2-3 paragraph public profile for a US 501(c)(3) nonprofit on GiveLedger. Highlight their mission, verified milestones, leadership team, and total impact. Be specific, trustworthy, and inspiring. Output plain text only.";

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate a public profile from this data:\n\n${profileText}` },
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const summary = data.choices?.[0]?.message?.content?.trim() ?? generateDonorSummary(profileText);

    // Cache it
    if (targetType === "USER") {
      await prisma.user.update({ where: { id: targetId }, data: { aiSummary: summary } }).catch(() => {});
    } else {
      await prisma.ngo.update({ where: { id: targetId }, data: { aiSummary: summary } }).catch(() => {});
    }

    return NextResponse.json({ summary });
  } catch {
    const summary = targetType === "USER" ? generateDonorSummary(profileText) : generateNgoSummary(profileText);
    return NextResponse.json({ summary });
  }
}

function generateDonorSummary(data: string): string {
  const lines = data.split("\n").reduce((acc: Record<string, string>, line) => {
    const [k, ...v] = line.split(": ");
    if (k && v.length) acc[k.trim()] = v.join(": ").trim();
    return acc;
  }, {});

  const parts: string[] = [];
  if (lines["Name"] && lines["Job Title"] && lines["Company"] && lines["Job Title"] !== "Not provided") {
    parts.push(`${lines["Name"]} is a ${lines["Job Title"]} at ${lines["Company"]}${lines["Location"] && lines["Location"] !== "Not provided" ? `, based in ${lines["Location"]}` : ""}.`);
  }
  if (lines["Bio"] && lines["Bio"] !== "Not provided") parts.push(lines["Bio"]);
  if (lines["Total donated on GiveLedger"] && !lines["Total donated on GiveLedger"].includes("$0")) {
    parts.push(`On GiveLedger, ${lines["Name"] ?? "this donor"} has contributed ${lines["Total donated on GiveLedger"]}.`);
  }
  if (lines["Verified skill contributions"] && !lines["Verified skill contributions"].startsWith("0")) {
    parts.push(`They have also completed ${lines["Verified skill contributions"]}.`);
  }
  return parts.join(" ") || "This donor is building their GiveLedger profile.";
}

function generateNgoSummary(data: string): string {
  const lines = data.split("\n").reduce((acc: Record<string, string>, line) => {
    const [k, ...v] = line.split(": ");
    if (k && v.length) acc[k.trim()] = v.join(": ").trim();
    return acc;
  }, {});

  const parts: string[] = [];
  if (lines["Organisation"]) parts.push(`${lines["Organisation"]} is a US-based 501(c)(3) nonprofit${lines["State"] && lines["State"] !== "Not provided" ? ` registered in ${lines["State"]}` : ""}.`);
  if (lines["Description"] && lines["Description"] !== "Not provided") parts.push(lines["Description"]);
  if (lines["Total raised"] && !lines["Total raised"].includes("$0")) {
    parts.push(`The organization has raised ${lines["Total raised"]} with ${lines["Milestones completed and verified on-chain"] ?? "0"} milestones verified on-chain.`);
  }
  if (lines["Founders"] && lines["Founders"] !== "Not listed") {
    parts.push(`Founded by ${lines["Founders"]}.`);
  }
  return parts.join(" ") || "This NGO is building their GiveLedger profile.";
}
