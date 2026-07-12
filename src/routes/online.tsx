import { createFileRoute } from "@tanstack/react-router";
import { doctorsRepo } from "@/lib/repository";
import { DoctorCard } from "@/components/DoctorCard";
import { Video } from "lucide-react";

export const Route = createFileRoute("/online")({
  component: OnlinePage,
  head: () => ({ meta: [{ title: "مشاوره آنلاین | مِدنِوبت" }, { name: "description", content: "پزشکان متخصصی که مشاوره آنلاین ارائه می‌دهند." }] }),
});

function OnlinePage() {
  const doctors = doctorsRepo.online();
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-2xl gradient-accent flex items-center justify-center text-white shadow-glow">
          <Video />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black">مشاوره آنلاین</h1>
          <p className="text-sm text-muted-foreground">با پزشکان از طریق چت، صوت و تصویر در ارتباط باشید.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((d) => <DoctorCard key={d.id} doctor={d} />)}
      </div>
    </div>
  );
}
