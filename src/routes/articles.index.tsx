import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { articlesRepo } from "@/lib/repository";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/articles/")({
  component: Articles,
  head: () => ({ meta: [{ title: "مجله سلامت | مِدنِوبت" }, { name: "description", content: "مقالات و ویدیوهای پزشکی به قلم متخصصان." }] }),
});

function Articles() {
  const all = articlesRepo.list();
  const cats = ["همه", ...Array.from(new Set(all.map((a) => a.category)))] as (string | Article["category"])[];
  const [cat, setCat] = useState<string>("همه");
  const list = cat === "همه" ? all : all.filter((a) => a.category === cat);
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-2">مجله سلامت</h1>
      <p className="text-sm text-muted-foreground mb-5">جدیدترین مقالات پزشکی و راهنماهای سلامت.</p>
      <div className="flex flex-wrap gap-2 mb-6">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c as string)}
            className={cn("px-4 py-2 rounded-full text-sm font-bold transition",
              cat === c ? "gradient-primary text-primary-foreground shadow-card" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {list.map((a) => <ArticleCard key={a.id} a={a} />)}
      </div>
    </div>
  );
}
