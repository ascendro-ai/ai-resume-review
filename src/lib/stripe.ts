import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",
});

export const PRICES = {
  singleRework: {
    priceId: process.env.STRIPE_SINGLE_REWORK_PRICE_ID!,
    credits: 1,
    label: "Single Rework",
    amount: 1999,
  },
  threePack: {
    priceId: process.env.STRIPE_THREE_PACK_PRICE_ID!,
    credits: 3,
    label: "3-Pack",
    amount: 3999,
  },
} as const;
