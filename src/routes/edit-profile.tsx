import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authRepo } from "@/lib/repository";
import type { AppUser } from "@/lib/types";
import { User, Mail, Phone, CreditCard, Save } from "lucide-react";

export const Route = createFileRoute("/edit-profile")({
  component: EditProfilePage,
  head: () => ({
    meta: [{ title: "ویرایش اطلاعات | مِدنِوبت" }],
  }),
});

function EditProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<AppUser>({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    nationalId: "",
    age: undefined,
    gender: undefined,
  });

  useEffect(() => {
    const user = authRepo.currentUser();

    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }

    setForm(user);
  }, []);

  const change =
    (key: keyof AppUser) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >,
    ) => {
      const value =
        key === "age"
          ? e.target.value === ""
            ? undefined
            : Number(e.target.value)
          : e.target.value;

      setForm((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const save = () => {
    authRepo.updateCurrentUser(form);

    alert("اطلاعات با موفقیت ذخیره شد.");

    router.navigate({
      to: "/profile",
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">

      <div className="card-elevated p-6">

        <h1 className="text-2xl font-black mb-6">
          ویرایش اطلاعات
        </h1>

        <div className="grid gap-5">

          <div>
            <label className="mb-2 block text-sm font-medium">
              نام کاربری
            </label>

            <div className="relative">
              <User
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                className="w-full rounded-xl border bg-background py-3 pr-10 pl-3 outline-none focus:ring-2 focus:ring-primary"
                value={form.username}
                onChange={change("username")}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              ایمیل
            </label>

            <div className="relative">
              <Mail
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                type="email"
                className="w-full rounded-xl border bg-muted py-3 pr-10 pl-3 text-muted-foreground"
                value={form.email}
                disabled
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              نام
            </label>

            <input
              className="w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
              value={form.firstName ?? ""}
              onChange={change("firstName")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              نام خانوادگی
            </label>

            <input
              className="w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
              value={form.lastName ?? ""}
              onChange={change("lastName")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              شماره موبایل
            </label>

            <div className="relative">
              <Phone
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                className="w-full rounded-xl border bg-background py-3 pr-10 pl-3 outline-none focus:ring-2 focus:ring-primary"
                value={form.phone ?? ""}
                onChange={change("phone")}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              کد ملی
            </label>

            <div className="relative">
              <CreditCard
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />

              <input
                className="w-full rounded-xl border bg-background py-3 pr-10 pl-3 outline-none focus:ring-2 focus:ring-primary"
                value={form.nationalId ?? ""}
                onChange={change("nationalId")}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              سن
            </label>

            <input
              type="number"
              min={0}
              className="w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
              value={form.age ?? ""}
              onChange={change("age")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              جنسیت
            </label>

            <select
              className="w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
              value={form.gender ?? ""}
              onChange={change("gender")}
            >
              <option value="">انتخاب کنید</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              رمز عبور
            </label>

            <input
              type="password"
              className="w-full rounded-xl border bg-background px-3 py-3 outline-none focus:ring-2 focus:ring-primary"
              value={form.password}
              onChange={change("password")}
            />
          </div>

          <button
            onClick={save}
            className="mt-3 flex items-center justify-center gap-2 rounded-xl gradient-primary px-4 py-3 font-bold text-primary-foreground shadow-card transition hover:opacity-90 cursor-pointer"
          >
            <Save size={18} />
            ذخیره تغییرات
          </button>

        </div>

      </div>

    </div>
  );
}