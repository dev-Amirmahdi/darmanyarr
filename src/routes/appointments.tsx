import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { appointmentsRepo, authRepo, doctorsRepo, specialtiesRepo } from "@/lib/repository";
import { Avatar } from "@/components/Avatar";
import { toFa, formatToman } from "@/lib/persian";
import { formatJDate, parseJDateKey, toGregorian } from "@/lib/jalali";
import { CalendarDays, Clock, X, MapPin, Video, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

export const Route = createFileRoute("/appointments")({
  component: AppointmentsPage,
  head: () => ({ meta: [{ title: "نوبت‌های من | مِدنِوبت" }] }),
});

function AppointmentsPage() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [items, setItems] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState(authRepo.patient());

  const load = () => {
    const p = authRepo.patient();
    setPatient(p);
    if (!p) return setItems([]);
    setItems(appointmentsRepo.byPatient(p.phone));
  };
  useEffect(load, []);

  const now = new Date();
  const upcoming = items.filter((a) => a.status === "confirmed" && new Date(`${gregoriseKey(a.dateKey)}T${a.time}`) >= now);
  const past = items.filter((a) => a.status !== "confirmed" || new Date(`${gregoriseKey(a.dateKey)}T${a.time}`) < now);
  const list = tab === "upcoming" ? upcoming : past;

  if (!patient) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <h1 className="text-2xl font-black mb-2">نوبت‌های من</h1>
        <p className="text-muted-foreground mb-6">برای مشاهده نوبت‌های خود ابتدا وارد شوید.</p>
        <Link to="/auth" className="inline-block gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-card">ورود / ثبت‌نام</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-4">نوبت‌های من</h1>
      <div className="flex bg-muted p-1 rounded-xl mb-6 w-fit">
        {(["upcoming", "past"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-5 py-2 rounded-lg text-sm font-bold transition", tab === t ? "bg-card shadow-card text-primary" : "text-muted-foreground")}>
            {t === "upcoming" ? `آینده (${toFa(upcoming.length)})` : `تاریخچه (${toFa(past.length)})`}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 card-elevated">
          <CalendarDays className="mx-auto text-muted-foreground" size={40} />
          <p className="mt-3 text-muted-foreground">نوبتی برای نمایش وجود ندارد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((a) => (
            <AppointmentRow key={a.id} a={a} onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentRow({ a, onChange }: { a: Appointment; onChange: () => void }) {
  const d = doctorsRepo.byId(a.doctorId);
  const sp = d ? specialtiesRepo.byId(d.specialtyId) : undefined;
  const j = parseJDateKey(a.dateKey);
  if (!d) return null;
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-3">
        <Avatar seed={d.avatarSeed} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">{d.name}</span>
            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold",
              a.status === "confirmed" ? "bg-accent/15 text-accent" :
              a.status === "cancelled" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground")}>
              {a.status === "confirmed" ? "تأیید شده" : a.status === "cancelled" ? "لغو شده" : "انجام شده"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{sp?.name}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <Meta icon={<CalendarDays size={14} />} label={formatJDate(j, { withWeekday: true })} />
        <Meta icon={<Clock size={14} />} label={toFa(a.time)} />
        <Meta icon={a.type === "online" ? <Video size={14} /> : <User size={14} />} label={a.type === "online" ? "مشاوره آنلاین" : "ویزیت حضوری"} />
        <Meta icon={<MapPin size={14} />} label={d.city} />
      </div>
      <div className="mt-3 flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm font-bold text-primary">{formatToman(a.type === "online" ? d.onlineFee : d.visitFee)}</span>
        {a.status === "confirmed" && (
          <div className="flex gap-2">
            <button onClick={() => { if (confirm("این نوبت لغو شود؟")) { appointmentsRepo.cancel(a.id); onChange(); } }}
              className="text-xs px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive font-bold flex items-center gap-1">
              <X size={14} /> لغو
            </button>
            <Link to="/booking/$doctorId" params={{ doctorId: d.id }} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold">
              رزرو مجدد
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-1.5 text-muted-foreground bg-muted rounded-lg px-2.5 py-1.5">{icon}<span className="text-foreground truncate">{label}</span></div>;
}

// Convert Jalali key to a Gregorian ISO date string for comparisons.
function gregoriseKey(key: string): string {
  const j = parseJDateKey(key);
  const g = toGregorian(j);
  return `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, "0")}-${String(g.getDate()).padStart(2, "0")}`;
}
