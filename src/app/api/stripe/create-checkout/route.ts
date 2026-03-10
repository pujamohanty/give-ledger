import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, projectTitle, amount } = await req.json();

    if (!projectId || !amount || amount < 1) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Donation: ${projectTitle}`,
              description: `Your donation supports verified milestone-based progress tracked on-chain.`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        projectId,
        userId: session.user.id,
        donorEmail: session.user.email ?? "",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/donor/dashboard?donated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
