import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { authRepo } from "@/lib/repository";
import { ArrowRight, User, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "ورود / ثبت‌نام | مِدنِوبت" }] }),
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-1/2 gradient-hero relative overflow-hidden items-center justify-center p-10">
        <div
          className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 20% 20%, white 0%, transparent 40%)" }}
        />
        <div className="relative text-white max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-black">
              م
            </div>
            <span className="font-black text-xl">مِدنِوبت</span>
          </Link>
          <h1 className="text-3xl font-black leading-snug">به خانواده مِدنِوبت خوش آمدید</h1>
          <p className="mt-4 text-white/85">
            با ثبت‌نام سریع، به بهترین پزشکان کشور دسترسی خواهید داشت.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "رزرو نوبت در کمتر از ۱ دقیقه",
              "مشاوره آنلاین ۲۴ ساعته",
              "دسترسی به تاریخچه ویزیت‌ها",
              "پزشکان مورد علاقه",
            ].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white" /> {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-sm text-muted-foreground flex items-center gap-1 mb-6">
            <ArrowRight size={16} /> بازگشت به خانه
          </Link>
          <h2 className="text-2xl font-black mb-2">
            {mode === "login" ? "ورود به حساب" : "ایجاد حساب جدید"}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "login"
              ? "با نام کاربری یا ایمیل وارد شوید"
              : "اطلاعات حساب خود را وارد کنید"}
          </p>

          <div className="flex bg-muted p-1 rounded-xl mb-5">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError(null);
                }}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-bold transition",
                  mode === m ? "bg-card shadow-card text-primary" : "text-muted-foreground",
                )}
              >
                {m === "login" ? "ورود" : "ثبت‌نام"}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {mode === "register" ? (
              <>
                <FieldIcon
                  icon={<User size={16} />}
                  placeholder="نام کاربری"
                  value={username}
                  onChange={setUsername}
                />
                <FieldIcon
                  icon={<Mail size={16} />}
                  placeholder="ایمیل"
                  value={email}
                  onChange={setEmail}
                  type="email"
                />
              </>
            ) : (
              <FieldIcon
                icon={<User size={16} />}
                placeholder="نام کاربری یا ایمیل"
                value={username}
                onChange={setUsername}
              />
            )}
            <FieldIcon
              icon={<Lock size={16} />}
              placeholder="رمز عبور"
              value={password}
              onChange={setPassword}
              type="password"
            />
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
            <button
              onClick={() => {
                const result =
                  mode === "register"
                    ? authRepo.register({ username, email, password })
                    : authRepo.login(username, password);
                if (!result.ok) return setError(result.error ?? "خطایی رخ داد.");
                setError(null);
                toast.success(mode === "register" ? "ثبت‌نام با موفقیت انجام شد." : "با موفقیت وارد حساب شدید.");
                router.navigate({ to: "/" });
              }}
              className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-bold shadow-card"
            >
              {mode === "login" ? "ورود" : "ثبت‌نام و ورود"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldIcon({
  icon,
  placeholder,
  value,
  onChange,
  maxLength,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  type?: "text" | "email" | "password";
}) {
  return (
    <div className="flex items-center gap-2 bg-input border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
      <span className="text-muted-foreground">{icon}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-sm"
      />
    </div>
  );
}
