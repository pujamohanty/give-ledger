/**
 * GiveLedger — Skill Contributions Seed (add-on)
 * Creates ~7,500 SkillContribution records against existing large seed data.
 *
 * Run with: npm run seed:skills
 * Idempotent — skips if skill contributions already exist for donor1.
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

const SKILL_CATEGORIES = [
  "Marketing", "Software Engineering", "Data & Analytics", "Legal", "Finance",
  "Operations", "HR", "UX Design", "Project Management", "Communications",
  "Cybersecurity", "Strategy",
];

const SKILL_DESCRIPTIONS = [
  "Contributed professional expertise to support NGO marketing and outreach initiatives.",
  "Provided software development and technical consulting for digital infrastructure.",
  "Delivered data analysis and reporting to support impact measurement.",
  "Offered pro bono legal guidance on compliance, contracts, and governance.",
  "Provided financial modelling, budgeting, and grant-writing support.",
  "Supported operations planning, logistics coordination, and process improvement.",
  "Assisted with HR policies, volunteer coordination, and team development.",
  "Designed user-facing materials, presentations, and brand assets.",
  "Led project planning, timeline management, and stakeholder coordination.",
  "Developed communications strategy, press releases, and donor messaging.",
  "Reviewed cybersecurity posture and recommended protective measures.",
  "Contributed strategic planning, board facilitation, and impact frameworks.",
];

async function main() {
  // Idempotency check — find donor1 and see if they already have a skill contribution
  const donor1 = await prisma.user.findFirst({ where: { email: "donor1@test.com" }, select: { id: true } });
  if (!donor1) {
    console.log("Large seed hasn't been run yet. Run npm run seed:large first.");
    return;
  }
  const alreadyDone = await prisma.skillContribution.count({ where: { donorId: donor1.id } });
  if (alreadyDone > 0) {
    console.log("Skill contributions already seeded — skipping.");
    return;
  }

  console.log("Fetching existing donors, NGOs, and projects...");
  const [donors, ngos, projects] = await Promise.all([
    prisma.user.findMany({
      where: { email: { startsWith: "donor", endsWith: "@test.com" }, role: "DONOR" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 15000,
    }),
    prisma.ngo.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 2500,
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
      orderBy: { createdAt: "asc" },
      take: 1200,
    }),
  ]);

  console.log(`  Found: ${donors.length} donors, ${ngos.length} NGOs, ${projects.length} projects`);

  // Every other donor (indices 0, 2, 4, …) = ~7,500 skill contributors
  const skillDonors = donors.filter((_, i) => i % 2 === 0);

  const skillData = skillDonors.map((d, i) => ({
    donorId: d.id,
    ngoId: ngos[i % ngos.length].id,
    projectId: projects[i % projects.length].id,
    skillCategory: SKILL_CATEGORIES[i % SKILL_CATEGORIES.length],
    description: SKILL_DESCRIPTIONS[i % SKILL_DESCRIPTIONS.length],
    hoursContributed: 10 + (i % 71),                     // 10 – 80 hrs
    monetaryValue: (10 + (i % 71)) * (50 + (i % 51)),   // $500 – $6,480
    status: "APPROVED",
    approvedAt: new Date(),
  }));

  console.log(`Creating ${skillData.length.toLocaleString()} skill contributions...`);
  let inserted = 0;
  for (const batch of chunk(skillData, 1000)) {
    await prisma.skillContribution.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / ${skillData.length.toLocaleString()}`);
  }

  console.log(`\n\nDone! ${skillData.length.toLocaleString()} skill contributions created.`);
  console.log(`  ${skillData.length} records = 50% of ${donors.length} donors`);
  console.log(`  All status: APPROVED, spread across ${ngos.length} NGOs and ${projects.length} projects`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
