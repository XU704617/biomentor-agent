"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTeacher = pathname.startsWith("/teacher");
  const isStudent = pathname.startsWith("/student");
  const isHome = pathname === "/";

  if (isHome) {
    return <>{children}</>;
  }

  const role = isTeacher ? "teacher" : "student";

  return (
    <div className="min-h-screen flex flex-col">
      <Header role={role} />
      <div className="flex flex-1 pt-[var(--header-height)]">
        <Sidebar role={role} />
        <main className="flex-1 ml-[var(--sidebar-width)] p-6 min-h-[calc(100vh-var(--header-height))] bio-pattern">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
