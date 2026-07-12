import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Calendar, MessageCircle, User, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { authRepo } from "@/lib/repository";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "خانه", icon: Home },
  { to: "/search", label: "جستجو", icon: Search },
  { to: "/appointments", label: "نوبت‌ها", icon: Calendar },
  { to: "/online", label: "مشاوره", icon: MessageCircle },
  { to: "/profile", label: "پروفایل", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden glass border-t border-border">
      <div className="grid grid-cols-5">
        {items.map((it) => {
          const active = loc.pathname === it.to || (it.to !== "/" && loc.pathname.startsWith(it.to));
          const Icon = it.icon;
          return (
            <button
              key={it.to}
              onClick={() => router.navigate({ to: it.to })}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-xs transition",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon size={22} className={cn(active && "scale-110 transition-transform")} />
              <span className={cn(active && "font-bold")}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function TopHeader() {
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof authRepo.currentUser>>(null);
  const loc = useLocation();

  useEffect(() => {
    setCurrentUser(authRepo.currentUser());
  }, [loc.pathname]);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-black shadow-glow">م</div>
          <span className="font-black text-lg">مِدنِوبت</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { to: "/", l: "خانه" },
            { to: "/specialties", l: "تخصص‌ها" },
            { to: "/online", l: "مشاوره آنلاین" },
            { to: "/articles", l: "مجله سلامت" },
            { to: "/appointments", l: "نوبت‌های من" },
          ].map((n) => (
            <Link key={n.to} to={n.to} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition">
              {n.l}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/doctor-auth" className="hidden sm:inline-flex text-xs px-3 py-2 rounded-lg border border-border hover:bg-muted transition font-medium">
            ورود پزشکان
          </Link>
          {currentUser ? (
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl bg-muted px-2 py-1.5 text-xs font-semibold hover:bg-muted/70 transition"
              aria-label="پروفایل کاربر"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-primary text-primary-foreground font-black">
                {currentUser.username.charAt(0)}
              </span>
              <span className="hidden sm:inline max-w-24 truncate">{currentUser.username}</span>
            </Link>
          ) : (
            <Link to="/auth" className="text-xs px-4 py-2 rounded-lg gradient-primary text-primary-foreground font-semibold shadow-card hover:opacity-95 transition">
              ورود / ثبت‌نام
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const PATHS_WITHOUT_CHROME = ["/auth", "/doctor-auth", "/doctor-panel", "/onboarding", "/booking"];

export function useHideChrome() {
  const loc = useLocation();
  return PATHS_WITHOUT_CHROME.some((p) => loc.pathname.startsWith(p));
}
