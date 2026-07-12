import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { doctorsRepo, specialtiesRepo, clinicsRepo, reviewsRepo, favoritesRepo, recentDoctorsRepo } from "@/lib/repository";
import { Avatar } from "@/components/Avatar";
import { toFa, formatToman } from "@/lib/persian";
import { FA_WEEKDAYS } from "@/lib/jalali";
import { Star, MapPin, Video, Heart, Share2, GraduationCap, Award, Clock, CheckCircle2, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/doctors/$id")({
  component: DoctorProfile,
  head: ({ params }) => {
    const d = doctorsRepo.byId(params.id);
    return { meta: [{ title: `${d?.name ?? "پزشک"} | مِدنِوبت` }, { name: "description", content: d?.bio ?? "" }] };
  },
});

function DoctorProfile() {
  const { id } = Route.useParams();
  const router = useRouter();
  const doctor = doctorsRepo.byId(id);
  if (!doctor) throw notFound();
  const specialty = specialtiesRepo.byId(doctor.specialtyId);
  const clinic = clinicsRepo.byId(doctor.clinicId);
  const reviews = reviewsRepo.byDoctor(doctor.id);
  const [fav, setFav] = useState(false);
  useEffect(() => { setFav(favoritesRepo.has(doctor.id)); recentDoctorsRepo.push(doctor.id); }, [doctor.id]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="relative px-5 py-8 md:py-12 text-white">
          <div className="flex items-start gap-5">
            <Avatar seed={doctor.avatarSeed} size={96} className="ring-4 ring-white/30 shadow-elegant" />
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black">{doctor.name}</h1>
                {doctor.isOnline && <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">آنلاین</span>}
              </div>
              <p className="text-white/85 mt-1">{specialty?.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1"><Star size={14} className="fill-warning text-warning" /> {toFa(doctor.rating.toFixed(1))} ({toFa(doctor.reviewsCount)} نظر)</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {doctor.city}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => setFav(favoritesRepo.toggle(doctor.id))} className="h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center">
                <Heart size={18} className={fav ? "fill-white" : ""} />
              </button>
              <button className="h-10 w-10 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur flex items-center justify-center">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 py-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="درباره پزشک">
            <p className="text-sm leading-8 text-muted-foreground">{doctor.bio}</p>
          </Card>

          <Card title="تحصیلات و مدارک" icon={<GraduationCap size={18} />}>
            <ul className="space-y-2 text-sm">
              {doctor.education.map((e, i) => (
                <li key={i} className="flex gap-2"><CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" /> {e}</li>
              ))}
            </ul>
          </Card>

          <Card title="گواهینامه‌ها" icon={<Award size={18} />}>
            <div className="flex flex-wrap gap-2">
              {doctor.certificates.map((c, i) => (
                <span key={i} className="text-xs bg-muted px-3 py-1.5 rounded-full">{c}</span>
              ))}
            </div>
          </Card>

          <Card title="ساعت کاری" icon={<Clock size={18} />}>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {FA_WEEKDAYS.map((n, i) => {
                const wh = doctor.workHours[i];
                return (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted">
                    <span className="font-medium">{n}</span>
                    <span className={wh ? "text-foreground" : "text-muted-foreground"}>
                      {wh ? `${toFa(wh.start)} تا ${toFa(wh.end)}` : "تعطیل"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="آدرس مطب" icon={<MapPin size={18} />}>
            <p className="text-sm mb-3">{clinic?.name} — {doctor.address}</p>
            <div className="h-48 rounded-xl gradient-soft border border-border flex items-center justify-center text-muted-foreground text-sm">
              نقشه (پیش‌نمایش)
            </div>
          </Card>

          <Card title={`نظرات بیماران (${toFa(reviews.length)})`} icon={<MessageSquare size={18} />}>
            <div className="space-y-3">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="p-3 rounded-xl bg-muted">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{r.author}</span>
                    <span className="flex items-center gap-0.5 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < r.rating ? "fill-warning text-warning" : "text-muted-foreground"} />
                      ))}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-7">{r.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar / booking CTA */}
        <aside className="space-y-4">
          <div className="card-elevated p-5 sticky top-20">
            <div className="text-sm text-muted-foreground mb-1">تعرفه ویزیت حضوری</div>
            <div className="text-xl font-black text-primary mb-3">{formatToman(doctor.visitFee)}</div>
            {doctor.supportsOnline && (
              <>
                <div className="text-sm text-muted-foreground mb-1">تعرفه مشاوره آنلاین</div>
                <div className="text-lg font-bold text-secondary mb-4">{formatToman(doctor.onlineFee)}</div>
              </>
            )}
            <button
              onClick={() => router.navigate({ to: "/booking/$doctorId", params: { doctorId: doctor.id } })}
              className="w-full gradient-primary text-primary-foreground rounded-xl py-3 font-bold shadow-card hover:opacity-95 transition"
            >
              رزرو نوبت
            </button>
            {doctor.supportsOnline && (
              <Link to="/chat/$doctorId" params={{ doctorId: doctor.id }} className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-border py-3 font-bold text-sm hover:bg-muted transition">
                <Video size={16} /> شروع مشاوره آنلاین
              </Link>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className="text-primary">{icon}</span>}
        <h2 className="font-bold text-lg">{title}</h2>
      </div>
      {children}
    </div>
  );
}
