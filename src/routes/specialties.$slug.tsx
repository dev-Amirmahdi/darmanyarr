import { createFileRoute, notFound } from "@tanstack/react-router";
import { specialtiesRepo, doctorsRepo } from "@/lib/repository";
import { DoctorCard } from "@/components/DoctorCard";
import { toFa } from "@/lib/persian";

export const Route = createFileRoute("/specialties/$slug")({
  component: SpecialtyDetail,
  head: ({ params }) => {
    const s = specialtiesRepo.bySlug(params.slug);
    return { meta: [{ title: `${s?.name ?? "تخصص"} | مِدنِوبت` }, { name: "description", content: `لیست پزشکان متخصص ${s?.name ?? ""}` }] };
  },
});

function SpecialtyDetail() {
  const { slug } = Route.useParams();
  const s = specialtiesRepo.bySlug(slug);
  if (!s) throw notFound();
  const doctors = doctorsRepo.bySpecialty(s.id);
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center gap-4 mb-6">
        <div className={`h-16 w-16 rounded-2xl ${s.color} flex items-center justify-center text-3xl shadow-card`}>{s.icon}</div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">{s.name}</h1>
          <p className="text-sm text-muted-foreground">{toFa(doctors.length)} پزشک متخصص در دسترس</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
      </div>
      {doctors.length === 0 && <p className="text-center text-muted-foreground py-12">پزشکی در این تخصص یافت نشد.</p>}
    </div>
  );
}
