import { cn } from "@/lib/utils";

// Deterministic pastel avatar based on seed string
export function Avatar({ seed, size = 56, className }: { seed: string; size?: number; className?: string }) {
  const initials = seed
    .replace(/[^A-Za-zآ-ی]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0] ?? "")
    .join("");
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const bg = `linear-gradient(135deg, oklch(0.75 0.14 ${h}), oklch(0.62 0.18 ${(h + 40) % 360}))`;
  return (
    <div
      className={cn("flex items-center justify-center rounded-full font-bold text-white shrink-0", className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials || "؟"}
    </div>
  );
}
