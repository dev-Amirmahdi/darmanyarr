import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { doctorsRepo, specialtiesRepo } from "@/lib/repository";
import { DoctorCard } from "@/components/DoctorCard";
import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "جستجو پزشک | مِدنِوبت" }] }),
});

function SearchPage() {
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q ?? "");
  const [spId, setSpId] = useState<string>("");
  const [gender, setGender] = useState<"any" | "male" | "female">("any");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const specialties = specialtiesRepo.list();

  const results = useMemo(() => {
    let arr = doctorsRepo.list();
    if (q.trim()) arr = arr.filter((d) => d.name.includes(q) || d.city.includes(q) || d.bio.includes(q));
    if (spId) arr = arr.filter((d) => d.specialtyId === spId);
    if (gender !== "any") arr = arr.filter((d) => d.gender === gender);
    if (onlineOnly) arr = arr.filter((d) => d.supportsOnline);
    if (minRating > 0) arr = arr.filter((d) => d.rating >= minRating);
    return arr;
  }, [q, spId, gender, onlineOnly, minRating]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-4">جستجوی پزشک</h1>
      <div className="card-elevated p-4 flex items-center gap-2 mb-4">
        <Search size={18} className="text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="نام، تخصص یا شهر..."
          className="flex-1 bg-transparent outline-none text-sm" />
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <aside className="card-elevated p-4 space-y-4 h-fit">
          <h3 className="font-bold flex items-center gap-2"><SlidersHorizontal size={16} /> فیلترها</h3>
          <div>
            <label className="text-xs font-bold mb-1.5 block">تخصص</label>
            <select value={spId} onChange={(e) => setSpId(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm">
              <option value="">همه تخصص‌ها</option>
              {specialties.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">جنسیت</label>
            <div className="flex gap-1">
              {([["any", "همه"], ["male", "مرد"], ["female", "زن"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setGender(v)}
                  className={cn("flex-1 py-2 rounded-lg text-xs font-bold", gender === v ? "gradient-primary text-primary-foreground" : "bg-muted")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold mb-1.5 block">حداقل امتیاز</label>
            <input type="range" min={0} max={5} step={0.5} value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} className="w-full accent-primary" />
            <div className="text-xs text-muted-foreground text-center mt-1">از {minRating} به بالا</div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} className="accent-primary" />
            فقط دارای مشاوره آنلاین
          </label>
        </aside>

        <div className="md:col-span-3">
          <p className="text-sm text-muted-foreground mb-3">{results.length} پزشک یافت شد.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
          {results.length === 0 && <p className="text-center text-muted-foreground py-10">نتیجه‌ای یافت نشد.</p>}
        </div>
      </div>
    </div>
  );
}
