import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AgeGuard({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true }
  });

  if (!user?.profile?.dateOfBirth) {
    return redirect("/onboarding");
  }

  const age = new Date().getFullYear() - new Date(user.profile.dateOfBirth).getFullYear();
  
  if (age < 18) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-card rounded-3xl m-4 md:m-8 shadow-xl border border-border max-w-2xl mx-auto mt-20">
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-4 text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">
          TwineCord's dating features are reserved for users who are 18 years or older. You can still participate in the community feed!
        </p>
        <Link 
          href="/feed" 
          className="px-8 py-4 bg-tc-primary hover:bg-tc-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-tc-primary/30"
        >
          Go to Community Feed
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
