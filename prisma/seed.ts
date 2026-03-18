/**
 * GiveLedger — Full Simulation Seed
 * Simulates: 10 donor accounts + 4 NGO accounts, end-to-end workflow
 *
 * Timeline (all dates in 2025–2026):
 *  Nov 2025  → NGOs register, get approved, create projects
 *  Dec 2025  → Donors sign up, first donations, first milestone submissions
 *  Jan 2026  → More donations, several milestones approved, funds released
 *  Feb 2026  → Second round of milestones completed & released
 *  Mar 2026  → Latest milestones submitted, under admin review (current state)
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── helpers ────────────────────────────────────────────────────────────────
const d = (s: string) => new Date(s);

function txHash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `0x${hex}a3b2c1d4e5f6${Math.abs(h * 7).toString(16).padStart(8, "0")}`;
}

// ─── main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("🌱  Seeding GiveLedger simulation...\n");

  // ── 0. Clean up any previous seed run ───────────────────────────────────
  const seedEmails = [
    "platform@giveledger.com",
    "david.ochieng@waterbridge.ke",
    "anjali.krishnan@pragati.org",
    "meera.nair@silveryears.org",
    "marcus.tetteh@sunpowerafrica.org",
    "priya.sharma@gmail.com",
    "sarah.mitchell@gmail.com",
    "james.ochieng@gmail.com",
    "rahul.verma@gmail.com",
    "fatima.alrashid@gmail.com",
    "marcus.johnson@gmail.com",
    "anjali.patel@gmail.com",
    "david.lim@gmail.com",
    "grace.muthoni@gmail.com",
    "sophie.laurent@gmail.com",
  ];

  // Delete in reverse dependency order
  const existingUsers = await prisma.user.findMany({
    where: { email: { in: seedEmails } },
    select: { id: true },
  });
  const existingIds = existingUsers.map((u) => u.id);

  if (existingIds.length > 0) {
    console.log("  Cleaning up previous seed data...");
    await prisma.notification.deleteMany({ where: { userId: { in: existingIds } } });
    await prisma.spotlightVote.deleteMany({ where: { userId: { in: existingIds } } });
    await prisma.rating.deleteMany({ where: { donorId: { in: existingIds } } });
    await prisma.campaignContributor.deleteMany({ where: { userId: { in: existingIds } } });
    await prisma.campaign.deleteMany({ where: { creatorId: { in: existingIds } } });
    await prisma.referral.deleteMany({ where: { referrerId: { in: existingIds } } });
    await prisma.ngoSuggestion.deleteMany({ where: { submittedBy: { in: existingIds } } });
    // Donor challenges (cascade deletes acceptances)
    await prisma.donorChallenge.deleteMany({ where: { donorId: { in: existingIds } } });
    // Donor endorsements
    await prisma.donorEndorsement.deleteMany({ where: { donorId: { in: existingIds } } });
    // Role applications → engagements (cascade)
    await prisma.roleApplication.deleteMany({ where: { applicantId: { in: existingIds } } });
    // Activity events emitted by seed actors
    await prisma.activityEvent.deleteMany({ where: { actorId: { in: existingIds } } });

    // Donations → BlockchainRecords
    const donations = await prisma.donation.findMany({
      where: { userId: { in: existingIds } },
      select: { id: true },
    });
    const donationIds = donations.map((d) => d.id);
    if (donationIds.length > 0) {
      await prisma.blockchainRecord.deleteMany({ where: { donationId: { in: donationIds } } });
      await prisma.donation.deleteMany({ where: { id: { in: donationIds } } });
    }

    // NGO projects chain
    const ngos = await prisma.ngo.findMany({
      where: { userId: { in: existingIds } },
      select: { id: true },
    });
    const ngoIds = ngos.map((n) => n.id);
    if (ngoIds.length > 0) {
      const projects = await prisma.project.findMany({
        where: { ngoId: { in: ngoIds } },
        select: { id: true },
      });
      const projectIds = projects.map((p) => p.id);
      if (projectIds.length > 0) {
        const milestones = await prisma.milestone.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
        });
        const milestoneIds = milestones.map((m) => m.id);
        if (milestoneIds.length > 0) {
          const disbursements = await prisma.disbursement.findMany({
            where: { milestoneId: { in: milestoneIds } },
            select: { id: true },
          });
          const disbursementIds = disbursements.map((d) => d.id);
          if (disbursementIds.length > 0) {
            await prisma.blockchainRecord.deleteMany({
              where: { disbursementId: { in: disbursementIds } },
            });
            await prisma.disbursement.deleteMany({
              where: { id: { in: disbursementIds } },
            });
          }
          await prisma.outputMarker.deleteMany({ where: { milestoneId: { in: milestoneIds } } });
          await prisma.evidenceFile.deleteMany({ where: { milestoneId: { in: milestoneIds } } });
          await prisma.milestone.deleteMany({ where: { id: { in: milestoneIds } } });
        }
        await prisma.campaign.deleteMany({ where: { projectId: { in: projectIds } } });
        await prisma.spotlightVote.deleteMany({ where: { projectId: { in: projectIds } } });
        await prisma.expense.deleteMany({ where: { projectId: { in: projectIds } } });
        await prisma.project.deleteMany({ where: { id: { in: projectIds } } });
      }
      await prisma.expense.deleteMany({ where: { ngoId: { in: ngoIds } } });
      await prisma.rating.deleteMany({ where: { ngoId: { in: ngoIds } } });
      await prisma.boardMember.deleteMany({ where: { ngoId: { in: ngoIds } } });
      const skillContribIds = await prisma.skillContribution.findMany({ where: { ngoId: { in: ngoIds } }, select: { id: true } }).then(r => r.map(x => x.id));
      if (skillContribIds.length > 0) await prisma.skillBlockchainRecord.deleteMany({ where: { skillContributionId: { in: skillContribIds } } });
      await prisma.skillContribution.deleteMany({ where: { ngoId: { in: ngoIds } } });
      // NgoRoles cascade → applications → engagements
      await prisma.ngoRole.deleteMany({ where: { ngoId: { in: ngoIds } } });
      await prisma.activityEvent.deleteMany({ where: { actorId: { in: ngoIds } } });
    }

    await prisma.user.deleteMany({ where: { id: { in: existingIds } } });
    console.log("  Done cleaning.\n");
  }

  // ── 1. Admin user ────────────────────────────────────────────────────────
  console.log("Creating admin account...");
  const admin = await prisma.user.create({
    data: {
      email: "platform@giveledger.com",
      name: "GiveLedger Admin",
      role: "ADMIN",
      emailVerified: d("2025-10-01T09:00:00Z"),
    },
  });

  // ── 2. NGO users & NGO records ───────────────────────────────────────────
  console.log("Creating 4 NGO accounts...");

  const ngoUserData = [
    {
      email: "david.ochieng@waterbridge.ke",
      name: "David Ochieng",
      registeredAt: d("2025-11-01T10:00:00Z"),
      ngo: {
        orgName: "WaterBridge Kenya",
        regNumber: "NGO-KE-18829",
        country: "Kenya",
        website: "waterbridge.ke",
        description:
          "WaterBridge Kenya installs water filtration systems in schools across Nairobi's informal settlements. Founded in 2018 after our director's daughter contracted typhoid from contaminated school water.",
        trustScore: 4.8,
        approvedAt: d("2025-11-10T14:00:00Z"),
      },
    },
    {
      email: "anjali.krishnan@pragati.org",
      name: "Anjali Krishnan",
      registeredAt: d("2025-11-03T11:30:00Z"),
      ngo: {
        orgName: "Pragati Foundation",
        regNumber: "CIN-U74900-BH2015",
        country: "India",
        website: "pragati.org.in",
        description:
          "Pragati Foundation provides vocational training to rural women in Bihar. Since 2015 we have trained over 2,200 women with an 81% employment rate at 6-month follow-up.",
        trustScore: 4.9,
        approvedAt: d("2025-11-10T14:30:00Z"),
      },
    },
    {
      email: "meera.nair@silveryears.org",
      name: "Dr. Meera Nair",
      registeredAt: d("2025-11-05T09:15:00Z"),
      ngo: {
        orgName: "SilverYears Trust",
        regNumber: "TRUST-KA-2012-007",
        country: "India",
        website: "silveryears.org",
        description:
          "SilverYears Trust provides dignified care for abandoned elderly citizens in Mysore. Founded in 2012 by a geriatric physician, we have served 180 individuals over 12 years.",
        trustScore: 4.7,
        approvedAt: d("2025-11-10T15:00:00Z"),
      },
    },
    {
      email: "marcus.tetteh@sunpowerafrica.org",
      name: "Marcus Tetteh",
      registeredAt: d("2025-11-07T13:00:00Z"),
      ngo: {
        orgName: "SunPower Africa",
        regNumber: "UG-NGO-2017-4421",
        country: "Uganda",
        website: "sunpowerafrica.org",
        description:
          "SunPower Africa installs solar microgrids in off-grid schools across East Africa. Since 2017 we have electrified 31 schools across Kenya, Uganda, and Ghana.",
        trustScore: 4.6,
        approvedAt: d("2025-11-10T15:30:00Z"),
      },
    },
  ];

  const ngoUsers: typeof admin[] = [];
  const ngos: { id: string }[] = [];

  for (const data of ngoUserData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: "NGO",
        emailVerified: data.registeredAt,
        createdAt: data.registeredAt,
      },
    });
    ngoUsers.push(user);

    const ngo = await prisma.ngo.create({
      data: {
        userId: user.id,
        orgName: data.ngo.orgName,
        regNumber: data.ngo.regNumber,
        country: data.ngo.country,
        website: data.ngo.website,
        description: data.ngo.description,
        trustScore: data.ngo.trustScore,
        status: "ACTIVE",
        approvedAt: data.ngo.approvedAt,
        createdAt: data.registeredAt,
      },
    });
    ngos.push(ngo);
    console.log(`  ✓ ${data.ngo.orgName} — approved`);
  }

  // ── 3. Donor users ───────────────────────────────────────────────────────
  console.log("\nCreating 10 donor accounts...");

  const donorData = [
    { email: "priya.sharma@gmail.com",     name: "Priya Sharma",      city: "San Francisco, CA",  jobTitle: "Product Manager",           company: "Google",          bio: "Product leader focused on emerging markets and sustainable tech. I give back to causes that create measurable economic opportunity.",  joinedAt: d("2025-11-20T10:00:00Z") },
    { email: "sarah.mitchell@gmail.com",   name: "Sarah Mitchell",    city: "New York, NY",       jobTitle: "VP Marketing",              company: "HubSpot",         bio: "20 years in marketing. Passionate about clean water and education. I believe transparency is the foundation of trust.",              joinedAt: d("2025-11-22T14:30:00Z") },
    { email: "james.ochieng@gmail.com",    name: "James Ochieng",     city: "Atlanta, GA",        jobTitle: "Civil Engineer",            company: "AECOM",           bio: "Infrastructure engineer with deep roots in East Africa. I fund projects where engineering creates lasting community change.",        joinedAt: d("2025-11-25T09:00:00Z") },
    { email: "rahul.verma@gmail.com",      name: "Rahul Verma",       city: "Austin, TX",         jobTitle: "Corporate Lawyer",          company: "Baker McKenzie",  bio: "International trade and compliance attorney. Pro bono work for NGOs is how I contribute skills beyond the donation cheque.",       joinedAt: d("2025-12-01T11:00:00Z") },
    { email: "fatima.alrashid@gmail.com",  name: "Fatima Al-Rashid",  city: "Chicago, IL",        jobTitle: "Investment Manager",        company: "Blackrock",       bio: "Impact investing professional. I fund elderly care and accessibility projects — causes that are chronically underfunded.",          joinedAt: d("2025-12-02T16:00:00Z") },
    { email: "marcus.johnson@gmail.com",   name: "Marcus Johnson",    city: "Seattle, WA",        jobTitle: "Data Scientist",            company: "Microsoft",       bio: "Data scientist by day, renewable energy advocate by habit. I believe every impact claim should be verifiable — hence GiveLedger.", joinedAt: d("2025-12-05T19:00:00Z") },
    { email: "anjali.patel@gmail.com",     name: "Anjali Patel",      city: "Boston, MA",         jobTitle: "UX Designer",               company: "IDEO",            bio: "Human-centred designer. I contribute skills to NGOs that need better digital experiences and give financially where lives are at stake.", joinedAt: d("2025-12-08T08:30:00Z") },
    { email: "david.lim@gmail.com",        name: "David Lim",         city: "Washington, DC",     jobTitle: "Policy Analyst",            company: "World Bank",      bio: "Development economist tracking livelihood outcomes across South Asia. GiveLedger's milestone model aligns with how I think about aid accountability.", joinedAt: d("2025-12-10T12:00:00Z") },
    { email: "grace.muthoni@gmail.com",    name: "Grace Muthoni",     city: "Houston, TX",        jobTitle: "Registered Nurse",          company: "Memorial Hermann", bio: "Healthcare professional passionate about elder care and disability access. I donate where medical outcomes are tracked and reported.", joinedAt: d("2025-12-12T10:45:00Z") },
    { email: "sophie.laurent@gmail.com",   name: "Sophie Laurent",    city: "Miami, FL",          jobTitle: "Full-Stack Developer",      company: "Stripe",          bio: "Engineer at Stripe. I build payments by day and fund solar electrification by night. Clean energy for schools is the best ROI I know.", joinedAt: d("2025-12-15T17:00:00Z") },
  ];

  const donors: typeof admin[] = [];
  for (const data of donorData) {
    const donor = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: "DONOR",
        emailVerified: data.joinedAt,
        createdAt: data.joinedAt,
        jobTitle: data.jobTitle,
        company: data.company,
        bio: data.bio,
        city: data.city,
      },
    });
    donors.push(donor);
    console.log(`  ✓ ${data.name} (${data.city})`);
  }

  const [priya, sarah, james, rahul, fatima, marcusJ, anjaliP, davidL, grace, sophie] = donors;

  // ── 4. Projects ──────────────────────────────────────────────────────────
  console.log("\nCreating 4 projects...");

  const projectDefs = [
    {
      ngoIdx: 0,
      title: "Clean Water for Kibera Schools",
      description:
        "Water contamination affects over 60% of Kibera residents. Children at 12 schools in our programme drink untreated water daily — leading to typhoid, cholera, and chronic absence from school.\n\nThis project installs industrial-grade filtration units at each school, provides maintenance training to school staff, and delivers clean water to approximately 6,200 students daily.\n\nEvery milestone is documented with photographic evidence, water quality test results, and school attendance data — all verifiable on-chain.",
      category: "CHILD_CARE" as const,
      goalAmount: 25000,
      raisedAmount: 18400,
      status: "ACTIVE" as const,
      featured: true,
      startDate: d("2025-11-15T00:00:00Z"),
      endDate: d("2026-06-30T00:00:00Z"),
    },
    {
      ngoIdx: 1,
      title: "Livelihood Training — Rural Bihar",
      description:
        "Unemployment among rural women in Bihar exceeds 70%. Pragati Foundation has been running vocational training programmes since 2015, helping women gain skills in tailoring, electronics repair, and mobile servicing.\n\nThis project funds training for 200 women across 5 villages over 8 months. Each cohort receives certification, starter kit, and 6 months of business mentorship.\n\nMilestone evidence includes attendance sheets, certification records, and income data collected 3 months post-training.",
      category: "INCOME_GENERATION" as const,
      goalAmount: 40000,
      raisedAmount: 31200,
      status: "ACTIVE" as const,
      featured: true,
      startDate: d("2025-11-20T00:00:00Z"),
      endDate: d("2026-08-31T00:00:00Z"),
    },
    {
      ngoIdx: 2,
      title: "Elderly Care Home — Mysore",
      description:
        "India has over 100 million elderly citizens, and fewer than 5% have access to organised elder care. Abandoned seniors in Mysore often live without nutrition, medical care, or human contact.\n\nSilverYears Trust is constructing a 50-bed care facility with on-site medical staff, nutritional meals, therapy rooms, and a garden. All construction milestones are verified by a licensed architect and documented on-chain.",
      category: "ELDERLY_CARE" as const,
      goalAmount: 80000,
      raisedAmount: 62000,
      status: "ACTIVE" as const,
      featured: true,
      startDate: d("2025-11-18T00:00:00Z"),
      endDate: d("2026-07-31T00:00:00Z"),
    },
    {
      ngoIdx: 3,
      title: "Solar Microgrids for Rural Schools",
      description:
        "6 rural schools in Uganda spend up to $400/month on diesel generators for electricity. Students cannot study after dark and teachers lack reliable power for projectors or computers.\n\nSunPower Africa will install rooftop solar panels, battery storage, and a local microgrid at each school. All installations are certified by licensed electrical engineers. Power output, student hours, and cost savings are tracked monthly.",
      category: "INCOME_GENERATION" as const,
      goalAmount: 55000,
      raisedAmount: 42000,
      status: "ACTIVE" as const,
      featured: false,
      startDate: d("2025-11-22T00:00:00Z"),
      endDate: d("2026-09-30T00:00:00Z"),
    },
  ];

  const projects: { id: string }[] = [];
  for (const p of projectDefs) {
    const project = await prisma.project.create({
      data: {
        ngoId: ngos[p.ngoIdx].id,
        title: p.title,
        description: p.description,
        category: p.category,
        goalAmount: p.goalAmount,
        raisedAmount: p.raisedAmount,
        status: p.status,
        featured: p.featured,
        startDate: p.startDate,
        endDate: p.endDate,
        createdAt: p.startDate,
      },
    });
    projects.push(project);
    console.log(`  ✓ ${p.title} — ACTIVE`);
  }
  const [projWater, projBihar, projMysore, projSolar] = projects;

  // ── 5. Milestones ────────────────────────────────────────────────────────
  console.log("\nCreating milestones...");

  // Project 1 — Clean Water for Kibera Schools
  const waterM1 = await prisma.milestone.create({ data: {
    projectId: projWater.id, orderIndex: 0,
    name: "Equipment procurement & import clearance",
    description: "Procure industrial-grade filtration units for 12 schools. Handle import clearance and delivery to Kibera warehouse.",
    requiredAmount: 6000, targetDate: d("2025-12-15T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2025-12-14T00:00:00Z"),
    completionNarrative: "All 12 filtration units procured from certified supplier in Nairobi. Import clearance obtained. Units delivered to our Kibera warehouse on Dec 12. Independent QA check confirmed all units meet WHO standards.",
    releasedAmount: 6000, createdAt: d("2025-11-15T00:00:00Z"),
  }});
  const waterM2 = await prisma.milestone.create({ data: {
    projectId: projWater.id, orderIndex: 1,
    name: "Installation — Schools 1–6",
    description: "Install and commission filtration systems at the first 6 schools. Conduct water quality tests and train maintenance staff.",
    requiredAmount: 5000, targetDate: d("2026-02-10T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2026-02-03T00:00:00Z"),
    completionNarrative: "Installation complete at Schools 1–6. Water quality lab certified 100% pass rate. All 6 school principals signed off. 2,400 students now have daily access to clean drinking water. Photos and lab reports attached.",
    releasedAmount: 5000, createdAt: d("2025-11-15T00:00:00Z"),
  }});
  const waterM3 = await prisma.milestone.create({ data: {
    projectId: projWater.id, orderIndex: 2,
    name: "Installation — Schools 7–12",
    description: "Install and commission filtration systems at the final 6 schools.",
    requiredAmount: 7500, targetDate: d("2026-03-20T00:00:00Z"),
    status: "UNDER_REVIEW",
    completionNarrative: "Installation completed at Schools 7–12 between Mar 10–18. All 6 filtration units tested and operational. Water quality lab results attached. School principals at all 6 locations have signed completion forms. This brings total to 12 schools, 6,200 students with daily clean water access.",
    releasedAmount: 0, createdAt: d("2025-11-15T00:00:00Z"),
  }});
  const waterM4 = await prisma.milestone.create({ data: {
    projectId: projWater.id, orderIndex: 3,
    name: "Community training & handover",
    description: "Train 2 maintenance staff per school on filter servicing. Formal handover ceremony with school principals.",
    requiredAmount: 6500, targetDate: d("2026-04-10T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-15T00:00:00Z"),
  }});

  // Project 2 — Livelihood Training Bihar
  const biharM1 = await prisma.milestone.create({ data: {
    projectId: projBihar.id, orderIndex: 0,
    name: "Training centre setup",
    description: "Set up 3 training centres across target villages. Install equipment: sewing machines, electronics workstations.",
    requiredAmount: 8000, targetDate: d("2025-12-10T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2025-12-10T00:00:00Z"),
    completionNarrative: "Three training centres set up across Vaishali, Muzaffarpur, and Sitamarhi districts. 15 sewing machines, 8 electronics repair stations installed. 2 certified trainers hired. Facility photos and equipment receipts attached.",
    releasedAmount: 8000, createdAt: d("2025-11-20T00:00:00Z"),
  }});
  const biharM2 = await prisma.milestone.create({ data: {
    projectId: projBihar.id, orderIndex: 1,
    name: "Cohort 1 — 45 women trained & certified",
    description: "Run 8-week vocational training programme for first cohort of 45 women. Issue certifications and starter kits.",
    requiredAmount: 12000, targetDate: d("2026-01-28T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2026-01-28T00:00:00Z"),
    completionNarrative: "45 women completed 8-week programme. 43 of 45 certified (2 withdrew for family reasons). Each certified graduate received a tailoring starter kit. 7 women have already started home businesses within 30 days. Attendance sheets, certification copies, and income tracking data attached.",
    releasedAmount: 12000, createdAt: d("2025-11-20T00:00:00Z"),
  }});
  const biharM3 = await prisma.milestone.create({ data: {
    projectId: projBihar.id, orderIndex: 2,
    name: "Cohort 2 — 45 women trained & certified",
    description: "Run 8-week vocational training for second cohort of 45 women.",
    requiredAmount: 12000, targetDate: d("2026-03-15T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-20T00:00:00Z"),
  }});
  const biharM4 = await prisma.milestone.create({ data: {
    projectId: projBihar.id, orderIndex: 3,
    name: "Business mentorship & 6-month income tracking",
    description: "6-month follow-up programme. Business coaching for self-employed graduates.",
    requiredAmount: 8000, targetDate: d("2026-05-01T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-20T00:00:00Z"),
  }});

  // Project 3 — Elderly Care Home Mysore
  const mysoreM1 = await prisma.milestone.create({ data: {
    projectId: projMysore.id, orderIndex: 0,
    name: "Land acquisition & permits",
    description: "Acquire 0.5-acre site in north Mysore. Obtain all municipal permits from BBMP.",
    requiredAmount: 15000, targetDate: d("2025-11-30T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2025-11-25T00:00:00Z"),
    completionNarrative: "0.5-acre site acquired in Saraswathipuram, Mysore. Registration documents and title deed obtained. All BBMP permits cleared. Land is fully unencumbered. Documents available for inspection.",
    releasedAmount: 15000, createdAt: d("2025-11-18T00:00:00Z"),
  }});
  const mysoreM2 = await prisma.milestone.create({ data: {
    projectId: projMysore.id, orderIndex: 1,
    name: "Foundation & ground floor structure",
    description: "Complete foundation work and erect ground floor structure for the 50-bed facility.",
    requiredAmount: 25000, targetDate: d("2026-01-20T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2026-01-20T00:00:00Z"),
    completionNarrative: "Foundation poured and ground floor structure complete. Licensed architect Mr. Suresh Rao has certified the work. Structural integrity tests passed. Construction is 60% of planned total. Photos, architect's certificate, and structural test report attached.",
    releasedAmount: 25000, createdAt: d("2025-11-18T00:00:00Z"),
  }});
  const mysoreM3 = await prisma.milestone.create({ data: {
    projectId: projMysore.id, orderIndex: 2,
    name: "Roof, electrical & plumbing",
    description: "Complete roofing, all electrical wiring, plumbing, and water supply installation.",
    requiredAmount: 20000, targetDate: d("2026-03-30T00:00:00Z"),
    status: "UNDER_REVIEW",
    completionNarrative: "Roofing completed March 5. Electrical wiring and plumbing finished March 18. Licensed electrician inspection passed. BWSSB water connection approved. Building is now weatherproof and utility-ready. Full completion report, architect's phase 2 certificate, and inspection reports attached.",
    releasedAmount: 0, createdAt: d("2025-11-18T00:00:00Z"),
  }});
  const mysoreM4 = await prisma.milestone.create({ data: {
    projectId: projMysore.id, orderIndex: 3,
    name: "Furnishing, staffing & inauguration",
    description: "Furnish all rooms, hire medical and care staff, conduct inaugural admission of first 50 residents.",
    requiredAmount: 20000, targetDate: d("2026-05-15T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-18T00:00:00Z"),
  }});

  // Project 4 — Solar Microgrids
  const solarM1 = await prisma.milestone.create({ data: {
    projectId: projSolar.id, orderIndex: 0,
    name: "Equipment procurement & shipping",
    description: "Procure and ship 6 solar panel arrays, battery banks, and microgrid controllers from supplier.",
    requiredAmount: 15000, targetDate: d("2026-01-15T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2026-01-10T00:00:00Z"),
    completionNarrative: "Solar panels (6×2kW arrays), LiFePO4 battery banks (6×10kWh), and smart microgrid controllers procured from SolarWorld Kenya. Shipped via Mombasa port. Customs cleared Jan 8. All equipment at Kampala warehouse. Import documents and inspection certificate attached.",
    releasedAmount: 15000, createdAt: d("2025-11-22T00:00:00Z"),
  }});
  const solarM2 = await prisma.milestone.create({ data: {
    projectId: projSolar.id, orderIndex: 1,
    name: "Installation — Schools 1–3",
    description: "Install and commission solar systems at first 3 schools.",
    requiredAmount: 15000, targetDate: d("2026-02-20T00:00:00Z"),
    status: "COMPLETED", completedAt: d("2026-02-20T00:00:00Z"),
    completionNarrative: "Solar systems operational at Nakivubo Primary, Bweyogerere Secondary, and Wakiso Technical School. Licensed electrical engineer Mr. Peter Ssebuliba has signed off on all 3 installations. Week 1 power readings show 4.2kWh/day average output per school. Generator costs eliminated. Evening study sessions now running at all 3 schools — 860 students benefiting. Reports attached.",
    releasedAmount: 15000, createdAt: d("2025-11-22T00:00:00Z"),
  }});
  const solarM3 = await prisma.milestone.create({ data: {
    projectId: projSolar.id, orderIndex: 2,
    name: "Installation — Schools 4–6",
    description: "Install and commission solar systems at remaining 3 schools.",
    requiredAmount: 15000, targetDate: d("2026-03-25T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-22T00:00:00Z"),
  }});
  const solarM4 = await prisma.milestone.create({ data: {
    projectId: projSolar.id, orderIndex: 3,
    name: "3-month monitoring & impact report",
    description: "Collect 3 months of power output data, student study hours, and generator cost savings across all 6 schools.",
    requiredAmount: 10000, targetDate: d("2026-05-01T00:00:00Z"),
    status: "PENDING", releasedAmount: 0, createdAt: d("2025-11-22T00:00:00Z"),
  }});

  console.log("  ✓ 16 milestones created (6 COMPLETED, 2 UNDER_REVIEW, 8 PENDING)");

  // ── 6. Evidence files & output markers for COMPLETED milestones ──────────
  console.log("\nAdding evidence files and output markers...");

  const completedMilestones = [
    { m: waterM1, files: [
      { fileName: "filtration-units-receipt.pdf", fileType: "PDF" },
      { fileName: "import-clearance-cert.pdf", fileType: "PDF" },
      { fileName: "warehouse-delivery-photos.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Filtration units procured", value: "12 units" },
      { label: "QA inspection result", value: "100% pass" },
    ]},
    { m: waterM2, files: [
      { fileName: "water-quality-lab-report-schools-1-6.pdf", fileType: "PDF" },
      { fileName: "installation-photos-schools-1-6.zip", fileType: "ZIP" },
      { fileName: "principal-signoff-letters.pdf", fileType: "PDF" },
    ], outputs: [
      { label: "Schools with clean water", value: "6 of 12" },
      { label: "Students with daily access", value: "2,400" },
      { label: "Water quality pass rate", value: "100%" },
    ]},
    { m: biharM1, files: [
      { fileName: "training-centre-photos.zip", fileType: "ZIP" },
      { fileName: "equipment-receipts.pdf", fileType: "PDF" },
      { fileName: "trainer-certificates.pdf", fileType: "PDF" },
    ], outputs: [
      { label: "Training centres established", value: "3 villages" },
      { label: "Sewing machines installed", value: "15" },
      { label: "Electronics stations installed", value: "8" },
    ]},
    { m: biharM2, files: [
      { fileName: "cohort1-attendance-records.pdf", fileType: "PDF" },
      { fileName: "certification-copies-43-women.pdf", fileType: "PDF" },
      { fileName: "training-photos-and-video.zip", fileType: "ZIP" },
      { fileName: "income-tracking-30-day.pdf", fileType: "PDF" },
    ], outputs: [
      { label: "Women trained", value: "43 certified" },
      { label: "Businesses started in 30 days", value: "7" },
      { label: "Average income potential increase", value: "+35%" },
    ]},
    { m: mysoreM1, files: [
      { fileName: "land-registration-document.pdf", fileType: "PDF" },
      { fileName: "bbmp-permits.pdf", fileType: "PDF" },
      { fileName: "site-photos.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Land area acquired", value: "0.5 acres" },
      { label: "Municipal permits", value: "All cleared" },
    ]},
    { m: mysoreM2, files: [
      { fileName: "architect-certificate-phase1.pdf", fileType: "PDF" },
      { fileName: "structural-test-report.pdf", fileType: "PDF" },
      { fileName: "construction-progress-photos.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Structural completion", value: "60%" },
      { label: "Planned bed capacity", value: "50 residents" },
      { label: "Construction workers employed", value: "18" },
    ]},
    { m: solarM1, files: [
      { fileName: "procurement-invoice-solarworld.pdf", fileType: "PDF" },
      { fileName: "customs-clearance-doc.pdf", fileType: "PDF" },
      { fileName: "warehouse-inspection-photos.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Solar arrays procured", value: "6 × 2kW" },
      { label: "Battery banks procured", value: "6 × 10kWh" },
      { label: "Equipment inspection", value: "Passed" },
    ]},
    { m: solarM2, files: [
      { fileName: "electrical-engineer-signoff-schools-1-3.pdf", fileType: "PDF" },
      { fileName: "power-output-readings-week1-4.pdf", fileType: "PDF" },
      { fileName: "installation-photos-3-schools.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Schools electrified", value: "3 of 6" },
      { label: "Students with evening study", value: "860" },
      { label: "Monthly diesel cost savings", value: "$1,200" },
    ]},
  ];

  for (const { m, files, outputs } of completedMilestones) {
    for (const f of files) {
      await prisma.evidenceFile.create({ data: {
        milestoneId: m.id, url: `#`, fileType: f.fileType, fileName: f.fileName, fileSize: 0,
      }});
    }
    for (const o of outputs) {
      await prisma.outputMarker.create({ data: { milestoneId: m.id, label: o.label, value: o.value }});
    }
  }

  // Evidence for UNDER_REVIEW milestones
  for (const { m, files, outputs } of [
    { m: waterM3, files: [
      { fileName: "water-quality-lab-schools-7-12.pdf", fileType: "PDF" },
      { fileName: "installation-photos-schools-7-12.zip", fileType: "ZIP" },
      { fileName: "principal-signoffs-schools-7-12.pdf", fileType: "PDF" },
    ], outputs: [
      { label: "Schools completed", value: "12 of 12" },
      { label: "Total students with clean water", value: "6,200" },
    ]},
    { m: mysoreM3, files: [
      { fileName: "architect-certificate-phase2.pdf", fileType: "PDF" },
      { fileName: "electrician-inspection-report.pdf", fileType: "PDF" },
      { fileName: "bwssb-water-connection-approval.pdf", fileType: "PDF" },
      { fileName: "construction-photos-roof-electrical.zip", fileType: "ZIP" },
    ], outputs: [
      { label: "Roofing completion", value: "100%" },
      { label: "Electrical inspection", value: "Passed" },
      { label: "Water connection status", value: "Active" },
    ]},
  ]) {
    for (const f of files) {
      await prisma.evidenceFile.create({ data: {
        milestoneId: m.id, url: "#", fileType: f.fileType, fileName: f.fileName, fileSize: 0,
      }});
    }
    for (const o of outputs) {
      await prisma.outputMarker.create({ data: { milestoneId: m.id, label: o.label, value: o.value }});
    }
  }

  console.log("  ✓ Evidence files and output markers added");

  // ── 7. Disbursements for completed milestones ────────────────────────────
  console.log("\nCreating approved disbursements...");

  const disbursementDefs = [
    { m: waterM1, amount: 6000, processedAt: d("2025-12-18T14:00:00Z"), hash: txHash("water-m1-disb") },
    { m: waterM2, amount: 5000, processedAt: d("2026-02-05T11:00:00Z"), hash: txHash("water-m2-disb") },
    { m: biharM1, amount: 8000, processedAt: d("2025-12-12T10:00:00Z"), hash: txHash("bihar-m1-disb") },
    { m: biharM2, amount: 12000, processedAt: d("2026-01-31T15:00:00Z"), hash: txHash("bihar-m2-disb") },
    { m: mysoreM1, amount: 15000, processedAt: d("2025-11-28T09:00:00Z"), hash: txHash("mysore-m1-disb") },
    { m: mysoreM2, amount: 25000, processedAt: d("2026-01-22T13:00:00Z"), hash: txHash("mysore-m2-disb") },
    { m: solarM1, amount: 15000, processedAt: d("2026-01-13T12:00:00Z"), hash: txHash("solar-m1-disb") },
    { m: solarM2, amount: 15000, processedAt: d("2026-02-22T16:00:00Z"), hash: txHash("solar-m2-disb") },
  ];

  const disbursements: { id: string; hash: string }[] = [];
  for (const def of disbursementDefs) {
    const disb = await prisma.disbursement.create({ data: {
      milestoneId: def.m.id,
      requestedAmount: def.amount,
      approvedAmount: def.amount,
      status: "APPROVED",
      approvedBy: admin.id,
      txHash: def.hash,
      processedAt: def.processedAt,
      createdAt: def.processedAt,
    }});
    disbursements.push({ id: disb.id, hash: def.hash });
    await prisma.blockchainRecord.create({ data: {
      entityType: "disbursement",
      disbursementId: disb.id,
      txHash: def.hash,
      network: "polygon",
      timestamp: def.processedAt,
    }});
  }

  // PENDING disbursements for UNDER_REVIEW milestones
  await prisma.disbursement.create({ data: {
    milestoneId: waterM3.id, requestedAmount: 7500, status: "PENDING",
    createdAt: d("2026-03-10T10:00:00Z"),
  }});
  await prisma.disbursement.create({ data: {
    milestoneId: mysoreM3.id, requestedAmount: 20000, status: "PENDING",
    createdAt: d("2026-03-12T09:00:00Z"),
  }});

  console.log("  ✓ 8 disbursements APPROVED ($96,000 total released)");
  console.log("  ✓ 2 disbursements PENDING (under admin review)");

  // ── 8. Donations ─────────────────────────────────────────────────────────
  console.log("\nCreating donations...");

  const donationDefs = [
    // Priya — donates to Water and Bihar
    { user: priya, proj: projWater, amount: 500,  at: d("2025-11-25T14:00:00Z"), payment: "CARD" as const },
    { user: priya, proj: projBihar, amount: 500,  at: d("2025-12-01T10:00:00Z"), payment: "CARD" as const },
    { user: priya, proj: projWater, amount: 150,  at: d("2026-03-01T11:00:00Z"), payment: "CARD" as const },
    // Sarah — donates to Water
    { user: sarah, proj: projWater, amount: 300,  at: d("2025-11-28T16:30:00Z"), payment: "CARD" as const },
    { user: sarah, proj: projWater, amount: 200,  at: d("2026-01-15T09:00:00Z"), payment: "CARD" as const },
    // James — donates to Water and Mysore
    { user: james, proj: projWater, amount: 200,  at: d("2025-12-05T08:00:00Z"), payment: "CARD" as const },
    { user: james, proj: projMysore, amount: 500, at: d("2025-12-10T14:00:00Z"), payment: "CARD" as const },
    // Rahul — donates to Bihar
    { user: rahul, proj: projBihar, amount: 1000, at: d("2025-12-03T12:00:00Z"), payment: "CARD" as const },
    { user: rahul, proj: projBihar, amount: 500,  at: d("2026-01-20T15:00:00Z"), payment: "CARD" as const },
    // Fatima — donates to Mysore
    { user: fatima, proj: projMysore, amount: 2000, at: d("2025-12-07T19:00:00Z"), payment: "CARD" as const },
    { user: fatima, proj: projMysore, amount: 1000, at: d("2026-02-01T17:00:00Z"), payment: "CARD" as const },
    // Marcus J — donates to Solar
    { user: marcusJ, proj: projSolar, amount: 500, at: d("2025-12-08T20:00:00Z"), payment: "CARD" as const },
    { user: marcusJ, proj: projSolar, amount: 300, at: d("2026-01-10T18:00:00Z"), payment: "CARD" as const },
    // Anjali P — donates to Water and Solar
    { user: anjaliP, proj: projWater, amount: 150, at: d("2025-12-09T09:00:00Z"), payment: "CARD" as const },
    { user: anjaliP, proj: projSolar, amount: 200, at: d("2025-12-14T11:00:00Z"), payment: "CARD" as const },
    // David L — donates to Bihar
    { user: davidL, proj: projBihar, amount: 250, at: d("2025-12-12T13:00:00Z"), payment: "CARD" as const },
    { user: davidL, proj: projBihar, amount: 150, at: d("2026-02-10T10:00:00Z"), payment: "CARD" as const },
    // Grace — donates to Mysore
    { user: grace, proj: projMysore, amount: 300, at: d("2025-12-13T10:00:00Z"), payment: "CARD" as const },
    { user: grace, proj: projMysore, amount: 500, at: d("2026-01-05T08:00:00Z"), payment: "CARD" as const },
    // Sophie — donates to Solar
    { user: sophie, proj: projSolar, amount: 300, at: d("2025-12-15T18:00:00Z"), payment: "CARD" as const },
    { user: sophie, proj: projSolar, amount: 150, at: d("2026-02-20T16:00:00Z"), payment: "CARD" as const },
  ];

  for (const def of donationDefs) {
    const hash = txHash(`don-${def.user.id}-${def.proj.id}-${def.amount}-${def.at.getTime()}`);
    const donation = await prisma.donation.create({ data: {
      userId: def.user.id,
      projectId: def.proj.id,
      amount: def.amount,
      currency: "USD",
      paymentMethod: def.payment,
      stripePaymentId: `pi_sim_${Math.random().toString(36).slice(2, 12)}`,
      txHash: hash,
      status: "COMPLETED",
      createdAt: def.at,
    }});
    await prisma.blockchainRecord.create({ data: {
      entityType: "donation",
      donationId: donation.id,
      txHash: hash,
      network: "polygon",
      timestamp: def.at,
    }});
  }

  console.log(`  ✓ ${donationDefs.length} donations created with blockchain records`);

  // ── 9. Campaigns (donor-led) ─────────────────────────────────────────────
  console.log("\nCreating campaigns...");

  const camp1 = await prisma.campaign.create({ data: {
    creatorId: sarah.id,
    projectId: projWater.id,
    title: "Help fund the last 6 Kibera school installations",
    description: "I donated to this project and witnessed how clean water changed these children's lives. Cohort 1 installations are done — 2,400 kids have clean water every day. The final 6 schools are next. Join me.",
    goalAmount: 7500,
    raisedAmount: 3200,
    endsAt: d("2026-03-25T00:00:00Z"),
    active: true,
    createdAt: d("2026-02-10T09:00:00Z"),
  }});
  await prisma.campaignContributor.createMany({ data: [
    { campaignId: camp1.id, userId: rahul.id,   amount: 200, createdAt: d("2026-02-12T10:00:00Z") },
    { campaignId: camp1.id, userId: priya.id,   amount: 500, createdAt: d("2026-02-14T14:00:00Z") },
    { campaignId: camp1.id, userId: james.id,   amount: 250, createdAt: d("2026-02-15T11:00:00Z") },
    { campaignId: camp1.id, userId: anjaliP.id, amount: 150, createdAt: d("2026-02-18T09:00:00Z") },
  ]});

  const camp2 = await prisma.campaign.create({ data: {
    creatorId: anjaliP.id,
    projectId: projBihar.id,
    title: "Complete Cohort 2 vocational training in Bihar",
    description: "Cohort 1 was transformative — 43 women certified, 7 businesses started. Help us get the next 45 women through the same programme.",
    goalAmount: 12000,
    raisedAmount: 8400,
    endsAt: d("2026-03-30T00:00:00Z"),
    active: true,
    createdAt: d("2026-02-15T11:00:00Z"),
  }});
  await prisma.campaignContributor.createMany({ data: [
    { campaignId: camp2.id, userId: priya.id,  amount: 1000, createdAt: d("2026-02-16T10:00:00Z") },
    { campaignId: camp2.id, userId: davidL.id, amount: 500,  createdAt: d("2026-02-18T12:00:00Z") },
    { campaignId: camp2.id, userId: rahul.id,  amount: 200,  createdAt: d("2026-02-20T15:00:00Z") },
  ]});

  const camp3 = await prisma.campaign.create({ data: {
    creatorId: davidL.id,
    projectId: projMysore.id,
    title: "50 seniors deserve a proper home — help finish the build",
    description: "The foundation is done, walls are up. Help SilverYears Trust complete the roof and electrical work so this home can open its doors in May.",
    goalAmount: 18000,
    raisedAmount: 11200,
    endsAt: d("2026-04-05T00:00:00Z"),
    active: true,
    createdAt: d("2026-02-20T14:00:00Z"),
  }});
  await prisma.campaignContributor.createMany({ data: [
    { campaignId: camp3.id, userId: fatima.id, amount: 2000, createdAt: d("2026-02-22T10:00:00Z") },
    { campaignId: camp3.id, userId: grace.id,  amount: 500,  createdAt: d("2026-02-24T09:00:00Z") },
    { campaignId: camp3.id, userId: james.id,  amount: 300,  createdAt: d("2026-02-25T14:00:00Z") },
  ]});

  const camp4 = await prisma.campaign.create({ data: {
    creatorId: marcusJ.id,
    projectId: projSolar.id,
    title: "Solar power for 3 more Ugandan schools",
    description: "Phase 1 lit up 3 schools. 860 students can now study after dark. The evidence is all on-chain. Now let's do the same for the remaining 3 schools.",
    goalAmount: 15000,
    raisedAmount: 4100,
    endsAt: d("2026-04-10T00:00:00Z"),
    active: true,
    createdAt: d("2026-03-01T12:00:00Z"),
  }});
  await prisma.campaignContributor.createMany({ data: [
    { campaignId: camp4.id, userId: sophie.id,  amount: 300, createdAt: d("2026-03-02T10:00:00Z") },
    { campaignId: camp4.id, userId: anjaliP.id, amount: 200, createdAt: d("2026-03-03T14:00:00Z") },
  ]});

  console.log("  ✓ 4 campaigns created with contributors");

  // ── 10. Board Members & Founders ─────────────────────────────────────────
  console.log("\nCreating board members...");
  const [ngoWater, ngoBihar, ngoMysore, ngoSolar] = ngos;

  await prisma.boardMember.createMany({ data: [
    // WaterBridge Kenya
    { ngoId: ngoWater.id, name: "David Ochieng",       role: "Executive Director", memberType: "FOUNDER",      bio: "Civil engineer turned social entrepreneur. Founded WaterBridge after his daughter contracted typhoid from contaminated school water in 2018.",     linkedinUrl: "https://linkedin.com/in/david-ochieng", orderIndex: 0 },
    { ngoId: ngoWater.id, name: "Dr. Sarah Wanjiku",   role: "Board Chair",        memberType: "BOARD_MEMBER", bio: "Former Regional Director, WHO Kenya. 22 years leading public health programmes across East Africa.",                                         linkedinUrl: "https://linkedin.com/in/sarah-wanjiku", orderIndex: 1 },
    { ngoId: ngoWater.id, name: "James Kamau",         role: "Technical Director", memberType: "BOARD_MEMBER", bio: "WASH engineer with 15 years experience. Certified by the Water & Environment Federation.",                                                  linkedinUrl: "https://linkedin.com/in/james-kamau-wash", orderIndex: 2 },
    // Pragati Foundation
    { ngoId: ngoBihar.id, name: "Anjali Krishnan",     role: "Programme Director", memberType: "FOUNDER",      bio: "Social work graduate from TISS Mumbai. Founded Pragati to address the 70% female unemployment rate in rural Bihar.",                        linkedinUrl: "https://linkedin.com/in/anjali-krishnan-pragati", orderIndex: 0 },
    { ngoId: ngoBihar.id, name: "Prof. Ramesh Sharma", role: "Board Chairman",     memberType: "BOARD_MEMBER", bio: "Professor of Development Economics, IIT Patna. Published researcher in rural livelihoods and vocational training outcomes.",                 linkedinUrl: "https://linkedin.com/in/ramesh-sharma-iitpatna", orderIndex: 1 },
    { ngoId: ngoBihar.id, name: "Sunita Devi",         role: "Community Director", memberType: "BOARD_MEMBER", bio: "Grassroots organiser for 18 years. Former district-level coordinator for the National Rural Livelihood Mission.",                          linkedinUrl: null, orderIndex: 2 },
    // SilverYears Trust
    { ngoId: ngoMysore.id, name: "Dr. Meera Nair",              role: "Founder & Medical Director", memberType: "FOUNDER",      bio: "Geriatric physician with 20 years at Mysore Medical College. Founded SilverYears after witnessing systemic abandonment of elderly patients.", linkedinUrl: "https://linkedin.com/in/dr-meera-nair-silveryears", orderIndex: 0 },
    { ngoId: ngoMysore.id, name: "Justice P.R. Krishnamurthy",  role: "Board Chairman",             memberType: "BOARD_MEMBER", bio: "Retired High Court Judge. Provides governance oversight and ensures all trust operations comply with Karnataka Trust Act.",                linkedinUrl: null, orderIndex: 1 },
    { ngoId: ngoMysore.id, name: "Suresh Rao",                  role: "Infrastructure Lead",        memberType: "BOARD_MEMBER", bio: "Licensed structural architect. Certifies all construction milestones for SilverYears. Donates his services pro bono.",                    linkedinUrl: "https://linkedin.com/in/suresh-rao-architect", orderIndex: 2 },
    // SunPower Africa
    { ngoId: ngoSolar.id, name: "Marcus Tetteh",       role: "Co-Founder & CEO",  memberType: "FOUNDER",      bio: "Electrical engineer from KNUST Kumasi. Co-founded SunPower Africa after leading USAID electrification projects across East Africa.",          linkedinUrl: "https://linkedin.com/in/marcus-tetteh-sunpower", orderIndex: 0 },
    { ngoId: ngoSolar.id, name: "Dr. Grace Nakamura",  role: "Board Member",       memberType: "BOARD_MEMBER", bio: "Renewable energy policy expert at the African Development Bank. PhD in Energy Systems from MIT.",                                             linkedinUrl: "https://linkedin.com/in/grace-nakamura-afdb", orderIndex: 1 },
    { ngoId: ngoSolar.id, name: "Robert Ssebuliba",    role: "Country Director",   memberType: "BOARD_MEMBER", bio: "Former Deputy Director, Uganda Ministry of Education. Oversees school-side partnerships and government liaison.",                             linkedinUrl: null, orderIndex: 2 },
  ]});
  console.log("  ✓ 12 board members + founders created across 4 NGOs");

  // ── 11. NGO Open Roles ────────────────────────────────────────────────────
  console.log("\nCreating NGO open roles...");

  const roleWaterMarketing = await prisma.ngoRole.create({ data: {
    ngoId: ngoWater.id, projectId: projWater.id,
    title: "Digital Marketing Coordinator",
    department: "Communications",
    roleType: "VOLUNTEER",
    description: "Help WaterBridge Kenya tell its story. We have impact but struggle to translate it into compelling content that drives donations and awareness. You'll run our social channels, write campaign emails, and create shareable milestone posts.",
    responsibilities: "Manage Instagram, LinkedIn, X — 3 posts/week minimum\nWrite monthly newsletter to 4,200 donors\nCreate shareable milestone update posts (templates provided)\nGrow our follower base by 20% over engagement period",
    skillsRequired: "Marketing,Social Media,Copywriting,Email Marketing",
    timeCommitment: "8 hours/week", durationWeeks: 8, isRemote: true, openings: 1,
    // Volunteer — unpaid
    status: "OPEN", applicationDeadline: d("2026-04-15T00:00:00Z"), startDate: d("2026-05-01T00:00:00Z"),
  }});

  const roleWaterFundraising = await prisma.ngoRole.create({ data: {
    ngoId: ngoWater.id,
    title: "Corporate Partnerships Strategist",
    department: "Fundraising",
    roleType: "CAREER_TRANSITION",
    description: "We need someone who understands corporate CSR and can build multi-year funding relationships with US-based companies. This is a high-impact role that will directly determine our ability to expand to 30 schools.",
    responsibilities: "Map and qualify 50 corporate CSR prospects\nDraft and send 20 partnership proposals\nLead 5+ discovery calls with CSR decision-makers\nBuild a repeatable outreach playbook we can use long-term",
    skillsRequired: "Fundraising,Sales,Corporate Partnerships,Grant Writing",
    timeCommitment: "12 hours/week", durationWeeks: 12, isRemote: true, openings: 1,
    salaryMin: 55000, salaryMax: 75000, // USD/yr annualised equivalent for part-time engagement
    status: "OPEN", applicationDeadline: d("2026-04-01T00:00:00Z"), startDate: d("2026-04-15T00:00:00Z"),
  }});

  const rolePragatiIT = await prisma.ngoRole.create({ data: {
    ngoId: ngoBihar.id, projectId: projBihar.id,
    title: "Mobile App Developer (React Native)",
    department: "Technology",
    roleType: "INTERNSHIP",
    description: "Build a mobile learning companion app for our training programme graduates. The app will deliver short daily business lessons, connect graduates with mentors, and track income progress. You'll own the full build from scratch.",
    responsibilities: "Build React Native app (iOS + Android)\nIntegrate with our existing Prisma/PostgreSQL backend\nDeliver MVP in 6 weeks: auth, lesson delivery, income tracker\nDocument codebase and handover to our in-house team",
    skillsRequired: "React Native,TypeScript,Mobile Development,API Integration",
    timeCommitment: "20 hours/week", durationWeeks: 6, isRemote: true, openings: 1,
    salaryMin: 28000, salaryMax: 45000, // USD/yr annualised internship stipend
    status: "OPEN", applicationDeadline: d("2026-03-25T00:00:00Z"), startDate: d("2026-04-01T00:00:00Z"),
  }});

  const rolePragatiTraining = await prisma.ngoRole.create({ data: {
    ngoId: ngoBihar.id,
    title: "Vocational Training Curriculum Designer",
    department: "Programmes",
    roleType: "VOLUNTEER",
    description: "Our current curriculum is effective but outdated. We need an experienced instructional designer to modernise the tailoring and electronics modules, introduce digital skills content, and create better assessment tools.",
    responsibilities: "Audit existing 8-week curriculum (all 3 modules)\nDesign 2 new digital skills modules (mobile commerce, basic accounting)\nCreate updated assessment rubrics and trainer guides\nConduct one virtual train-the-trainer session",
    skillsRequired: "Instructional Design,Training,Curriculum Development,Education",
    timeCommitment: "10 hours/week", durationWeeks: 10, isRemote: true, openings: 1,
    // Volunteer — unpaid
    status: "OPEN", applicationDeadline: d("2026-04-10T00:00:00Z"), startDate: d("2026-04-20T00:00:00Z"),
  }});

  const roleSilverLegal = await prisma.ngoRole.create({ data: {
    ngoId: ngoMysore.id,
    title: "Nonprofit Legal Advisor",
    department: "Governance",
    roleType: "VOLUNTEER",
    description: "Provide legal guidance on Karnataka Trust Act compliance, FCRA renewal, and property documentation for our new care facility. This is advisory work — no court appearances required.",
    responsibilities: "Review and update trust deed provisions (approx. 40 pages)\nAdvise on FCRA renewal requirements and timeline\nReview construction contract and flag risks\nDraft resident admission agreement template",
    skillsRequired: "Legal,Nonprofit Law,Contract Review,Compliance",
    timeCommitment: "6 hours/week", durationWeeks: 8, isRemote: true, openings: 1,
    // Volunteer — unpaid (advisory, pro bono)
    status: "OPEN", applicationDeadline: d("2026-04-05T00:00:00Z"), startDate: d("2026-04-15T00:00:00Z"),
  }});

  const roleSolarData = await prisma.ngoRole.create({ data: {
    ngoId: ngoSolar.id, projectId: projSolar.id,
    title: "Impact Data Analyst",
    department: "Monitoring & Evaluation",
    roleType: "CAREER_TRANSITION",
    description: "Design and run our M&E framework for the 6-school solar project. You'll work directly with field engineers to collect power output data, student study hours, and cost savings — then turn it into a publishable impact report.",
    responsibilities: "Design data collection methodology for 6 schools\nBuild Excel/Sheets dashboard for real-time power monitoring\nConduct 2 virtual check-ins with school principals\nWrite final impact report (15 pages, published on our website)",
    skillsRequired: "Data Analysis,Excel,Impact Measurement,Report Writing",
    timeCommitment: "10 hours/week", durationWeeks: 10, isRemote: true, openings: 1,
    salaryMin: 48000, salaryMax: 65000, // USD/yr annualised equivalent for part-time engagement
    status: "OPEN", applicationDeadline: d("2026-02-28T00:00:00Z"), startDate: d("2026-03-05T00:00:00Z"),
  }});

  const roleSolarEngineering = await prisma.ngoRole.create({ data: {
    ngoId: ngoSolar.id, projectId: projSolar.id,
    title: "Electrical Engineering Intern",
    department: "Field Operations",
    roleType: "INTERNSHIP",
    description: "Support our field engineers remotely on installation documentation, technical specification reviews, and safety compliance checklists for the Schools 4–6 installations. You'll get real project experience on a live solar deployment.",
    responsibilities: "Review technical specifications for each school installation\nCreate installation quality checklist (30-point review)\nDocument as-built configurations for 3 schools\nAssist with engineer handover report",
    skillsRequired: "Electrical Engineering,Solar Systems,Technical Documentation",
    timeCommitment: "15 hours/week", durationWeeks: 6, isRemote: true, openings: 2,
    salaryMin: 32000, salaryMax: 48000, // USD/yr annualised internship stipend
    status: "OPEN", applicationDeadline: d("2026-03-20T00:00:00Z"), startDate: d("2026-03-25T00:00:00Z"),
  }});

  console.log("  ✓ 7 NGO roles created (WaterBridge: 2, Pragati: 2, SilverYears: 1, SunPower: 2)");

  // ── 12. Role Applications & Engagements ──────────────────────────────────
  console.log("\nCreating role applications and engagements...");

  // Priya → Pragati Mobile App Dev → ACCEPTED → ACTIVE (24h logged)
  const appPriyaIT = await prisma.roleApplication.create({ data: {
    roleId: rolePragatiIT.id, applicantId: priya.id, status: "ACCEPTED",
    coverNote: "I'm a PM at Google who codes on weekends — React Native is my side-stack. I've built two community apps before. This project would be deeply meaningful to me: I grew up in Bihar.",
    linkedinUrl: "https://linkedin.com/in/priya-sharma-pm",
    appliedAt: d("2026-03-05T10:00:00Z"), reviewedAt: d("2026-03-07T14:00:00Z"),
  }});
  const engPriyaIT = await prisma.roleEngagement.create({ data: {
    applicationId: appPriyaIT.id, startedAt: d("2026-03-10T00:00:00Z"),
    hoursLogged: 24, status: "ACTIVE",
    workSummary: "Auth flow complete, lesson delivery screens built. Working on income tracker. On track for MVP delivery April 1.",
  }});

  // Sarah → WaterBridge Marketing → ACCEPTED → ACTIVE (12h logged)
  const appSarahMarketing = await prisma.roleApplication.create({ data: {
    roleId: roleWaterMarketing.id, applicantId: sarah.id, status: "ACCEPTED",
    coverNote: "VP Marketing at HubSpot — I build content and email programmes at scale every day. I've been following WaterBridge since I donated in November. I want to help you tell this story better.",
    linkedinUrl: "https://linkedin.com/in/sarah-mitchell-hubspot",
    appliedAt: d("2026-03-02T09:00:00Z"), reviewedAt: d("2026-03-04T11:00:00Z"),
  }});
  const engSarahMarketing = await prisma.roleEngagement.create({ data: {
    applicationId: appSarahMarketing.id, startedAt: d("2026-03-08T00:00:00Z"),
    hoursLogged: 12, status: "ACTIVE",
    workSummary: "Revamped LinkedIn bio and post templates. Wrote March newsletter (4,200 subscribers). Scheduled 3 weeks of posts. Follower growth up 8% in first 2 weeks.",
  }});

  // Marcus J → SunPower Impact Data Analyst → ACCEPTED → COMPLETED (40h, $4,000)
  const appMarcusData = await prisma.roleApplication.create({ data: {
    roleId: roleSolarData.id, applicantId: marcusJ.id, status: "ACCEPTED",
    coverNote: "Data scientist at Microsoft, specialising in energy and sustainability analytics. I've built M&E dashboards for 3 renewable projects. I'll give you a monitoring system you can actually use long-term.",
    linkedinUrl: "https://linkedin.com/in/marcus-johnson-data",
    appliedAt: d("2026-02-20T18:00:00Z"), reviewedAt: d("2026-02-22T10:00:00Z"),
  }});
  const engMarcusData = await prisma.roleEngagement.create({ data: {
    applicationId: appMarcusData.id, startedAt: d("2026-03-05T00:00:00Z"),
    completedAt: d("2026-03-15T00:00:00Z"),
    hoursLogged: 40, status: "COMPLETED",
    workSummary: "Delivered full M&E framework: data collection methodology, 6-school Google Sheets dashboard, 2 principal check-ins completed, 15-page impact report submitted for publication.",
    ngoFeedback: "Marcus exceeded every expectation. His dashboard is now our standard. The impact report quality was publication-ready. We couldn't have produced it without him.",
    monetaryValue: 4000,
  }});

  // Anjali P → Pragati Training Designer → ACCEPTED → COMPLETED (30h, $2,500)
  const appAnjaliTraining = await prisma.roleApplication.create({ data: {
    roleId: rolePragatiTraining.id, applicantId: anjaliP.id, status: "ACCEPTED",
    coverNote: "UX designer at IDEO, but instructional design is half of what I do. I've redesigned training programmes for 3 NGOs. I understand how to make learning stick for adults with no prior formal education.",
    linkedinUrl: "https://linkedin.com/in/anjali-patel-ideo",
    appliedAt: d("2026-02-25T08:00:00Z"), reviewedAt: d("2026-02-27T12:00:00Z"),
  }});
  const engAnjaliTraining = await prisma.roleEngagement.create({ data: {
    applicationId: appAnjaliTraining.id, startedAt: d("2026-03-03T00:00:00Z"),
    completedAt: d("2026-03-14T00:00:00Z"),
    hoursLogged: 30, status: "COMPLETED",
    workSummary: "Audited all 3 curriculum modules. Delivered 2 new digital skills modules (mobile commerce + basic bookkeeping). Created updated assessment rubrics. Ran virtual train-the-trainer with 5 Pragati staff.",
    ngoFeedback: "Anjali's work transformed our curriculum. Her digital skills modules are exactly what our graduates needed. The trainer rubrics are already improving consistency across centres.",
    monetaryValue: 2500,
  }});

  // James → WaterBridge Fundraising → PENDING
  await prisma.roleApplication.create({ data: {
    roleId: roleWaterFundraising.id, applicantId: james.id, status: "PENDING",
    coverNote: "Civil engineer at AECOM with corporate partnership experience — I've co-led bid teams for $50M+ infrastructure contracts. I know how to position technical NGO work for corporate CSR audiences. Happy to share a sample proposal.",
    linkedinUrl: "https://linkedin.com/in/james-ochieng-aecom",
    appliedAt: d("2026-03-10T09:00:00Z"),
  }});

  // David L → SilverYears Legal → PENDING
  await prisma.roleApplication.create({ data: {
    roleId: roleSilverLegal.id, applicantId: davidL.id, status: "PENDING",
    coverNote: "Policy analyst at World Bank with a JD from Georgetown. My work covers development law and nonprofit governance frameworks across South Asia. I'm familiar with Indian trust law and FCRA requirements.",
    linkedinUrl: "https://linkedin.com/in/david-lim-worldbank",
    appliedAt: d("2026-03-12T14:00:00Z"),
  }});

  // Grace → SunPower Engineering → REJECTED
  await prisma.roleApplication.create({ data: {
    roleId: roleSolarEngineering.id, applicantId: grace.id, status: "REJECTED",
    coverNote: "Registered nurse with strong scientific background and interest in sustainable energy. Eager to learn and contribute.",
    appliedAt: d("2026-03-08T10:00:00Z"), reviewedAt: d("2026-03-10T09:00:00Z"),
  }});

  console.log("  ✓ 7 role applications (2 active engagements, 2 completed, 2 pending, 1 rejected)");

  // ── 13. SkillContributions (completed engagements → auto-create; + direct) ─
  console.log("\nCreating skill contributions...");

  // From completed engagements
  const scMarcus = await prisma.skillContribution.create({ data: {
    donorId: marcusJ.id, ngoId: ngoSolar.id, projectId: projSolar.id,
    skillCategory: "IT", status: "APPROVED",
    description: "M&E framework, 6-school solar monitoring dashboard, impact report. Role: Impact Data Analyst.",
    hoursContributed: 40, monetaryValue: 4000,
    txHash: txHash("skill-marcus-solar"), approvedAt: d("2026-03-15T12:00:00Z"),
  }});
  await prisma.roleEngagement.update({ where: { id: engMarcusData.id }, data: { skillContributionId: scMarcus.id } });

  const scAnjali = await prisma.skillContribution.create({ data: {
    donorId: anjaliP.id, ngoId: ngoBihar.id, projectId: projBihar.id,
    skillCategory: "TRAINING", status: "APPROVED",
    description: "Full curriculum redesign: 3-module audit, 2 new digital skills modules, updated assessment rubrics, train-the-trainer session. Role: Vocational Training Curriculum Designer.",
    hoursContributed: 30, monetaryValue: 2500,
    txHash: txHash("skill-anjali-pragati"), approvedAt: d("2026-03-14T15:00:00Z"),
  }});
  await prisma.roleEngagement.update({ where: { id: engAnjaliTraining.id }, data: { skillContributionId: scAnjali.id } });

  // Direct skill contributions (not from roles)
  await prisma.skillContribution.create({ data: {
    donorId: rahul.id, ngoId: ngoMysore.id,
    skillCategory: "LEGAL", status: "APPROVED",
    description: "Reviewed SilverYears Trust deed, advised on Karnataka Trust Act compliance gaps, drafted resident admission agreement template (8 pages), flagged 3 material risks in construction contract.",
    hoursContributed: 15, monetaryValue: 1500,
    txHash: txHash("skill-rahul-silveryears"), approvedAt: d("2026-03-08T10:00:00Z"),
  }});

  await prisma.skillContribution.create({ data: {
    donorId: fatima.id, ngoId: ngoWater.id, projectId: projWater.id,
    skillCategory: "MARKETING", status: "APPROVED",
    description: "Built and launched WaterBridge's first LinkedIn company page. Wrote and scheduled 20 posts. Set up Mailchimp donor list (4,200 subscribers). Delivered a 12-page social media strategy document.",
    hoursContributed: 20, monetaryValue: 2000,
    txHash: txHash("skill-fatima-waterbridge"), approvedAt: d("2026-03-05T14:00:00Z"),
  }});

  await prisma.skillContribution.create({ data: {
    donorId: sophie.id, ngoId: ngoBihar.id, projectId: projBihar.id,
    skillCategory: "IT", status: "APPROVED",
    description: "Built a donor-facing impact tracker page for Pragati Foundation. React + Next.js, integrates with their existing data. Live at pragati.org.in/impact. Includes mobile-responsive dashboard and CSV export.",
    hoursContributed: 35, monetaryValue: 3500,
    txHash: txHash("skill-sophie-pragati"), approvedAt: d("2026-03-10T11:00:00Z"),
  }});

  await prisma.skillContribution.create({ data: {
    donorId: james.id, ngoId: ngoWater.id, projectId: projWater.id,
    skillCategory: "OTHER", status: "APPROVED",
    description: "Structural review of WaterBridge's water storage tank installation specs. Verified load calculations, signed off on anchor point design. Provided written engineering opinion (AECOM letterhead).",
    hoursContributed: 8, monetaryValue: 1200,
    txHash: txHash("skill-james-waterbridge"), approvedAt: d("2026-02-28T09:00:00Z"),
  }});

  console.log("  ✓ 7 skill contributions (2 from role completions, 5 direct — all APPROVED)");

  // ── 14. Donor Endorsements ────────────────────────────────────────────────
  console.log("\nCreating donor endorsements...");
  await prisma.donorEndorsement.createMany({ skipDuplicates: true, data: [
    { donorId: priya.id,   ngoId: ngoWater.id,  endorsedBy: ngoUsers[0].id, category: "FINANCIAL",        note: "Priya has been one of our most consistent donors since day one. Her early commitment gave us the confidence to launch Kibera Schools.", createdAt: d("2026-02-15T10:00:00Z") },
    { donorId: sarah.id,   ngoId: ngoWater.id,  endorsedBy: ngoUsers[0].id, category: "SKILL",            note: "Sarah's marketing work is transformative. She rebuilt our entire communications strategy in 8 weeks. Our newsletter open rate went from 18% to 34%.", createdAt: d("2026-03-16T11:00:00Z") },
    { donorId: james.id,   ngoId: ngoWater.id,  endorsedBy: ngoUsers[0].id, category: "SKILL",            note: "James provided critical engineering oversight on our tank installation. His AECOM sign-off gave our donors and regulators real confidence.", createdAt: d("2026-03-01T09:00:00Z") },
    { donorId: fatima.id,  ngoId: ngoWater.id,  endorsedBy: ngoUsers[0].id, category: "SKILL",            note: "Fatima's marketing work laid the foundation for our digital presence. Without her we wouldn't have the LinkedIn following or email list we have today.", createdAt: d("2026-03-06T14:00:00Z") },
    { donorId: anjaliP.id, ngoId: ngoBihar.id,  endorsedBy: ngoUsers[1].id, category: "SKILL",            note: "Anjali redesigned our entire training curriculum. The quality of her work — the modules, the rubrics, the trainer session — was better than what a paid consultant would have delivered.", createdAt: d("2026-03-15T15:00:00Z") },
    { donorId: sophie.id,  ngoId: ngoBihar.id,  endorsedBy: ngoUsers[1].id, category: "SKILL",            note: "Sophie built us a proper impact tracker that our donors can now actually see. Clean code, full documentation, handed over perfectly. Outstanding work.", createdAt: d("2026-03-11T12:00:00Z") },
    { donorId: rahul.id,   ngoId: ngoMysore.id, endorsedBy: ngoUsers[2].id, category: "SKILL",            note: "Rahul's legal review was thorough and immediately actionable. He identified risks we hadn't even considered and drafted a resident agreement that protects both residents and the trust.", createdAt: d("2026-03-09T10:00:00Z") },
    { donorId: fatima.id,  ngoId: ngoMysore.id, endorsedBy: ngoUsers[2].id, category: "FINANCIAL",        note: "Fatima is SilverYears' largest individual donor. Her generosity has directly funded the construction of the ground floor and kept us on schedule.", createdAt: d("2026-02-05T09:00:00Z") },
    { donorId: marcusJ.id, ngoId: ngoSolar.id,  endorsedBy: ngoUsers[3].id, category: "SKILL",            note: "Marcus delivered more than any pro bono consultant I have worked with. His M&E framework is now the standard for how we report impact. The SunPower board was impressed.", createdAt: d("2026-03-16T10:00:00Z") },
  ]});
  console.log("  ✓ 9 donor endorsements across 4 NGOs");

  // ── 15. Donor Challenges ──────────────────────────────────────────────────
  console.log("\nCreating donor challenges...");

  const chalPriya = await prisma.donorChallenge.create({ data: {
    donorId: priya.id, challengeType: "FINANCIAL", projectId: projBihar.id,
    amount: 200, deadline: d("2026-04-01T00:00:00Z"),
    message: "I've donated to Pragati Foundation's Bihar vocational training project. Cohort 1 just certified 43 women — 7 started businesses within a month. I challenge you to match my $200 and help fund Cohort 2. Your $200 = one woman trained and certified.",
    createdAt: d("2026-02-02T10:00:00Z"),
  }});
  await prisma.challengeAcceptance.createMany({ data: [
    { challengeId: chalPriya.id, name: "James Ochieng",  createdAt: d("2026-02-03T14:00:00Z") },
    { challengeId: chalPriya.id, name: "A supporter",    createdAt: d("2026-02-05T09:00:00Z") },
    { challengeId: chalPriya.id, name: "Rahul Verma",    createdAt: d("2026-02-06T11:00:00Z") },
    { challengeId: chalPriya.id, name: "Sophie Laurent", createdAt: d("2026-02-08T17:00:00Z") },
  ]});

  const chalMarcus = await prisma.donorChallenge.create({ data: {
    donorId: marcusJ.id, challengeType: "FINANCIAL", projectId: projSolar.id,
    amount: 500, deadline: d("2026-04-15T00:00:00Z"),
    message: "860 students now study after dark because of Schools 1–3. Schools 4–6 still need funding. I've put in $800 total. I'm challenging my network to match $500. Every dollar is on-chain. You can verify exactly what it funded.",
    createdAt: d("2026-02-25T19:00:00Z"),
  }});
  await prisma.challengeAcceptance.createMany({ data: [
    { challengeId: chalMarcus.id, name: "David Lim",     createdAt: d("2026-02-26T10:00:00Z") },
    { challengeId: chalMarcus.id, name: "Grace Muthoni", createdAt: d("2026-02-27T12:00:00Z") },
    { challengeId: chalMarcus.id, name: "A supporter",   createdAt: d("2026-02-28T09:00:00Z") },
    { challengeId: chalMarcus.id, name: "A supporter",   createdAt: d("2026-03-01T14:00:00Z") },
    { challengeId: chalMarcus.id, name: "Sophie Laurent",createdAt: d("2026-03-02T16:00:00Z") },
  ]});

  const chalSarah = await prisma.donorChallenge.create({ data: {
    donorId: sarah.id, challengeType: "SKILL", ngoId: ngoWater.id,
    roleId: roleWaterMarketing.id, skillCategory: "Marketing",
    hoursContributed: 8,
    message: "WaterBridge Kenya installs clean water at schools — but they need marketers to tell their story. I've volunteered as their Digital Marketing Coordinator. If you work in marketing, comms, or content, I challenge you to give 8 hours. It's the most valuable thing you can contribute.",
    deadline: d("2026-04-20T00:00:00Z"), createdAt: d("2026-03-09T10:00:00Z"),
  }});
  await prisma.challengeAcceptance.createMany({ data: [
    { challengeId: chalSarah.id, name: "Fatima Al-Rashid", createdAt: d("2026-03-10T11:00:00Z") },
    { challengeId: chalSarah.id, name: "A contributor",    createdAt: d("2026-03-11T14:00:00Z") },
    { challengeId: chalSarah.id, name: "Priya Sharma",     createdAt: d("2026-03-12T09:00:00Z") },
  ]});

  const chalAnjali = await prisma.donorChallenge.create({ data: {
    donorId: anjaliP.id, challengeType: "SKILL", ngoId: ngoBihar.id,
    roleId: rolePragatiTraining.id, skillCategory: "Training",
    hoursContributed: 10,
    message: "I redesigned Pragati Foundation's entire training curriculum. It took 30 hours but it's now in the hands of 200 women a year. If you work in L&D, instructional design, or corporate training, they need you. I challenge you to give 10 hours.",
    deadline: d("2026-04-25T00:00:00Z"), createdAt: d("2026-03-15T16:00:00Z"),
  }});
  await prisma.challengeAcceptance.createMany({ data: [
    { challengeId: chalAnjali.id, name: "Marcus Johnson",  createdAt: d("2026-03-16T10:00:00Z") },
    { challengeId: chalAnjali.id, name: "Sophie Laurent",  createdAt: d("2026-03-17T09:00:00Z") },
  ]});

  console.log("  ✓ 4 donor challenges (2 financial, 2 skill) with 14 acceptances");

  // ── 16. MILESTONE_CREDITED notifications for donors ───────────────────────
  console.log("\nCreating MILESTONE_CREDITED notifications...");
  const milestoneCredits = [
    { projectId: projWater.id,  ngoName: "WaterBridge Kenya",   milestoneName: "Installation — Schools 1–6",      metric: "2,400 children now have clean water daily",           donorIds: [priya.id, sarah.id, james.id, anjaliP.id], sentAt: d("2026-02-05T12:00:00Z") },
    { projectId: projBihar.id,  ngoName: "Pragati Foundation",  milestoneName: "Cohort 1 — 45 women trained",     metric: "43 women certified, 7 businesses already started",    donorIds: [priya.id, rahul.id, davidL.id], sentAt: d("2026-01-31T16:00:00Z") },
    { projectId: projMysore.id, ngoName: "SilverYears Trust",   milestoneName: "Foundation & ground floor",       metric: "60% of 50-bed care facility structurally complete",   donorIds: [james.id, fatima.id, grace.id], sentAt: d("2026-01-22T14:00:00Z") },
    { projectId: projSolar.id,  ngoName: "SunPower Africa",     milestoneName: "Installation — Schools 1–3",      metric: "860 students study after dark, $1,200/month saved",   donorIds: [marcusJ.id, anjaliP.id, sophie.id], sentAt: d("2026-02-22T17:00:00Z") },
  ];
  for (const mc of milestoneCredits) {
    await prisma.notification.createMany({
      data: mc.donorIds.map((uid) => ({
        userId: uid,
        type: "MILESTONE_CREDITED",
        title: "Your donation just made an impact",
        message: `${mc.ngoName} completed "${mc.milestoneName}" — a milestone you helped fund. Result: ${mc.metric}. Share what your donation achieved.`,
        linkUrl: `/projects/${mc.projectId}`,
        read: false,
        createdAt: mc.sentAt,
      })),
      skipDuplicates: true,
    });
  }
  // ROLE_COMPLETED notifications
  await prisma.notification.create({ data: {
    userId: marcusJ.id, type: "ROLE_COMPLETED",
    title: "Engagement completed — it's on your record",
    message: "SunPower Africa has confirmed your Impact Data Analyst contribution: 40 hours, $4,000 in value. It's verified on-chain and on your GiveLedger credential now.",
    linkUrl: "/donor/credential", read: false, createdAt: d("2026-03-15T13:00:00Z"),
  }});
  await prisma.notification.create({ data: {
    userId: anjaliP.id, type: "ROLE_COMPLETED",
    title: "Engagement completed — it's on your record",
    message: "Pragati Foundation has confirmed your Curriculum Designer contribution: 30 hours, $2,500 in value. Verified on-chain. Check your credential.",
    linkUrl: "/donor/credential", read: false, createdAt: d("2026-03-14T16:00:00Z"),
  }});
  console.log("  ✓ MILESTONE_CREDITED and ROLE_COMPLETED notifications created");

  // ── 17. Spotlight Votes ──────────────────────────────────────────────────
  console.log("\nCreating spotlight votes...");
  await prisma.spotlightVote.createMany({ data: [
    { userId: priya.id,   projectId: projWater.id,  month: 2, year: 2026, createdAt: d("2026-02-05T10:00:00Z") },
    { userId: sarah.id,   projectId: projWater.id,  month: 2, year: 2026, createdAt: d("2026-02-06T11:00:00Z") },
    { userId: james.id,   projectId: projMysore.id, month: 2, year: 2026, createdAt: d("2026-02-07T09:00:00Z") },
    { userId: rahul.id,   projectId: projBihar.id,  month: 2, year: 2026, createdAt: d("2026-02-08T14:00:00Z") },
    { userId: fatima.id,  projectId: projMysore.id, month: 2, year: 2026, createdAt: d("2026-02-09T17:00:00Z") },
    { userId: marcusJ.id, projectId: projSolar.id,  month: 2, year: 2026, createdAt: d("2026-02-10T19:00:00Z") },
    { userId: anjaliP.id, projectId: projWater.id,  month: 3, year: 2026, createdAt: d("2026-03-02T09:00:00Z") },
    { userId: davidL.id,  projectId: projBihar.id,  month: 3, year: 2026, createdAt: d("2026-03-03T12:00:00Z") },
    { userId: grace.id,   projectId: projMysore.id, month: 3, year: 2026, createdAt: d("2026-03-04T10:00:00Z") },
    { userId: sophie.id,  projectId: projSolar.id,  month: 3, year: 2026, createdAt: d("2026-03-05T16:00:00Z") },
  ]});

  // Update project spotlight vote counts
  await prisma.project.update({ where: { id: projWater.id  }, data: { spotlightVoteCount: 3 } });
  await prisma.project.update({ where: { id: projBihar.id  }, data: { spotlightVoteCount: 2 } });
  await prisma.project.update({ where: { id: projMysore.id }, data: { spotlightVoteCount: 3 } });
  await prisma.project.update({ where: { id: projSolar.id  }, data: { spotlightVoteCount: 2 } });
  console.log("  ✓ 10 spotlight votes");

  // ── 18. Ratings ──────────────────────────────────────────────────────────
  console.log("\nCreating NGO ratings...");
  await prisma.rating.createMany({ skipDuplicates: true, data: [
    { donorId: priya.id,  ngoId: ngoWater.id,  stars: 5, comment: "Exceptional transparency. I can see exactly what my money did.", createdAt: d("2026-02-10T10:00:00Z") },
    { donorId: sarah.id,  ngoId: ngoWater.id,  stars: 5, comment: "Best NGO I've ever donated to. The blockchain receipts give me real confidence.", createdAt: d("2026-02-12T14:00:00Z") },
    { donorId: rahul.id,  ngoId: ngoBihar.id,  stars: 5, comment: "Pragati's work is outstanding. 43 certified women in 8 weeks — remarkable.", createdAt: d("2026-02-01T11:00:00Z") },
    { donorId: davidL.id, ngoId: ngoBihar.id,  stars: 4, comment: "Great cause and execution. Would love more frequent milestone updates.", createdAt: d("2026-02-15T09:00:00Z") },
    { donorId: fatima.id, ngoId: ngoMysore.id, stars: 5, comment: "SilverYears is doing incredible work. The construction progress photos are moving.", createdAt: d("2026-01-25T17:00:00Z") },
    { donorId: grace.id,  ngoId: ngoMysore.id, stars: 5, comment: "Full marks. On schedule, fully documented, every rupee accounted for.", createdAt: d("2026-02-05T10:00:00Z") },
    { donorId: marcusJ.id,ngoId: ngoSolar.id,  stars: 5, comment: "SunPower's technical documentation is world-class. Power readings, engineer sign-offs — brilliant.", createdAt: d("2026-02-25T19:00:00Z") },
    { donorId: sophie.id, ngoId: ngoSolar.id,  stars: 4, comment: "Love the cause and execution. Looking forward to schools 4–6.", createdAt: d("2026-02-28T16:00:00Z") },
  ]});
  console.log("  ✓ 8 donor ratings");

  // ── 12. Notifications ────────────────────────────────────────────────────
  console.log("\nCreating donor notifications...");

  // Helper: send milestone-complete notification to all donors of a project
  async function notifyDonors(
    projectId: string,
    projectTitle: string,
    milestoneName: string,
    metric: string,
    txH: string,
    sentAt: Date,
  ) {
    const donations = await prisma.donation.findMany({
      where: { projectId },
      select: { userId: true },
      distinct: ["userId"],
    });
    for (const { userId } of donations) {
      await prisma.notification.create({ data: {
        userId,
        type: "MILESTONE_COMPLETE",
        title: `Milestone verified: ${milestoneName}`,
        message: `Your funds are working. ${projectTitle} just completed: "${milestoneName}". Result: ${metric}. Blockchain record: ${txH}.`,
        linkUrl: `/projects/${projectId}`,
        read: false,
        createdAt: sentAt,
      }});
    }
  }

  // Milestone completion notifications
  await notifyDonors(projWater.id, "Clean Water for Kibera Schools",
    "Equipment procurement", "12 filtration units delivered & QA certified", disbursements[0].hash, d("2025-12-18T15:00:00Z"));
  await notifyDonors(projWater.id, "Clean Water for Kibera Schools",
    "Installation — Schools 1–6", "2,400 children now have clean water daily", disbursements[1].hash, d("2026-02-05T12:00:00Z"));
  await notifyDonors(projBihar.id, "Livelihood Training — Rural Bihar",
    "Training centre setup", "3 centres established across 3 villages", disbursements[2].hash, d("2025-12-12T11:00:00Z"));
  await notifyDonors(projBihar.id, "Livelihood Training — Rural Bihar",
    "Cohort 1 — 45 women trained", "43 women certified, 7 businesses started", disbursements[3].hash, d("2026-01-31T16:00:00Z"));
  await notifyDonors(projMysore.id, "Elderly Care Home — Mysore",
    "Land acquisition & permits", "0.5 acres acquired, all permits cleared", disbursements[4].hash, d("2025-11-28T10:00:00Z"));
  await notifyDonors(projMysore.id, "Elderly Care Home — Mysore",
    "Foundation & ground floor structure", "60% of 50-bed facility structurally complete", disbursements[5].hash, d("2026-01-22T14:00:00Z"));
  await notifyDonors(projSolar.id, "Solar Microgrids for Rural Schools",
    "Equipment procurement & shipping", "All 6 solar arrays & batteries shipped & customs-cleared", disbursements[6].hash, d("2026-01-13T13:00:00Z"));
  await notifyDonors(projSolar.id, "Solar Microgrids for Rural Schools",
    "Installation — Schools 1–3", "860 students now study after dark, $1,200/month diesel savings", disbursements[7].hash, d("2026-02-22T17:00:00Z"));

  // Campaign notifications for campaign creators
  await prisma.notification.create({ data: {
    userId: sarah.id, type: "CAMPAIGN_UPDATE",
    title: "Your campaign hit 40% — 12 days left",
    message: "Your Kibera Water campaign has raised $3,200 of your $7,500 goal. 24 people have contributed. Share it to push past 50%.",
    linkUrl: `/campaigns/${camp1.id}`, read: false, createdAt: d("2026-03-01T09:00:00Z"),
  }});
  await prisma.notification.create({ data: {
    userId: anjaliP.id, type: "CAMPAIGN_UPDATE",
    title: "Your Bihar campaign is at 70%!",
    message: "Your Cohort 2 campaign has raised $8,400 — 70% of the $12,000 goal with 18 days remaining. Keep sharing!",
    linkUrl: `/campaigns/${camp2.id}`, read: false, createdAt: d("2026-03-02T10:00:00Z"),
  }});

  // Under-review notifications to NGO users
  await prisma.notification.create({ data: {
    userId: ngoUsers[0].id, type: "MILESTONE_COMPLETE",
    title: "Evidence submitted — under review",
    message: "Your completion report for 'Installation — Schools 7–12' is being reviewed. Expected decision within 72 hours.",
    linkUrl: `/ngo/submit-milestone`, read: false, createdAt: d("2026-03-10T10:30:00Z"),
  }});
  await prisma.notification.create({ data: {
    userId: ngoUsers[2].id, type: "MILESTONE_COMPLETE",
    title: "Evidence submitted — under review",
    message: "Your completion report for 'Roof, electrical & plumbing' is being reviewed. Expected decision within 72 hours.",
    linkUrl: `/ngo/submit-milestone`, read: false, createdAt: d("2026-03-12T09:30:00Z"),
  }});

  // Spotlight winner notification
  await prisma.notification.create({ data: {
    userId: priya.id, type: "SPOTLIGHT_WINNER",
    title: "February Spotlight: Kibera Water wins!",
    message: "The project you funded — Clean Water for Kibera Schools — won the February Community Spotlight with the most donor votes. Thank you for being part of this.",
    linkUrl: `/projects/${projWater.id}`, read: true, createdAt: d("2026-03-01T08:00:00Z"),
  }});

  // Read older notifications
  await prisma.notification.updateMany({
    where: { createdAt: { lt: d("2026-01-01T00:00:00Z") }, read: false },
    data: { read: true },
  });

  console.log("  ✓ Milestone-complete notifications sent to all project donors");
  console.log("  ✓ Campaign update notifications created");
  console.log("  ✓ Spotlight winner notification created");

  // ── 20. Activity Feed (wall) — all event types covered ───────────────────
  console.log("\nCreating activity events...");
  await prisma.activityEvent.createMany({ data: [
    // NGO_JOINED
    { type: "NGO_JOINED",         ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",   actorId: ngoWater.id,  actorType: "NGO", actorName: "WaterBridge Kenya",   description: "WaterBridge Kenya joined GiveLedger — installing clean water filtration at 12 schools in Kibera.",                            linkUrl: "/ngo/" + ngoWater.id,  createdAt: d("2025-11-10T14:00:00Z") },
    { type: "NGO_JOINED",         ngoId: ngoBihar.id,  ngoName: "Pragati Foundation",  actorId: ngoBihar.id,  actorType: "NGO", actorName: "Pragati Foundation",   description: "Pragati Foundation joined GiveLedger — vocational training for 200 rural women in Bihar.",                                   linkUrl: "/ngo/" + ngoBihar.id,  createdAt: d("2025-11-10T14:30:00Z") },
    { type: "NGO_JOINED",         ngoId: ngoMysore.id, ngoName: "SilverYears Trust",   actorId: ngoMysore.id, actorType: "NGO", actorName: "SilverYears Trust",    description: "SilverYears Trust joined GiveLedger — building a 50-bed dignified care home for abandoned elderly in Mysore.",               linkUrl: "/ngo/" + ngoMysore.id, createdAt: d("2025-11-10T15:00:00Z") },
    { type: "NGO_JOINED",         ngoId: ngoSolar.id,  ngoName: "SunPower Africa",     actorId: ngoSolar.id,  actorType: "NGO", actorName: "SunPower Africa",      description: "SunPower Africa joined GiveLedger — solar microgrids for 6 off-grid schools in Uganda.",                                    linkUrl: "/ngo/" + ngoSolar.id,  createdAt: d("2025-11-10T15:30:00Z") },
    // PROJECT_LAUNCH
    { type: "PROJECT_LAUNCH", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",      actorId: ngoWater.id,  actorType: "NGO", actorName: "WaterBridge Kenya",  description: "WaterBridge Kenya launched: Clean Water for Kibera Schools — $25,000 goal, 12 schools, 6,200 students.",          linkUrl: "/projects/" + projWater.id,  createdAt: d("2025-11-15T10:00:00Z") },
    { type: "PROJECT_LAUNCH", projectId: projBihar.id,  ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", projectTitle: "Livelihood Training — Rural Bihar",    actorId: ngoBihar.id,  actorType: "NGO", actorName: "Pragati Foundation", description: "Pragati Foundation launched: Livelihood Training Rural Bihar — $40,000 goal to train 200 women.",               linkUrl: "/projects/" + projBihar.id,  createdAt: d("2025-11-20T11:00:00Z") },
    { type: "PROJECT_LAUNCH", projectId: projMysore.id, ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  projectTitle: "Elderly Care Home — Mysore",          actorId: ngoMysore.id, actorType: "NGO", actorName: "SilverYears Trust",  description: "SilverYears Trust launched: Elderly Care Home Mysore — $80,000 goal to build a 50-bed facility.",               linkUrl: "/projects/" + projMysore.id, createdAt: d("2025-11-18T09:00:00Z") },
    { type: "PROJECT_LAUNCH", projectId: projSolar.id,  ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    projectTitle: "Solar Microgrids for Rural Schools",   actorId: ngoSolar.id,  actorType: "NGO", actorName: "SunPower Africa",    description: "SunPower Africa launched: Solar Microgrids for Rural Schools — $55,000 goal to electrify 6 schools.",            linkUrl: "/projects/" + projSolar.id,  createdAt: d("2025-11-22T10:00:00Z") },
    // DONATION
    { type: "DONATION", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",    actorId: priya.id,   actorType: "USER", actorName: "Priya Sharma",     description: "Priya Sharma donated $500 to \"Clean Water for Kibera Schools\"",                  linkUrl: "/projects/" + projWater.id,  createdAt: d("2025-11-25T14:00:00Z") },
    { type: "DONATION", projectId: projBihar.id,  ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", projectTitle: "Livelihood Training — Rural Bihar",  actorId: rahul.id,   actorType: "USER", actorName: "Rahul Verma",      description: "Rahul Verma donated $1,000 to \"Livelihood Training — Rural Bihar\"",              linkUrl: "/projects/" + projBihar.id,  createdAt: d("2025-12-03T12:00:00Z") },
    { type: "DONATION", projectId: projMysore.id, ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  projectTitle: "Elderly Care Home — Mysore",        actorId: fatima.id,  actorType: "USER", actorName: "Fatima Al-Rashid", description: "Fatima Al-Rashid donated $2,000 to \"Elderly Care Home — Mysore\"",               linkUrl: "/projects/" + projMysore.id, createdAt: d("2025-12-07T19:00:00Z") },
    { type: "DONATION", projectId: projSolar.id,  ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    projectTitle: "Solar Microgrids for Rural Schools", actorId: marcusJ.id, actorType: "USER", actorName: "Marcus Johnson",   description: "Marcus Johnson donated $500 to \"Solar Microgrids for Rural Schools\"",             linkUrl: "/projects/" + projSolar.id,  createdAt: d("2025-12-08T20:00:00Z") },
    { type: "DONATION", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",    actorId: sarah.id,   actorType: "USER", actorName: "Sarah Mitchell",   description: "Sarah Mitchell donated $300 to \"Clean Water for Kibera Schools\"",                linkUrl: "/projects/" + projWater.id,  createdAt: d("2025-11-28T16:30:00Z") },
    // MILESTONE_COMPLETE
    { type: "MILESTONE_COMPLETE", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",    actorId: ngoWater.id,  actorType: "NGO", actorName: "WaterBridge Kenya",  description: "WaterBridge Kenya completed: Equipment procurement — 12 filtration units delivered, WHO-certified. $6,000 released on-chain.",      linkUrl: "/projects/" + projWater.id,  createdAt: d("2025-12-18T14:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projBihar.id,  ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", projectTitle: "Livelihood Training — Rural Bihar",  actorId: ngoBihar.id,  actorType: "NGO", actorName: "Pragati Foundation", description: "Pragati Foundation completed: Training centre setup — 3 centres, 15 sewing machines, 8 electronics stations. $8,000 released.",   linkUrl: "/projects/" + projBihar.id,  createdAt: d("2025-12-12T10:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projMysore.id, ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  projectTitle: "Elderly Care Home — Mysore",        actorId: ngoMysore.id, actorType: "NGO", actorName: "SilverYears Trust",  description: "SilverYears Trust completed: Land acquisition — 0.5 acres acquired in Mysore, all permits cleared. $15,000 released on-chain.",  linkUrl: "/projects/" + projMysore.id, createdAt: d("2025-11-28T09:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",    actorId: ngoWater.id,  actorType: "NGO", actorName: "WaterBridge Kenya",  description: "WaterBridge Kenya completed: Installation Schools 1–6 — 2,400 children now have clean water daily. $5,000 released on-chain.",    linkUrl: "/projects/" + projWater.id,  createdAt: d("2026-02-05T11:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projBihar.id,  ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", projectTitle: "Livelihood Training — Rural Bihar",  actorId: ngoBihar.id,  actorType: "NGO", actorName: "Pragati Foundation", description: "Pragati Foundation completed: Cohort 1 — 43 women certified, 7 businesses started within 30 days. $12,000 released on-chain.", linkUrl: "/projects/" + projBihar.id,  createdAt: d("2026-01-31T16:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projMysore.id, ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  projectTitle: "Elderly Care Home — Mysore",        actorId: ngoMysore.id, actorType: "NGO", actorName: "SilverYears Trust",  description: "SilverYears Trust completed: Foundation & ground floor — architect certified, 60% of 50-bed facility complete. $25,000 released.", linkUrl: "/projects/" + projMysore.id, createdAt: d("2026-01-22T14:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projSolar.id,  ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    projectTitle: "Solar Microgrids for Rural Schools", actorId: ngoSolar.id,  actorType: "NGO", actorName: "SunPower Africa",    description: "SunPower Africa completed: Equipment procurement — 6 solar arrays & batteries shipped, customs-cleared. $15,000 released.",       linkUrl: "/projects/" + projSolar.id,  createdAt: d("2026-01-13T12:00:00Z") },
    { type: "MILESTONE_COMPLETE", projectId: projSolar.id,  ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    projectTitle: "Solar Microgrids for Rural Schools", actorId: ngoSolar.id,  actorType: "NGO", actorName: "SunPower Africa",    description: "SunPower Africa completed: Installation Schools 1–3 — 860 students study after dark, $1,200/month diesel savings. $15,000 released.", linkUrl: "/projects/" + projSolar.id, createdAt: d("2026-02-22T17:00:00Z") },
    // SKILL_APPROVED
    { type: "SKILL_APPROVED", ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    actorId: marcusJ.id, actorType: "USER", actorName: "Marcus Johnson",   description: "SunPower Africa approved Marcus Johnson's data analytics contribution — M&E framework + 6-school impact dashboard. 40h, valued at $4,000.",    linkUrl: "/donor/" + marcusJ.id + "/profile", createdAt: d("2026-03-15T12:00:00Z") },
    { type: "SKILL_APPROVED", ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", actorId: anjaliP.id, actorType: "USER", actorName: "Anjali Patel",     description: "Pragati Foundation approved Anjali Patel's curriculum design contribution — full 8-week training redesign. 30h, valued at $2,500.",           linkUrl: "/donor/" + anjaliP.id + "/profile", createdAt: d("2026-03-14T15:00:00Z") },
    { type: "SKILL_APPROVED", ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  actorId: rahul.id,   actorType: "USER", actorName: "Rahul Verma",      description: "SilverYears Trust approved Rahul Verma's legal advisory contribution — trust deed review, compliance audit, resident agreement draft. 15h, $1,500.", linkUrl: "/donor/" + rahul.id + "/profile",   createdAt: d("2026-03-08T10:00:00Z") },
    { type: "SKILL_APPROVED", ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  actorId: fatima.id,  actorType: "USER", actorName: "Fatima Al-Rashid", description: "WaterBridge Kenya approved Fatima Al-Rashid's marketing contribution — LinkedIn page, 20 posts, Mailchimp setup, strategy doc. 20h, $2,000.", linkUrl: "/donor/" + fatima.id + "/profile",  createdAt: d("2026-03-05T14:00:00Z") },
    { type: "SKILL_APPROVED", ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", actorId: sophie.id,  actorType: "USER", actorName: "Sophie Laurent",   description: "Pragati Foundation approved Sophie Laurent's IT contribution — full impact tracker web page built and deployed. 35h, valued at $3,500.",          linkUrl: "/donor/" + sophie.id + "/profile",  createdAt: d("2026-03-10T11:00:00Z") },
    { type: "SKILL_APPROVED", ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  actorId: james.id,   actorType: "USER", actorName: "James Ochieng",    description: "WaterBridge Kenya approved James Ochieng's engineering contribution — structural review and AECOM sign-off on tank installation. 8h, $1,200.", linkUrl: "/donor/" + james.id + "/profile",   createdAt: d("2026-02-28T09:00:00Z") },
    // NGO_ENDORSEMENT
    { type: "NGO_ENDORSEMENT", ngoId: ngoSolar.id,  ngoName: "SunPower Africa",    actorId: ngoSolar.id,  actorType: "NGO", actorName: "SunPower Africa",    description: "SunPower Africa endorsed Marcus Johnson: \"Marcus delivered more than any pro bono consultant I have worked with. His M&E framework is now our standard.\"", linkUrl: "/donor/" + marcusJ.id + "/profile", createdAt: d("2026-03-16T10:00:00Z") },
    { type: "NGO_ENDORSEMENT", ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", actorId: ngoBihar.id,  actorType: "NGO", actorName: "Pragati Foundation", description: "Pragati Foundation endorsed Anjali Patel: \"Anjali's curriculum redesign was better than what a paid consultant would have delivered. Outstanding.\"",   linkUrl: "/donor/" + anjaliP.id + "/profile", createdAt: d("2026-03-15T15:00:00Z") },
    { type: "NGO_ENDORSEMENT", ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  actorId: ngoWater.id,  actorType: "NGO", actorName: "WaterBridge Kenya",  description: "WaterBridge Kenya endorsed Sarah Mitchell: \"Sarah rebuilt our entire comms strategy. Newsletter open rate went from 18% to 34% in 8 weeks.\"",   linkUrl: "/donor/" + sarah.id + "/profile",   createdAt: d("2026-03-16T11:00:00Z") },
    { type: "NGO_ENDORSEMENT", ngoId: ngoMysore.id, ngoName: "SilverYears Trust",  actorId: ngoMysore.id, actorType: "NGO", actorName: "SilverYears Trust",  description: "SilverYears Trust endorsed Rahul Verma: \"Rahul's legal review identified risks we hadn't considered. His resident agreement protects the trust.\"", linkUrl: "/donor/" + rahul.id + "/profile",   createdAt: d("2026-03-09T10:00:00Z") },
    // JOURNEY_UPDATE (mid-project contributor updates)
    { type: "JOURNEY_UPDATE", ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", actorId: priya.id,   actorType: "USER", actorName: "Priya Sharma",   description: "Priya Sharma logged 24h on \"Mobile App Developer\" at Pragati Foundation: Auth flow complete, lesson delivery screens built. On track for MVP delivery April 1.", linkUrl: "/opportunities/" + rolePragatiIT.id,      createdAt: d("2026-03-14T10:00:00Z") },
    { type: "JOURNEY_UPDATE", ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  actorId: sarah.id,   actorType: "USER", actorName: "Sarah Mitchell", description: "Sarah Mitchell logged 12h on \"Digital Marketing Coordinator\" at WaterBridge Kenya: Wrote March newsletter, revamped templates. Follower growth +8% in 2 weeks.", linkUrl: "/opportunities/" + roleWaterMarketing.id, createdAt: d("2026-03-15T09:00:00Z") },
    // CAMPAIGN_CREATED
    { type: "CAMPAIGN_CREATED", projectId: projWater.id,  ngoId: ngoWater.id,  ngoName: "WaterBridge Kenya",  projectTitle: "Clean Water for Kibera Schools",   actorId: sarah.id,   actorType: "USER", actorName: "Sarah Mitchell", description: "Sarah Mitchell started a campaign for Kibera Water — raising $7,500 to fund the final 6 school installations.",  linkUrl: "/projects/" + projWater.id,  createdAt: d("2026-02-10T09:00:00Z") },
    { type: "CAMPAIGN_CREATED", projectId: projBihar.id,  ngoId: ngoBihar.id,  ngoName: "Pragati Foundation", projectTitle: "Livelihood Training — Rural Bihar", actorId: anjaliP.id, actorType: "USER", actorName: "Anjali Patel",   description: "Anjali Patel started a campaign for Pragati's Cohort 2 — targeting the next 45 women for vocational training.", linkUrl: "/projects/" + projBihar.id,  createdAt: d("2026-02-15T11:00:00Z") },
    // SPOTLIGHT_WIN
    { type: "SPOTLIGHT_WIN", projectId: projWater.id, ngoId: ngoWater.id, ngoName: "WaterBridge Kenya", projectTitle: "Clean Water for Kibera Schools", description: "February Spotlight Winner: Clean Water for Kibera Schools received the most donor votes this month.", linkUrl: "/projects/" + projWater.id, createdAt: d("2026-03-01T08:00:00Z") },
  ]});
  console.log("  ✓ 40+ platform activity events covering all wall event types");

  // ── 14. NGO Suggestions by donors ───────────────────────────────────────
  console.log("\nCreating NGO suggestions...");
  await prisma.ngoSuggestion.create({ data: {
    submittedBy: grace.id,
    orgName: "PawsNairobi",
    website: "https://pawsnairobi.org",
    country: "Kenya",
    reason: "PawsNairobi has been rescuing street animals in Nairobi since 2020. They have a 120-strong volunteer network, are fully registered, and document all their work with photos and vet reports. Perfect for GiveLedger's milestone model.",
    status: "PENDING",
    createdAt: d("2026-02-08T11:00:00Z"),
  }});
  await prisma.ngoSuggestion.create({ data: {
    submittedBy: marcusJ.id,
    orgName: "AccessAbility India",
    website: "https://accessability.in",
    country: "India",
    reason: "AccessAbility India installs wheelchair ramps in Dharavi and Govandi. Founded by a wheelchair user — co-designed with the community. Their work is measurable (buildings accessible, users served) and they already track outcomes carefully.",
    status: "PENDING",
    createdAt: d("2026-03-05T14:00:00Z"),
  }});
  console.log("  ✓ 2 NGO suggestions submitted by donors");

  // ── Final summary ────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("✅  Seed complete. GiveLedger simulation is live.\n");
  console.log("📊  Summary:");
  console.log(`    1 Admin account      (platform@giveledger.com)`);
  console.log(`    4 NGO accounts       (WaterBridge, Pragati, SilverYears, SunPower)`);
  console.log(`   10 Donor accounts     (with jobTitle, company, bio, city)`);
  console.log(`   12 Board members      (3 per NGO — founders + board)`);
  console.log(`    7 NGO open roles     (VOLUNTEER, CAREER_TRANSITION, INTERNSHIP)`);
  console.log(`    7 Role applications  (2 active, 2 completed, 2 pending, 1 rejected)`);
  console.log(`    7 Skill contributions (2 from roles, 5 direct — all APPROVED)`);
  console.log(`    9 Donor endorsements`);
  console.log(`    4 Donor challenges   (2 financial, 2 skill) + 14 acceptances`);
  console.log(`    4 Active projects    ($202,000 combined goal)`);
  console.log(`   16 Milestones         (6 COMPLETED, 2 UNDER_REVIEW, 8 PENDING)`);
  console.log(`   21 Donations          ($8,850 total)`);
  console.log(`    8 Disbursements      (APPROVED, $96,000 released)`);
  console.log(`    2 Disbursements      (PENDING)`);
  console.log(`    4 Donor campaigns    with contributors`);
  console.log(`    8 NGO ratings`);
  console.log(`   10 Spotlight votes`);
  console.log(`   40+ Activity events   (NGO_JOINED, PROJECT_LAUNCH, DONATION,`);
  console.log(`                          MILESTONE_COMPLETE, SKILL_APPROVED,`);
  console.log(`                          NGO_ENDORSEMENT, JOURNEY_UPDATE, CAMPAIGN_CREATED)`);
  console.log(`    2 NGO suggestions`);
  console.log("═".repeat(60) + "\n");

  console.log("🔑  Test accounts:");
  console.log("    Admin:  platform@giveledger.com");
  console.log("    NGOs:   david.ochieng@waterbridge.ke");
  console.log("            anjali.krishnan@pragati.org");
  console.log("            meera.nair@silveryears.org");
  console.log("            marcus.tetteh@sunpowerafrica.org");
  console.log("    Donors: priya.sharma@gmail.com  (donated to Water + Bihar)");
  console.log("            sarah.mitchell@gmail.com (donated to Water, runs campaign)");
  console.log("            rahul.verma@gmail.com    (donated to Bihar)");
  console.log("            fatima.alrashid@gmail.com (donated to Mysore)");
  console.log("            marcus.johnson@gmail.com  (donated to Solar, runs campaign)");
  console.log("    (All accounts use Google OAuth — sign in via /login with these emails)\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
