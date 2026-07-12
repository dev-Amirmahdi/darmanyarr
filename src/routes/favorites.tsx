import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { favoritesRepo, doctorsRepo, recentDoctorsRepo } from "@/lib/repository";
import { DoctorCard } from "@/components/DoctorCard";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  component: Favorites,
  head: () => ({ meta: [{ title: "پزشکان مورد علاقه | مِدنِوبت" }] }),
});

function Favorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => { setIds(favoritesRepo.list()); setRecent(recentDoctorsRepo.list()); }, []);
  const favDoctors = ids.map((i) => doctorsRepo.byId(i)).filter(Boolean) as ReturnType<typeof doctorsRepo.byId>[];
  const recentDoctors = recent.map((i) => doctorsRepo.byId(i)).filter(Boolean) as ReturnType<typeof doctorsRepo.byId>[];
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-6 flex items-center gap-2"><Heart className="text-destructive fill-destructive" /> پزشکان مورد علاقه</h1>
      {favDoctors.length === 0 ? (
        <div className="text-center py-16 card-elevated">
          <p className="text-muted-foreground">هنوز پزشکی به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
          <Link to="/specialties" className="mt-4 inline-block gradient-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm">جستجوی پزشک</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{favDoctors.map((d) => d && <DoctorCard key={d.id} doctor={d} />)}</div>
      )}

      {recentDoctors.length > 0 && (
        <>
          <h2 className="text-xl font-black mt-10 mb-4">آخرین پزشکان مشاهده شده</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{recentDoctors.map((d) => d && <DoctorCard key={d.id} doctor={d} />)}</div>
        </>
      )}
    </div>
  );
}
