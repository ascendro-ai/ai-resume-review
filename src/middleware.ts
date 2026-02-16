export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard", "/scorecard", "/rework", "/rework/result"],
};
