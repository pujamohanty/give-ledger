import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { generateMockTxHash } from "@/lib/utils";

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
    const txHash = generateMockTxHash();

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

    await prisma.blockchainRecord.create({
      data: {
        entityType: "donation",
        donationId: donation.id,
        txHash,
        network: "polygon",
      },
    });

    await prisma.project.update({
      where: { id: projectId },
      data: { raisedAmount: { increment: amountPaid } },
    });
  }

  return NextResponse.json({ received: true });
}
