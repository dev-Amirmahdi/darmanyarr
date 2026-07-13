import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authRepo, walletRepo } from "@/lib/repository";
import type { AppUser, WalletTransaction } from "@/lib/types";
import { formatToman, toFa } from "@/lib/persian";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function WalletPage() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = authRepo.currentUser();

    setUser(current);

    if (!current) return;

    setTransactions(walletRepo.byUser(current.email));
    setBalance(walletRepo.balance(current.email));
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-16 text-center">
        <Wallet className="mx-auto mb-4 text-muted-foreground" size={52} />

        <h1 className="text-2xl font-black mb-2">
          کیف پول
        </h1>

        <p className="text-muted-foreground mb-6">
          برای مشاهده کیف پول ابتدا وارد حساب خود شوید.
        </p>

        <Link
          to="/auth"
          className="inline-block gradient-primary text-primary-foreground px-6 py-3 rounded-xl font-bold shadow-card"
        >
          ورود / ثبت نام
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8">

      <h1 className="text-2xl md:text-3xl font-black mb-6">
        کیف پول
      </h1>

      <div className="card-elevated p-6">

        <div className="text-muted-foreground text-sm">
          موجودی کیف پول
        </div>

        <div className="text-3xl font-black text-primary mt-2">
          {formatToman(balance)}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-6 gradient-primary text-primary-foreground rounded-xl px-5 py-3 font-bold flex items-center gap-2"
        >
          <Plus size={18} />

          افزایش اعتبار
        </button>

      </div>

      <div className="mt-8">

        <h2 className="font-black text-lg mb-4">
          تراکنش‌ها
        </h2>

        {transactions.length === 0 ? (

          <div className="card-elevated py-12 text-center">

            <Wallet
              size={42}
              className="mx-auto text-muted-foreground"
            />

            <p className="mt-4 text-muted-foreground">
              هنوز تراکنشی ثبت نشده است.
            </p>

          </div>

        ) : (

          <div className="space-y-3">

            {transactions.map((item) => {

              const deposit =
                item.type === "deposit";

              const refund =
                item.type === "refund";

              return (

                <div
                  key={item.id}
                  className="card-elevated p-4 flex items-center gap-4"
                >

                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      deposit
                        ? "bg-green-500/15 text-green-600"
                        : refund
                        ? "bg-blue-500/15 text-blue-600"
                        : "bg-red-500/15 text-red-600"
                    }`}
                  >

                    {deposit ? (
                      <ArrowDownLeft size={20} />
                    ) : refund ? (
                      <RotateCcw size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}

                  </div>

                  <div className="flex-1">

                    <div className="font-bold">
                      {item.title}
                    </div>

                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(item.createdAt).toLocaleDateString("fa-IR")}
                    </div>

                  </div>

                  <div
                    className={`font-black ${
                      deposit
                        ? "text-green-600"
                        : refund
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {deposit || refund ? "+" : "-"}
                    {toFa(formatToman(item.amount))}
                  </div>

                </div>

              );
            })}

          </div>

        )}

      </div>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >

        <AlertDialogContent
          dir="rtl"
          className="max-w-sm rounded-2xl"
        >

          <AlertDialogHeader className="text-right">

            <AlertDialogTitle>
              افزایش اعتبار
            </AlertDialogTitle>

            <AlertDialogDescription>
              این قابلیت در نسخه‌های آینده مِدنِوبت پیاده‌سازی خواهد شد.
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogAction className="rounded-xl gradient-primary text-primary-foreground">
              متوجه شدم
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>

    </div>
  );
}

export const Route = createFileRoute("/wallet")({
  component: WalletPage,
  head: () => ({
    meta: [{ title: "کیف پول | مِدنِوبت" }],
  }),
});
