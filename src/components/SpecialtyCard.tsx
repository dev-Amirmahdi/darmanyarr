import { Link } from "@tanstack/react-router";
import type { Specialty } from "@/lib/types";

export function SpecialtyCard({ s }: { s: Specialty }) {
  return (
    <Link
      to="/specialties/$slug"
      params={{ slug: s.slug }}
      className="card-elevated card-elevated-hover p-4 flex flex-col items-center justify-center gap-2 text-center min-h-[110px]"
    >
      <div className={`h-12 w-12 rounded-2xl ${s.color} flex items-center justify-center text-2xl shadow-card`} style={{ fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",system-ui,sans-serif' }}>
        {s.icon}
      </div>
      <span className="text-sm font-semibold">{s.name}</span>
    </Link>
  );
}
