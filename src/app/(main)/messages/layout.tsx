import AgeGuard from "@/components/AgeGuard";

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <AgeGuard>{children}</AgeGuard>;
}
