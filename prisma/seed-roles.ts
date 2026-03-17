/**
 * Seed script: create mock open roles for existing test NGOs.
 * Run with: npx tsx prisma/seed-roles.ts
 */

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // Ensure Ngo records exist for all three test NGO accounts
  const ngoSeeds = [
    { email: "greenroots@test.com", orgName: "GreenRoots Initiative", state: "California" },
    { email: "hopehands@test.com",  orgName: "HopeHands Foundation",  state: "New York"   },
    { email: "brightfuture@test.com", orgName: "BrightFuture Academy", state: "Texas"     },
  ];

  for (const seed of ngoSeeds) {
    const user = await prisma.user.findUnique({ where: { email: seed.email } });
    if (!user) { console.log(`  ⚠ User ${seed.email} not found — skipping`); continue; }
    await prisma.ngo.upsert({
      where: { userId: user.id },
      create: { userId: user.id, orgName: seed.orgName, state: seed.state, status: "ACTIVE", country: "United States" },
      update: { orgName: seed.orgName, status: "ACTIVE", state: seed.state },
    });
  }

  // Fetch test NGOs by email
  const ngos = await prisma.ngo.findMany({
    where: { user: { email: { in: ["greenroots@test.com", "hopehands@test.com", "brightfuture@test.com"] } } },
    include: {
      user: { select: { email: true } },
      projects: { select: { id: true, title: true }, take: 1 },
    },
  });

  if (ngos.length === 0) {
    console.log("No test NGOs found.");
    process.exit(1);
  }

  // Delete existing seeded roles (idempotent)
  await prisma.ngoRole.deleteMany({
    where: { ngoId: { in: ngos.map((n) => n.id) } },
  });

  console.log(`Found ${ngos.length} NGOs. Creating roles...`);

  for (const ngo of ngos) {
    const projectId = ngo.projects[0]?.id ?? null;
    const email = ngo.user.email;

    if (email === "greenroots@test.com") {
      await prisma.ngoRole.createMany({
        data: [
          {
            ngoId: ngo.id,
            projectId,
            title: "Social Media Manager",
            department: "Communications",
            roleType: "CAREER_TRANSITION",
            description:
              "GreenRoots needs a Social Media Manager to grow our online presence and tell stories of impact from the field. You will plan and publish content across Instagram, LinkedIn, and Twitter, engage with our community, and help document ongoing project milestones. This is a fully remote, flexible role perfect for someone looking to build a portfolio in nonprofit communications.",
            responsibilities:
              "- Plan and publish 4–5 posts per week across Instagram, LinkedIn, and Twitter\n- Write captions and short-form content from field updates and milestone reports\n- Respond to comments and DMs within 24 hours\n- Design simple graphics using Canva or Figma\n- Prepare a monthly content performance report",
            skillsRequired: "Social Media,Marketing,Design,Writing,Canva",
            timeCommitment: "8 hours/week",
            durationWeeks: 8,
            isRemote: true,
            openings: 1,
            status: "OPEN",
            applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks
          },
          {
            ngoId: ngo.id,
            title: "Website & IT Support Volunteer",
            department: "Technology",
            roleType: "INTERNSHIP",
            description:
              "GreenRoots is looking for a tech-savvy individual to help maintain our website, improve page speed, and build a simple donation tracker dashboard. You will work directly with the programme director and get real exposure to nonprofit technology needs — a great first project to put on your resume.",
            responsibilities:
              "- Audit current website for broken links, slow pages, and mobile issues\n- Fix identified issues using WordPress or basic HTML/CSS\n- Build a simple dashboard in Google Sheets or Notion to track donation milestones\n- Document what you've done in a handover guide for future volunteers",
            skillsRequired: "IT,Web Development,WordPress,Google Sheets",
            timeCommitment: "10 hours/week",
            durationWeeks: 6,
            isRemote: true,
            openings: 2,
            status: "OPEN",
            applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      console.log("  ✓ GreenRoots: 2 roles created");
    }

    if (email === "hopehands@test.com") {
      await prisma.ngoRole.createMany({
        data: [
          {
            ngoId: ngo.id,
            title: "Grant Writer",
            department: "Fundraising",
            roleType: "INTERIM",
            description:
              "HopeHands has identified 6 grant opportunities from US foundations opening in the next quarter. We need an experienced writer to research, draft, and submit two grant applications on our behalf. This is a serious interim engagement with real deliverables — ideal for a development professional between roles or a freelance writer looking to add nonprofit grant writing to their portfolio.",
            responsibilities:
              "- Research 6 open grant opportunities and shortlist 2 best fits\n- Interview programme staff to gather evidence and impact data\n- Draft two full grant applications (narrative, budget justification, attachments)\n- Submit by the specified deadlines and confirm receipt\n- Prepare a brief post-submission report for leadership",
            skillsRequired: "Writing,Fundraising,Research,Grant Writing",
            timeCommitment: "15 hours/week",
            durationWeeks: 12,
            isRemote: true,
            openings: 1,
            status: "OPEN",
            applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          },
          {
            ngoId: ngo.id,
            projectId,
            title: "Program Coordinator",
            department: "Operations",
            roleType: "VOLUNTEER",
            description:
              "We are looking for a Programme Coordinator to help us manage logistics for our upcoming community training events in Q2. You will work closely with our field team to schedule sessions, communicate with participants, and prepare materials. A great fit for someone with event or operations experience who wants to contribute meaningfully.",
            responsibilities:
              "- Coordinate scheduling of 8 community training sessions with field staff\n- Send and track participant communications via email\n- Prepare and print training materials (templates provided)\n- Attend 2 virtual check-in calls per week with the programme team\n- Submit a brief end-of-engagement report",
            skillsRequired: "Project Management,Training,Communication,Organisation",
            timeCommitment: "6 hours/week",
            durationWeeks: 4,
            isRemote: false,
            location: "New York, NY",
            openings: 1,
            status: "OPEN",
          },
        ],
      });
      console.log("  ✓ HopeHands: 2 roles created");
    }

    if (email === "brightfuture@test.com") {
      await prisma.ngoRole.createMany({
        data: [
          {
            ngoId: ngo.id,
            title: "Impact Data Analyst",
            department: "Research & Evaluation",
            roleType: "CAREER_TRANSITION",
            description:
              "BrightFuture collects outcome data from 3 active projects but lacks the capacity to analyse it properly. We need a Data Analyst to clean our data, build summary visualisations, and present findings to the board. This is a high-visibility role — your work will directly influence our next funding strategy and be cited in our annual impact report.",
            responsibilities:
              "- Receive and clean 3 CSV datasets from field teams\n- Identify key impact metrics (beneficiaries reached, outcomes by cohort, cost-per-outcome)\n- Build 4–6 charts and a one-page summary dashboard (Excel, Google Sheets, or Tableau)\n- Present findings in a 30-minute board presentation\n- Document methodology for future replication",
            skillsRequired: "Data Analysis,Excel,Research,Tableau,Statistics",
            timeCommitment: "10 hours/week",
            durationWeeks: 8,
            isRemote: true,
            openings: 1,
            status: "OPEN",
            applicationDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
          },
          {
            ngoId: ngo.id,
            title: "Marketing Strategy Consultant",
            department: "Communications",
            roleType: "INTERNSHIP",
            description:
              "BrightFuture is preparing to launch our next fundraising campaign and needs strategic marketing support. You will review our existing donor communication, identify gaps, and propose a 4-week campaign strategy. This is a consulting-style engagement — you will present a strategic brief at the end. Great for a marketing student or early-career professional looking for a real-world strategy project.",
            responsibilities:
              "- Review and audit existing donor email campaigns and social content\n- Research what comparable NGOs are doing in their fundraising communications\n- Prepare a 4-week campaign strategy brief with messaging, channels, and timeline\n- Present to the executive director in a 45-minute review meeting\n- (Optional) Execute one campaign element if capacity allows",
            skillsRequired: "Marketing,Strategy,Writing,Social Media,Campaign Management",
            timeCommitment: "8 hours/week",
            durationWeeks: 6,
            isRemote: true,
            openings: 2,
            status: "OPEN",
            startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      console.log("  ✓ BrightFuture: 2 roles created");
    }
  }

  const total = await prisma.ngoRole.count();
  console.log(`\nDone. Total open roles in DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
