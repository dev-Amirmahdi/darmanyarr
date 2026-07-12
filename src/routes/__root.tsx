import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BottomNav, TopHeader, useHideChrome } from "@/components/Layout";
import { ensureSeeded } from "@/lib/repository";
import { applyTheme, type Theme } from "@/lib/theme";
import { KEYS, storage } from "@/lib/storage";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-black text-primary">۴۰۴</h1>
        <h2 className="mt-4 text-xl font-bold">صفحه‌ای که دنبالش می‌گردید پیدا نشد</h2>
        <p className="mt-2 text-sm text-muted-foreground">شاید حذف شده یا آدرس آن تغییر کرده است.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-xl gradient-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-card">
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold">این صفحه بارگذاری نشد</h1>
        <p className="mt-2 text-sm text-muted-foreground">مشکلی پیش آمده است. لطفاً دوباره تلاش کنید.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-xl gradient-primary px-4 py-2 text-sm font-bold text-primary-foreground">تلاش دوباره</button>
          <a href="/" className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium">بازگشت به خانه</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "مِدنِوبت - رزرو نوبت پزشک آنلاین" },
      { name: "description", content: "بزرگ‌ترین سامانه رزرو نوبت پزشک و مشاوره آنلاین با بهترین پزشکان کشور" },
      { name: "author", content: "MedNobat" },
      { property: "og:title", content: "مِدنِوبت - رزرو نوبت پزشک آنلاین" },
      { property: "og:description", content: "رزرو نوبت پزشک، مشاوره آنلاین و مجله سلامت در یک اپلیکیشن." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://cdn.fontcdn.ir", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    ensureSeeded();
    const t = storage.get<Theme>(KEYS.theme, "light");
    applyTheme(t);
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  );
}

function AppShell() {
  const hide = useHideChrome();
  return (
    <div className="min-h-screen bg-background">
      {!hide && <TopHeader />}
      <main className={hide ? "" : "pb-20 md:pb-0"}>
        <Outlet />
      </main>
      {!hide && <BottomNav />}
    </div>
  );
}
