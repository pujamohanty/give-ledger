import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BetaProgramClient from "./BetaProgramClient";

export default async function BetaProgramPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.betaTesterProfile.findUnique({
    where: { userId: session.user.id },
  });

  return <BetaProgramClient existing={existing} />;
}
