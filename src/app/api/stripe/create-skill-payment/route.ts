import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

const PLAN_DETAILS = {
  BASIC: {
    name: "GiveLedger Basic — Skill Contributor Access",
    description: "Apply to up to 50 open roles at verified US nonprofits.",
    amount: 10_00, // cents
  },
  PRO: {
    name: "GiveLedger Pro — Priority Skill Contributor",
    description: "Unlimited applications, priority listing, and 100% refund after 18 months.",
    amount: 25_00, // cents
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await req.json();
    if (!plan || !(plan in PLAN_DETAILS)) {
      return NextResponse.json({ error: "Invalid plan. Must be BASIC or PRO." }, { status: 400 });
    }

    const details = PLAN_DETAILS[plan as keyof typeof PLAN_DETAILS];

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: details.name,
              description: details.description,
            },
            unit_amount: details.amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "subscription",
        plan,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donor/subscription?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Skill payment checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
