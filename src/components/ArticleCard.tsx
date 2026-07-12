import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { toFa } from "@/lib/persian";
import type { Article } from "@/lib/types";

const GRADIENTS: Record<string, string> = {
  "gradient-1": "linear-gradient(135deg,#f472b6,#ef4444)",
  "gradient-2": "linear-gradient(135deg,#60a5fa,#a78bfa)",
  "gradient-3": "linear-gradient(135deg,#34d399,#0ea5e9)",
  "gradient-4": "linear-gradient(135deg,#fb7185,#f59e0b)",
  "gradient-5": "linear-gradient(135deg,#22c55e,#14b8a6)",
  "gradient-6": "linear-gradient(135deg,#a855f7,#ec4899)",
};

export function ArticleCard({ a }: { a: Article }) {
  return (
    <Link to="/articles/$id" params={{ id: a.id }} className="card-elevated card-elevated-hover overflow-hidden block">
      <div className="h-36 relative" style={{ background: GRADIENTS[a.cover] ?? GRADIENTS["gradient-2"] }}>
        <span className="absolute top-3 end-3 text-xs bg-black/25 text-white px-2 py-1 rounded-full backdrop-blur">
          {a.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm line-clamp-2 mb-2">{a.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{a.excerpt}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} /> {toFa(a.minutes)} دقیقه مطالعه
        </div>
      </div>
    </Link>
  );
}
