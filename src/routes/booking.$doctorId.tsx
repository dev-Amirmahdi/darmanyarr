import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { doctorsRepo, appointmentsRepo, authRepo, specialtiesRepo } from "@/lib/repository";
import { Avatar } from "@/components/Avatar";
import { toFa, toEn, formatToman } from "@/lib/persian";
import {
  FA_MONTHS,
  FA_WEEKDAYS_SHORT,
  addDaysJ,
  compareJ,
  formatJDate,
  irWeekdayIndex,
  jDateKey,
  jMonthLength,
  todayJ,
  toGregorian,
  type JDate,
} from "@/lib/jalali";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  CalendarDays,
  Clock,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/booking/$doctorId")({
  component: BookingWizard,
  head: () => ({ meta: [{ title: "رزرو نوبت | مِدنِوبت" }] }),
});

type Step = 2 | 3 | 4;

function BookingWizard() {
  const { doctorId } = Route.useParams();
  const router = useRouter();
  const doctor = doctorsRepo.byId(doctorId);
  if (!doctor) throw notFound();
  const specialty = specialtiesRepo.byId(doctor.specialtyId);
  const patientAuth = authRepo.currentUser();

  if (!patientAuth) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 glass border-b border-border">
          <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between">
            <button onClick={() => router.history.back()} className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <ChevronRight size={18} />
            </button>
            <h1 className="font-bold">رزرو نوبت</h1>
            <span className="w-9" />
          </div>
        </header>
        <div className="mx-auto max-w-md px-5 py-16 text-center">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <LogIn size={30} />
          </div>
          <h2 className="mt-5 text-2xl font-black">ابتدا وارد حساب خود شوید</h2>
          <p className="mt-2 text-sm text-muted-foreground">برای رزرو نوبت با {doctor.name} باید وارد سامانه شوید.</p>
          <Link to="/auth" className="mt-6 inline-flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-card">
            <LogIn size={18} /> ورود / ثبت‌نام
          </Link>
        </div>
      </div>
    );
  }

  const [step, setStep] = useState<Step>(2);
  const [date, setDate] = useState<JDate | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: patientAuth.firstName ?? "",
    lastName: patientAuth.lastName ?? "",
    nationalId: patientAuth.nationalId ?? "",
    phone: patientAuth.phone ?? "",
    age: patientAuth.age ? String(patientAuth.age) : "",
    gender: patientAuth.gender ?? "male",
    notes: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border">
        <div className="mx-auto max-w-3xl px-5 h-16 flex items-center justify-between">
          <button
            onClick={() => router.history.back()}
            className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"
          >
            <ChevronRight size={18} />
          </button>
          <h1 className="font-bold">رزرو نوبت</h1>
          <span className="w-9" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 py-6">
        <Stepper step={step} />

        {/* Doctor summary card */}
        <div className="card-elevated p-4 mt-6 flex items-center gap-4">
          <Avatar seed={doctor.avatarSeed} size={56} />
          <div className="flex-1">
            <div className="font-bold">{doctor.name}</div>
            <div className="text-sm text-muted-foreground">
              {specialty?.name} — {doctor.city}
            </div>
          </div>
        </div>

        <div className="mt-6">
          {step === 2 && (
            <StepCard title="تاریخ نوبت را انتخاب کنید" icon={<CalendarDays size={18} />}>
              <JalaliCalendar
                doctor={doctor}
                value={date}
                onSelect={(d) => {
                  setDate(d);
                  setTime(null);
                }}
              />
              <Nav
                onNext={() => date && setStep(3)}
                nextDisabled={!date}
                nextLabel="مرحله بعد"
              />
            </StepCard>
          )}

          {step === 3 && date && (
            <StepCard title="ساعت نوبت را انتخاب کنید" icon={<Clock size={18} />}>
              <p className="text-sm text-muted-foreground mb-3">
                {formatJDate(date, { withWeekday: true })}
              </p>
              <TimeSlots doctor={doctor} date={date} value={time} onSelect={setTime} />
              <Nav
                onBack={() => setStep(2)}
                onNext={() => time && setStep(4)}
                nextDisabled={!time}
                nextLabel="ورود اطلاعات بیمار"
              />
            </StepCard>
          )}

          {step === 4 && date && time && (
            <StepCard title="اطلاعات بیمار">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="نام"
                  value={form.firstName}
                  onChange={(v) => setForm({ ...form, firstName: v })}
                />
                <Field
                  label="نام خانوادگی"
                  value={form.lastName}
                  onChange={(v) => setForm({ ...form, lastName: v })}
                />
                <Field
                  label="کد ملی"
                  value={form.nationalId}
                  onChange={(v) => setForm({ ...form, nationalId: v })}
                  maxLength={10}
                />
                <Field
                  label="شماره موبایل"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  maxLength={11}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                />
                <Field label="سن" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
                <div>
                  <label className="text-xs font-bold mb-1.5 block">جنسیت</label>
                  <div className="flex gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g })}
                        className={cn(
                          "flex-1 py-2.5 rounded-lg text-sm font-bold border transition",
                          form.gender === g
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-muted",
                        )}
                      >
                        {g === "male" ? "مرد" : "زن"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold mb-1.5 block">توضیحات (اختیاری)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-5 card-elevated p-4 gradient-soft">
                <h4 className="font-bold mb-3">خلاصه رزرو</h4>
                <SummaryRow k="پزشک" v={doctor.name} />
                <SummaryRow k="نوع نوبت" v="حضوری" />
                <SummaryRow k="تاریخ" v={formatJDate(date, { withWeekday: true })} />
                <SummaryRow k="ساعت" v={toFa(time)} />
                <SummaryRow
                  k="مبلغ"
                  v={formatToman(doctor.visitFee)}
                  highlight
                />
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                  <X size={16} />
                  {error}
                </div>
              )}

              <Nav
                onBack={() => setStep(3)}
                onNext={() => {
                  setError(null);
                  const errors: string[] = [];
                  const fn = form.firstName.trim(),
                    ln = form.lastName.trim();
                  const nid = toEn(form.nationalId).trim();
                  const ph = toEn(form.phone).trim();
                  const age = Number(toEn(form.age));
                  if (!fn) errors.push("نام");
                  if (!ln) errors.push("نام خانوادگی");
                  if (!/^\d{10}$/.test(nid)) errors.push("کد ملی معتبر");
                  if (!/^09\d{9}$/.test(ph)) errors.push("شماره موبایل معتبر");
                  if (!age || age < 1 || age > 130) errors.push("سن معتبر");
                  if (errors.length) {
                    setError("لطفاً وارد کنید: " + errors.join("، "));
                    return;
                  }
                  const id = `apt-${Date.now()}`;
                  const res = appointmentsRepo.create({
                    id,
                    doctorId: doctor.id,
                    patientId: patientAuth.email,
                    type: "in-person",
                    dateKey: jDateKey(date),
                    time,
                    patient: {
                      firstName: fn,
                      lastName: ln,
                      nationalId: nid,
                      phone: ph,
                      age,
                      gender: form.gender,
                      notes: form.notes.trim() || undefined,
                    },
                    status: "confirmed",
                    createdAt: new Date().toISOString(),
                  });
                  if (!res.ok) {
                    setError(res.error ?? "خطا در ثبت نوبت");
                    return;
                  }
                  authRepo.updateCurrentUser({
                    firstName: fn,
                    lastName: ln,
                    phone: ph,
                    nationalId: nid,
                    age,
                    gender: form.gender,
                  });
                  setSuccess(id);
                }}
                nextLabel="تأیید و ثبت نوبت"
              />
            </StepCard>
          )}
        </div>

        {success && (
          <div className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-elevated p-6 max-w-sm w-full text-center animate-fade-in-up">
              <div className="h-16 w-16 mx-auto rounded-full gradient-accent flex items-center justify-center shadow-glow">
                <Check size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-black mt-4">نوبت شما با موفقیت ثبت شد!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                جزئیات نوبت در بخش نوبت‌های من قابل مشاهده است.
              </p>
              <div className="mt-5 flex gap-2">
                <Link
                  to="/appointments"
                  className="flex-1 gradient-primary text-primary-foreground rounded-xl py-3 font-bold text-sm"
                >
                  نوبت‌های من
                </Link>
                <Link
                  to="/"
                  className="flex-1 border border-border rounded-xl py-3 font-bold text-sm"
                >
                  صفحه اصلی
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const labels = ["انتخاب پزشک", "تاریخ", "ساعت", "اطلاعات"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const s = i + 1;
        const active = s === step;
        const done = s < step;
        return (
          <div key={l} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-2 w-full rounded-full transition",
                done ? "bg-primary" : active ? "gradient-primary" : "bg-muted",
              )}
            />
            <span
              className={cn(
                "text-[10px] md:text-xs font-bold",
                active || done ? "text-primary" : "text-muted-foreground",
              )}
            >
              {l}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated p-5 animate-fade-in-up">
      <h2 className="flex items-center gap-2 font-bold mb-4">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel: string;
}) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          onClick={onBack}
          className="px-4 py-3 rounded-xl border border-border font-bold text-sm hover:bg-muted transition flex items-center gap-1"
        >
          <ChevronRight size={16} /> قبلی
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "px-6 py-3 rounded-xl font-bold text-sm shadow-card transition flex items-center gap-1",
          nextDisabled
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "gradient-primary text-primary-foreground hover:opacity-95",
        )}
      >
        {nextLabel} <ChevronLeft size={16} />
      </button>
    </div>
  );
}

