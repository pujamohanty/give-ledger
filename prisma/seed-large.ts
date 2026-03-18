/**
 * GiveLedger — Large-Scale Data Seed
 * Generates: 15,000 donors · 2,500 NGOs · 1,200 projects · ~4,800 milestones · ~12,000 donations
 *
 * Run with: npm run seed:large
 * Idempotent — safe to re-run (skips if already seeded)
 * All accounts use password: Test1234!
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Data Pools ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James","Mary","John","Patricia","Robert","Jennifer","Michael","Linda","William","Barbara",
  "David","Elizabeth","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen",
  "Christopher","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra",
  "Donald","Ashley","Steven","Dorothy","Paul","Kimberly","Andrew","Emily","Joshua","Donna",
  "Kenneth","Michelle","Kevin","Carol","Brian","Amanda","George","Melissa","Edward","Deborah",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez",
  "Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin",
  "Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson",
  "Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores",
  "Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts",
];

// 20 × 25 × 5 = 2,500 unique NGO names
const NGO_ADJECTIVES = [
  "Rising","Hope","Clear","Bright","United","Green","Safe","Free","Strong","Open",
  "Pure","True","Bold","Wise","Warm","Just","Fair","New","Light","Deep",
];
const NGO_NOUNS = [
  "Hands","Hearts","Roots","Wings","Path","Light","Bridge","Voice","Future","Life",
  "Seeds","Fields","Rivers","Stars","Homes","Roads","Bonds","Steps","Dreams","Minds",
  "Reach","Care","Aid","Spark","Change",
];
const NGO_TYPES = [
  "Foundation","Initiative","Alliance","Network","Coalition",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const PROJECT_CATEGORIES = [
  "INCOME_GENERATION","CHILD_CARE","ELDERLY_CARE","PHYSICALLY_DISABLED","PET_CARE","OTHER",
];

const GOAL_AMOUNTS = [10000,25000,50000,75000,100000,150000,200000,250000,300000,500000];

const DONATION_AMOUNTS = [25,50,100,150,250,500,750,1000,2500,5000];

// 60 project title bases → cycles to produce 1200 unique titles
const PROJECT_TITLE_BASES = [
  "Clean Water Access","Youth Skills Training","Women's Economic Empowerment","Senior Wellness",
  "Child Nutrition","Digital Literacy","Renewable Energy Access","Affordable Housing",
  "Mental Health Awareness","Disaster Relief","Microfinance for Farmers","Early Childhood Education",
  "Accessible Transportation","Food Security","Job Placement","Urban Gardening",
  "Clean Air Initiative","Mobile Health Clinic","Legal Aid","Safe Drinking Water",
  "Vocational Training","School Infrastructure","Maternal Health","Community Library",
  "Animal Rescue & Care","Elder Day Care","Disability Support","Tech for Good",
  "Environmental Restoration","Hunger Relief","Literacy for Adults","Clean Cookstoves",
  "Rural Connectivity","STEM Education","Refugee Integration","Soil Regeneration",
  "Vision Care Outreach","Hearing Aid Program","Oral Health Drive","Sports for Youth",
  "Wheelchair Access","Mentorship Program","Financial Inclusion","Childcare Facilities",
  "Senior Technology","Urban Farming","Waste Management","Crisis Counseling",
  "Indigenous Heritage","Art & Culture","Music Education","Coding Bootcamp",
  "Wildlife Conservation","Ocean Cleanup","Solar Power","Seed Bank",
  "Community Kitchen","Emergency Shelter","Migrant Support","Civic Engagement",
];

const MILESTONE_NAMES = [
  "Community Assessment & Baseline Study",
  "Stakeholder Engagement & Planning",
  "Infrastructure Design & Permitting",
  "Phase 1 Construction / Setup",
  "Equipment Procurement & Delivery",
  "Staff Recruitment & Training",
  "Pilot Launch & Testing",
  "Community Rollout & Onboarding",
  "Monitoring & Data Collection",
  "Mid-Term Review & Adjustments",
  "Phase 2 Expansion",
  "Sustainability Planning",
  "Impact Measurement & Reporting",
  "Knowledge Transfer & Handover",
  "Final Evaluation & Documentation",
  "Beneficiary Feedback Collection",
  "Partner Coordination Workshop",
  "Supply Chain Establishment",
  "Awareness Campaign Launch",
  "Program Certification & Compliance",
];

const NGO_DESCRIPTIONS = [
  "We work with underserved communities to create sustainable, lasting change through evidence-based programs and local partnerships.",
  "Our mission is to empower individuals and communities by removing barriers to opportunity and building capacity for long-term success.",
  "A grassroots organization dedicated to improving quality of life through community-led initiatives and transparent, accountable operations.",
  "We partner with local leaders and international donors to deliver measurable impact in health, education, and economic resilience.",
  "Committed to dignity, equity, and opportunity for all — we design programs that put communities first and build on existing strengths.",
];

const PROJECT_DESCRIPTIONS = [
  "This project targets underserved populations in our service area, delivering critical resources and measurable outcomes through milestone-based implementation.",
  "Working directly with community members, this initiative addresses a documented gap in services by mobilizing donor funding and local expertise.",
  "A structured, evidence-based program designed to create lasting change through phased delivery, community ownership, and rigorous outcome tracking.",
  "Building on years of field experience, this project expands our proven model to reach more beneficiaries with greater efficiency and transparency.",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function getNgoName(i: number): string {
  const adj  = NGO_ADJECTIVES[i % NGO_ADJECTIVES.length];
  const noun = NGO_NOUNS[Math.floor(i / NGO_ADJECTIVES.length) % NGO_NOUNS.length];
  const type = NGO_TYPES[Math.floor(i / (NGO_ADJECTIVES.length * NGO_NOUNS.length)) % NGO_TYPES.length];
  return `${adj} ${noun} ${type}`;
}

function getProjectTitle(i: number): string {
  const base  = PROJECT_TITLE_BASES[i % PROJECT_TITLE_BASES.length];
  const round = Math.floor(i / PROJECT_TITLE_BASES.length) + 1;
  return round === 1 ? base : `${base} (Phase ${round})`;
}

function getEin(i: number): string {
  const prefix = String(10 + (i % 89)).padStart(2, "0");
  const suffix = String(1000000 + i).slice(-7);
  return `${prefix}-${suffix}`;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // Idempotency check
  const alreadySeeded = await prisma.user.count({ where: { email: "donor1@test.com" } });
  if (alreadySeeded > 0) {
    console.log("Large seed already applied — skipping. Delete donor1@test.com to re-seed.");
    return;
  }

  console.log("Hashing password (once for all accounts)...");
  const pw = await bcrypt.hash("Test1234!", 10);

  // ── Step 1: Create 15,000 donor Users ──────────────────────────────────────
  console.log("Step 1/6 — Creating 15,000 donor users...");
  const donorUserData = Array.from({ length: 15000 }, (_, i) => ({
    email: `donor${i + 1}@test.com`,
    name: `${FIRST_NAMES[i % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length]}`,
    role: "DONOR" as const,
    password: pw,
  }));
  let inserted = 0;
  for (const batch of chunk(donorUserData, 1000)) {
    await prisma.user.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / 15,000`);
  }
  console.log("\n  ✓ Donor users created");

  // ── Step 2: Create 2,500 NGO Users ─────────────────────────────────────────
  console.log("Step 2/6 — Creating 2,500 NGO users...");
  const ngoUserData = Array.from({ length: 2500 }, (_, i) => ({
    email: `ngo${i + 1}@test.com`,
    name: getNgoName(i),
    role: "NGO" as const,
    password: pw,
  }));
  inserted = 0;
  for (const batch of chunk(ngoUserData, 500)) {
    await prisma.user.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / 2,500`);
  }
  console.log("\n  ✓ NGO users created");

  // ── Step 3: Create 2,500 NGO profiles ──────────────────────────────────────
  console.log("Step 3/6 — Creating 2,500 NGO profiles...");
  // Fetch NGO user IDs in index order (by email suffix number)
  const ngoUsers = await prisma.user.findMany({
    where: { email: { startsWith: "ngo", endsWith: "@test.com" }, role: "NGO" },
    select: { id: true, email: true },
  });
  // Sort by the numeric part of the email
  ngoUsers.sort((a, b) => {
    const ai = parseInt(a.email.replace("ngo", "").replace("@test.com", ""));
    const bi = parseInt(b.email.replace("ngo", "").replace("@test.com", ""));
    return ai - bi;
  });

  const ngoProfileData = ngoUsers.map((u, i) => ({
    userId: u.id,
    orgName: getNgoName(i),
    description: NGO_DESCRIPTIONS[i % NGO_DESCRIPTIONS.length],
    state: US_STATES[i % US_STATES.length],
    ein: getEin(i),
    status: "ACTIVE" as const,
    trustScore: 65 + (i % 35),
  }));

  inserted = 0;
  for (const batch of chunk(ngoProfileData, 500)) {
    await prisma.ngo.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / 2,500`);
  }
  console.log("\n  ✓ NGO profiles created");

  // ── Step 4: Create 1,200 Projects ──────────────────────────────────────────
  console.log("Step 4/6 — Creating 1,200 projects...");
  const ngos = await prisma.ngo.findMany({
    where: { status: "ACTIVE", userId: { in: ngoUsers.map((u) => u.id) } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const projectData = Array.from({ length: 1200 }, (_, i) => {
    const goal = GOAL_AMOUNTS[i % GOAL_AMOUNTS.length];
    const raised = Math.round(goal * (0.05 + (i % 19) * 0.05)); // 5%–95% funded
    return {
      ngoId: ngos[i % ngos.length].id,
      title: getProjectTitle(i),
      description: PROJECT_DESCRIPTIONS[i % PROJECT_DESCRIPTIONS.length],
      category: PROJECT_CATEGORIES[i % PROJECT_CATEGORIES.length] as any,
      goalAmount: goal,
      raisedAmount: Math.min(raised, goal),
      status: "ACTIVE" as const,
    };
  });

  inserted = 0;
  for (const batch of chunk(projectData, 500)) {
    await prisma.project.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / 1,200`);
  }
  console.log("\n  ✓ Projects created");

  // ── Step 5: Create Milestones (3–5 per project) ────────────────────────────
  console.log("Step 5/6 — Creating milestones (3–5 per project)...");
  const projects = await prisma.project.findMany({
    where: { ngoId: { in: ngos.map((n) => n.id) } },
    select: { id: true, goalAmount: true },
    orderBy: { createdAt: "asc" },
  });

  const milestoneData = projects.flatMap((p, pi) => {
    const count = 3 + (pi % 3); // 3, 4, or 5 milestones
    const share = Math.round(p.goalAmount / count);
    return Array.from({ length: count }, (_, mi) => ({
      projectId: p.id,
      name: MILESTONE_NAMES[(pi * 5 + mi) % MILESTONE_NAMES.length],
      description: `Deliverable ${mi + 1} of ${count} for this project — tracked and disbursed on completion.`,
      requiredAmount: mi === count - 1 ? p.goalAmount - share * (count - 1) : share, // last one absorbs rounding
      status: (mi === 0 ? "COMPLETED" : mi === 1 ? "UNDER_REVIEW" : "PENDING") as any,
    }));
  });

  inserted = 0;
  for (const batch of chunk(milestoneData, 1000)) {
    await prisma.milestone.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / ${milestoneData.length.toLocaleString()}`);
  }
  console.log(`\n  ✓ ${milestoneData.length.toLocaleString()} milestones created`);

  // ── Step 6: Create Donations (8–15 per project) ────────────────────────────
  console.log("Step 6/6 — Creating donations...");
  const donors = await prisma.user.findMany({
    where: { email: { startsWith: "donor", endsWith: "@test.com" }, role: "DONOR" },
    select: { id: true },
    orderBy: { createdAt: "asc" },
    take: 15000,
  });

  const donationData: Array<{
    userId: string; projectId: string; amount: number;
    status: string; paymentMethod: "CARD"; stripePaymentId: string;
  }> = [];

  for (let pi = 0; pi < projects.length; pi++) {
    const donorCount = 8 + (pi % 8); // 8–15 donors per project
    for (let di = 0; di < donorCount; di++) {
      const donorIdx = (pi * 97 + di * 31 + di * di) % donors.length; // spread across donor pool
      donationData.push({
        userId: donors[donorIdx].id,
        projectId: projects[pi].id,
        amount: DONATION_AMOUNTS[(pi + di) % DONATION_AMOUNTS.length],
        status: "COMPLETED",
        paymentMethod: "CARD" as const,
        stripePaymentId: `pi_bulk_${pi}_${di}`,
      });
    }
  }

  inserted = 0;
  for (const batch of chunk(donationData, 1000)) {
    await prisma.donation.createMany({ data: batch, skipDuplicates: true });
    inserted += batch.length;
    process.stdout.write(`\r  ${inserted.toLocaleString()} / ${donationData.length.toLocaleString()}`);
  }
  console.log(`\n  ✓ ${donationData.length.toLocaleString()} donations created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n✅ Large seed complete!");
  console.log(`   Donors:     15,000  (donor1@test.com … donor15000@test.com)`);
  console.log(`   NGOs:        2,500  (ngo1@test.com … ngo2500@test.com)`);
  console.log(`   Projects:    1,200`);
  console.log(`   Milestones:  ${milestoneData.length.toLocaleString()}`);
  console.log(`   Donations:   ${donationData.length.toLocaleString()}`);
  console.log(`   Password for all accounts: Test1234!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
