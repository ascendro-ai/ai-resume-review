import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { currentUser } from "@clerk/nextjs/server";
import { stripe, PRICES } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await getAuthUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress;

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
      userId,
      credits: String(price.credits),
    },
    ...(email ? { customer_email: email } : {}),
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?payment=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
