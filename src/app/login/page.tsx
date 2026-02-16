import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <SignIn afterSignInUrl="/dashboard" />
    </div>
  );
}
