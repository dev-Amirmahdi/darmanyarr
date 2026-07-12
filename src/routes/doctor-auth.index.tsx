import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authRepo, doctorsRepo } from "@/lib/repository";
import { ArrowRight, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/doctor-auth/")({
  component: DoctorAuth,
  head: () => ({ meta: [{ title: "ورود پزشکان | مِدنِوبت" }] }),
});

function DoctorAuth() {
  const router = useRouter();
  const [id, setId] = useState("dr-1");
  const [password, setPassword] = useState("doctor");
  const [error, setError] = useState<string | null>(null);
  const doctors = doctorsRepo.list().slice(0, 12);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 gradient-soft">
      <div className="w-full max-w-md card-elevated p-6">
        <Link to="/" className="text-sm text-muted-foreground flex items-center gap-1 mb-6"><ArrowRight size={16} /> بازگشت</Link>
        <div className="h-14 w-14 rounded-2xl gradient-accent flex items-center justify-center shadow-glow mb-4">
          <Stethoscope className="text-white" />
        </div>
        <h1 className="text-2xl font-black">پنل ورود پزشکان</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-5">با استفاده از حساب اختصاصی خود وارد پنل پزشک شوید.</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold mb-1.5 block">نام کاربری (شناسه پزشک)</label>
            <select value={id} onChange={(e) => setId(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring">
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.id})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">رمز عبور</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </div>
          {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          <button onClick={() => {
            if (!password) return setError("رمز عبور را وارد کنید.");
            const d = doctorsRepo.byId(id);
            if (!d) return setError("پزشکی با این شناسه یافت نشد.");
            authRepo.setDoctor({ doctorId: d.id, name: d.name });
            router.navigate({ to: "/doctor-panel" });
          }} className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-bold shadow-card">
            ورود به پنل پزشک
          </button>
          <p className="text-xs text-muted-foreground text-center pt-2">در نسخه آزمایشی، رمز عبور هر مقداری می‌تواند باشد.</p>
        </div>
      </div>
    </div>
  );
}
