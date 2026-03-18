export type LessonType = "guide" | "exercise" | "project" | "prompt-library";
export type Level = "Beginner" | "Intermediate" | "Advanced";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: LessonType;
  description: string;
  keyPoints: string[];
  examplePrompt?: string; // Copy-paste ready Claude Code prompt
}

export interface TrainingModule {
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  totalDuration: string;
  level: Level;
  colorClass: string;    // Tailwind bg + text combo for the card
  accentClass: string;   // Accent for badges
  outcomes: string[];
  lessons: Lesson[];
}

export const TRAINING_MODULES: TrainingModule[] = [
  /* ─── MODULE 1 ─────────────────────────────────────────── */
  {
    slug: "claude-code-fundamentals",
    number: 1,
    title: "Claude Code Fundamentals",
    subtitle: "From zero to your first AI-powered workflow",
    description:
      "Understand what Claude Code is, how agentic AI works, and set up your environment. By the end you will be reading, editing, and creating files using natural-language instructions — no prior coding experience required.",
    category: "Getting Started",
    totalDuration: "2h 20min",
    level: "Beginner",
    colorClass: "bg-emerald-50 border-emerald-200",
    accentClass: "bg-emerald-100 text-emerald-800",
    outcomes: [
      "Install and authenticate Claude Code on your machine",
      "Navigate and modify files using plain English instructions",
      "Understand how context, sessions, and memory work",
      "Know when to trust Claude's output vs. when to verify it",
    ],
    lessons: [
      {
        id: "1-1",
        title: "What is Claude Code and Why It Matters",
        duration: "15 min",
        type: "guide",
        description:
          "An honest introduction to AI coding assistants — what they can and cannot do, and why this matters more to non-developers than to engineers.",
        keyPoints: [
          "Claude Code is a terminal-based AI that reads, writes, and runs code on your behalf",
          "It works best when you describe what you want in plain English",
          "It can make mistakes — your job is to describe clearly and review outputs",
          "The biggest gains are for non-technical professionals who want to automate repetitive work",
        ],
      },
      {
        id: "1-2",
        title: "Installing Claude Code",
        duration: "20 min",
        type: "guide",
        description:
          "Step-by-step installation on Mac, Windows, and Linux. Covers Node.js, npm, the Claude Code CLI, and your first authentication.",
        keyPoints: [
          "Install Node.js (LTS version) from nodejs.org",
          "Run: npm install -g @anthropic-ai/claude-code",
          "Authenticate: claude (follow the browser prompt to log in with your Anthropic account)",
          "Test: claude --version should print the installed version",
        ],
        examplePrompt:
          "Hello Claude. Tell me what operating system I'm on and list the files in my current directory.",
      },
      {
        id: "1-3",
        title: "Your First Session — Reading and Understanding Files",
        duration: "20 min",
        type: "exercise",
        description:
          "Open a spreadsheet or document you use at work. Ask Claude Code to explain its structure, summarise the content, and identify any issues.",
        keyPoints: [
          "Start Claude in any folder: cd ~/Documents && claude",
          "Ask it to read a file: 'Read the file budget.csv and tell me what it contains'",
          "Ask follow-up questions in the same session — Claude remembers context",
          "You can ask it to find errors, inconsistencies, or missing data",
        ],
        examplePrompt:
          "Read the file called budget.csv in this folder. Summarise each column, tell me the date range of the data, calculate the total spend, and flag any rows that look like outliers.",
      },
      {
        id: "1-4",
        title: "Editing and Creating Files with Plain English",
        duration: "20 min",
        type: "exercise",
        description:
          "Make Claude edit an existing document and create a new one from your description. Understand the review step before changes are saved.",
        keyPoints: [
          "Claude shows you what it plans to change before making edits",
          "You approve, reject, or modify each proposed change",
          "You can say 'create a new file called X that does Y' and Claude writes it",
          "Always read the output — Claude is fast but not infallible",
        ],
        examplePrompt:
          "Create a new file called donor-report-template.md with a professional template for a monthly donor impact report. It should have sections for: key metrics, milestone updates, a personal thank-you message, and next month's goals. Use placeholder text that's easy to replace.",
      },
      {
        id: "1-5",
        title: "Understanding Context, Sessions, and Memory",
        duration: "15 min",
        type: "guide",
        description:
          "How Claude remembers (and forgets) information. Best practices for keeping sessions focused and picking up where you left off.",
        keyPoints: [
          "Within a single session, Claude remembers everything said",
          "New session = blank slate — paste in key context at the start",
          "Use CLAUDE.md files to give Claude persistent instructions for a project",
          "Keep sessions focused: one goal per session works better than everything at once",
        ],
        examplePrompt:
          "Create a CLAUDE.md file in this folder. It should tell Claude that this project is for a nonprofit called [NGO NAME], that all financial figures are in USD, that our fiscal year runs April to March, and that reports should be written in a warm but professional tone.",
      },
      {
        id: "1-6",
        title: "When to Trust Claude vs. When to Verify",
        duration: "10 min",
        type: "guide",
        description:
          "A practical framework for knowing which outputs to use directly and which to double-check — especially when working with financial or legal data.",
        keyPoints: [
          "Always verify: calculations on real financial data, legal statements, anything sent externally",
          "Generally safe to use directly: structural templates, draft text, code that you can test",
          "Use Claude to explain its own output: 'Walk me through how you calculated this'",
          "Treat Claude like a very fast intern — review before you publish",
        ],
      },
    ],
  },

  /* ─── MODULE 2 ─────────────────────────────────────────── */
  {
    slug: "terminal-mastery",
    number: 2,
    title: "Terminal Mastery for Non-Developers",
    subtitle: "The one skill that unlocks everything else",
    description:
      "The terminal is where Claude Code lives. This module removes the fear and gives you real command-line fluency — enough to navigate files, run scripts, use Git, and fix errors with Claude's help.",
    category: "Getting Started",
    totalDuration: "2h 10min",
    level: "Beginner",
    colorClass: "bg-slate-50 border-slate-200",
    accentClass: "bg-slate-100 text-slate-800",
    outcomes: [
      "Navigate the file system confidently from the command line",
      "Run scripts and programmes without needing to understand them",
      "Use Git to save, share, and version your work",
      "Read and fix error messages with Claude's help",
    ],
    lessons: [
      {
        id: "2-1",
        title: "Why the Terminal Matters",
        duration: "10 min",
        type: "guide",
        description:
          "What the terminal is, why AI tools live there, and why learning it in 2025 is faster than ever before (Claude helps you when you're stuck).",
        keyPoints: [
          "The terminal is just a text-based way to talk to your computer",
          "Most AI developer tools, automations, and scripts run from the terminal",
          "With Claude, you can ask 'what does this error mean?' and get an immediate fix",
          "You do not need to memorise commands — you need to know what you want to achieve",
        ],
      },
      {
        id: "2-2",
        title: "Essential Commands: Navigate and Manage Files",
        duration: "30 min",
        type: "exercise",
        description:
          "The 12 commands you will use 90% of the time. Practice each one with real files from your own work.",
        keyPoints: [
          "pwd — where am I?    ls — what's here?    cd folder — go there    cd .. — go back",
          "mkdir name — create folder    touch file.txt — create file    cp / mv / rm — copy, move, delete",
          "cat file.txt — print contents    open . (Mac) or explorer . (Windows) — open in Finder/Explorer",
          "Ask Claude: 'I want to move all CSV files in this folder to a subfolder called data — how do I do that?'",
        ],
        examplePrompt:
          "I'm in my terminal. I have a folder with 30 CSV files all starting with 'report_2024'. I want to move them all into a subfolder called 'archive/2024'. Write me the exact terminal command to do this on Mac.",
      },
      {
        id: "2-3",
        title: "Running Scripts and Programmes",
        duration: "25 min",
        type: "exercise",
        description:
          "How to run a Python or Node.js script that Claude has written for you. Includes installing dependencies and running the programme.",
        keyPoints: [
          "node script.js — runs a JavaScript file    python script.py — runs a Python file",
          "npm install — installs the packages a Node project needs",
          "pip install package-name — installs a Python package",
          "If you see an error, paste it to Claude: 'I got this error running the script. Fix it.'",
        ],
        examplePrompt:
          "Write a Python script called summarise.py that reads a CSV file called expenses.csv, groups the rows by the 'Category' column, sums the 'Amount' column for each category, and prints a clean summary. Include installation instructions at the top as a comment.",
      },
      {
        id: "2-4",
        title: "Git Basics: Saving and Sharing Your Work",
        duration: "35 min",
        type: "exercise",
        description:
          "Git is version control — it's like Google Docs history for files and code. Learn how to save your work, go back in time, and share with your team.",
        keyPoints: [
          "git init — start tracking a folder    git add . — stage all changes    git commit -m 'message' — save snapshot",
          "git log — see history    git diff — see what changed    git checkout filename — undo changes to a file",
          "Push to GitHub so your work is backed up and shareable: git push origin main",
          "With Claude Code: it automatically handles git add and commit when you ask it to save your work",
        ],
        examplePrompt:
          "Initialise a Git repository in this folder. Create a .gitignore file that ignores .env files, node_modules, __pycache__, and .DS_Store files. Make the first commit with the message 'Initial project setup'.",
      },
      {
        id: "2-5",
        title: "Reading Error Messages with Claude",
        duration: "20 min",
        type: "guide",
        description:
          "Errors look scary but they follow patterns. This lesson gives you a mental model for reading errors and a reliable process for fixing them with Claude.",
        keyPoints: [
          "Read the last line first — that's usually the actual error",
          "Copy the entire error message and paste it to Claude: 'I got this error. Explain it and fix it.'",
          "Common errors: 'module not found' (run npm install), 'permission denied' (use sudo or fix file permissions)",
          "Google the exact error message — 9 times out of 10, someone else had the same problem",
        ],
      },
    ],
  },

  /* ─── MODULE 3 ─────────────────────────────────────────── */
  {
    slug: "building-your-first-tool",
    number: 3,
    title: "Building Your First Tool",
    subtitle: "From idea to deployed web app in one session",
    description:
      "Build three real tools from scratch — a CSV analyser, an email template generator, and a simple web dashboard — then deploy them live on the internet using Vercel. No prior experience needed.",
    category: "Getting Started",
    totalDuration: "3h 00min",
    level: "Beginner",
    colorClass: "bg-blue-50 border-blue-200",
    accentClass: "bg-blue-100 text-blue-800",
    outcomes: [
      "Build a working web app from a plain-English description",
      "Deploy a tool live on the internet in under 10 minutes",
      "Understand the build-test-deploy cycle",
      "Create reusable tools your whole team can use via a URL",
    ],
    lessons: [
      {
        id: "3-1",
        title: "What Makes a 'Tool' vs Just Prompting",
        duration: "15 min",
        type: "guide",
        description:
          "The difference between one-off AI answers and repeatable tools. When to build a tool vs when to just ask Claude directly.",
        keyPoints: [
          "A tool is a repeatable process: same input format → reliable output every time",
          "Build a tool when: you do the same task more than twice a week",
          "Prompting is faster for one-off questions; tools save time on recurring tasks",
          "Tools can be shared with colleagues — they don't need to know how to use Claude",
        ],
      },
      {
        id: "3-2",
        title: "Build: Donation / Expense CSV Analyser",
        duration: "45 min",
        type: "project",
        description:
          "Build a tool that accepts any CSV file and returns a structured summary — totals, trends, outliers, and a plain-English narrative. Works for donations, expenses, or any tabular data.",
        keyPoints: [
          "Ask Claude to build a Node.js script that reads a CSV and outputs a formatted report",
          "Test with a real file from your organisation",
          "Extend it: add charts, export to PDF, email the report automatically",
          "This pattern (read data → process → report) powers 80% of finance automations",
        ],
        examplePrompt:
          "Build me a command-line tool in Node.js called analyse-csv.js. It should: (1) accept a CSV filename as an argument, (2) detect column types automatically, (3) for numeric columns: calculate sum, average, min, max, and flag values more than 2 standard deviations from the mean as outliers, (4) for date columns: identify the date range and group data by month, (5) output a clean, readable report in the terminal. Include error handling for missing files or malformed CSVs. Show me how to run it.",
      },
      {
        id: "3-3",
        title: "Build: Email Template Generator",
        duration: "40 min",
        type: "project",
        description:
          "Build a simple web form where you enter a few details (donor name, project, milestone achieved) and get a personalised, professional email ready to copy-paste or send directly.",
        keyPoints: [
          "Frontend: HTML form with fields for donor name, amount, project, personal note",
          "Logic: a template with variable substitution — Claude fills in the blanks",
          "Extend: connect to Mailchimp or SendGrid to send directly from the tool",
          "This is the foundation of all personalised donor communication workflows",
        ],
        examplePrompt:
          "Build a single HTML file (no frameworks) called email-generator.html. It should have a form with these fields: Donor Name, Donation Amount, Project Name, Milestone Achieved (dropdown: Planning Complete / Construction Started / Halfway / Complete), Personal Note (textarea). When submitted, it should generate a warm, professional thank-you email and display it in a preview box below the form with a 'Copy to Clipboard' button. Style it cleanly with inline CSS in a pale green colour scheme.",
      },
      {
        id: "3-4",
        title: "Build: Simple Dashboard Web App",
        duration: "50 min",
        type: "project",
        description:
          "Build a Next.js dashboard that reads from a Google Sheet (or CSV) and displays your key metrics as cards and a chart. Deploy it live with Vercel.",
        keyPoints: [
          "Next.js is the same framework GiveLedger uses — you will recognise the structure",
          "Fetch data from a published Google Sheet CSV URL — no API keys needed",
          "Display: KPI cards (total raised, milestones completed, donors this month) + line chart",
          "Deploy with: vercel --prod — your dashboard gets a public URL in 2 minutes",
        ],
        examplePrompt:
          "Build a Next.js app called ngo-dashboard. It should fetch data from a public Google Sheets CSV URL (I'll provide it), parse the data, and display: (1) four KPI cards at the top showing total donations, number of donors, average donation, and largest donation, (2) a line chart showing donations over time grouped by month, (3) a table of the 10 most recent donations with donor name, amount, and date. Use Tailwind CSS for styling. Make it look like a professional dashboard — clean, minimal, white background, emerald accent colour.",
      },
      {
        id: "3-5",
        title: "Deploy to Vercel in 10 Minutes",
        duration: "20 min",
        type: "exercise",
        description:
          "Take the dashboard you built and make it live on the internet. Anyone with the URL can see it — no server management, no hosting bills under $0/month for basic use.",
        keyPoints: [
          "Install Vercel CLI: npm install -g vercel",
          "Run: vercel — answer 3 questions, your app is live",
          "For production: vercel --prod",
          "Custom domain: add it in the Vercel dashboard — free SSL included",
        ],
        examplePrompt:
          "I've built a Next.js app in a folder called ngo-dashboard. Walk me through deploying it to Vercel step by step, including: initialising git, creating a GitHub repo, pushing the code, connecting to Vercel, and setting it to auto-deploy every time I push a change.",
      },
    ],
  },

  /* ─── MODULE 4 ─────────────────────────────────────────── */
  {
    slug: "marketing-workflows",
    number: 4,
    title: "Marketing & Growth Workflows",
    subtitle: "AI-powered content, campaigns, and donor communications",
    description:
      "Build a complete marketing engine: automated content calendars, email sequences, social media copy, SEO tools, and Google Ad Grants management. Cut content production time by 80% while improving quality.",
    category: "Business Functions",
    totalDuration: "4h 30min",
    level: "Intermediate",
    colorClass: "bg-pink-50 border-pink-200",
    accentClass: "bg-pink-100 text-pink-800",
    outcomes: [
      "Generate a 3-month content calendar from a single theme list",
      "Build personalised donor email sequences at scale",
      "Create a batch social media content generator",
      "Set up a Google Ad Grants ($120K/yr) keyword and copy workflow",
    ],
    lessons: [
      {
        id: "4-1",
        title: "Content Calendar Generator",
        duration: "35 min",
        type: "project",
        description:
          "Input your NGO's themes, campaigns, and key dates. Get a 90-day content calendar with post ideas, captions, hashtags, and recommended posting times — for LinkedIn, Instagram, and email.",
        keyPoints: [
          "Structure: one input file (themes.md) → Claude generates a full calendar as CSV",
          "Include: post type, platform, hook line, body copy, call to action, hashtags, image suggestion",
          "Export to Google Sheets: paste the CSV directly, format with colour-coding by platform",
          "Schedule with Buffer or Hootsuite — copy-paste each entry",
        ],
        examplePrompt:
          "I run a US nonprofit focused on clean water access in underserved communities. Our key themes are: community empowerment, transparency in funding, volunteer stories, and milestone celebrations. Our audience is: professional donors aged 35-55, LinkedIn primary, Instagram secondary. Generate a 12-week content calendar with 3 posts per week (2 LinkedIn, 1 Instagram). For each post include: week number, platform, content type (story/educational/celebration/CTA), hook (first line), body copy (150 words max), hashtags, and a suggested image description. Output as a markdown table.",
      },
      {
        id: "4-2",
        title: "Donor Email Nurture Sequence Builder",
        duration: "40 min",
        type: "project",
        description:
          "Build a 6-email welcome sequence for new donors and a re-engagement sequence for lapsed donors. Personalise by donation amount tier and cause area.",
        keyPoints: [
          "Map the donor journey: first donation → welcome → impact update → milestone → anniversary → renewal",
          "Personalisation variables: name, project, donation amount, days since last gift",
          "Tone: warm and specific, never generic — 'Your $50 is buying 200 water purification tablets' not 'Thank you for your generous gift'",
          "A/B test subject lines — Claude generates 5 variants per email",
        ],
        examplePrompt:
          "Write a 6-email welcome sequence for first-time donors to a clean water nonprofit. The donor just gave their first gift. Personalisation variables available: [FIRST_NAME], [DONATION_AMOUNT], [PROJECT_NAME], [SPECIFIC_IMPACT] (e.g. '200 tablets'), [NGO_FOUNDER_NAME]. Email 1: Immediate thank you + impact statement. Email 2 (Day 3): Behind-the-scenes story from the field. Email 3 (Day 7): Meet the community beneficiary. Email 4 (Day 14): Progress update on their specific project. Email 5 (Day 30): Impact certificate + social share invite. Email 6 (Day 60): Re-engage with a new campaign. For each email: subject line (5 variants), preview text, full body, CTA button text.",
      },
      {
        id: "4-3",
        title: "Social Media Batch Content Creator",
        duration: "30 min",
        type: "project",
        description:
          "Upload a list of facts, stats, and stories. Get 30 social media posts in different formats — carousels, quotes, behind-the-scenes, CTAs — ready to schedule.",
        keyPoints: [
          "Input: a bullet-point list of facts and stories about your work",
          "Output: 30 posts categorised by type and platform, with visual description",
          "LinkedIn posts: longer, professional, data-driven — ideal for corporate donor audience",
          "Instagram captions: emotional, specific, with strong image direction",
        ],
        examplePrompt:
          "Here are 15 facts and stories from our NGO's last quarter: [paste facts]. Transform these into 30 social media posts: 15 for LinkedIn (professional tone, 150-300 words each, include a data point, end with a thought-provoking question) and 15 for Instagram (emotional hook, specific impact, 3-5 hashtags, suggest a photo/graphic concept for each). Vary the formats: 8 impact stories, 7 behind-the-scenes, 8 data/stats, 7 calls to action.",
      },
      {
        id: "4-4",
        title: "Google Ad Grants Workflow ($120K/yr)",
        duration: "45 min",
        type: "guide",
        description:
          "Google gives every qualified 501(c)(3) $10,000/month in free search ads. This lesson shows you how to use Claude to research keywords, write ad copy, and structure campaigns that meet Google's requirements.",
        keyPoints: [
          "Eligibility: US 501(c)(3), apply at google.com/grants — approval in 2-4 weeks",
          "Rules: max $2 CPC, min 5% CTR, must target specific causes not generic terms",
          "Claude workflow: give it your mission + top 3 programmes → generates 50+ keywords + 10 ad groups",
          "Ad copy: ask Claude for 15 headlines (30 chars max) and 4 descriptions (90 chars max) per ad group",
        ],
        examplePrompt:
          "I run a US nonprofit (501c3) focused on providing clean water to rural communities. We run three programmes: (1) well installation, (2) water quality testing, (3) hygiene education. Help me build a Google Ad Grants campaign. Give me: 10 ad groups with names and theme descriptions, 40 keywords per ad group (mix of broad, phrase, exact match), 15 responsive search ad headlines (max 30 chars each) and 4 descriptions (max 90 chars each) per ad group, recommended negative keywords, and a landing page brief for each ad group. Format everything in a way I can paste directly into Google Ads Editor.",
      },
      {
        id: "4-5",
        title: "Annual Report Writer",
        duration: "40 min",
        type: "project",
        description:
          "Feed Claude your year's data (a spreadsheet of metrics) and a few quotes from beneficiaries. Get a full draft annual report with narrative sections, statistics, and impact stories.",
        keyPoints: [
          "Input: a spreadsheet with the year's metrics + 3-5 beneficiary quotes + staff/board names",
          "Output: 8-12 page draft report — executive letter, year in numbers, programme highlights, financials narrative, team page",
          "Tone: compelling but honest — NGO annual reports are read by donors, boards, and grant funders",
          "Export to Word/Google Docs: Claude formats with proper headings so you can apply your brand template",
        ],
        examplePrompt:
          "I need to write our annual report. Here is our data for the year: [paste spreadsheet data as text]. Here are quotes from three beneficiaries: [paste quotes]. Our key programmes were: [list programmes]. Our total revenue was $X. Write an 8-section annual report including: (1) Board Chair letter, (2) Year in numbers (format as a visually interesting stats page), (3) Programme highlights (one page per programme with impact data), (4) Stories from the field (expand the 3 quotes into 200-word narratives), (5) Financial overview, (6) Donor recognition, (7) Team and board, (8) Looking ahead. Use a warm, credible, data-driven tone. Format with proper markdown headings.",
      },
      {
        id: "4-6",
        title: "Prompt Library: 25 Marketing Prompts",
        duration: "20 min",
        type: "prompt-library",
        description:
          "A reference library of 25 copy-paste ready prompts for the marketing tasks you do most often. Bookmark this lesson.",
        keyPoints: [
          "Grant narrative opener — write the 2-paragraph opener for a grant application",
          "Press release — turn a milestone into a press release in AP style",
          "Donor testimonial polish — take a rough quote and make it quotable",
          "Board presentation summary — turn 10 slides of data into a 1-page exec summary",
          "Website copy audit — review your homepage and suggest improvements for clarity and conversion",
        ],
        examplePrompt:
          "GRANT NARRATIVE OPENER: Write the opening 2 paragraphs of a grant application to [FUNDER NAME] for [PROGRAMME NAME]. Our organisation [NGO NAME] has been operating since [YEAR] and serves [BENEFICIARIES] in [LOCATION]. The specific need we are addressing is [PROBLEM]. We are requesting $[AMOUNT] to [SPECIFIC ACTIVITY]. The tone should be: compelling, specific, and evidence-based. Open with a human story, then transition to data.",
      },
    ],
  },

  /* ─── MODULE 5 ─────────────────────────────────────────── */
  {
    slug: "finance-workflows",
    number: 5,
    title: "Finance & Accounting Workflows",
    subtitle: "Automate budgets, grants, reports, and audits",
    description:
      "Build an AI-powered finance function: automated budget trackers, grant financial reports, invoice processors, and audit preparation tools. Cut month-end close time from days to hours.",
    category: "Business Functions",
    totalDuration: "4h 00min",
    level: "Intermediate",
    colorClass: "bg-green-50 border-green-200",
    accentClass: "bg-green-100 text-green-800",
    outcomes: [
      "Build a budget vs actual tracker that auto-generates variance analysis",
      "Create grant financial reports from raw transaction data",
      "Automate invoice processing and expense categorisation",
      "Generate audit-ready documentation from your accounting records",
    ],
    lessons: [
      {
        id: "5-1",
        title: "Budget vs Actual Tracker with Variance Analysis",
        duration: "45 min",
        type: "project",
        description:
          "Build a tool that takes your budget spreadsheet and your actual spend data, calculates variances, and writes a plain-English narrative explaining what happened — board-ready in one run.",
        keyPoints: [
          "Input: two CSVs — budget.csv and actuals.csv — with matching category codes",
          "Output: variance table + percentage over/under + risk flags for categories over 15% variance",
          "Narrative: Claude writes 'Personnel costs are 8% over budget due to the unplanned contractor engagement in March'",
          "Extend: connect to QuickBooks or Xero via their CSV export — run this every month in 5 minutes",
        ],
        examplePrompt:
          "I have two CSV files: budget.csv (with columns: Category, Q1_Budget, Q2_Budget, Q3_Budget, Q4_Budget) and actuals.csv (with columns: Category, Q1_Actual, Q2_Actual, Q3_Actual, Q4_Actual). Write a Python script that: (1) merges them by Category, (2) calculates variance in dollars and percentage for each quarter, (3) flags any category with >15% variance as HIGH RISK, (4) outputs a formatted table to the terminal, (5) writes a plain-English narrative paragraph for each quarter explaining the key variances, and (6) saves the full report as budget-variance-report.md. Run it and show me the output.",
      },
      {
        id: "5-2",
        title: "Grant Budget Builder and Financial Narrative",
        duration: "40 min",
        type: "project",
        description:
          "Generate a grant-ready budget with line-item justifications from a simple project brief. Includes the financial narrative section that funders require.",
        keyPoints: [
          "Input: project description, timeline, staff involved, expected activities",
          "Output: itemised budget table with: personnel (FTE fractions), direct costs, indirect/overhead, and grand total",
          "Narrative: each line item has a one-sentence justification ('0.3 FTE Programme Manager at $65K = $19,500 to oversee...')",
          "Match funder budget templates: paste the funder's template and Claude reformats automatically",
        ],
        examplePrompt:
          "Build a grant budget for the following project: [describe your project, timeline, team, and key activities]. The funder requires: personnel costs separated from non-personnel, overhead capped at 15%, and all costs justified. Generate: (1) a line-item budget table in CSV format with columns: Category, Item Description, Calculation/Basis, Amount, and a Notes column, (2) a 400-word budget narrative that justifies each major line item in the language a programme officer expects, (3) a summary table showing the budget broken down by quarter. Make all personnel calculations explicit (e.g. '0.5 FTE x $80,000 salary x 12 months = $40,000').",
      },
      {
        id: "5-3",
        title: "Expense Categorisation and Reconciliation",
        duration: "35 min",
        type: "project",
        description:
          "Paste in a raw bank statement or expense report. Claude categorises every line item, flags anomalies, and produces a clean reconciliation file for your accountant.",
        keyPoints: [
          "Input: CSV export from your bank or accounting software — raw transaction descriptions",
          "Output: each transaction tagged with: cost centre, budget category, grant allocation, and notes",
          "Anomaly flags: duplicate amounts on same date, unusual vendors, round-number amounts",
          "Export: upload the categorised file back to QuickBooks, Xero, or Wave in one step",
        ],
        examplePrompt:
          "Here is a raw bank statement export as CSV: [paste or describe transactions]. Each row has: Date, Description, Amount, Reference. Categorise every transaction into our chart of accounts: (1) Programme Delivery, (2) Personnel, (3) Admin & Overhead, (4) IT & Technology, (5) Travel, (6) Marketing, (7) Professional Services, (8) Other. For any transaction you cannot confidently categorise, add a REVIEW flag and explain why. For any potential anomalies (duplicate amounts, round numbers over $500, unusual vendor names), add a FLAG note. Output as a clean CSV with original columns plus: Category, Confidence (High/Medium/Low), Notes.",
      },
      {
        id: "5-4",
        title: "Grant Financial Report Generator",
        duration: "40 min",
        type: "project",
        description:
          "Turn raw transaction data into a grant financial report that meets funder requirements — including spend-to-date, remaining balance, and burn rate projection.",
        keyPoints: [
          "Input: categorised transactions for the grant period + original approved budget",
          "Output: spend by budget line, % utilised, projected end balance, and narrative",
          "Compliance check: flag if any category is >10% over budget (common grant restriction)",
          "Extend: generate the cover letter to the funder summarising financial performance",
        ],
        examplePrompt:
          "I need to submit a mid-year financial report to our funder. The grant period is Jan 1 – Dec 31. We are now at June 30. Here is our approved budget: [paste budget]. Here are our actual expenditures Jan-June: [paste transactions or summary]. Generate: (1) a financial report table showing approved budget vs actual spend vs remaining for each line item, (2) a burn rate column showing monthly average spend and projected year-end balance, (3) variance explanations for any line with >10% variance, (4) a 200-word financial narrative suitable for a funder report, (5) any compliance flags I should address before submitting.",
      },
      {
        id: "5-5",
        title: "Audit Preparation Toolkit",
        duration: "30 min",
        type: "project",
        description:
          "Build a pre-audit checklist, generate the management representation letter, and prepare the supporting schedules your auditor will request.",
        keyPoints: [
          "Standard pre-audit request list: bank reconciliations, payroll records, grant agreements, board minutes, fixed asset register",
          "Management letter: Claude drafts it from a template — you review and sign",
          "Supporting schedules: accounts receivable aging, prepaid expenses, accrued liabilities — all formatted for your auditor",
          "Ask Claude: 'What are the most common audit findings for nonprofits of our size? How do we prevent them?'",
        ],
        examplePrompt:
          "Prepare an audit preparation package for a small US 501(c)(3) with annual revenue of $800K. Generate: (1) a comprehensive pre-audit document request checklist organised by account area, (2) a sample management representation letter (fill-in-the-blank format), (3) a fixed asset rollforward schedule template, (4) an accounts receivable aging template, (5) a list of the 10 most common audit findings for nonprofits under $1M revenue and how to address each proactively. Format everything in markdown so I can export to Word.",
      },
    ],
  },

  /* ─── MODULE 6 ─────────────────────────────────────────── */
  {
    slug: "operations-workflows",
    number: 6,
    title: "Operations & Project Management",
    subtitle: "Systems that run your organisation while you focus on mission",
    description:
      "Automate the operational backbone of your NGO: meeting notes, project timelines, vendor management, SOPs, weekly reports, and risk tracking. Build systems that make your organisation more resilient and less dependent on any one person.",
    category: "Business Functions",
    totalDuration: "4h 15min",
    level: "Intermediate",
    colorClass: "bg-orange-50 border-orange-200",
    accentClass: "bg-orange-100 text-orange-800",
    outcomes: [
      "Convert meeting notes to action items and project updates automatically",
      "Generate project plans and Gantt-style timelines from a brief",
      "Build SOP documents for your most critical processes",
      "Automate weekly and monthly reporting",
    ],
    lessons: [
      {
        id: "6-1",
        title: "Meeting Notes to Action Items",
        duration: "30 min",
        type: "project",
        description:
          "Build a tool that transforms raw meeting notes (even messy ones) into structured action items, owners, deadlines, and a follow-up email — in one prompt.",
        keyPoints: [
          "Input: paste your meeting notes in any format — bullet points, stream of consciousness, even voice transcript",
          "Output: action items table (task, owner, deadline, priority), decisions made, open questions, follow-up email draft",
          "Use it every day: copy notes → paste to Claude → send the follow-up email → done",
          "Extend: connect to Notion or Asana via their API to automatically create tasks",
        ],
        examplePrompt:
          "Here are my notes from today's team meeting: [paste notes]. Please: (1) extract all action items and format them as a table with columns: Action, Owner, Deadline, Priority (High/Medium/Low), (2) list all decisions made during the meeting, (3) list all open questions that need follow-up, (4) draft a follow-up email to send to all attendees summarising the above in a clear, professional format with the subject line 'Meeting follow-up: [meeting title]', (5) flag any action items without a clear owner or deadline.",
      },
      {
        id: "6-2",
        title: "Project Plan Generator",
        duration: "40 min",
        type: "project",
        description:
          "Describe a project in plain English. Get a phased project plan with milestones, dependencies, resource requirements, and risk flags — formatted for your project management tool of choice.",
        keyPoints: [
          "Input: project name, objective, start date, end date, team size, budget, key constraints",
          "Output: phased breakdown with weekly milestones, dependencies identified, responsible owners, and a plain-English Gantt description",
          "Export: CSV format for import into Asana, Monday.com, Trello, or Notion",
          "Risk register: Claude automatically identifies the 5 most likely risks and suggests mitigations",
        ],
        examplePrompt:
          "I need to plan a project to build two water wells in rural Uganda. Start date: March 1. Completion: August 31. Team: 1 project manager (remote), 2 local field staff, 1 engineer (part-time), and local community volunteers. Budget: $45,000. Key constraints: rainy season April-May limits construction, community consultation must precede any drilling, funder requires progress reports every 6 weeks. Generate: (1) a phased project plan broken into weekly milestones, (2) a task list with estimated effort (days) and responsible party, (3) key dependencies between tasks, (4) a risk register with probability, impact, and mitigation for each risk, (5) a reporting calendar with what to report and when. Format as markdown with tables.",
      },
      {
        id: "6-3",
        title: "Standard Operating Procedure (SOP) Writer",
        duration: "35 min",
        type: "project",
        description:
          "Document your critical processes before they only exist in one person's head. Generate SOPs for donor onboarding, milestone submission, volunteer management, and any other repetitive process.",
        keyPoints: [
          "Interview style: ask Claude to interview you about the process — it asks questions, you answer, it writes the SOP",
          "Structure: purpose, scope, prerequisites, step-by-step instructions, decision points, quality checks, escalation",
          "Version control: each SOP stored in Git — you can see exactly what changed and when",
          "Review cycle: Claude generates a quarterly review checklist — are these SOPs still accurate?",
        ],
        examplePrompt:
          "Help me write an SOP for our donor milestone reporting process. The process starts when our programme team confirms a milestone is complete. Ask me questions to understand the full process, then write the SOP. Here's what I know so far: the programme team fills in an evidence form, our finance team checks the disbursement amount, the comms team sends a donor notification, and our executive director signs off before funds are released. Please ask me any questions you need to write a complete, accurate SOP.",
      },
      {
        id: "6-4",
        title: "Weekly and Monthly Report Automator",
        duration: "35 min",
        type: "project",
        description:
          "Build a script that pulls data from your tracking spreadsheets and generates a formatted weekly status report — automatically. Send it to your board every Monday morning.",
        keyPoints: [
          "Input: a structured 'data entry' template your team fills in each week (Google Form or simple spreadsheet)",
          "Output: formatted PDF or HTML report with charts, highlights, risks, and next week's priorities",
          "Automate: use a free cron job service (cron-job.org) to run the script every Monday at 8am",
          "Escalation logic: Claude flags any metric that has declined for 2+ consecutive weeks",
        ],
        examplePrompt:
          "Build a weekly status report generator. The input is a CSV file called weekly-data.csv with columns: Week, Metric, Value, Target, Status (On Track / At Risk / Behind). The output should be: (1) an HTML file called weekly-report.html with a professional header, (2) a summary table showing all metrics with colour-coded status indicators (green/amber/red), (3) a section for metrics that are 'At Risk' or 'Behind' with space for a brief explanation, (4) an auto-generated 'executive summary' paragraph that Claude writes based on the data trends, (5) a 'Next Week Focus' section listing the 3 highest-priority items. Style it in our brand colours (emerald green and white).",
      },
      {
        id: "6-5",
        title: "Vendor Comparison and Due Diligence Tool",
        duration: "35 min",
        type: "project",
        description:
          "Build a structured vendor evaluation framework. Input quotes and proposals from multiple vendors; get a scoring matrix, recommendation, and due diligence checklist.",
        keyPoints: [
          "Evaluation criteria: price, track record, delivery timeline, references, financial stability, contract terms",
          "Scoring matrix: weighted scoring — you set the weights based on what matters most",
          "Red flags: Claude flags unusual contract terms, vague deliverables, or missing insurance/certifications",
          "Output: recommendation memo suitable for board approval",
        ],
        examplePrompt:
          "I'm evaluating three IT vendors to build our donor management system. I have their proposals as text. Vendor A: [paste proposal summary]. Vendor B: [paste]. Vendor C: [paste]. Evaluate them on: Technical capability (30%), Cost (25%), Timeline (20%), References and track record (15%), Contract terms (10%). Generate: (1) a weighted scoring matrix with scores for each criterion, (2) a summary of key differences, (3) red flags for each vendor if any, (4) a recommendation with justification, (5) a list of 10 due diligence questions to ask the recommended vendor before signing. Format as a decision memo I can present to my board.",
      },
    ],
  },

  /* ─── MODULE 7 ─────────────────────────────────────────── */
  {
    slug: "hr-people-workflows",
    number: 7,
    title: "HR & People Operations",
    subtitle: "Hire, develop, and retain your team with AI support",
    description:
      "From job descriptions to performance reviews to volunteer management — build an HR function that works for a lean nonprofit team. Includes templates, interview tools, and onboarding automation.",
    category: "Business Functions",
    totalDuration: "3h 30min",
    level: "Intermediate",
    colorClass: "bg-violet-50 border-violet-200",
    accentClass: "bg-violet-100 text-violet-800",
    outcomes: [
      "Write job descriptions that attract mission-aligned candidates",
      "Build a structured interview process with scored rubrics",
      "Create a complete onboarding experience for new staff and volunteers",
      "Generate performance review frameworks your team will actually use",
    ],
    lessons: [
      {
        id: "7-1",
        title: "Job Description Writer",
        duration: "30 min",
        type: "project",
        description: "Turn a bullet-point list of duties into a compelling, inclusive job description that attracts mission-driven candidates. Includes DEI language audit.",
        keyPoints: [
          "Input: role title, key duties, must-have skills, nice-to-have skills, salary range, location",
          "Output: structured JD with: hook paragraph, about us, responsibilities, requirements, what we offer",
          "DEI audit: Claude checks for exclusionary language (e.g. 'ninja', 'rockstar', unnecessarily gendered terms)",
          "Platform-specific versions: LinkedIn (shorter, hook-led), Indeed (keyword-optimised), organisation website (full)",
        ],
        examplePrompt:
          "Write a job description for a Programme Manager role at our clean water nonprofit. Key duties: manage 3 active field projects, coordinate with local partners, write donor reports, attend funder meetings. Required: 3+ years project management, strong written communication, ability to travel 20% of the time. Preferred: experience in WASH sector, Salesforce, second language. Salary: $55,000-$65,000. Remote-first with NYC office. Make it compelling for a mission-driven candidate aged 27-35. After writing it, review it for any potentially exclusionary language and suggest improvements.",
      },
      {
        id: "7-2",
        title: "Interview Process and Scoring Rubric",
        duration: "35 min",
        type: "project",
        description: "Build a complete interview process: question bank, scoring rubric, structured debrief template, and candidate comparison matrix.",
        keyPoints: [
          "Structured interviews reduce bias — every candidate gets the same questions, scored the same way",
          "Question types: situational ('Tell me about a time...'), technical, values-based, role-specific",
          "Scoring rubric: 1-5 scale per criterion with clear descriptions of what each score means",
          "Debrief template: keeps hiring discussions structured and documented",
        ],
        examplePrompt:
          "Build a complete interview process for the Programme Manager role described above. Create: (1) a 45-minute interview guide with 8 structured questions, including scoring guidance (what a 1, 3, and 5 answer looks like for each), (2) a one-page scorecard with criteria: Mission Alignment, Project Management, Communication, Problem Solving, and Cultural Add — each weighted and scored 1-5, (3) a 10-minute pre-screen phone call guide with 5 knockout questions, (4) a post-interview debrief template for the hiring panel to complete before discussing candidates together, (5) a candidate comparison matrix template for evaluating 3-5 finalists.",
      },
      {
        id: "7-3",
        title: "Onboarding Checklist and Experience Builder",
        duration: "35 min",
        type: "project",
        description: "Create a 30-60-90 day onboarding plan for new staff and a separate rapid onboarding guide for volunteers.",
        keyPoints: [
          "Days 1-7: admin setup, team introductions, key document reading, first small win",
          "Days 8-30: shadow key processes, take ownership of first project, meet all stakeholders",
          "Days 31-60: run first project independently, give feedback on onboarding experience",
          "Days 61-90: set 6-month goals, identify development opportunities, full independence",
        ],
        examplePrompt:
          "Create a comprehensive onboarding plan for a new Programme Manager joining our nonprofit. Include: (1) a pre-start checklist (things to send/prepare before day 1), (2) a day-by-day plan for the first week (morning and afternoon of each day), (3) a 30-60-90 day plan with clear milestones and success criteria for each phase, (4) a 'must-read' document list with brief descriptions of why each document matters, (5) a 'first win' project they can complete in week 2 to build confidence, (6) a list of 10 people they should meet in the first month and why. Also create a separate 2-hour onboarding guide for new volunteers who will be doing data entry work.",
      },
      {
        id: "7-4",
        title: "Performance Review Framework",
        duration: "40 min",
        type: "project",
        description: "Build a lightweight but effective performance review system: self-assessment template, manager review form, and goal-setting framework — tailored for a nonprofit culture.",
        keyPoints: [
          "Avoid traditional performance ratings — they create anxiety and rarely improve performance",
          "Focus on: achievements, growth areas, what support is needed, goals for next period",
          "Two-way: the manager also completes a 'how am I supporting you?' section",
          "Calibration: a simple team-level review ensures consistency across managers",
        ],
        examplePrompt:
          "Build a performance review system for a 15-person nonprofit. We want to avoid numerical ratings and focus on growth conversations. Create: (1) a self-assessment template (1 page, 6 questions), (2) a manager review form (complementary to the self-assessment, not duplicating it), (3) a joint goal-setting template for the post-review conversation (OKR-style, 1-3 objectives per quarter), (4) a calibration guide for our leadership team to ensure consistency, (5) a 6-month check-in template (shorter, focused on goals progress). All templates should be in markdown format. Include instructions for how to run each conversation.",
      },
    ],
  },

  /* ─── MODULE 8 ─────────────────────────────────────────── */
  {
    slug: "legal-compliance-workflows",
    number: 8,
    title: "Legal & Compliance",
    subtitle: "Navigate contracts, governance, and compliance without a law firm",
    description:
      "Use AI to read and summarise contracts, generate policy documents, track compliance requirements, and prepare for board meetings — all without needing to bill 10 hours of attorney time. Always review with a qualified lawyer before signing.",
    category: "Business Functions",
    totalDuration: "3h 00min",
    level: "Intermediate",
    colorClass: "bg-red-50 border-red-200",
    accentClass: "bg-red-100 text-red-800",
    outcomes: [
      "Summarise and flag risk clauses in grant agreements and vendor contracts",
      "Generate compliant policy documents for your organisation",
      "Build a 501(c)(3) compliance tracker and board governance calendar",
      "Prepare board meeting materials in half the time",
    ],
    lessons: [
      {
        id: "8-1",
        title: "Contract Review and Risk Flagging",
        duration: "35 min",
        type: "project",
        description: "Paste a contract and get a plain-English summary, a risk flag on unusual clauses, and a list of questions to ask before signing. Covers grant agreements, vendor contracts, and employment agreements.",
        keyPoints: [
          "Always clarify: 'This is for educational purposes — I will review with a lawyer before signing'",
          "Risk clauses to flag: automatic renewal, IP ownership, unlimited liability, termination for convenience",
          "Grant agreements: check for matching requirements, restricted use clauses, reporting obligations, clawback provisions",
          "Output: 1-page executive summary + risk matrix with severity (Low/Medium/High) and recommended action",
        ],
        examplePrompt:
          "Review the following contract [paste contract text]. Provide: (1) a plain-English summary of the key terms (purpose, parties, duration, payment, deliverables, termination), (2) a risk matrix flagging any unusual, one-sided, or potentially problematic clauses — rate each as Low/Medium/High risk and explain why, (3) missing clauses that should typically be in this type of agreement, (4) 10 questions I should ask the other party before signing, (5) suggested modifications for the 3 highest-risk clauses. Note: this is for initial review only and I will have an attorney review before signing.",
      },
      {
        id: "8-2",
        title: "Policy Document Generator",
        duration: "40 min",
        type: "project",
        description: "Generate complete, compliant policy documents: privacy policy, conflict of interest policy, expense reimbursement policy, social media policy, and whistleblower policy.",
        keyPoints: [
          "Nonprofit-specific policies: conflict of interest is required by the IRS for 501(c)(3) status",
          "Privacy policy: required if you collect donor data — must reference GDPR (if any EU donors) and applicable state laws",
          "Input your organisation details once; Claude adapts every policy template automatically",
          "Review with a lawyer once per year and after any major regulatory change",
        ],
        examplePrompt:
          "Generate a complete Conflict of Interest Policy for our nonprofit. Our organisation: [NAME], a US 501(c)(3) based in [STATE], with a 9-person board and 12 full-time staff. The policy must: (1) meet IRS requirements for tax-exempt organisations, (2) define 'conflict of interest' broadly including financial and personal relationships, (3) establish a disclosure and recusal process, (4) require annual written disclosure from all board members and key staff, (5) specify consequences for violations, (6) include a standalone annual disclosure form that board members can sign. Format as a formal policy document with version number, effective date, and approval block.",
      },
      {
        id: "8-3",
        title: "501(c)(3) Compliance Calendar",
        duration: "30 min",
        type: "project",
        description: "Build a 12-month compliance calendar covering all federal and state filing requirements for a US nonprofit — so nothing falls through the cracks.",
        keyPoints: [
          "Federal: Form 990 (due 4.5 months after fiscal year end, or extension to 6 months), 990-T for UBIT if applicable",
          "State: annual report + charitable solicitation registration in every state where you fundraise",
          "Employment: W-2 (Jan 31), 1099s (Jan 31), payroll tax deposits (semi-weekly or monthly)",
          "Board: minimum annual meeting, conflict of interest disclosures, financial statements review",
        ],
        examplePrompt:
          "Create a 12-month compliance calendar for a US 501(c)(3) nonprofit with these details: fiscal year ends June 30, based in California but solicits donations nationally, has 8 employees and 2 contractors, has a 9-member board. The calendar should include: (1) all federal filing deadlines (IRS Form 990, employment tax filings, 1099s), (2) California state filings (RRF-1, CT-TR-1, attorney general registration renewal), (3) key states where we fundraise that require charitable registration renewal (list the top 10 most common), (4) internal governance requirements (board meetings, conflict of interest disclosures, financial review), (5) a notes column with what each filing requires and approximate cost. Output as a table I can paste into Google Sheets.",
      },
      {
        id: "8-4",
        title: "Board Meeting Preparation Toolkit",
        duration: "35 min",
        type: "project",
        description: "Generate a complete board meeting package: agenda, consent calendar, financial dashboard, CEO report, and board resolution templates — in one hour instead of a full day.",
        keyPoints: [
          "Consent calendar: routine approvals (minutes, standard contracts) bundled for a single vote — saves meeting time",
          "CEO report: Claude takes your bullet-point notes and writes the polished narrative",
          "Financial dashboard: takes your accounting export and generates the board-level summary",
          "Resolution templates: standard resolutions pre-drafted for approval of contracts, policy changes, officer elections",
        ],
        examplePrompt:
          "Prepare a complete board meeting package for our quarterly board meeting. Meeting date: [DATE]. Attendees: [list board members]. Key items to discuss: (1) Q3 financial review — [paste key financial data], (2) approval of a new $200K vendor contract, (3) executive director hiring update, (4) approval of updated conflict of interest policy. Generate: (a) a formal meeting agenda with time allocations, (b) a consent calendar grouping routine items, (c) an executive summary of the Q3 financials in board-friendly language, (d) a board resolution template for approving the vendor contract, (e) a draft of the CEO report paragraph on the hiring update based on these notes: [paste notes], (f) proposed minutes template to be completed after the meeting.",
      },
    ],
  },

  /* ─── MODULE 9 ─────────────────────────────────────────── */
  {
    slug: "data-impact-measurement",
    number: 9,
    title: "Data & Impact Measurement",
    subtitle: "Turn raw data into credible, compelling impact evidence",
    description:
      "Build the data infrastructure of a sophisticated nonprofit: clean messy data, create impact dashboards, analyse surveys, write data-driven narratives, and build the logic models that satisfy the most demanding grant funders.",
    category: "Business Functions",
    totalDuration: "4h 00min",
    level: "Intermediate",
    colorClass: "bg-cyan-50 border-cyan-200",
    accentClass: "bg-cyan-100 text-cyan-800",
    outcomes: [
      "Clean and standardise messy data from multiple sources in minutes",
      "Build an impact dashboard that updates automatically from a spreadsheet",
      "Write a theory of change and logic model from scratch",
      "Turn a year of raw data into a publishable impact report",
    ],
    lessons: [
      {
        id: "9-1",
        title: "Data Cleaning and Standardisation",
        duration: "40 min",
        type: "project",
        description: "Every organisation has messy data. Build scripts that automatically clean, standardise, and merge data from multiple sources — no manual spreadsheet work.",
        keyPoints: [
          "Common problems: inconsistent date formats, duplicate entries, mixed currencies, spelling variations in names",
          "Claude Code writes the cleaning script; you review and run it — you never need to understand the code",
          "Validation: after cleaning, Claude generates a data quality report — what was fixed, what still needs review",
          "Merge: combine data from multiple sources (Salesforce, spreadsheets, donation platforms) into one clean dataset",
        ],
        examplePrompt:
          "I have a donor database CSV exported from three different systems. The files are: salesforce-export.csv, spreadsheet-manual.csv, and stripe-donations.csv. Each has slightly different column names and formats. Build a Python script that: (1) loads all three files, (2) identifies and maps equivalent columns across the files, (3) standardises date formats to YYYY-MM-DD, (4) standardises phone numbers to (XXX) XXX-XXXX, (5) removes duplicate records (matching on email address), (6) flags rows with missing required fields (name, email, at least one donation record), (7) merges everything into a single clean file called merged-donors.csv, (8) outputs a data quality report showing: records in each source, duplicates removed, rows with missing data, and final record count.",
      },
      {
        id: "9-2",
        title: "Impact Dashboard Builder",
        duration: "50 min",
        type: "project",
        description: "Build a live impact dashboard that reads from a Google Sheet, updates automatically, and can be embedded in your website or shared with donors as a link.",
        keyPoints: [
          "Data source: a Google Sheet your programme team updates weekly — Claude reads it via the Sheets API",
          "Metrics: people reached, funds disbursed, milestones completed, volunteer hours logged",
          "Visualisations: progress bars, line charts (over time), map (if you have location data), donor leaderboard",
          "Sharing: the dashboard gets a permanent URL — embed it in your website with a single line of code",
        ],
        examplePrompt:
          "Build a Next.js impact dashboard that fetches data from a public Google Sheets CSV (I'll provide the URL). The sheet has columns: Month, Programme, Beneficiaries_Reached, Funds_Disbursed_USD, Volunteer_Hours, Milestones_Completed. The dashboard should show: (1) four KPI cards at the top with totals for all time, (2) a line chart showing beneficiaries reached by month, (3) a bar chart showing funds disbursed by programme, (4) a data table showing the last 12 months, (5) auto-generated 'impact story' paragraph that Claude writes from the data using the Anthropic API. Deploy to Vercel. Style it professionally with our brand colours.",
      },
      {
        id: "9-3",
        title: "Survey Analysis and Insight Extraction",
        duration: "35 min",
        type: "project",
        description: "Analyse beneficiary satisfaction surveys, donor feedback, and volunteer exit surveys. Turn hundreds of free-text responses into themes, quotes, and actionable recommendations.",
        keyPoints: [
          "Input: raw survey export from Google Forms, SurveyMonkey, or Typeform as CSV",
          "Output: quantitative summary (ratings distribution) + qualitative themes from free-text responses",
          "Sentiment analysis: Claude categorises each response as Positive/Neutral/Negative and explains why",
          "Report: auto-generated summary with charts, top 5 themes, representative quotes, and recommendations",
        ],
        examplePrompt:
          "I have a beneficiary satisfaction survey with 120 responses. The CSV has these columns: Date, Overall_Satisfaction (1-5), Programme_Name, What_Worked_Well (free text), What_Could_Improve (free text), Would_Recommend (Yes/No), Additional_Comments (free text). Analyse the data and produce: (1) quantitative summary — average satisfaction by programme, recommendation rate, distribution of scores, (2) thematic analysis of the free-text responses — identify the top 5 themes in each question, with example quotes for each theme, (3) sentiment analysis — what percentage of free-text responses are positive/neutral/negative, (4) cross-tabulation — do satisfaction scores vary significantly by programme?, (5) a one-page executive summary with key findings and 3 actionable recommendations.",
      },
      {
        id: "9-4",
        title: "Theory of Change and Logic Model Builder",
        duration: "35 min",
        type: "project",
        description: "Build the programme theory that sophisticated grant funders require. Claude helps you articulate your inputs, activities, outputs, outcomes, and long-term impact — in the language of M&E professionals.",
        keyPoints: [
          "Theory of Change: 'If we do X with Y, then Z will happen, because of this evidence'",
          "Logic model: the visual representation of inputs → activities → outputs → outcomes → impact",
          "Evidence base: Claude suggests relevant academic or sector evidence to support your causal claims",
          "Indicator framework: for each outcome, Claude suggests 2-3 SMART indicators with data collection methods",
        ],
        examplePrompt:
          "Help me build a Theory of Change for our programme: [describe your programme, target population, activities, and what change you're trying to create]. Ask me clarifying questions, then generate: (1) a written Theory of Change narrative (500 words) explaining the causal pathway from our activities to long-term impact, including our key assumptions, (2) a logic model table with columns: Inputs, Activities, Outputs, Short-term Outcomes, Long-term Outcomes, Impact, (3) 2-3 SMART indicators for each outcome with suggested data collection methods, (4) key assumptions that need to hold true for the theory to work, (5) suggestions for relevant evidence base we can cite to strengthen the theory.",
      },
    ],
  },

  /* ─── MODULE 10 ─────────────────────────────────────────── */
  {
    slug: "product-technology",
    number: 10,
    title: "Product & Technology",
    subtitle: "Build internal tools, donor portals, and custom databases",
    description:
      "Go beyond scripts and dashboards. Build full web applications: donor portals, volunteer management systems, internal admin tools, and custom CRMs. Deploy professional-grade software without hiring a developer.",
    category: "Advanced",
    totalDuration: "5h 00min",
    level: "Advanced",
    colorClass: "bg-indigo-50 border-indigo-200",
    accentClass: "bg-indigo-100 text-indigo-800",
    outcomes: [
      "Build a full-stack web application from a plain-English specification",
      "Connect your app to external APIs (Stripe, Mailchimp, Salesforce)",
      "Design and implement a database schema for a real programme",
      "Deploy and maintain a production web application",
    ],
    lessons: [
      {
        id: "10-1",
        title: "Building Internal Admin Tools",
        duration: "60 min",
        type: "project",
        description: "Build a private admin dashboard: see all your donors, their giving history, contact details, and notes — in a simple web app only you can access. This is a basic CRM.",
        keyPoints: [
          "Stack: Next.js + SQLite (simple, no server needed) or PostgreSQL via Supabase (free tier)",
          "Features: donor list with search/filter, donor profile with giving history, add notes, export to CSV",
          "Auth: password-protect the entire app with a single admin password (NextAuth)",
          "Deploy: Vercel for the frontend, Supabase free tier for the database — total cost: $0",
        ],
        examplePrompt:
          "Build a simple donor CRM web application using Next.js and a PostgreSQL database via Supabase. Features needed: (1) donor list page — searchable, filterable by giving status (active/lapsed/prospect), shows name, email, total given, last gift date, (2) donor detail page — full contact info, complete giving history with dates/amounts/projects, notes field (editable), tags (e.g. 'major donor', 'board prospect'), (3) add/edit donor form, (4) CSV import — upload a CSV of donors and have it automatically import to the database, (5) basic auth — single admin login to protect all pages. Use Tailwind CSS for styling. Deploy to Vercel with Supabase as the database.",
      },
      {
        id: "10-2",
        title: "API Integrations: Stripe, Mailchimp, and Salesforce",
        duration: "60 min",
        type: "guide",
        description: "Connect your tools to the services you already use. Learn how to integrate donation payments (Stripe), email marketing (Mailchimp), and CRM (Salesforce NPSP) using Claude Code.",
        keyPoints: [
          "Stripe: accept donations on your website — Claude builds the checkout page and webhook handler",
          "Mailchimp: automatically add new donors to your email list and tag them by project",
          "Salesforce NPSP: sync donation records from your website to Salesforce — no more manual entry",
          "Pattern: webhook → API call → database update — works the same way for any service",
        ],
        examplePrompt:
          "I want to add a donation button to my existing website. When someone donates: (1) they pay through Stripe Checkout, (2) after payment, a webhook fires and: adds them to my Mailchimp list with the tag 'donor-[project-name]', creates a contact and donation record in Salesforce NPSP, sends me a Slack notification. Build the complete integration: the Stripe checkout page, the webhook handler, and all three downstream API calls. I will provide my API keys via environment variables. Show me exactly how to set this up and test it locally before going live.",
      },
      {
        id: "10-3",
        title: "Database Design for NGO Programmes",
        duration: "50 min",
        type: "guide",
        description: "Design a proper database schema for your programme — beneficiaries, services delivered, outcomes tracked, documents stored. The foundation of serious impact measurement.",
        keyPoints: [
          "Entities to model: beneficiaries, households, services, staff, locations, outcomes, documents",
          "Relationships: one household has many beneficiaries, one beneficiary receives many services",
          "Prisma schema: Claude writes the schema.prisma file — you review and run prisma db push",
          "Migration strategy: start simple and add fields as you learn what data you actually need",
        ],
        examplePrompt:
          "Design a database schema using Prisma for a nutrition programme that tracks: (1) beneficiaries (adults and children, with household linkage), (2) monthly nutrition assessments (weight, height, MUAC measurement, food security score), (3) food distributions (what was given, how much, when), (4) household details (location, number of members, income level), (5) staff who conducted the assessment, (6) programme outcomes (improved nutritional status tracked over time). Write the complete schema.prisma file with appropriate data types, relationships (one-to-many, many-to-many where needed), required vs optional fields, and indexes for fields we'll query frequently. Include a seed script with 5 sample beneficiary households.",
      },
    ],
  },

  /* ─── MODULE 11 ─────────────────────────────────────────── */
  {
    slug: "advanced-automation",
    number: 11,
    title: "Advanced Automation & Pipelines",
    subtitle: "Build workflows that run themselves",
    description:
      "Build end-to-end automation pipelines: scheduled reports, multi-step data workflows, AI-powered document processing, and internal bots. The goal is workflows that run without human intervention.",
    category: "Advanced",
    totalDuration: "4h 30min",
    level: "Advanced",
    colorClass: "bg-amber-50 border-amber-200",
    accentClass: "bg-amber-100 text-amber-800",
    outcomes: [
      "Build and deploy a scheduled automation that runs without human intervention",
      "Create multi-step pipelines connecting 3+ external services",
      "Build an AI agent that processes documents and takes action",
      "Monitor and alert on pipeline failures",
    ],
    lessons: [
      {
        id: "11-1",
        title: "Scheduled Automations with Cron Jobs",
        duration: "45 min",
        type: "project",
        description: "Deploy scripts that run on a schedule — weekly reports emailed at 7am Monday, monthly donor reconciliation on the 1st, grant deadline reminders 30 days out.",
        keyPoints: [
          "Cron syntax: '0 7 * * 1' = 7am every Monday. Claude explains and generates any cron expression",
          "Free hosting for scheduled jobs: GitHub Actions (free for public repos), Vercel Cron, Railway.app",
          "Always add: error logging + email alert on failure — you need to know when automations break",
          "Start simple: one job, one output. Then chain them as you get confident",
        ],
        examplePrompt:
          "Build an automated weekly report pipeline. Every Monday at 7am it should: (1) read the latest data from our Google Sheet (published CSV URL), (2) generate a formatted HTML status report using the template we built in Module 6, (3) email the report to three recipients using SendGrid, (4) log the run to a simple log file with timestamp and status, (5) send a Slack message to #reports channel with a one-line summary. Set it up as a GitHub Actions workflow so it runs on a schedule with no server needed. Include error handling: if any step fails, email me immediately with the error details.",
      },
      {
        id: "11-2",
        title: "Document Processing Pipeline",
        duration: "50 min",
        type: "project",
        description: "Build a pipeline that monitors a Google Drive folder, processes any new PDF (grant application, donor letter, invoice), extracts structured data, and routes it to the right place.",
        keyPoints: [
          "Trigger: new file in Google Drive → Google Drive webhook → your API endpoint",
          "Processing: Claude reads the PDF, extracts structured data (sender, amount, date, type)",
          "Routing: invoice → accounts payable folder + email to finance. Grant app → programme team notification",
          "Storage: structured data saved to your database — searchable, trackable, never lost",
        ],
        examplePrompt:
          "Build a document processing pipeline for our finance team. When a new PDF is dropped in a specific Google Drive folder: (1) download the PDF and extract text using pdf-parse, (2) send the text to the Claude API with a prompt to extract: document type (invoice/receipt/grant-agreement/other), vendor name, amount, date, reference number, (3) based on document type: create a record in our database, save the structured data, (4) send an email notification to the appropriate team with the extracted data and a link to the original PDF, (5) move the processed PDF to a 'Processed' subfolder. Build this as an Express.js API that can receive webhooks from Google Drive.",
      },
      {
        id: "11-3",
        title: "Building an Internal Slack Bot",
        duration: "55 min",
        type: "project",
        description: "Build a Slack bot your team can query for: budget status, donor counts, upcoming deadlines, and quick data lookups — without logging into any system.",
        keyPoints: [
          "Slash commands: /budget Q3, /donors this-month, /deadline next-30-days",
          "Natural language: 'How much did we raise from individual donors in the last quarter?'",
          "Data sources: connects to your Supabase database, Google Sheets, or any CSV file",
          "Permissions: some queries available to all staff, others restricted to finance/leadership",
        ],
        examplePrompt:
          "Build a Slack bot for our nonprofit team using the Slack Bolt SDK for Node.js. The bot should respond to these slash commands: (1) /donors [period] — returns donor count and total raised for 'this-month', 'last-month', 'this-year', (2) /budget [category] — returns budget vs actual for the requested category from our Supabase database, (3) /deadlines — returns all grant and compliance deadlines in the next 30 days from a Supabase table, (4) /report — generates and emails a quick 5-metric status report to the requester. Also handle natural language questions via @bot mention — connect these to the Claude API with context about our organisation. Deploy to Railway.app (free tier). Provide complete setup instructions.",
      },
    ],
  },

  /* ─── MODULE 12 ─────────────────────────────────────────── */
  {
    slug: "ai-leadership-strategy",
    number: 12,
    title: "AI Leadership & Strategy",
    subtitle: "Lead your organisation's AI adoption with confidence",
    description:
      "The final module is about leadership, not tools. Evaluate AI investments, build an AI policy, train your team, measure the ROI of AI adoption, and create a roadmap that keeps your organisation ahead of the curve.",
    category: "Advanced",
    totalDuration: "3h 00min",
    level: "Advanced",
    colorClass: "bg-gray-50 border-gray-200",
    accentClass: "bg-gray-100 text-gray-800",
    outcomes: [
      "Write your organisation's AI adoption policy and acceptable use guidelines",
      "Build and present a business case for AI investment to your board",
      "Train your team to use AI tools responsibly and effectively",
      "Create a 12-month AI roadmap with prioritised initiatives and measurable goals",
    ],
    lessons: [
      {
        id: "12-1",
        title: "Evaluating AI Tools for Your Organisation",
        duration: "30 min",
        type: "guide",
        description: "A framework for assessing any AI tool: does it actually save time, is the data safe, what are the hidden costs, and how do you measure success?",
        keyPoints: [
          "Evaluation criteria: time savings, data privacy, cost (including your time to set it up), reliability",
          "Red flags: AI tools that promise too much, require excessive data sharing, have no human review step",
          "Pilot framework: test with a small project for 30 days, measure before and after, then decide",
          "Ask Claude: 'What are the limitations and failure modes of using AI for [specific task]?'",
        ],
        examplePrompt:
          "We are evaluating three AI tools for our nonprofit: (1) an AI grant writer that promises to write full grant applications, (2) an AI donor screening tool that analyses donor potential, (3) Claude Code for building internal automation tools. For each tool, provide: (a) a realistic assessment of what it can and cannot do, (b) data privacy considerations we should investigate, (c) a 30-day pilot plan with specific success metrics, (d) estimated time investment to implement vs time saved if it works, (e) red flags to watch for. Be honest about limitations — we need to make a realistic decision.",
      },
      {
        id: "12-2",
        title: "Writing Your AI Policy",
        duration: "35 min",
        type: "project",
        description: "Generate a practical, enforceable AI acceptable use policy for your organisation. Covers what AI can and cannot be used for, data handling, and disclosure requirements.",
        keyPoints: [
          "Approved uses: drafting and editing, data analysis, research, template generation",
          "Prohibited uses: final legal or financial documents without expert review, any communication implying AI was not involved",
          "Data rules: never paste donor PII, financial account details, or unreleased grant information into public AI tools",
          "Disclosure: when AI is used in donor-facing or funder-facing materials, disclose appropriately",
        ],
        examplePrompt:
          "Write an AI Acceptable Use Policy for our nonprofit organisation. We use: Claude (via API), ChatGPT (staff personal accounts), and Google Workspace AI features. The policy should cover: (1) approved uses (list specific, practical examples for each department), (2) prohibited uses with clear explanations of why, (3) data handling rules — what data can and cannot be shared with AI tools, (4) quality control requirements — human review for all external communications, (5) disclosure guidelines — when and how to disclose AI use, (6) tools that are approved vs require IT review before use, (7) breach reporting — what to do if you accidentally share sensitive data with an AI tool. Write it in plain English, not legalese. Maximum 3 pages.",
      },
      {
        id: "12-3",
        title: "Building the Business Case for AI",
        duration: "40 min",
        type: "project",
        description: "Quantify the ROI of your AI initiatives and present it to your board. Covers time savings, cost avoidance, quality improvements, and strategic positioning.",
        keyPoints: [
          "Time tracking: keep a log for 30 days of time saved on AI-assisted tasks — this becomes your data",
          "Dollar value: time saved × average hourly staff cost = cost avoidance",
          "Quality improvements: harder to quantify but trackable — error rates, donor satisfaction scores, grant success rate",
          "Board pitch: 1 slide — before (hours/cost), after (hours/cost), net saving, investment required",
        ],
        examplePrompt:
          "Help me build a business case for investing in AI tools and training for our nonprofit. Our organisation: 12 FTE staff, average salary $55,000, 80% programme + 20% admin split. We spend roughly: 15 hours/week on report writing, 10 hours/week on donor communications, 8 hours/week on data entry and cleaning, 6 hours/week on meeting preparation and follow-up. Based on the tools and workflows in this training programme, generate: (1) a time savings estimate per task if AI is implemented (use conservative 40% reduction), (2) a dollar value of time savings per year, (3) estimated investment (training time, tool subscriptions, setup time), (4) net ROI calculation, (5) a 1-page board presentation slide outline making the case for approval, (6) a 12-month implementation roadmap showing which tools to adopt in which order.",
      },
      {
        id: "12-4",
        title: "12-Month AI Roadmap",
        duration: "55 min",
        type: "project",
        description: "Your graduation project. Build a personalised 12-month AI adoption roadmap for your organisation — prioritised by ROI, sequenced for your team's capacity, and measured by clear milestones.",
        keyPoints: [
          "Phase 1 (Months 1-3): Foundation — install tools, train key staff, quick wins in one department",
          "Phase 2 (Months 4-6): Expansion — roll out to all departments, build first automation pipeline",
          "Phase 3 (Months 7-9): Optimisation — measure ROI, refine workflows, tackle complex use cases",
          "Phase 4 (Months 10-12): Leadership — share learnings, update AI policy, plan year 2",
        ],
        examplePrompt:
          "Create a personalised 12-month AI adoption roadmap for our nonprofit. Our situation: [describe your organisation size, main programmes, current tech stack, staff AI experience level, budget constraints]. Based on everything you've learned in this training programme, generate: (1) a phased 12-month roadmap showing what to implement in each quarter, (2) prioritisation rationale — why these initiatives first?, (3) capacity requirements — how many staff hours does each initiative require?, (4) success metrics for each phase, (5) a change management plan — how to bring sceptical staff along, (6) budget estimate for tools and external support, (7) risk mitigation — what could go wrong and how to prevent it. This is my organisation's strategic AI plan — make it specific, actionable, and realistic.",
      },
    ],
  },
];

/* Convenience helpers */
export const TOTAL_LESSONS = TRAINING_MODULES.reduce((sum, m) => sum + m.lessons.length, 0);
export const TOTAL_HOURS = "42+";
export const MODULE_COUNT = TRAINING_MODULES.length;

export function getModule(slug: string): TrainingModule | undefined {
  return TRAINING_MODULES.find((m) => m.slug === slug);
}

export const LEVEL_ORDER: Record<Level, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
};