function JalaliCalendar({
  doctor,
  value,
  onSelect,
}: {
  doctor: ReturnType<typeof doctorsRepo.byId>;
  value: JDate | null;
  onSelect: (d: JDate) => void;
}) {
  const today = todayJ();
  const [cursor, setCursor] = useState<JDate>({ jy: today.jy, jm: today.jm, jd: 1 });
  const length = jMonthLength(cursor.jy, cursor.jm);
  const firstG = toGregorian({ jy: cursor.jy, jm: cursor.jm, jd: 1 });
  const startCol = irWeekdayIndex(firstG); // 0..6
  const cells: (JDate | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= length; d++) cells.push({ jy: cursor.jy, jm: cursor.jm, jd: d });
  const nextMonth = () =>
    setCursor(
      cursor.jm === 12 ? { jy: cursor.jy + 1, jm: 1, jd: 1 } : { ...cursor, jm: cursor.jm + 1 },
    );
  const prevMonth = () =>
    setCursor(
      cursor.jm === 1 ? { jy: cursor.jy - 1, jm: 12, jd: 1 } : { ...cursor, jm: cursor.jm - 1 },
    );
  const canGoPrev =
    compareJ({ jy: cursor.jy, jm: cursor.jm, jd: 1 }, { jy: today.jy, jm: today.jm, jd: 1 }) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          disabled={!canGoPrev}
          onClick={prevMonth}
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center",
            canGoPrev
              ? "bg-muted hover:bg-muted/70"
              : "bg-muted/40 text-muted-foreground cursor-not-allowed",
          )}
        >
          <ChevronRight size={16} />
        </button>
        <div className="font-bold">
          {FA_MONTHS[cursor.jm - 1]} {toFa(cursor.jy)}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="h-9 w-9 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1 text-xs text-muted-foreground text-center">
        {FA_WEEKDAYS_SHORT.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} />;
          const g = toGregorian(c);
          const wd = irWeekdayIndex(g);
          const past = compareJ(c, today) < 0;
          const off = doctor?.workHours?.[wd] == null;
          const disabled = past || off;
          const selected = value && compareJ(value, c) === 0;
          const isToday = compareJ(c, today) === 0;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(c)}
              className={cn(
                "aspect-square rounded-lg text-sm font-bold transition relative",
                disabled
                  ? "text-muted-foreground/40 bg-muted/30 cursor-not-allowed line-through"
                  : selected
                    ? "gradient-primary text-primary-foreground shadow-card"
                    : isToday
                      ? "border-2 border-primary text-primary bg-primary/5 hover:bg-primary/10"
                      : "bg-muted hover:bg-muted/70",
              )}
            >
              {toFa(c.jd)}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">روزهای تعطیل و گذشته غیرفعال هستند.</p>
    </div>
  );
}

