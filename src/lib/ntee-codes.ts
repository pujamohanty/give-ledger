/**
 * NTEE (National Taxonomy of Exempt Entities) code descriptions.
 * Used to display human-readable category names for IRS organizations.
 *
 * Major groups (first letter): A-Z
 * Full codes: letter + 2 digits (e.g., "A84" = Historical Societies)
 */

export const NTEE_MAJOR_GROUPS: Record<string, string> = {
  A: "Arts, Culture & Humanities",
  B: "Education",
  C: "Environment",
  D: "Animal-Related",
  E: "Health Care",
  F: "Mental Health & Crisis Intervention",
  G: "Diseases, Disorders & Medical Disciplines",
  H: "Medical Research",
  I: "Crime & Legal-Related",
  J: "Employment",
  K: "Food, Agriculture & Nutrition",
  L: "Housing & Shelter",
  M: "Public Safety, Disaster Preparedness & Relief",
  N: "Recreation & Sports",
  O: "Youth Development",
  P: "Human Services",
  Q: "International, Foreign Affairs & National Security",
  R: "Civil Rights, Social Action & Advocacy",
  S: "Community Improvement & Capacity Building",
  T: "Philanthropy, Voluntarism & Grantmaking Foundations",
  U: "Science & Technology",
  V: "Social Science",
  W: "Public & Societal Benefit",
  X: "Religion-Related",
  Y: "Mutual & Membership Benefit",
  Z: "Unknown / Unclassified",
};

/** Convert NTEE major group ID (1-10) to category name (ProPublica API format) */
export const NTEE_PROPUBLICA_GROUPS: Record<number, string> = {
  1: "Arts, Culture & Humanities",
  2: "Education",
  3: "Environment and Animals",
  4: "Health",
  5: "Human Services",
  6: "International, Foreign Affairs",
  7: "Public, Societal Benefit",
  8: "Religion Related",
  9: "Mutual/Membership Benefit",
  10: "Unknown, Unclassified",
};

/** IRC subsection code descriptions */
export const SUBSECTION_CODES: Record<number, string> = {
  2: "501(c)(2) — Title-Holding Corporation",
  3: "501(c)(3) — Charitable, Religious, Educational",
  4: "501(c)(4) — Social Welfare",
  5: "501(c)(5) — Labor, Agricultural, Horticultural",
  6: "501(c)(6) — Business League, Chamber of Commerce",
  7: "501(c)(7) — Social & Recreation Club",
  8: "501(c)(8) — Fraternal Beneficiary Society",
  9: "501(c)(9) — Voluntary Employees' Beneficiary Association",
  10: "501(c)(10) — Domestic Fraternal Society",
  11: "501(c)(11) — Teachers' Retirement Fund",
  12: "501(c)(12) — Benevolent Life Insurance Association",
  13: "501(c)(13) — Cemetery Company",
  14: "501(c)(14) — State-Chartered Credit Union",
  15: "501(c)(15) — Mutual Insurance Company",
  17: "501(c)(17) — Supplemental Unemployment Benefit Trust",
  19: "501(c)(19) — War Veterans' Organization",
  25: "501(c)(25) — Title-Holding Corporation (Multiple Parents)",
  92: "4947(a)(1) — Nonexempt Charitable Trust",
};

/** Deductibility codes */
export const DEDUCTIBILITY_CODES: Record<number, string> = {
  1: "Contributions are deductible",
  2: "Contributions are not deductible",
  4: "Contributions are deductible by treaty",
};

/**
 * Get human-readable NTEE category from code (e.g., "A84" → "Arts, Culture & Humanities")
 */
export function getNteeCategory(code: string | null | undefined): string {
  if (!code) return "Unclassified";
  const major = code.charAt(0).toUpperCase();
  return NTEE_MAJOR_GROUPS[major] || "Unclassified";
}

/**
 * Get subsection description from code (e.g., 3 → "501(c)(3) — Charitable...")
 */
export function getSubsectionLabel(code: number | null | undefined): string {
  if (!code) return "Unknown";
  return SUBSECTION_CODES[code] || `501(c)(${code})`;
}

/**
 * Format EIN with dash (e.g., "142007220" → "14-2007220")
 */
export function formatEin(ein: string): string {
  if (ein.includes("-")) return ein;
  if (ein.length < 3) return ein;
  return `${ein.slice(0, 2)}-${ein.slice(2)}`;
}

/**
 * Format dollar amount for display
 */
export function formatDollars(amount: bigint | number | null | undefined): string {
  if (amount === null || amount === undefined) return "N/A";
  const num = typeof amount === "bigint" ? Number(amount) : amount;
  if (Math.abs(num) >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(num) >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (Math.abs(num) >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}
