import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PER_PAGE = 24;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const state = searchParams.get("state") ?? "";
  const naics = searchParams.get("naics") ?? "";
  const sba = searchParams.get("sba") ?? "";
  const page = Math.max(0, parseInt(searchParams.get("page") ?? "0", 10));

  const where = {
    isActive: true,
    ...(q ? { legalName: { startsWith: q, mode: "insensitive" as const } } : {}),
    ...(state ? { state } : {}),
    ...(naics ? { naicsPrimary: { startsWith: naics } } : {}),
    ...(sba ? { sbaDesignations: { has: sba } } : {}),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      select: {
        id: true,
        uei: true,
        legalName: true,
        dbaName: true,
        city: true,
        state: true,
        naicsPrimary: true,
        naicsDescription: true,
        businessTypes: true,
        sbaDesignations: true,
        entityStructure: true,
        employeeRange: true,
        revenueRange: true,
        samRegistered: true,
        ocRegistered: true,
        website: true,
      },
      orderBy: [{ legalName: "asc" }],
      skip: page * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.company.count({ where }),
  ]);

  return NextResponse.json({ companies, total, page, perPage: PER_PAGE });
}
