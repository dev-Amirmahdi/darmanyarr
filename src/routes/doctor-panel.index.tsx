import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { authRepo, appointmentsRepo, doctorsRepo } from "@/lib/repository";
import { Avatar } from "@/components/Avatar";
import { toFa, formatToman } from "@/lib/persian";
import { FA_MONTHS, FA_WEEKDAYS, jDateKey, parseJDateKey, todayJ, addDaysJ, formatJDate, toGregorian, irWeekdayIndex } from "@/lib/jalali";
import { CalendarDays, Users, TrendingUp, Bell, LogOut, Clock, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctor-panel/")({
  component: DoctorPanel,
  head: () => ({ meta: [{ title: "پنل پزشک | مِدنِوبت" }] }),
});

function DoctorPanel() {
  const router = useRouter();
  const [session, setSession] = useState(authRepo.doctor());
  useEffect(() => { if (!session) router.navigate({ to: "/doctor-auth" }); }, [session, router]);
  if (!session) return null;

  const doctor = doctorsRepo.byId(session.doctorId);
  if (!doctor) return null;
  const all = appointmentsRepo.byDoctor(doctor.id).filter((a) => a.status !== "cancelled");

  const today = todayJ();
  const todayKey = jDateKey(today);
  const tomorrowKey = jDateKey(addDaysJ(today, 1));
  const todaysApts = all.filter((a) => a.dateKey === todayKey);
  const tomorrowApts = all.filter((a) => a.dateKey === tomorrowKey);
  const uniquePatients = new Set(all.map((a) => a.patientId)).size;
  const revenue = all.reduce((s, a) => s + (a.type === "online" ? doctor.onlineFee : doctor.visitFee), 0);

  // week (7 days) counts
  const week = Array.from({ length: 7 }).map((_, i) => addDaysJ(today, i));

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar seed={doctor.avatarSeed} size={40} />
            <div>
              <div className="font-bold text-sm">{doctor.name}</div>
              <div className="text-xs text-muted-foreground">پنل مدیریت پزشک</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center relative">
              <Bell size={18} />
              <span className="absolute top-2 end-2 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <button onClick={() => { authRepo.signOutDoctor(); setSession(null); }} className="h-10 px-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center gap-1">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={<CalendarDays />} label="نوبت‌های امروز" value={toFa(todaysApts.length)} color="from-blue-500 to-blue-600" />
          <Stat icon={<Clock />} label="نوبت‌های فردا" value={toFa(tomorrowApts.length)} color="from-teal-500 to-teal-600" />
          <Stat icon={<Users />} label="کل بیماران" value={toFa(uniquePatients)} color="from-emerald-500 to-emerald-600" />
          <Stat icon={<DollarSign />} label="درآمد (آزمایشی)" value={formatToman(revenue)} color="from-amber-500 to-amber-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card title="نوبت‌های امروز" icon={<CalendarDays size={18} />}>
              {todaysApts.length === 0 ? (
                <Empty>امروز نوبتی ندارید.</Empty>
              ) : (
                <div className="space-y-2">
                  {todaysApts.sort((a, b) => a.time.localeCompare(b.time)).map((a) => (
                    <AptRow key={a.id} apt={a} />
                  ))}
                </div>
              )}
            </Card>

            <Card title="تقویم هفتگی" icon={<TrendingUp size={18} />}>
              <div className="grid grid-cols-7 gap-2">
                {week.map((d, i) => {
                  const key = jDateKey(d);
                  const count = all.filter((a) => a.dateKey === key).length;
                  const g = toGregorian(d);
                  const wd = irWeekdayIndex(g);
                  return (
                    <div key={i} className={cn("card-elevated p-3 text-center", count > 0 ? "border-primary/30" : "")}>
                      <div className="text-[10px] text-muted-foreground">{FA_WEEKDAYS[wd]}</div>
                      <div className="text-lg font-black">{toFa(d.jd)}</div>
                      <div className="text-[10px] text-muted-foreground">{FA_MONTHS[d.jm - 1]}</div>
                      <div className={cn("mt-2 text-xs font-bold px-2 py-1 rounded-full", count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        {toFa(count)} نوبت
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="نوبت‌های فردا" icon={<Clock size={18} />}>
              {tomorrowApts.length === 0 ? <Empty>فردا نوبتی ندارید.</Empty> : (
                <div className="space-y-2">{tomorrowApts.sort((a, b) => a.time.localeCompare(b.time)).map((a) => <AptRow key={a.id} apt={a} />)}</div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="ساعت‌های کاری" icon={<Clock size={18} />}>
              <div className="space-y-1.5 text-sm">
                {FA_WEEKDAYS.map((n, i) => {
                  const wh = doctor.workHours[i];
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="font-medium">{n}</span>
                      <span className={wh ? "text-foreground" : "text-muted-foreground"}>
                        {wh ? `${toFa(wh.start)} تا ${toFa(wh.end)}` : "تعطیل"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card title="لیست بیماران" icon={<Users size={18} />}>
              {uniquePatients === 0 ? <Empty>هنوز بیماری ندارید.</Empty> : (
                <div className="space-y-2 max-h-72 overflow-auto no-scrollbar">
                  {Array.from(new Map(all.map((a) => [a.patientId, a])).values()).map((a) => (
                    <div key={a.patientId} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                      <div className="h-9 w-9 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {a.patient.firstName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{a.patient.firstName} {a.patient.lastName}</div>
                        <div className="text-xs text-muted-foreground">{toFa(a.patient.phone)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="card-elevated p-4">
      <div className={cn("h-10 w-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center mb-3", color)}>{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-black mt-1">{value}</div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <h2 className="flex items-center gap-2 font-bold mb-4">{icon}{title}</h2>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground py-6 text-center">{children}</p>;
}

function AptRow({ apt }: { apt: ReturnType<typeof appointmentsRepo.byDoctor>[number] }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
      <div className="text-center min-w-[52px]">
        <div className="text-lg font-black text-primary">{toFa(apt.time)}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{apt.patient.firstName} {apt.patient.lastName}</div>
        <div className="text-xs text-muted-foreground">{apt.type === "online" ? "آنلاین" : "حضوری"} — {toFa(apt.patient.phone)}</div>
      </div>
    </div>
  );
}
