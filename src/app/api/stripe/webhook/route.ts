import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { recordDonation } from "@/lib/blockchain";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = (session as { metadata?: Record<string, string> }).metadata ?? {};

    // ── Subscription payment ──────────────────────────────────────────
    if (metadata.type === "subscription") {
      const { plan, userId } = metadata;
      if (!plan || !userId) {
        return NextResponse.json({ error: "Missing subscription metadata" }, { status: 400 });
      }

      const sessionObj = session as { payment_intent?: string };
      const refundEligibleAt =
        plan === "PRO"
          ? new Date(Date.now() + 18 * 30 * 24 * 60 * 60 * 1000)
          : null;

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          plan: plan as "BASIC" | "PRO",
          stripePaymentId: sessionObj.payment_intent as string,
          refundEligibleAt,
          purchasedAt: new Date(),
        },
        create: {
          userId,
          plan: plan as "BASIC" | "PRO",
          stripePaymentId: sessionObj.payment_intent as string,
          refundEligibleAt,
          purchasedAt: new Date(),
        },
      });

      return NextResponse.json({ received: true });
    }

    // ── Donation payment ──────────────────────────────────────────────
    const { projectId, userId } = metadata;

    if (!projectId || !userId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const sessionObj = session as {
      amount_total?: number;
      currency?: string;
      payment_intent?: string;
    };

    const amountPaid = (sessionObj.amount_total ?? 0) / 100;

    const donation = await prisma.donation.create({
      data: {
        userId,
        projectId,
        amount: amountPaid,
        currency: sessionObj.currency?.toUpperCase() ?? "USD",
        paymentMethod: "CARD",
        stripePaymentId: sessionObj.payment_intent as string,
        status: "COMPLETED",
      },
    });

    // Fetch NGO ID for the project (needed for on-chain record)
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ngoId: true },
    });

    // Write to Polygon (real if env vars set, mock otherwise)
    const { txHash } = await recordDonation(
      donation.id,
      project?.ngoId ?? "",
      projectId,
      amountPaid
    );

    await prisma.blockchainRecord.create({
      data: {
        entityType: "donation",
        donationId: donation.id,
        txHash,
        network: "polygon",
      },
    });

    const fullProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, ngo: { select: { orgName: true, id: true } } },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { raisedAmount: { increment: amountPaid } },
    });

    // Emit activity event
    const donor = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await prisma.activityEvent.create({
      data: {
        type: "DONATION",
        projectId,
        ngoName: fullProject?.ngo.orgName,
        projectTitle: fullProject?.title,
        actorId: userId,
        actorType: "USER",
        actorName: donor?.name ?? "A donor",
        description: `${donor?.name ?? "A donor"} donated $${amountPaid.toLocaleString()} to "${fullProject?.title ?? "a project"}"`,
        linkUrl: `/projects/${projectId}`,
      },
    }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
