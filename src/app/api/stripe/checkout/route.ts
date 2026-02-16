import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();

  const price = plan === "three_pack" ? PRICES.threePack : PRICES.singleRework;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price: price.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      credits: String(price.credits),
    },
    customer_email: session.user.email,
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?payment=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
