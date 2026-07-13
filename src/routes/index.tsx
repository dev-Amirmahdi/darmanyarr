import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Search, Zap, Phone, Video, Star, ChevronLeft, Sparkles, Shield, Clock } from "lucide-react";
import { doctorsRepo, specialtiesRepo, articlesRepo } from "@/lib/repository";
import { DoctorCard } from "@/components/DoctorCard";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { ArticleCard } from "@/components/ArticleCard";
import { toFa } from "@/lib/persian";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "مِدنِوبت | رزرو نوبت پزشک، مشاوره آنلاین و مجله سلامت" },
      { name: "description", content: "جستجو و رزرو نوبت پزشک از میان بهترین متخصصان کشور، همراه با مشاوره آنلاین و مجله سلامت." },
    ],
  }),
});

function Home() {
  const specialties = specialtiesRepo.list();
  const topDoctors = doctorsRepo.top(6);
  const popular = doctorsRepo.popular(6);
  const online = doctorsRepo.online().filter((d) => d.isOnline).slice(0, 4);
  const articles = articlesRepo.list().slice(0, 6);
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute -top-24 -start-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -end-24 h-96 w-96 rounded-full bg-black/10 blur-3xl" />
        <div className="relative px-5 pt-10 pb-14 md:pt-16 md:pb-20 text-white">
          <div className="flex items-center gap-2 text-xs bg-white/15 w-fit px-3 py-1.5 rounded-full mb-4 backdrop-blur">
            <Sparkles size={14} /> بیش از {toFa(60)} پزشک متخصص در دسترس
          </div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight max-w-2xl">
            سلامتی شما، فقط یک جستجو با ما فاصله دارد
          </h1>
          <p className="mt-3 text-white/85 max-w-xl">
            رزرو نوبت پزشک، مشاوره آنلاین با متخصصان و دسترسی به مقالات معتبر سلامت — همه در یکجا.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); router.navigate({ to: "/search", search: { q } }); }}
            className="mt-6 flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-elegant max-w-2xl"
          >
            <div className="flex items-center gap-2 px-3 flex-1 text-foreground">
              <Search size={18} className="text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="نام پزشک، تخصص یا شهر..."
                className="w-full bg-transparent outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <button type="submit" className="rounded-xl gradient-primary text-primary-foreground font-bold px-5 py-3 text-sm shadow-card cursor-pointer">
              جستجو
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/online" className="inline-flex items-center gap-2 bg-white text-primary font-bold rounded-xl px-4 py-2.5 text-sm shadow-card">
              <Zap size={16} /> درخواست سریع مشاوره
            </Link>
            <a href="tel:115" className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground font-bold rounded-xl px-4 py-2.5 text-sm shadow-card">
              <Phone size={16} /> تماس اضطراری {toFa(115)}
            </a>
          </div>
        </div>
      </section>

      {/* Value pills */}
      <section className="px-5 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Video, l: "مشاوره آنلاین", d: "۲۴ ساعته" },
            { icon: Shield, l: "پزشکان معتبر", d: "دارای پروانه" },
            { icon: Clock, l: "رزرو سریع", d: "کمتر از ۱ دقیقه" },
            { icon: Star, l: "امتیاز واقعی", d: "از بیماران" },
          ].map((x, i) => (
            <div key={i} className="card-elevated p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                <x.icon size={20} />
              </div>
              <div>
                <div className="text-sm font-bold">{x.l}</div>
                <div className="text-xs text-muted-foreground">{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties */}
      <Section title="تخصص‌های پزشکی" href="/specialties">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 px-5">
          {specialties.slice(0, 12).map((s) => (
            <SpecialtyCard key={s.id} s={s} />
          ))}
        </div>
      </Section>

      {/* Online doctors */}
      {online.length > 0 && (
        <Section title="پزشکان آنلاین همین حالا" href="/online">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5">
            {online.map((d) => <DoctorCard key={d.id} doctor={d} />)}
          </div>
        </Section>
      )}

      {/* Promo banner */}
      <section className="px-5 mt-10">
        <div className="relative overflow-hidden rounded-3xl gradient-accent p-6 md:p-8 text-accent-foreground">
          <div className="absolute -bottom-10 -end-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div>
              <h3 className="text-xl md:text-2xl font-black">اولین مشاوره خود را با ۵۰٪ تخفیف تجربه کنید</h3>
              <p className="text-sm opacity-90 mt-1">با پزشکان متخصص، هرجا که هستید، از طریق چت، صوت و تصویر</p>
            </div>
            <Link to="/online" className="bg-foreground text-background px-5 py-3 rounded-xl font-bold text-sm shadow-elegant shrink-0">
              دریافت مشاوره
            </Link>
          </div>
        </div>
      </section>

      {/* Top doctors */}
      <Section title="بهترین پزشکان" href="/specialties">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5">
          {topDoctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      </Section>

      {/* Popular */}
      <Section title="پزشکان محبوب" href="/specialties">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5">
          {popular.map((d) => <DoctorCard key={d.id} doctor={d} />)}
        </div>
      </Section>

      {/* Articles */}
      <Section title="مجله سلامت" href="/articles">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-5">
          {articles.map((a) => <ArticleCard key={a.id} a={a} />)}
        </div>
      </Section>

      {/* FAQ */}
      <section className="px-5 mt-10">
        <h2 className="text-xl font-black mb-4">سوالات متداول</h2>
        <div className="space-y-3">
          {[
            { q: "چگونه نوبت رزرو کنم؟", a: "کافی است پزشک مورد نظر را انتخاب کرده و در چهار مرحله ساده، تاریخ و ساعت مناسب را انتخاب کنید." },
            { q: "آیا اطلاعات من محفوظ می‌ماند؟", a: "بله. تمام اطلاعات فقط روی دستگاه شما ذخیره می‌شود و در اختیار هیچ‌کس قرار نمی‌گیرد." },
            { q: "چطور می‌توانم مشاوره آنلاین دریافت کنم؟", a: "از بخش «مشاوره آنلاین» پزشک مورد نظر را انتخاب کرده و از طریق چت با ایشان در ارتباط باشید." },
          ].map((f, i) => (
            <details key={i} className="card-elevated p-4 group">
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm">
                {f.q}
                <ChevronLeft className="group-open:-rotate-90 transition" size={18} />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-7">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mt-14 px-5 py-8 text-center text-xs text-muted-foreground">
        ساخته شده با ❤️ برای سلامت ایران — تمام حقوق محفوظ است.
      </footer>
    </div>
  );
}

function Section({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-center justify-between px-5 mb-4">
        <h2 className="text-xl font-black">{title}</h2>
        <Link to={href} className="text-sm text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
          مشاهده همه <ChevronLeft size={16} />
        </Link>
      </div>
      {children}
    </section>
  );
}
