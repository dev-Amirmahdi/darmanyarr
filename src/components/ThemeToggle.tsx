// import { useState } from "react";
// import { Moon, Sun } from "lucide-react";
// import { useTheme } from "@/lib/theme";
// import { useEffect } from "react";

// export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
//   const { theme, toggle } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;
//   if (variant === "row") {
//     return (
//       <button onClick={toggle} className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-muted hover:bg-muted/70 transition">
//         <span className="flex items-center gap-3 font-medium">
//           {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
//           حالت {theme === "dark" ? "تیره" : "روشن"}
//         </span>
//         <span className="text-xs text-muted-foreground">تغییر</span>
//       </button>
//     );
//   }
//   return (
//     <button aria-label="تغییر تم" onClick={toggle} className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center transition">
//       {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
//     </button>
//   );
// }

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "تغییر به حالت روشن" : "تغییر به حالت تاریک"}
      title={isDark ? "حالت روشن" : "حالت تاریک"}
      className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/70 flex items-center justify-center text-lg transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 cursor-pointer"
    >
      <span className="transition-transform duration-300">
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}