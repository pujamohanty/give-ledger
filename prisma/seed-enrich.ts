/**
 * GiveLedger — Enrichment Seed
 * Creates 50 donors + 50 NGOs with full profiles and 200+ wall activities
 * Run: npx ts-node --project tsconfig.json prisma/seed-enrich.ts
 */

import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL });

function uid(): string {
  return "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
function txHash(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  const hex = Math.abs(h).toString(16).padStart(8, "0");
  return `0x${hex}a3b2${Math.abs(h * 13).toString(16).padStart(16, "0")}`;
}
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86400000);
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ─── DONOR DATA ──────────────────────────────────────────────────────────────

const DONORS = [
  { name: "Alex Chen", email: "alex.chen@techmail.com", jobTitle: "Software Engineer", company: "Google", city: "San Francisco, CA", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/alexchen", bio: "Passionate about using technology for social good. 8 years in backend engineering, now channeling that into causes that matter — clean water, education, and climate action. Every dollar I give is tracked on-chain." },
  { name: "Maria Rodriguez", email: "maria.rodriguez@designco.com", jobTitle: "UX Designer", company: "Adobe", city: "Austin, TX", skills: "Design,Communications", linkedin: "https://linkedin.com/in/mariarodriguez", bio: "Design can change the world. I volunteer design skills to NGOs and believe that good UX makes social impact more accessible. Currently focused on elderly care and disability access initiatives." },
  { name: "Jordan Williams", email: "jordan.williams@fintech.io", jobTitle: "Financial Analyst", company: "Goldman Sachs", city: "New York, NY", skills: "Finance & Accounting,Project Management", linkedin: "https://linkedin.com/in/jordanwilliams", bio: "Wall Street by day, changemaker by night. I apply the same rigor to philanthropy as I do to portfolio management — only investing in NGOs with measurable, verified outcomes." },
  { name: "Emma Thompson", email: "emma.thompson@lawfirm.com", jobTitle: "Corporate Attorney", company: "Sullivan & Cromwell", city: "New York, NY", skills: "Legal,Communications", linkedin: "https://linkedin.com/in/emmathompson", bio: "15 years in corporate law taught me that accountability is everything. I now use my legal skills to help NGOs structure compliance and governance frameworks." },
  { name: "Michael Brown", email: "michael.brown@medtech.com", jobTitle: "Data Scientist", company: "Amazon", city: "Seattle, WA", skills: "IT & Engineering,Training & Education", linkedin: "https://linkedin.com/in/michaelbrown", bio: "Data tells the truth. I look for NGOs with transparent reporting — blockchain verification gives me the confidence to give generously and hold organizations accountable." },
  { name: "Lisa Park", email: "lisa.park@mktgagency.com", jobTitle: "Marketing Director", company: "HubSpot", city: "Boston, MA", skills: "Marketing,Communications,Fundraising", linkedin: "https://linkedin.com/in/lisapark", bio: "Storytelling is how we move people. I donate marketing skills to help NGOs amplify their impact stories and reach the donors who need to hear them." },
  { name: "David Kim", email: "david.kim@startup.io", jobTitle: "Product Manager", company: "Stripe", city: "San Francisco, CA", skills: "IT & Engineering,Project Management,Marketing", linkedin: "https://linkedin.com/in/davidkim", bio: "Built products used by millions. Now applying that same product thinking to social impact — iterating on what works, cutting what doesn't." },
  { name: "Stephanie Johnson", email: "stephanie.j@healthcare.org", jobTitle: "Pediatrician", company: "UCSF Medical Center", city: "San Francisco, CA", skills: "Training & Education,Communications", linkedin: "https://linkedin.com/in/stephaniejohnson", bio: "As a pediatrician, I see the direct link between poverty and health outcomes every day. Investing in child care NGOs is the most evidence-based thing I can do with my money." },
  { name: "Ryan O'Brien", email: "ryan.obrien@cloud.dev", jobTitle: "Cloud Architect", company: "Microsoft", city: "Seattle, WA", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/ryanobrien", bio: "20 years in enterprise tech. Taking early retirement to focus on causes I care about — particularly bridging the digital divide for underserved communities." },
  { name: "Aisha Mohammed", email: "aisha.m@consultancy.co", jobTitle: "Management Consultant", company: "McKinsey", city: "Chicago, IL", skills: "Project Management,Finance & Accounting,Training & Education", linkedin: "https://linkedin.com/in/aishamohammed", bio: "Strategy consultant by profession, community builder by calling. I help NGOs think through their operating model and sustainability strategy." },
  { name: "Christopher Davis", email: "chris.davis@security.com", jobTitle: "Cybersecurity Engineer", company: "Palo Alto Networks", city: "Santa Clara, CA", skills: "IT & Engineering", linkedin: "https://linkedin.com/in/christopherdavis", bio: "Keeping the internet safe. Supporting NGOs building digital infrastructure for underserved communities — because cybersecurity matters for everyone." },
  { name: "Jennifer Martinez", email: "jennifer.m@nonprofitlaw.com", jobTitle: "Nonprofit Attorney", company: "Munger Tolles", city: "Los Angeles, CA", skills: "Legal,Communications", linkedin: "https://linkedin.com/in/jennifermartinez", bio: "Former public defender turned nonprofit attorney. I provide pro bono legal support to NGOs navigating compliance, governance, and 501(c)(3) requirements." },
  { name: "Kevin Nguyen", email: "kevin.nguyen@ecommerce.co", jobTitle: "Growth Engineer", company: "Shopify", city: "San Francisco, CA", skills: "IT & Engineering,Marketing", linkedin: "https://linkedin.com/in/kevinnguyen", bio: "Growth hacker helping NGOs scale their donor acquisition. Built tools that raised $2M for three nonprofits in the last year alone." },
  { name: "Amanda Wilson", email: "amanda.wilson@privateequity.com", jobTitle: "Private Equity Analyst", company: "Blackstone", city: "New York, NY", skills: "Finance & Accounting,Fundraising", linkedin: "https://linkedin.com/in/amandawilson", bio: "I apply investment analysis to philanthropy. Before I donate, I want to see the numbers. GiveLedger's on-chain verification is exactly the level of transparency I need." },
  { name: "Robert Taylor", email: "robert.t@architecture.co", jobTitle: "Urban Planner", company: "Gensler", city: "Los Angeles, CA", skills: "Project Management,Design", linkedin: "https://linkedin.com/in/roberttaylor", bio: "Cities are for people. I support NGOs building affordable housing, accessible infrastructure, and livable communities for the most vulnerable." },
  { name: "Sandra Lee", email: "sandra.lee@journalism.org", jobTitle: "Senior Journalist", company: "New York Times", city: "New York, NY", skills: "Communications,Training & Education", linkedin: "https://linkedin.com/in/sandralee", bio: "Covered poverty and inequality for 20 years. Now putting money where my reporting is — supporting organizations doing the hard work on the ground." },
  { name: "Thomas Jackson", email: "thomas.j@startup.vc", jobTitle: "VC Partner", company: "Andreessen Horowitz", city: "Menlo Park, CA", skills: "Finance & Accounting,Fundraising,Project Management", linkedin: "https://linkedin.com/in/thomasjackson", bio: "Invest in people and ideas that change the world. Increasingly that means NGOs and social enterprises with verifiable track records." },
  { name: "Patricia Harris", email: "patricia.h@university.edu", jobTitle: "Professor of Economics", company: "Harvard University", city: "Cambridge, MA", skills: "Training & Education,Finance & Accounting", linkedin: "https://linkedin.com/in/patriciaharris", bio: "Teaching the economics of development for 25 years. Supporting organizations that translate academic research into real-world outcomes — clean water, income generation, elder care." },
  { name: "Daniel Lewis", email: "daniel.lewis@techstartup.io", jobTitle: "CTO", company: "Anthropic", city: "San Francisco, CA", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/daniellewis", bio: "Building AI that benefits humanity. Extending that mission to how I deploy philanthropy — only organizations with transparent, verifiable impact get my support." },
  { name: "Michelle Robinson", email: "michelle.r@healthcare.net", jobTitle: "Public Health Researcher", company: "CDC", city: "Atlanta, GA", skills: "Training & Education,Communications,Project Management", linkedin: "https://linkedin.com/in/michellerobinson", bio: "Public health is the foundation of everything. Supporting NGOs that address the social determinants of health — housing, nutrition, clean water, elderly care." },
  { name: "James Walker", email: "james.walker@realestate.com", jobTitle: "Real Estate Developer", company: "Related Companies", city: "Miami, FL", skills: "Finance & Accounting,Project Management", linkedin: "https://linkedin.com/in/jameswalker", bio: "Built hundreds of homes. Now focused on ensuring that seniors have dignity in their final years. SilverYears Trust gets my largest annual donation." },
  { name: "Karen Hall", email: "karen.hall@nonprofit.org", jobTitle: "Executive Director", company: "United Way", city: "Denver, CO", skills: "Fundraising,Project Management,Communications", linkedin: "https://linkedin.com/in/karenhall", bio: "30 years in the nonprofit sector. Know exactly what good looks like — and GiveLedger's milestone-locked funding model is the future of accountable giving." },
  { name: "Joseph Young", email: "joseph.young@banking.com", jobTitle: "Investment Banker", company: "JPMorgan Chase", city: "New York, NY", skills: "Finance & Accounting,Fundraising", linkedin: "https://linkedin.com/in/josephyoung", bio: "Structured finance for Fortune 500s. Now applying the same discipline to impact investing and philanthropic capital allocation." },
  { name: "Dorothy Mitchell", email: "dorothy.m@healthcare.edu", jobTitle: "Nurse Practitioner", company: "Mass General Hospital", city: "Boston, MA", skills: "Training & Education,Communications", linkedin: "https://linkedin.com/in/dorothymitchell", bio: "40 years in nursing. Every child deserves access to a healthy start. Donating skills and dollars to organizations serving the most vulnerable patients." },
  { name: "Joshua Roberts", email: "joshua.r@software.dev", jobTitle: "Full Stack Developer", company: "GitHub", city: "San Francisco, CA", skills: "IT & Engineering", linkedin: "https://linkedin.com/in/joshuaroberts", bio: "Open source contributor and social impact technologist. I build tools for NGOs and donate monthly to causes with verified on-chain records." },
  { name: "Jessica Turner", email: "jessica.t@marketing.agency", jobTitle: "Brand Strategist", company: "Ogilvy", city: "New York, NY", skills: "Marketing,Design,Communications", linkedin: "https://linkedin.com/in/jessicaturner", bio: "20 years building brands. Now helping NGOs tell their stories better — because the mission deserves the same production quality as any Fortune 500 campaign." },
  { name: "Kenneth Phillips", email: "ken.phillips@tax.com", jobTitle: "Tax Attorney", company: "KPMG", city: "Chicago, IL", skills: "Legal,Finance & Accounting", linkedin: "https://linkedin.com/in/kennethphillips", bio: "Tax law expert helping nonprofits maximize their exempt status and donors optimize charitable deductions. GiveLedger makes this process transparent." },
  { name: "Helen Campbell", email: "helen.c@sociology.edu", jobTitle: "Social Worker", company: "City of Chicago", city: "Chicago, IL", skills: "Training & Education,Communications", linkedin: "https://linkedin.com/in/helencampbell", bio: "Front-line social worker who has seen firsthand what good NGO work looks like. I give to organizations I've vetted personally — and now verify on-chain." },
  { name: "George Evans", email: "george.e@manufacturing.com", jobTitle: "Operations Director", company: "3M", city: "Minneapolis, MN", skills: "Project Management,Finance & Accounting", linkedin: "https://linkedin.com/in/georgeevans", bio: "Operations excellence in manufacturing taught me that systems matter. NGOs with strong operational frameworks and verifiable outcomes get my support." },
  { name: "Deborah Carter", email: "deborah.c@media.com", jobTitle: "Documentary Producer", company: "PBS Frontline", city: "Washington, DC", skills: "Communications,Marketing", linkedin: "https://linkedin.com/in/deborahcarter", bio: "20 years documenting global poverty and inequality. Now directing resources toward organizations with the transparency I've sought in my journalism." },
  { name: "Edward Collins", email: "edward.c@biotech.com", jobTitle: "Biomedical Engineer", company: "Medtronic", city: "Minneapolis, MN", skills: "IT & Engineering,Training & Education", linkedin: "https://linkedin.com/in/edwardcollins", bio: "Medical devices for the world's most underserved patients. Donating 10% of income to disability access and healthcare NGOs every year." },
  { name: "Carol Stewart", email: "carol.s@accounting.firm", jobTitle: "CFO", company: "Deloitte", city: "New York, NY", skills: "Finance & Accounting,Project Management", linkedin: "https://linkedin.com/in/carolstewart", bio: "Chief Financial Officer who demands the same transparency from NGOs as from public companies. GiveLedger is the first platform that gives me that." },
  { name: "Jason Morris", email: "jason.m@logistics.co", jobTitle: "Supply Chain Director", company: "FedEx", city: "Memphis, TN", skills: "Project Management,IT & Engineering", linkedin: "https://linkedin.com/in/jasonmorris", bio: "If you can move packages across the world efficiently, you can move aid. Supporting organizations building better supply chains for humanitarian relief." },
  { name: "Martha Rogers", email: "martha.r@education.org", jobTitle: "School Principal", company: "Chicago Public Schools", city: "Chicago, IL", skills: "Training & Education,Project Management", linkedin: "https://linkedin.com/in/martharogers", bio: "30 years in public education. Every child in America deserves a great teacher and a safe learning environment. That's my giving mandate." },
  { name: "Frank Reed", email: "frank.r@construction.com", jobTitle: "Civil Engineer", company: "AECOM", city: "Houston, TX", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/frankreed", bio: "Built bridges, roads, and water systems. Now focused on making sure those same systems reach the communities that need them most." },
  { name: "Virginia Cook", email: "virginia.c@psychology.edu", jobTitle: "Clinical Psychologist", company: "Columbia University", city: "New York, NY", skills: "Training & Education,Communications", linkedin: "https://linkedin.com/in/virginiacook", bio: "Mental health is the invisible crisis. Donating to organizations addressing trauma, elderly isolation, and childhood developmental challenges." },
  { name: "Dennis Morgan", email: "dennis.m@cybersec.io", jobTitle: "CISO", company: "Cloudflare", city: "San Francisco, CA", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/dennismorgan", bio: "Protecting the internet for everyone. Extending that mission to underserved communities who deserve the same digital security as Fortune 500 companies." },
  { name: "Ruby Bell", email: "ruby.bell@hr.company", jobTitle: "People Operations Lead", company: "Netflix", city: "Los Gatos, CA", skills: "Training & Education,Communications,Project Management", linkedin: "https://linkedin.com/in/rubybell", bio: "People are the most valuable asset in any organization. Supporting NGOs that invest in human capital — training, education, and dignified employment." },
  { name: "Gregory Cooper", email: "greg.cooper@aerospace.com", jobTitle: "Aerospace Engineer", company: "SpaceX", city: "Hawthorne, CA", skills: "IT & Engineering,Project Management", linkedin: "https://linkedin.com/in/gregcooper", bio: "If we can reach Mars, we can solve hunger, poverty, and clean water access. I apply the same systems thinking to my philanthropic portfolio." },
  { name: "Kathleen Bailey", email: "kathleen.b@publishing.com", jobTitle: "Editor-in-Chief", company: "Penguin Random House", city: "New York, NY", skills: "Communications,Marketing,Training & Education", linkedin: "https://linkedin.com/in/kathleenbailey", bio: "Stories change lives. Supporting organizations that amplify marginalized voices and invest in literacy, education, and cultural preservation." },
  { name: "Larry Rivera", email: "larry.r@insurance.com", jobTitle: "Actuarial Director", company: "Aetna", city: "Hartford, CT", skills: "Finance & Accounting,Project Management", linkedin: "https://linkedin.com/in/larryrivera", bio: "I calculate risk for a living. That's why I love blockchain-verified donations — because I can model the exact probability that my money reaches its intended impact." },
  { name: "Shirley Brooks", email: "shirley.b@philanthropy.org", jobTitle: "Philanthropic Advisor", company: "Rockefeller Foundation", city: "New York, NY", skills: "Fundraising,Finance & Accounting,Project Management", linkedin: "https://linkedin.com/in/shirleybrooks", bio: "Advising high-net-worth individuals on strategic philanthropy for 25 years. GiveLedger represents the future of impact verification I've always wanted for my clients." },
  { name: "Victor Santos", email: "victor.s@architecture.com", jobTitle: "Architect", company: "SOM", city: "Los Angeles, CA", skills: "Design,Project Management", linkedin: "https://linkedin.com/in/victorsantos", bio: "Design shapes human experience. I contribute architectural expertise to NGOs building accessible spaces for elderly and disabled communities." },
  { name: "Monica Jenkins", email: "monica.j@realestate.net", jobTitle: "Real Estate Agent", company: "Keller Williams", city: "Miami, FL", skills: "Communications,Marketing", linkedin: "https://linkedin.com/in/monicajenkins", bio: "Every family deserves a safe home. Supporting affordable housing NGOs and elderly care organizations in South Florida." },
  { name: "Derek Walsh", email: "derek.w@media.co", jobTitle: "Investigative Reporter", company: "ProPublica", city: "New York, NY", skills: "Communications,Legal", linkedin: "https://linkedin.com/in/derekwalsh", bio: "Investigative journalist covering nonprofit accountability. GiveLedger's blockchain verification model is the standard I've argued for in my reporting for years." },
  { name: "Chloe Lambert", email: "chloe.l@wellness.co", jobTitle: "Wellness Entrepreneur", company: "Self-Employed", city: "Denver, CO", skills: "Training & Education,Communications", linkedin: "https://linkedin.com/in/chloelambert", bio: "Holistic wellness advocate who believes mental, physical, and financial health are interconnected. Supporting organizations addressing all three." },
  { name: "Brandon Lee", email: "brandon.l@restaurant.com", jobTitle: "Restaurant Owner", company: "Self-Employed", city: "San Francisco, CA", skills: "Training & Education,Project Management", linkedin: "https://linkedin.com/in/brandonlee", bio: "Feed the community. I run a restaurant that donates 1% of revenue to hunger relief NGOs. Every meal has a verified impact story." },
  { name: "Simone Davis", email: "simone.d@consulting.org", jobTitle: "Nonprofit Consultant", company: "Arabella Advisors", city: "Washington, DC", skills: "Fundraising,Project Management,Finance & Accounting", linkedin: "https://linkedin.com/in/simonedavis", bio: "Helping nonprofits scale their impact for 20 years. GiveLedger's model solves the accountability problem I've seen derail even the best organizations." },
  { name: "Antoine Pierre", email: "antoine.p@music.com", jobTitle: "Music Producer", company: "Warner Music", city: "Nashville, TN", skills: "Communications,Marketing,Fundraising", linkedin: "https://linkedin.com/in/antoinepierre", bio: "Music connects people across every divide. Supporting arts education NGOs and organizations using culture to drive social change in underserved communities." },
  { name: "Helen Zhang", email: "helen.z@ventures.com", jobTitle: "Serial Entrepreneur", company: "Self-Employed", city: "San Jose, CA", skills: "Finance & Accounting,Marketing,IT & Engineering", linkedin: "https://linkedin.com/in/helenz", bio: "Built and sold three companies. Turned 50 and decided that the third act is all about giving back — with the same discipline and data-driven approach that built those companies." },
];

// ─── NGO DATA ────────────────────────────────────────────────────────────────

const NGOS = [
  // CHILD_CARE (10)
  { name: "Little Stars Learning Center", state: "New York, NY", category: "CHILD_CARE", ein: "13-4567890", website: "https://littlestars.org", desc: "Providing early childhood education and safe after-school programs to over 400 children annually in underserved New York neighborhoods. Every dollar unlocks verified learning milestones.", founders: [{ name: "Dr. Rachel Kim", role: "Founder & Executive Director", type: "FOUNDER" }, { name: "James Osei", role: "Board Chair", type: "BOARD_MEMBER" }] },
  { name: "Bright Futures Academy", state: "Los Angeles, CA", category: "CHILD_CARE", ein: "95-3421890", website: "https://brightfutures.edu", desc: "Closing the achievement gap for K-12 students in South LA. Our tutoring, mentorship, and college prep programs have sent 200+ first-generation students to four-year universities.", founders: [{ name: "Maria Gutierrez", role: "Co-Founder & CEO", type: "FOUNDER" }, { name: "Dr. James Chen", role: "Academic Director", type: "BOARD_MEMBER" }] },
  { name: "Rainbow Bridge Early Childhood", state: "Chicago, IL", category: "CHILD_CARE", ein: "36-7891234", website: "https://rainbowbridge.org", desc: "Bilingual early childhood development center serving 300 children aged 0-5 in Chicago's West Side. Trauma-informed care, nutritional support, and family engagement programs.", founders: [{ name: "Sofia Reyes", role: "Founder", type: "FOUNDER" }, { name: "Dr. Patricia Wong", role: "Clinical Director", type: "BOARD_MEMBER" }] },
  { name: "Seeds of Hope Education", state: "Houston, TX", category: "CHILD_CARE", ein: "74-2345678", website: "https://seedsofhope.edu", desc: "Transforming educational outcomes in Houston's Fifth Ward through intensive literacy programs, STEM camps, and college pathway support for underserved youth.", founders: [{ name: "Marcus Johnson", role: "Founder & CEO", type: "FOUNDER" }, { name: "Angela Davis", role: "Programs Director", type: "BOARD_MEMBER" }] },
  { name: "Young Minds Initiative", state: "Phoenix, AZ", category: "CHILD_CARE", ein: "86-1234567", website: "https://youngminds.org", desc: "Providing mental health support and social-emotional learning programs to 500+ at-risk youth annually in Phoenix metro area.", founders: [{ name: "Dr. Sarah Patel", role: "Founder & Clinical Director", type: "FOUNDER" }, { name: "Robert Thompson", role: "Board Treasurer", type: "BOARD_MEMBER" }] },
  { name: "Pathways to Learning", state: "Philadelphia, PA", category: "CHILD_CARE", ein: "23-4567890", website: "https://pathwayslearning.org", desc: "After-school tutoring and summer enrichment programs serving 600 elementary school students in North and West Philadelphia's most under-resourced neighborhoods.", founders: [{ name: "Vanessa Williams", role: "Executive Director", type: "FOUNDER" }, { name: "Dr. John Harris", role: "Education Advisor", type: "BOARD_MEMBER" }] },
  { name: "Future Leaders Foundation", state: "San Antonio, TX", category: "CHILD_CARE", ein: "74-9876543", website: "https://futureleaders.org", desc: "Leadership development programs for first-generation college-bound youth. 95% of our graduates earn college admission and graduate within four years.", founders: [{ name: "Carlos Rivera", role: "Founder & President", type: "FOUNDER" }, { name: "Monica Santos", role: "Development Director", type: "BOARD_MEMBER" }] },
  { name: "Next Generation Scholars", state: "San Diego, CA", category: "CHILD_CARE", ein: "33-2109876", website: "https://nextgenscholars.org", desc: "STEM education and college prep for 350 high school students in underserved San Diego communities. 100% college acceptance rate for program completers.", founders: [{ name: "Dr. Alice Chen", role: "Founder & ED", type: "FOUNDER" }, { name: "Kevin Nguyen", role: "Tech Curriculum Lead", type: "BOARD_MEMBER" }] },
  { name: "Sunshine Scholars Fund", state: "Dallas, TX", category: "CHILD_CARE", ein: "75-3456789", website: "https://sunshinescholars.org", desc: "Scholarship programs and academic coaching for 250 high-achieving, low-income Dallas students pursuing college and vocational pathways.", founders: [{ name: "Tamara Jones", role: "Co-Founder", type: "FOUNDER" }, { name: "Dr. David Kim", role: "Academic Director", type: "BOARD_MEMBER" }] },
  { name: "Literacy First Alliance", state: "Nashville, TN", category: "CHILD_CARE", ein: "62-1357924", website: "https://literacyfirst.org", desc: "One-on-one reading tutoring and family literacy programs for 700 children and adults annually in Davidson County. Because literacy is the gateway to everything.", founders: [{ name: "Janet Morrison", role: "Founder", type: "FOUNDER" }, { name: "Prof. Emily Grant", role: "Research Advisor", type: "BOARD_MEMBER" }] },

  // INCOME_GENERATION (10)
  { name: "Women's Empowerment Network", state: "Atlanta, GA", category: "INCOME_GENERATION", ein: "58-2345678", website: "https://womensempowerment.org", desc: "Workforce development and micro-enterprise support for 400 low-income women annually in Atlanta. Our graduates increase household income by an average of 60%.", founders: [{ name: "Dr. Keisha Brown", role: "Founder & CEO", type: "FOUNDER" }, { name: "Lisa Adams", role: "Programs VP", type: "BOARD_MEMBER" }] },
  { name: "Veterans Workforce Alliance", state: "Boston, MA", category: "INCOME_GENERATION", ein: "04-3456789", website: "https://veteransworkforce.org", desc: "Job placement and entrepreneurship support for 300 post-9/11 veterans annually in Greater Boston. 87% job placement rate within 90 days of program completion.", founders: [{ name: "Col. James Bradley", role: "Founder & ED", type: "FOUNDER" }, { name: "Sandra Lee", role: "Employment Director", type: "BOARD_MEMBER" }] },
  { name: "Rebuild America Jobs Coalition", state: "Denver, CO", category: "INCOME_GENERATION", ein: "84-5678901", website: "https://rebuildamericajobs.org", desc: "Construction and skilled trades training for formerly incarcerated individuals. 78% of graduates maintain employment for two or more years post-program.", founders: [{ name: "Rick Hernandez", role: "Co-Founder", type: "FOUNDER" }, { name: "Judge Maria Torres", role: "Advisory Board", type: "BOARD_MEMBER" }] },
  { name: "Urban Enterprise Institute", state: "Seattle, WA", category: "INCOME_GENERATION", ein: "91-2345678", website: "https://urbanenterprise.org", desc: "Small business incubation and microfinance for 200 entrepreneurs annually from communities of color. Our cohorts have launched 150+ sustainable businesses.", founders: [{ name: "Angela Washington", role: "Founder & President", type: "FOUNDER" }, { name: "Dr. Marcus Reed", role: "Finance Advisor", type: "BOARD_MEMBER" }] },
  { name: "Skills for Tomorrow Foundation", state: "Miami, FL", category: "INCOME_GENERATION", ein: "59-3456789", website: "https://skillsfortomorrow.org", desc: "Digital skills training and job placement in tech for 500 unemployed and underemployed adults annually in Miami-Dade County.", founders: [{ name: "Jose Martinez", role: "Founder", type: "FOUNDER" }, { name: "Carmen Rodriguez", role: "Tech Partnerships Lead", type: "BOARD_MEMBER" }] },
  { name: "New Horizons Job Training", state: "Portland, OR", category: "INCOME_GENERATION", ein: "93-4567890", website: "https://newhorizonsjobs.org", desc: "Culinary arts, hospitality, and food service job training for individuals experiencing homelessness. 200 graduates employed annually at living wage jobs.", founders: [{ name: "Chef Thomas Park", role: "Founder & Executive Chef", type: "FOUNDER" }, { name: "Patricia Sullivan", role: "Social Services Director", type: "BOARD_MEMBER" }] },
  { name: "Community Builders Alliance", state: "Minneapolis, MN", category: "INCOME_GENERATION", ein: "41-2345678", website: "https://communitybuilders.org", desc: "Construction trades training and community development projects in North Minneapolis. Residents build their own neighborhood while gaining marketable skills.", founders: [{ name: "Darnell Jefferson", role: "Co-Founder & ED", type: "FOUNDER" }, { name: "Maria Sanchez", role: "Community Organizer", type: "BOARD_MEMBER" }] },
  { name: "Second Chance Employment", state: "Detroit, MI", category: "INCOME_GENERATION", ein: "38-5678901", website: "https://secondchanceemployment.org", desc: "Reentry employment support for 400 individuals returning from incarceration annually in Detroit. Every person deserves a second chance and a living wage.", founders: [{ name: "Pastor James Wilson", role: "Founder", type: "FOUNDER" }, { name: "Attorney Karen Mills", role: "Legal Director", type: "BOARD_MEMBER" }] },
  { name: "Rural Economic Recovery Fund", state: "Nashville, TN", category: "INCOME_GENERATION", ein: "62-3456789", website: "https://ruraleconomy.org", desc: "Agricultural training, farm-to-market support, and rural business development for 300 farming families in rural Tennessee facing economic displacement.", founders: [{ name: "William Crawford", role: "Founder & CEO", type: "FOUNDER" }, { name: "Dr. Sarah Fields", role: "Agricultural Economist", type: "BOARD_MEMBER" }] },
  { name: "Bridge to Work Foundation", state: "Charlotte, NC", category: "INCOME_GENERATION", ein: "56-7890123", website: "https://bridgetowork.org", desc: "Job readiness and career coaching for 600 long-term unemployed adults in Charlotte annually. Wrap-around services including childcare and transportation.", founders: [{ name: "Christine Taylor", role: "Founder & ED", type: "FOUNDER" }, { name: "Robert Evans", role: "Corporate Partnerships", type: "BOARD_MEMBER" }] },

  // ELDERLY_CARE (10)
  { name: "Silver Lining Senior Services", state: "Tampa, FL", category: "ELDERLY_CARE", ein: "59-4567890", website: "https://silverliningsrs.org", desc: "In-home care, social connection programs, and emergency support for 800 low-income seniors in Hillsborough County. No senior should face their final years alone.", founders: [{ name: "Nancy Hoffman", role: "Founder & Executive Director", type: "FOUNDER" }, { name: "Dr. Charles Wong", role: "Medical Director", type: "BOARD_MEMBER" }] },
  { name: "Golden Years Wellness Center", state: "Phoenix, AZ", category: "ELDERLY_CARE", ein: "86-2345678", website: "https://goldenyearswellness.org", desc: "Comprehensive wellness programs — fitness, nutrition, mental health, and social activities — for 500 seniors in Greater Phoenix who cannot afford private retirement facilities.", founders: [{ name: "Sandra Morrison", role: "Co-Founder & ED", type: "FOUNDER" }, { name: "Dr. Anthony Rivera", role: "Geriatric Specialist", type: "BOARD_MEMBER" }] },
  { name: "Senior Dignity Alliance", state: "San Francisco, CA", category: "ELDERLY_CARE", ein: "94-5678901", website: "https://seniordignity.org", desc: "Housing stability, meal delivery, and advocacy for 600 low-income seniors in San Francisco's most expensive neighborhoods. Dignity is not a luxury.", founders: [{ name: "Jean Nakamura", role: "Founder", type: "FOUNDER" }, { name: "Commissioner David Lee", role: "Policy Advisor", type: "BOARD_MEMBER" }] },
  { name: "Elder Care Network", state: "Chicago, IL", category: "ELDERLY_CARE", ein: "36-8901234", website: "https://eldercarenetwork.org", desc: "Coordinating in-home services, transportation, and medical advocacy for 1,200 isolated seniors on Chicago's South Side. No senior left without support.", founders: [{ name: "Dr. Ruth Patterson", role: "Founder & Chief Medical Officer", type: "FOUNDER" }, { name: "Marcus Thomas", role: "Operations Director", type: "BOARD_MEMBER" }] },
  { name: "Wise Elders Foundation", state: "Baltimore, MD", category: "ELDERLY_CARE", ein: "52-3456789", website: "https://wiseelders.org", desc: "Intergenerational mentorship programs connecting senior wisdom with youth ambition. 400 senior mentors and 1,000 youth participants active annually.", founders: [{ name: "Prof. Barbara Young", role: "Founder & Academic Director", type: "FOUNDER" }, { name: "Anthony Green", role: "Youth Programs Lead", type: "BOARD_MEMBER" }] },
  { name: "Sunset Years Support Network", state: "Houston, TX", category: "ELDERLY_CARE", ein: "74-6789012", website: "https://sunsetyears.org", desc: "Emergency financial assistance, home modification for accessibility, and grief support for 700 vulnerable seniors annually in Harris County.", founders: [{ name: "Gloria Simmons", role: "Founder & Social Worker", type: "FOUNDER" }, { name: "Dr. Steven Park", role: "Geriatric Psychiatrist", type: "BOARD_MEMBER" }] },
  { name: "Aging with Grace Initiative", state: "Dallas, TX", category: "ELDERLY_CARE", ein: "75-5678901", website: "https://agingwithgrace.org", desc: "Palliative care support, spiritual counseling, and end-of-life planning services for 500 low-income seniors annually in Dallas-Fort Worth.", founders: [{ name: "Sister Mary Callahan", role: "Co-Founder", type: "FOUNDER" }, { name: "Dr. James Murphy", role: "Palliative Care Advisor", type: "BOARD_MEMBER" }] },
  { name: "Home Comfort Senior Care", state: "Philadelphia, PA", category: "ELDERLY_CARE", ein: "23-6789012", website: "https://homecomfortcare.org", desc: "Home health aides, medical equipment loans, and caregiver respite support for 900 seniors and their families in Philadelphia and surrounding counties.", founders: [{ name: "Linda Chen", role: "Founder & Registered Nurse", type: "FOUNDER" }, { name: "Attorney Michael Walsh", role: "Board Secretary", type: "BOARD_MEMBER" }] },
  { name: "Lighthouse Elder Services", state: "Pittsburgh, PA", category: "ELDERLY_CARE", ein: "25-7890123", website: "https://lighthouseelders.org", desc: "Navigation support helping 600 seniors annually access Medicare, Social Security, and community benefits they're entitled to but rarely receive.", founders: [{ name: "Janet Brooks", role: "Founder & Benefits Specialist", type: "FOUNDER" }, { name: "Commissioner Tom Walsh", role: "Government Relations", type: "BOARD_MEMBER" }] },
  { name: "Eternal Spring Senior Programs", state: "Tucson, AZ", category: "ELDERLY_CARE", ein: "86-9012345", website: "https://eternalspring.org", desc: "Arts, music, and lifelong learning programs for 400 seniors annually in Southern Arizona. Because learning never stops and isolation is the real epidemic.", founders: [{ name: "Rosa Garcia", role: "Founder & Arts Educator", type: "FOUNDER" }, { name: "Dr. Patricia Flores", role: "Cognitive Health Advisor", type: "BOARD_MEMBER" }] },

  // PHYSICALLY_DISABLED (10)
  { name: "Ability First Alliance", state: "Los Angeles, CA", category: "PHYSICALLY_DISABLED", ein: "95-4567890", website: "https://abilityfirst.org", desc: "Adaptive sports, employment support, and community integration programs for 700 adults with physical disabilities in greater Los Angeles.", founders: [{ name: "Michael Torres", role: "Founder (wheelchair athlete)", type: "FOUNDER" }, { name: "Dr. Sarah Mitchell", role: "Rehabilitation Specialist", type: "BOARD_MEMBER" }] },
  { name: "Adaptive Living Foundation", state: "San Diego, CA", category: "PHYSICALLY_DISABLED", ein: "33-3456789", website: "https://adaptiveliving.org", desc: "Home modification, assistive technology, and independent living support for 400 adults with mobility challenges in San Diego County.", founders: [{ name: "Jennifer Adams", role: "Co-Founder & Occupational Therapist", type: "FOUNDER" }, { name: "Paul Chen", role: "Technology Director", type: "BOARD_MEMBER" }] },
  { name: "Breakthrough Access Network", state: "New York, NY", category: "PHYSICALLY_DISABLED", ein: "13-6789012", website: "https://breakthroughaccess.org", desc: "Legal advocacy and systems change to ensure full accessibility compliance across New York's transportation, housing, and public accommodation sectors.", founders: [{ name: "Attorney Christine Park", role: "Founder & Chief Advocate", type: "FOUNDER" }, { name: "Rebecca Hughes", role: "Policy Director", type: "BOARD_MEMBER" }] },
  { name: "Independence Matters Initiative", state: "Austin, TX", category: "PHYSICALLY_DISABLED", ein: "74-3456789", website: "https://independencematters.org", desc: "Personal care assistance, peer support networks, and employment coaching for 500 individuals with physical disabilities seeking independent living in Austin.", founders: [{ name: "David Wheeler", role: "Founder & Self-Advocate", type: "FOUNDER" }, { name: "Dr. Lisa Torres", role: "Disability Studies Professor", type: "BOARD_MEMBER" }] },
  { name: "Power of Inclusion Foundation", state: "Denver, CO", category: "PHYSICALLY_DISABLED", ein: "84-6789012", website: "https://powerinclusion.org", desc: "Inclusion consulting, disability awareness training, and accommodation support for Denver businesses committed to employing people with disabilities.", founders: [{ name: "Amanda Clarke", role: "Co-Founder & ED", type: "FOUNDER" }, { name: "Ryan Martinez", role: "Employer Partnerships", type: "BOARD_MEMBER" }] },
  { name: "Beyond Barriers Nonprofit", state: "Chicago, IL", category: "PHYSICALLY_DISABLED", ein: "36-9012345", website: "https://beyondbarriers.org", desc: "Transitional support for 300 physically disabled adults moving from institutional care to independent community living in Chicago metro area.", founders: [{ name: "Sylvia Johnson", role: "Founder & Social Worker", type: "FOUNDER" }, { name: "Dr. Marcus Lee", role: "Transition Specialist", type: "BOARD_MEMBER" }] },
  { name: "Accessible America Fund", state: "Washington, DC", category: "PHYSICALLY_DISABLED", ein: "52-4567890", website: "https://accessibleamerica.org", desc: "National advocacy organization driving ADA enforcement, accessible design standards, and inclusive policy for 60 million Americans with disabilities.", founders: [{ name: "Congressman Mark Reeves", role: "Founder (retired)", type: "FOUNDER" }, { name: "Dr. Patricia Lin", role: "Policy Research Director", type: "BOARD_MEMBER" }] },
  { name: "Disability Pride Network", state: "Portland, OR", category: "PHYSICALLY_DISABLED", ein: "93-5678901", website: "https://disabilitypride.org", desc: "Community building, cultural events, and peer support networks celebrating disability identity and creating belonging for 1,000+ members in the Pacific Northwest.", founders: [{ name: "Sam Rivera", role: "Founder & Community Organizer", type: "FOUNDER" }, { name: "Dr. Jordan Smith", role: "Identity & Culture Director", type: "BOARD_MEMBER" }] },
  { name: "Breaking Boundaries Foundation", state: "Atlanta, GA", category: "PHYSICALLY_DISABLED", ein: "58-3456789", website: "https://breakingboundaries.org", desc: "Paralympic athlete development, adaptive fitness programs, and sports scholarship fund for 200 student-athletes with physical disabilities in Georgia.", founders: [{ name: "Coach Terrence Bell", role: "Founder & Paralympic Coach", type: "FOUNDER" }, { name: "Dr. Angela Ross", role: "Sports Medicine Director", type: "BOARD_MEMBER" }] },
  { name: "Limitless Living Alliance", state: "Seattle, WA", category: "PHYSICALLY_DISABLED", ein: "91-3456789", website: "https://limitlessliving.org", desc: "Technology access programs providing adaptive devices, screen reader training, and digital literacy support for 600 individuals with disabilities in Washington state.", founders: [{ name: "Kevin Chang", role: "Founder & Tech Engineer", type: "FOUNDER" }, { name: "Dr. Susan Park", role: "Assistive Technology Expert", type: "BOARD_MEMBER" }] },

  // OTHER (10)
  { name: "Clean Coast Initiative", state: "Miami, FL", category: "OTHER", ein: "59-5678901", website: "https://cleancoast.org", desc: "Coastal cleanup, marine habitat restoration, and ocean pollution education programs along Florida's coastline. 500 tons of plastic removed annually.", founders: [{ name: "Captain Jake Morrison", role: "Founder & Marine Biologist", type: "FOUNDER" }, { name: "Dr. Elena Santos", role: "Environmental Science Director", type: "BOARD_MEMBER" }] },
  { name: "Urban Gardens Network", state: "Detroit, MI", category: "OTHER", ein: "38-6789012", website: "https://urbangardens.org", desc: "Converting vacant lots into thriving community gardens. 40 active sites providing fresh produce for 2,000 Detroit families in food desert neighborhoods.", founders: [{ name: "Fatima Ali", role: "Co-Founder & Master Gardener", type: "FOUNDER" }, { name: "Reverend Marcus Green", role: "Community Relations", type: "BOARD_MEMBER" }] },
  { name: "Digital Literacy for All", state: "Albuquerque, NM", category: "OTHER", ein: "85-2345678", website: "https://digitalliteracyforall.org", desc: "Free digital skills training, computer access, and broadband navigation support for 1,000 low-income adults and seniors in New Mexico annually.", founders: [{ name: "Maria Begay", role: "Founder & Technologist", type: "FOUNDER" }, { name: "Professor James Tewa", role: "Curriculum Director", type: "BOARD_MEMBER" }] },
  { name: "Animal Rescue Alliance", state: "Nashville, TN", category: "PET_CARE", ein: "62-4567890", website: "https://animalrescuealliance.org", desc: "Rescuing, rehabilitating, and rehoming 1,500 animals annually. Community spay/neuter programs reducing pet overpopulation in Middle Tennessee.", founders: [{ name: "Dr. Amy Collins", role: "Founder & Veterinarian", type: "FOUNDER" }, { name: "Jennifer Walsh", role: "Rescue Operations Director", type: "BOARD_MEMBER" }] },
  { name: "Hunger Zero Coalition", state: "New Orleans, LA", category: "OTHER", ein: "72-3456789", website: "https://hungerzero.org", desc: "Community food pantries, hot meal programs, and nutrition education serving 5,000 food-insecure individuals monthly in Greater New Orleans.", founders: [{ name: "Chef Pierre Tureaud", role: "Founder & Executive Chef", type: "FOUNDER" }, { name: "Sister Agnes Broussard", role: "Community Outreach", type: "BOARD_MEMBER" }] },
  { name: "Safe Shelter Network", state: "Cleveland, OH", category: "OTHER", ein: "34-5678901", website: "https://safeshelter.org", desc: "Emergency housing, domestic violence shelter, and transitional housing support for 800 individuals and families experiencing crisis in Northeast Ohio.", founders: [{ name: "Dr. Sandra Wright", role: "Founder & Social Worker", type: "FOUNDER" }, { name: "Judge Mary Thompson", role: "Legal Advisor", type: "BOARD_MEMBER" }] },
  { name: "Mental Health Matters Alliance", state: "Minneapolis, MN", category: "OTHER", ein: "41-3456789", website: "https://mentalhealthmatters.org", desc: "Community mental health clinics, crisis intervention, and stigma reduction programs serving 2,000 uninsured and underinsured adults annually in Twin Cities.", founders: [{ name: "Dr. Rachel Kim", role: "Founder & Clinical Psychologist", type: "FOUNDER" }, { name: "Senator James Blair", role: "Policy Advocate", type: "BOARD_MEMBER" }] },
  { name: "Refugee Welcome Initiative", state: "St. Louis, MO", category: "OTHER", ein: "43-2345678", website: "https://refugeewelcome.org", desc: "Comprehensive resettlement support — housing, language, employment, and community connection — for 300 refugee families annually arriving in the St. Louis metro area.", founders: [{ name: "Amina Hassan", role: "Founder & Former Refugee", type: "FOUNDER" }, { name: "Dr. Philip Warner", role: "Cultural Integration Specialist", type: "BOARD_MEMBER" }] },
  { name: "Arts for Communities Foundation", state: "Salt Lake City, UT", category: "OTHER", ein: "87-3456789", website: "https://artsforcomm.org", desc: "Arts education, cultural programming, and creative therapy for 600 underserved youth and seniors annually in Salt Lake County.", founders: [{ name: "Brigitte Sorensen", role: "Founder & Artist", type: "FOUNDER" }, { name: "Professor Tom Hansen", role: "Arts Education Director", type: "BOARD_MEMBER" }] },
  { name: "Environmental Justice Fund", state: "Sacramento, CA", category: "OTHER", ein: "94-6789012", website: "https://envjusticefund.org", desc: "Addressing environmental pollution, toxic exposure, and climate vulnerability in California's most disadvantaged communities. Advocacy, legal action, and remediation support.", founders: [{ name: "Dr. Elena Chavez", role: "Founder & Environmental Attorney", type: "FOUNDER" }, { name: "Professor Luis Reyes", role: "Environmental Science Advisor", type: "BOARD_MEMBER" }] },
];

// Project templates per category
const PROJECT_TEMPLATES: Record<string, { title: string; desc: string; goal: number; milestones: { name: string; amount: number; status: "COMPLETED" | "PENDING" }[] }[]> = {
  CHILD_CARE: [
    { title: "After-School Reading Program", desc: "Intensive one-on-one reading tutoring for 150 students identified as reading below grade level.", goal: 45000, milestones: [{ name: "Hire and train 10 reading coaches", amount: 15000, status: "COMPLETED" }, { name: "Complete first semester (75 students enrolled)", amount: 15000, status: "COMPLETED" }, { name: "Year-end assessment and graduation ceremony", amount: 15000, status: "PENDING" }] },
    { title: "STEM Summer Camp 2026", desc: "Four-week coding, robotics, and science camp for 200 underserved youth aged 10-16.", goal: 60000, milestones: [{ name: "Secure venue and equipment", amount: 20000, status: "COMPLETED" }, { name: "Run camp weeks 1-2 (100 students)", amount: 20000, status: "PENDING" }, { name: "Complete camp and measure outcomes", amount: 20000, status: "PENDING" }] },
  ],
  INCOME_GENERATION: [
    { title: "Digital Skills Bootcamp — Spring 2026", desc: "12-week intensive coding and digital marketing bootcamp for 50 unemployed adults, guaranteed job placement support.", goal: 75000, milestones: [{ name: "Enroll and assess 50 participants", amount: 25000, status: "COMPLETED" }, { name: "Complete 8-week core training phase", amount: 25000, status: "PENDING" }, { name: "Job placement (target: 40 employed within 90 days)", amount: 25000, status: "PENDING" }] },
    { title: "Women's Entrepreneur Accelerator", desc: "Business development, microgrants, and mentorship for 30 women-owned small businesses.", goal: 50000, milestones: [{ name: "Select and onboard 30 entrepreneurs", amount: 15000, status: "COMPLETED" }, { name: "Complete 6-month mentorship program", amount: 20000, status: "PENDING" }, { name: "Issue microgrants and track business outcomes", amount: 15000, status: "PENDING" }] },
  ],
  ELDERLY_CARE: [
    { title: "Senior Isolation Prevention Program", desc: "Weekly home visits, phone check-ins, and social activities for 200 isolated seniors aged 75+.", goal: 40000, milestones: [{ name: "Recruit and train 50 volunteer visitors", amount: 12000, status: "COMPLETED" }, { name: "Serve 100 seniors for 6 months", amount: 16000, status: "COMPLETED" }, { name: "Scale to 200 seniors — full program year", amount: 12000, status: "PENDING" }] },
    { title: "Fall Prevention & Home Safety", desc: "Home safety assessments and modifications for 150 seniors at fall risk, plus balance training.", goal: 35000, milestones: [{ name: "Complete 75 home safety assessments", amount: 12000, status: "COMPLETED" }, { name: "Install safety equipment in 75 homes", amount: 12000, status: "PENDING" }, { name: "Complete balance training classes for 150 seniors", amount: 11000, status: "PENDING" }] },
  ],
  PHYSICALLY_DISABLED: [
    { title: "Adaptive Sports League 2026", desc: "Year-round wheelchair basketball, seated volleyball, and para-athletics league for 120 participants.", goal: 55000, milestones: [{ name: "Equipment purchase and league setup", amount: 20000, status: "COMPLETED" }, { name: "Season 1 completion (60 participants)", amount: 18000, status: "PENDING" }, { name: "Championship tournament and awards", amount: 17000, status: "PENDING" }] },
    { title: "Assistive Technology Access Fund", desc: "Providing wheelchairs, hearing aids, screen readers, and adaptive devices to 80 individuals in need.", goal: 80000, milestones: [{ name: "Needs assessment and device sourcing", amount: 25000, status: "COMPLETED" }, { name: "Distribute devices to 40 recipients", amount: 30000, status: "PENDING" }, { name: "Training, follow-up, and impact evaluation", amount: 25000, status: "PENDING" }] },
  ],
  PET_CARE: [
    { title: "Community Spay/Neuter Initiative", desc: "Free spay/neuter surgeries for 500 pets owned by low-income families to reduce pet overpopulation.", goal: 30000, milestones: [{ name: "Partner with 5 veterinary clinics", amount: 8000, status: "COMPLETED" }, { name: "Complete 250 surgeries (Phase 1)", amount: 12000, status: "PENDING" }, { name: "Complete 500 total surgeries", amount: 10000, status: "PENDING" }] },
  ],
  OTHER: [
    { title: "Community Resource Hub", desc: "One-stop navigation center helping 500 vulnerable individuals annually access food, housing, healthcare, and employment services.", goal: 65000, milestones: [{ name: "Secure location and hire 3 navigators", amount: 20000, status: "COMPLETED" }, { name: "Serve first 250 clients", amount: 25000, status: "PENDING" }, { name: "Scale to 500 clients and evaluate outcomes", amount: 20000, status: "PENDING" }] },
    { title: "Digital Access for Underserved Communities", desc: "Providing refurbished computers, broadband hotspots, and training to 300 low-income households.", goal: 45000, milestones: [{ name: "Source and refurbish 150 computers", amount: 15000, status: "COMPLETED" }, { name: "Distribute to 150 households with setup support", amount: 15000, status: "PENDING" }, { name: "Complete second wave of 150 households", amount: 15000, status: "PENDING" }] },
  ],
};

async function main() {
  console.log("🌱 Starting enrichment seed...\n");

  const donorIds: { id: string; name: string }[] = [];
  const ngoIds: { id: string; ngoId: string; name: string; category: string }[] = [];
  const projectIds: { id: string; ngoId: string; title: string; ngoName: string }[] = [];
  const activityEvents: { type: string; desc: string; actorName: string; actorId: string; actorType: string; ngoName?: string; projectTitle?: string; projectId?: string; linkUrl?: string; daysAgoN: number }[] = [];

  // Clean up previous enrichment seed (by email pattern)
  console.log("  Cleaning up previous enrichment seed...");
  const enEmails = DONORS.map(d => d.email);
  const ngoEmails = NGOS.map(n => n.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@giveledger-ngo.com");
  const allEmails = [...enEmails, ...ngoEmails];

  const existingResult = await pool.query(
    `SELECT id FROM "User" WHERE email = ANY($1)`,
    [allEmails]
  );
  if (existingResult.rows.length > 0) {
    const ids = existingResult.rows.map(r => r.id);
    // cascade deletes via FK constraints mostly, but let's do explicit cleanup
    // delete in reverse dependency order — simpler: just delete users (cascade handles the rest via schema)
    // We need to clean donations, skill contributions etc. manually
    const ngoResult = await pool.query(`SELECT id FROM "Ngo" WHERE "userId" = ANY($1)`, [ids]);
    const ngoIdList = ngoResult.rows.map(r => r.id);
    if (ngoIdList.length > 0) {
      const projResult = await pool.query(`SELECT id FROM "Project" WHERE "ngoId" = ANY($1)`, [ngoIdList]);
      const projIdList = projResult.rows.map(r => r.id);
      if (projIdList.length > 0) {
        const msResult = await pool.query(`SELECT id FROM "Milestone" WHERE "projectId" = ANY($1)`, [projIdList]);
        const msIdList = msResult.rows.map(r => r.id);
        if (msIdList.length > 0) {
          const disResult = await pool.query(`SELECT id FROM "Disbursement" WHERE "milestoneId" = ANY($1)`, [msIdList]);
          const disIdList = disResult.rows.map(r => r.id);
          if (disIdList.length > 0) {
            await pool.query(`DELETE FROM "BlockchainRecord" WHERE "disbursementId" = ANY($1)`, [disIdList]);
            await pool.query(`DELETE FROM "Disbursement" WHERE id = ANY($1)`, [disIdList]);
          }
          await pool.query(`DELETE FROM "EvidenceFile" WHERE "milestoneId" = ANY($1)`, [msIdList]);
          await pool.query(`DELETE FROM "OutputMarker" WHERE "milestoneId" = ANY($1)`, [msIdList]);
          await pool.query(`DELETE FROM "Milestone" WHERE id = ANY($1)`, [msIdList]);
        }
        await pool.query(`DELETE FROM "Donation" WHERE "projectId" = ANY($1)`, [projIdList]);
        await pool.query(`DELETE FROM "Project" WHERE id = ANY($1)`, [projIdList]);
      }
      await pool.query(`DELETE FROM "BoardMember" WHERE "ngoId" = ANY($1)`, [ngoIdList]);
      await pool.query(`DELETE FROM "Ngo" WHERE id = ANY($1)`, [ngoIdList]);
    }
    await pool.query(`DELETE FROM "Donation" WHERE "userId" = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM "SkillContribution" WHERE "donorId" = ANY($1)`, [ids]);
    await pool.query(`DELETE FROM "User" WHERE id = ANY($1)`, [ids]);
    console.log(`  Cleaned up ${ids.length} previous accounts.\n`);
  }

  // ─── SEED 50 DONORS ──────────────────────────────────────────────────────
  console.log("  Creating 50 donors...");
  for (const d of DONORS) {
    const id = uid();
    donorIds.push({ id, name: d.name });
    await pool.query(
      `INSERT INTO "User" (id, email, name, role, "jobTitle", company, city, "linkedinUrl", skills, bio, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,'DONOR',$4,$5,$6,$7,$8,$9,$10,$10)`,
      [id, d.email, d.name, d.jobTitle, d.company, d.city, d.linkedin, d.skills, d.bio, daysAgo(Math.floor(Math.random() * 180) + 30)]
    );
    // Activity: NGO_JOINED style event for donors
    activityEvents.push({
      type: "DONOR_ENDORSEMENT",
      desc: `${d.name} joined GiveLedger as a donor — ${d.jobTitle} at ${d.company}, committed to verified impact giving.`,
      actorName: d.name, actorId: id, actorType: "USER",
      linkUrl: `/donor/${id}/profile`, daysAgoN: Math.floor(Math.random() * 90) + 5,
    });
  }
  console.log("  ✓ 50 donors created");

  // ─── SEED 50 NGOS ────────────────────────────────────────────────────────
  console.log("  Creating 50 NGOs...");
  for (let i = 0; i < NGOS.length; i++) {
    const n = NGOS[i];
    const email = n.name.toLowerCase().replace(/[^a-z0-9]/g, "") + "@giveledger-ngo.com";
    const userId = uid();
    const ngoId = uid();
    ngoIds.push({ id: userId, ngoId, name: n.name, category: n.category });

    await pool.query(
      `INSERT INTO "User" (id, email, name, role, "createdAt", "updatedAt") VALUES ($1,$2,$3,'NGO',$4,$4)`,
      [userId, email, n.name, daysAgo(Math.floor(Math.random() * 200) + 90)]
    );
    await pool.query(
      `INSERT INTO "Ngo" (id, "userId", "orgName", ein, state, country, website, description, "trustScore", status, "approvedAt", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,'United States',$6,$7,$8,'ACTIVE',$9,$9,$9)`,
      [ngoId, userId, n.name, n.ein, n.state, n.website, n.desc, Math.floor(Math.random() * 30) + 65, daysAgo(Math.floor(Math.random() * 180) + 60)]
    );

    // Board members
    for (const member of n.founders) {
      await pool.query(
        `INSERT INTO "BoardMember" (id, "ngoId", name, role, "memberType", "orderIndex", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$7)`,
        [uid(), ngoId, member.name, member.role, member.type, n.founders.indexOf(member), daysAgo(150)]
      );
    }

    // Activity: NGO joined
    activityEvents.push({
      type: "NGO_JOINED",
      desc: `${n.name} joined GiveLedger — a US 501(c)(3) committed to verified, milestone-based impact in ${n.state}.`,
      actorName: n.name, actorId: ngoId, actorType: "NGO",
      ngoName: n.name, linkUrl: `/ngo/${ngoId}`, daysAgoN: Math.floor(Math.random() * 150) + 30,
    });

    // Projects
    const templates = PROJECT_TEMPLATES[n.category] ?? PROJECT_TEMPLATES["OTHER"];
    const template = templates[Math.floor(Math.random() * templates.length)];
    const projId = uid();
    const raised = template.milestones.filter(m => m.status === "COMPLETED").reduce((s, m) => s + m.amount, 0);
    projectIds.push({ id: projId, ngoId, title: template.title, ngoName: n.name });

    await pool.query(
      `INSERT INTO "Project" (id, "ngoId", title, description, category, "goalAmount", "raisedAmount", status, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5::\"ProjectCategory",$6,$7,'ACTIVE',$8,$8)`,
      [projId, ngoId, template.title, template.desc, n.category, template.goal, raised, daysAgo(Math.floor(Math.random() * 120) + 30)]
    );

    // Activity: Project launch
    activityEvents.push({
      type: "PROJECT_LAUNCH",
      desc: `${n.name} launched "${template.title}" — raising $${template.goal.toLocaleString()} for verifiable impact in ${n.state}.`,
      actorName: n.name, actorId: ngoId, actorType: "NGO",
      ngoName: n.name, projectTitle: template.title, projectId: projId,
      linkUrl: `/projects/${projId}`, daysAgoN: Math.floor(Math.random() * 100) + 10,
    });

    // Milestones
    for (const ms of template.milestones) {
      const msId = uid();
      const completedAt = ms.status === "COMPLETED" ? daysAgo(Math.floor(Math.random() * 60) + 10) : null;
      await pool.query(
        `INSERT INTO "Milestone" (id, "projectId", name, description, "requiredAmount", "releasedAmount", status, "completedAt", "orderIndex", "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7::\"MilestoneStatus",$8,$9,$10,$10)`,
        [msId, projId, ms.name, `Deliverable: ${ms.name}`, ms.amount, ms.status === "COMPLETED" ? ms.amount : 0,
          ms.status, completedAt, template.milestones.indexOf(ms), daysAgo(90)]
      );

      if (ms.status === "COMPLETED") {
        const disbId = uid();
        const tx = txHash(msId);
        await pool.query(
          `INSERT INTO "Disbursement" (id, "milestoneId", "requestedAmount", "approvedAmount", status, "txHash", "processedAt", "createdAt", "updatedAt")
           VALUES ($1,$2,$3,$3,'APPROVED',$4,$5,$5,$5)`,
          [disbId, msId, ms.amount, tx, completedAt]
        );
        await pool.query(
          `INSERT INTO "BlockchainRecord" (id, "entityType", "disbursementId", "txHash", network, "timestamp")
           VALUES ($1,'disbursement',$2,$3,'polygon',$4)`,
          [uid(), disbId, tx, completedAt]
        );
        // Activity: Milestone complete
        activityEvents.push({
          type: "MILESTONE_COMPLETE",
          desc: `${n.name} completed milestone "${ms.name}" on "${template.title}" — $${ms.amount.toLocaleString()} released and verified on Polygon.`,
          actorName: n.name, actorId: ngoId, actorType: "NGO",
          ngoName: n.name, projectTitle: template.title, projectId: projId,
          linkUrl: `/projects/${projId}`, daysAgoN: Math.floor(Math.random() * 60) + 2,
        });
      }
    }
  }
  console.log("  ✓ 50 NGOs created with projects and milestones");

  // ─── SEED DONATIONS ───────────────────────────────────────────────────────
  console.log("  Creating donations...");
  const donationAmounts = [25, 50, 100, 150, 200, 250, 500, 750, 1000, 1500, 2000];
  let donationCount = 0;
  for (const donor of donorIds) {
    const numDonations = Math.floor(Math.random() * 3) + 1; // 1-3 donations per donor
    const shuffledProjects = shuffle(projectIds).slice(0, numDonations);
    for (const proj of shuffledProjects) {
      const amount = pick(donationAmounts);
      const dId = uid();
      const tx = txHash(dId);
      const donatedAt = daysAgo(Math.floor(Math.random() * 80) + 1);
      await pool.query(
        `INSERT INTO "Donation" (id, "userId", "projectId", amount, currency, "paymentMethod", "stripePaymentId", "txHash", status, "createdAt")
         VALUES ($1,$2,$3,$4,'USD','CARD',$5,$5,'COMPLETED',$6)`,
        [dId, donor.id, proj.id, amount, tx, donatedAt]
      );
      await pool.query(
        `UPDATE "Project" SET "raisedAmount" = "raisedAmount" + $1 WHERE id = $2`,
        [amount, proj.id]
      );
      // Activity: Donation
      activityEvents.push({
        type: "DONATION",
        desc: `${donor.name} donated $${amount.toLocaleString()} to "${proj.title}" by ${proj.ngoName} — every dollar milestone-locked and on-chain.`,
        actorName: donor.name, actorId: donor.id, actorType: "USER",
        ngoName: proj.ngoName, projectTitle: proj.title, projectId: proj.id,
        linkUrl: `/projects/${proj.id}`, daysAgoN: Math.floor(Math.random() * 80) + 1,
      });
      donationCount++;
    }
  }
  console.log(`  ✓ ${donationCount} donations created`);

  // ─── SEED SKILL CONTRIBUTIONS ─────────────────────────────────────────────
  console.log("  Creating skill contributions...");
  const skillCats = ["IT & Engineering", "Marketing", "Legal", "Design", "Finance & Accounting", "Training & Education"];
  const approvedDonors = shuffle(donorIds).slice(0, 25);
  for (let i = 0; i < approvedDonors.length; i++) {
    const donor = approvedDonors[i];
    const ngoData = ngoIds[i % ngoIds.length];
    const proj = projectIds[i % projectIds.length];
    const skill = pick(skillCats);
    const hours = pick([10, 20, 30, 40, 50]);
    const value = pick([500, 1000, 1500, 2000, 2500, 3000]);
    const scId = uid();
    const approvedAt = daysAgo(Math.floor(Math.random() * 60) + 5);
    await pool.query(
      `INSERT INTO "SkillContribution" (id, "donorId", "ngoId", "projectId", "skillCategory", description, "hoursContributed", status, "monetaryValue", "submittedAt", "approvedAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,'APPROVED',$8,$9,$9,$9)`,
      [scId, donor.id, ngoData.ngoId, proj.id, skill,
        `Provided ${hours} hours of professional ${skill} support to help ${ngoData.name} deliver their community programs more effectively.`,
        hours, value, approvedAt]
    );
    activityEvents.push({
      type: "SKILL_APPROVED",
      desc: `${donor.name} completed a ${skill} contribution for ${ngoData.name} — ${hours} hours valued at $${value.toLocaleString()} verified on-chain.`,
      actorName: donor.name, actorId: donor.id, actorType: "USER",
      ngoName: ngoData.name, projectTitle: proj.title, projectId: proj.id,
      linkUrl: `/donor/${donor.id}/profile`, daysAgoN: Math.floor(Math.random() * 60) + 2,
    });
  }
  console.log("  ✓ 25 skill contributions created");

  // ─── SEED ACTIVITY EVENTS ────────────────────────────────────────────────
  console.log(`  Writing ${activityEvents.length} activity events to wall...`);
  // Sort by recency and insert
  activityEvents.sort((a, b) => a.daysAgoN - b.daysAgoN);
  for (const ev of activityEvents) {
    await pool.query(
      `INSERT INTO "ActivityEvent" (id, type, description, "actorName", "actorId", "actorType", "ngoName", "projectTitle", "projectId", "linkUrl", "createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [uid(), ev.type, ev.desc, ev.actorName, ev.actorId, ev.actorType,
        ev.ngoName ?? null, ev.projectTitle ?? null, ev.projectId ?? null,
        ev.linkUrl ?? null, daysAgo(ev.daysAgoN)]
    );
  }
  console.log(`  ✓ ${activityEvents.length} activity events created`);

  await pool.end();
  console.log(`\n✅ Enrichment seed complete!`);
  console.log(`   - 50 donors with full profiles`);
  console.log(`   - 50 NGOs with board members, projects & milestones`);
  console.log(`   - ${donationCount} donations`);
  console.log(`   - ${activityEvents.length} wall activity events`);
}

main().catch((e) => { console.error(e); pool.end(); process.exit(1); });
