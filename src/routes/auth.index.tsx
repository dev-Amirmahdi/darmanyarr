import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authRepo } from "@/lib/repository";
import { toEn, toFa } from "@/lib/persian";
import { ArrowRight, Phone, User, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "ورود / ثبت‌نام | مِدنِوبت" }] }),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otp, setOtp] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-10">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%)" }} />
        <div className="relative text-white max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black">م</div>
            <span className="font-black text-xl">مِدنِوبت</span>
          </Link>
          <h1 className="text-3xl font-black leading-snug">به خانواده مِدنِوبت خوش آمدید</h1>
          <p className="mt-4 text-white/85">با ثبت‌نام سریع، به بهترین پزشکان کشور دسترسی خواهید داشت.</p>
          <ul className="mt-8 space-y-3 text-sm">
            {["رزرو نوبت در کمتر از ۱ دقیقه", "مشاوره آنلاین ۲۴ ساعته", "دسترسی به تاریخچه ویزیت‌ها", "پزشکان مورد علاقه"].map((x) => (
              <li key={x} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-white" /> {x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-sm text-muted-foreground flex items-center gap-1 mb-6"><ArrowRight size={16} /> بازگشت به خانه</Link>
          <h2 className="text-2xl font-black mb-2">{mode === "login" ? "ورود به حساب" : "ایجاد حساب جدید"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{step === "form" ? "شماره موبایل خود را وارد کنید" : `کد تأیید به ${toFa(phone)} ارسال شد`}</p>

          <div className="flex bg-muted p-1 rounded-xl mb-5">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setStep("form"); setError(null); }}
                className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition", mode === m ? "bg-card shadow-card text-primary" : "text-muted-foreground")}>
                {m === "login" ? "ورود" : "ثبت‌نام"}
              </button>
            ))}
          </div>

          {step === "form" && (
            <div className="space-y-3">
              {mode === "register" && (
                <>
                  <FieldIcon icon={<User size={16} />} placeholder="نام" value={firstName} onChange={setFirstName} />
                  <FieldIcon icon={<User size={16} />} placeholder="نام خانوادگی" value={lastName} onChange={setLastName} />
                </>
              )}
              <FieldIcon icon={<Phone size={16} />} placeholder="شماره موبایل (۰۹۱۲...)" value={phone} onChange={setPhone} maxLength={11} />
              {mode === "login" && (
                <label className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" />
                  مرا به خاطر بسپار
                </label>
              )}
              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
              <button onClick={() => {
                const ph = toEn(phone).trim();
                if (!/^09\d{9}$/.test(ph)) return setError("شماره موبایل معتبر نیست.");
                if (mode === "register" && (!firstName.trim() || !lastName.trim())) return setError("لطفاً نام و نام خانوادگی را وارد کنید.");
                setError(null);
                setStep("otp");
              }} className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-bold shadow-card">
                ارسال کد تأیید
              </button>
              {mode === "login" && (
                <button onClick={() => alert("این قابلیت در نسخه فعلی غیرفعال است.")} className="w-full text-xs text-muted-foreground py-2">
                  رمز عبور خود را فراموش کرده‌اید؟
                </button>
              )}
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-3">
              <FieldIcon icon={<Lock size={16} />} placeholder="کد ۴ رقمی (هر عددی)" value={otp} onChange={setOtp} maxLength={6} />
              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
              <button onClick={() => {
                const code = toEn(otp).trim();
                if (code.length < 4) return setError("کد تأیید کوتاه است.");
                const ph = toEn(phone).trim();
                authRepo.setPatient({ phone: ph, firstName: firstName || "کاربر", lastName: lastName || "مِدنِوبت" });
                router.navigate({ to: "/" });
              }} className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-bold shadow-card">
                {mode === "login" ? "ورود" : "ثبت‌نام و ورود"}
              </button>
              <button onClick={() => setStep("form")} className="w-full text-xs text-muted-foreground py-2">ویرایش شماره</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldIcon({ icon, placeholder, value, onChange, maxLength }: { icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void; maxLength?: number }) {
  return (
    <div className="flex items-center gap-2 bg-input border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
      <span className="text-muted-foreground">{icon}</span>
      <input value={value} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm" />
    </div>
  );
}