function TimeSlots({
  doctor,
  date,
  value,
  onSelect,
}: {
  doctor: ReturnType<typeof doctorsRepo.byId>;
  date: JDate;
  value: string | null;
  onSelect: (t: string) => void;
}) {
  const slots = useMemo(() => {
    if (!doctor) return [];
    const g = toGregorian(date);
    const wd = irWeekdayIndex(g);
    const wh = doctor.workHours[wd];
    if (!wh) return [];
    const [sh, sm] = wh.start.split(":").map(Number);
    const [eh, em] = wh.end.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    const out: string[] = [];
    for (let m = start; m < end; m += doctor.slotMinutes) {
      out.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
    }
    return out;
  }, [doctor, date]);
  const booked = doctor
    ? new Set(appointmentsRepo.bookedSlots(doctor.id, jDateKey(date)))
    : new Set();

  if (slots.length === 0)
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        در این روز ساعت کاری تعریف نشده است.
      </p>
    );
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((s) => {
        const isBooked = booked.has(s);
        const selected = value === s;
        return (
          <button
            key={s}
            type="button"
            disabled={isBooked}
            onClick={() => onSelect(s)}
            className={cn(
              "py-2.5 rounded-lg text-sm font-bold border transition",
              isBooked
                ? "bg-muted/40 text-muted-foreground/50 border-transparent line-through cursor-not-allowed"
                : selected
                  ? "gradient-primary text-primary-foreground border-transparent shadow-card"
                  : "bg-muted border-transparent hover:bg-muted/70",
            )}
          >
            {toFa(s)}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-xs font-bold mb-1.5 block">{label}</label>
      <input
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function SummaryRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("font-bold", highlight && "text-primary")}>{v}</span>
    </div>
  );
}
