import { createFileRoute } from "@tanstack/react-router";
import { TicketPercent } from "lucide-react";

export const Route = createFileRoute("/discounts")({
  component: DiscountsPage,
  head: () => ({
    meta: [{ title: "تخفیف‌ها | مِدنِوبت" }],
  }),
});

function DiscountsPage() {
  const discounts: unknown[] = [];

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <h1 className="text-2xl md:text-3xl font-black mb-6">
        تخفیف‌های من
      </h1>

      {discounts.length === 0 ? (
        <div className="card-elevated py-16 px-6 text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <TicketPercent
              size={32}
              className="text-primary"
            />
          </div>

          <h2 className="mt-5 text-lg font-black">
            هیچ کد تخفیفی ندارید
          </h2>

          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
            در حال حاضر هیچ کد تخفیف فعالی برای حساب کاربری شما وجود ندارد.
            با شرکت در جشنواره‌ها و کمپین‌های مِدنِوبت، کدهای تخفیف در این
            صفحه نمایش داده خواهند شد.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* لیست کدهای تخفیف در آینده */}
        </div>
      )}
    </div>
  );
}