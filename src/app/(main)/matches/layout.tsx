import AgeGuard from "@/components/AgeGuard";

export default function MatchesLayout({ children }: { children: React.ReactNode }) {
  return <AgeGuard>{children}</AgeGuard>;
}
