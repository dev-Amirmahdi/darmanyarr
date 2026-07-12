import { Link } from "@tanstack/react-router";
import { Star, MapPin, Video, Heart } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { toFa, formatToman } from "@/lib/persian";
import { specialtiesRepo, favoritesRepo } from "@/lib/repository";
import type { Doctor } from "@/lib/types";
import { useEffect, useState } from "react";

export function DoctorCard({ doctor }: { doctor: Doctor }) {
  const sp = specialtiesRepo.byId(doctor.specialtyId);
  const [fav, setFav] = useState(false);
  useEffect(() => setFav(favoritesRepo.has(doctor.id)), [doctor.id]);
  return (
    <div className="card-elevated card-elevated-hover p-5 relative">
      <button
        aria-label="افزودن به علاقه‌مندی"
        onClick={(e) => { e.preventDefault(); setFav(favoritesRepo.toggle(doctor.id)); }}
        className="absolute top-4 left-4 h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/70 transition"
      >
        <Heart size={18} className={fav ? "fill-destructive text-destructive" : "text-muted-foreground"} />
      </button>
      <Link to="/doctors/$id" params={{ id: doctor.id }} className="block">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar seed={doctor.avatarSeed} size={64} />
            {doctor.isOnline && (
              <span className="absolute bottom-0 end-0 h-3.5 w-3.5 rounded-full bg-accent border-2 border-card" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{doctor.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{sp?.name}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star size={13} className="fill-warning text-warning" />
                <span className="text-foreground font-semibold">{toFa(doctor.rating.toFixed(1))}</span>
                <span>({toFa(doctor.reviewsCount)})</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} />{doctor.city}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">تعرفه ویزیت</p>
            <p className="text-sm font-bold text-primary">{formatToman(doctor.visitFee)}</p>
          </div>
          <div className="flex items-center gap-2">
            {doctor.supportsOnline && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-secondary/15 text-secondary font-medium">
                <Video size={12} /> آنلاین
              </span>
            )}
            <span className="text-xs px-3 py-1.5 rounded-full gradient-primary text-primary-foreground font-medium">
              رزرو نوبت
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
