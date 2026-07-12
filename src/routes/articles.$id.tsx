import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { articlesRepo } from "@/lib/repository";
import { toFa } from "@/lib/persian";
import { Clock, ChevronRight, Bookmark } from "lucide-react";

const GRADIENTS: Record<string, string> = {
  "gradient-1": "linear-gradient(135deg,#f472b6,#ef4444)",
  "gradient-2": "linear-gradient(135deg,#60a5fa,#a78bfa)",
  "gradient-3": "linear-gradient(135deg,#34d399,#0ea5e9)",
  "gradient-4": "linear-gradient(135deg,#fb7185,#f59e0b)",
  "gradient-5": "linear-gradient(135deg,#22c55e,#14b8a6)",
  "gradient-6": "linear-gradient(135deg,#a855f7,#ec4899)",
};

export const Route = createFileRoute("/articles/$id")({
  component: ArticleDetail,
  head: ({ params }) => {
    const a = articlesRepo.byId(params.id);
    return { meta: [{ title: `${a?.title ?? "مقاله"} | مِدنِوبت` }, { name: "description", content: a?.excerpt ?? "" }] };
  },
});

function ArticleDetail() {
  const { id } = Route.useParams();
  const a = articlesRepo.byId(id);
  if (!a) throw notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <div className="h-64 md:h-80 relative" style={{ background: GRADIENTS[a.cover] ?? GRADIENTS["gradient-2"] }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute inset-0 flex items-end p-6">
          <div>
            <span className="text-xs bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full">{a.category}</span>
            <h1 className="text-2xl md:text-4xl font-black text-white mt-3 max-w-2xl">{a.title}</h1>
          </div>
        </div>
      </div>
      <div className="px-5 py-6">
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Clock size={14} /> {toFa(a.minutes)} دقیقه مطالعه</span>
          <button className="flex items-center gap-1 text-primary font-bold"><Bookmark size={14} /> ذخیره</button>
        </div>
        <p className="text-base leading-8 whitespace-pre-line">{a.content}</p>
        <Link to="/articles" className="mt-8 inline-flex items-center gap-1 text-primary font-bold">
          <ChevronRight size={16} /> بازگشت به مجله سلامت
        </Link>
      </div>
    </article>
  );
}
