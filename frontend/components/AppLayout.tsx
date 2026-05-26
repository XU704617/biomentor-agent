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
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <Header role={role} />
      <div className="flex flex-1 pt-[var(--header-height)]">
        <Sidebar role={role} />
        <main className="flex-1 ml-[var(--sidebar-width)] p-8 min-h-[calc(100vh-var(--header-height))]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
