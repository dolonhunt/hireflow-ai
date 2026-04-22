"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarClock, Database, FolderKanban, LayoutDashboard, LogOut, Mail, Settings2, Shuffle, Users2 } from "lucide-react";
import { clsx } from "clsx";
import { APP_NAME, NAV_ITEMS, WORKSPACE_LABEL } from "@/lib/constants";
import { useAuth } from "@/components/auth-provider";

const iconMap = {
  Dashboard: LayoutDashboard,
  "Jobs & Watchlists": FolderKanban,
  Candidates: Users2,
  Pipeline: Shuffle,
  Workflow: CalendarClock,
  Outreach: Mail,
  "Imports & Sync": Database,
  Settings: Settings2,
} as const;

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="shell-grid">
      <aside className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.22),_transparent_36%),linear-gradient(180deg,#0d3f43,#07282b)] px-5 py-6 text-white">
        <div className="absolute inset-0 soft-grid opacity-20" />
        <div className="relative flex h-full flex-col gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-amber-100">
              Bangladesh Media Hiring
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight">{APP_NAME}</p>
              <p className="mt-1 text-sm text-white/72">{WORKSPACE_LABEL}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.label as keyof typeof iconMap];
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center justify-between rounded-2xl border px-3 py-3 text-sm transition-colors",
                    active
                      ? "border-amber-300/40 bg-white/16 text-white"
                      : "border-white/8 bg-white/4 text-white/72 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {active ? <span className="h-2 w-2 rounded-full bg-amber-300" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            {user && (
              <div className="rounded-2xl border border-white/12 bg-white/8 p-3">
                <p className="text-sm font-medium text-white">{user.email}</p>
                <p className="text-xs text-white/60">Signed in</p>
              </div>
            )}
            
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/4 px-3 py-3 text-sm text-white/72 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <main className="min-w-0 bg-background px-5 py-5 md:px-8 md:py-6">{children}</main>
      </div>
    </div>
  );
}