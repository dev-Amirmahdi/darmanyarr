import { createFileRoute } from "@tanstack/react-router";
import { specialtiesRepo, doctorsRepo } from "@/lib/repository";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { toFa } from "@/lib/persian";

export const Route = createFileRoute("/specialties/")({
  component: SpecialtiesPage,
  head: () => ({ meta: [{ title: "تخصص‌های پزشکی | مِدنِوبت" }, { name: "description", content: "لیست کامل تخصص‌های پزشکی برای رزرو نوبت." }] }),
});

function SpecialtiesPage() {
  const list = specialtiesRepo.list();
  const doctors = doctorsRepo.list();
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-2">تخصص‌های پزشکی</h1>
      <p className="text-muted-foreground text-sm mb-6">یکی از تخصص‌ها را انتخاب کنید تا لیست پزشکان آن نمایش داده شود.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {list.map((s) => {
          const count = doctors.filter((d) => d.specialtyId === s.id).length;
          return (
            <div key={s.id} className="relative">
              <SpecialtyCard s={s} />
              <span className="absolute top-2 start-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {toFa(count)} پزشک
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
