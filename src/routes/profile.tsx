import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authRepo, appointmentsRepo, notificationsRepo } from "@/lib/repository";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toFa } from "@/lib/persian";
import { User, LogOut, Heart, CalendarDays, Bell, ChevronLeft, Settings } from "lucide-react";
import type { Patient } from "@/lib/types";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "پروفایل کاربر | مِدنِوبت" }] }),
});

function ProfilePage() {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [count, setCount] = useState({ apts: 0, notif: 0 });
  useEffect(() => {
    const p = authRepo.patient();
    setPatient(p);
    if (p) setCount({ apts: appointmentsRepo.byPatient(p.phone).length, notif: notificationsRepo.list().filter((n) => !n.read).length });
  }, []);

  if (!patient) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4"><User size={32} className="text-muted-foreground" /></div>
        <h1 className="text-2xl font-black mb-2">وارد حساب خود شوید</h1>
        <p className="text-muted-foreground mb-6">برای دسترسی به پروفایل و نوبت‌ها ابتدا وارد شوید.</p>
        <Link to="/auth" className="inline-block gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-card">ورود / ثبت‌نام</Link>
      </div>
    );
  }

  const items: { icon: React.ReactNode; label: string; to?: string; onClick?: () => void; badge?: string }[] = [
    { icon: <CalendarDays size={18} />, label: "نوبت‌های من", to: "/appointments", badge: toFa(count.apts) },
    { icon: <Heart size={18} />, label: "پزشکان مورد علاقه", to: "/favorites" },
    { icon: <Bell size={18} />, label: "اعلان‌ها", to: "/appointments", badge: count.notif > 0 ? toFa(count.notif) : undefined },
    { icon: <Settings size={18} />, label: "تنظیمات", onClick: () => {} },
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      <div className="card-elevated p-6 flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow-glow">
          {patient.firstName[0] ?? "؟"}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-black">{patient.firstName} {patient.lastName}</h1>
          <p className="text-sm text-muted-foreground">{toFa(patient.phone)}</p>
        </div>
      </div>

      <div className="mt-6 card-elevated p-2">
        {items.map((it, i) => {
          const inner = (
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">{it.icon}</div>
              <span className="flex-1 font-medium">{it.label}</span>
              {it.badge && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{it.badge}</span>}
              <ChevronLeft size={16} className="text-muted-foreground" />
            </div>
          );
          return it.to ? <Link key={i} to={it.to}>{inner}</Link> : <button key={i} onClick={it.onClick} className="w-full text-right">{inner}</button>;
        })}
      </div>

      <div className="mt-6 space-y-3">
        <ThemeToggle variant="row" />
        <button onClick={() => { authRepo.signOutPatient(); router.navigate({ to: "/" }); }}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-xl bg-destructive/10 text-destructive font-bold hover:bg-destructive/15 transition">
          <LogOut size={18} /> خروج از حساب
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">نسخه ۱٫۰٫۰ — تمام اطلاعات فقط روی دستگاه شما ذخیره می‌شوند.</p>
    </div>
  );
}
