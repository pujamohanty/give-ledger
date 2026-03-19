import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BetaProgramClient from "./BetaProgramClient";

export default async function BetaProgramPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [existing, subscription] = await Promise.all([
    prisma.betaTesterProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { plan: true },
    }),
  ]);

  const isPro = subscription?.plan === "PRO";

  return <BetaProgramClient existing={existing} isPro={isPro} />;
}
