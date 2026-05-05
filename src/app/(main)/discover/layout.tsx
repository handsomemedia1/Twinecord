import AgeGuard from "@/components/AgeGuard";

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <AgeGuard>{children}</AgeGuard>;
}
