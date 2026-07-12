import * as jalaali from "jalaali-js";
import { toFa } from "./persian";

export const FA_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];
export const FA_WEEKDAYS = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
export const FA_WEEKDAYS_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export type JDate = { jy: number; jm: number; jd: number };

export function toJalali(d: Date): JDate {
  return jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}
export function toGregorian(j: JDate): Date {
  const g = jalaali.toGregorian(j.jy, j.jm, j.jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}
export function jMonthLength(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm);
}
export function isValidJDate(j: JDate): boolean {
  return jalaali.isValidJalaaliDate(j.jy, j.jm, j.jd);
}

/** JS weekday to Iranian weekday index (Saturday = 0). */
export function irWeekdayIndex(d: Date): number {
  // JS: Sun=0..Sat=6 → Iranian: Sat=0..Fri=6
  return (d.getDay() + 1) % 7;
}

export function formatJDate(j: JDate, opts: { withWeekday?: boolean } = {}): string {
  const parts = `${toFa(j.jy)}/${toFa(String(j.jm).padStart(2, "0"))}/${toFa(String(j.jd).padStart(2, "0"))}`;
  if (opts.withWeekday) {
    const g = toGregorian(j);
    return `${FA_WEEKDAYS[irWeekdayIndex(g)]} ${toFa(j.jd)} ${FA_MONTHS[j.jm - 1]} ${toFa(j.jy)}`;
  }
  return parts;
}

export function jDateKey(j: JDate): string {
  return `${j.jy}-${String(j.jm).padStart(2, "0")}-${String(j.jd).padStart(2, "0")}`;
}
export function parseJDateKey(k: string): JDate {
  const [jy, jm, jd] = k.split("-").map(Number);
  return { jy, jm, jd };
}

export function todayJ(): JDate {
  return toJalali(new Date());
}

export function addDaysJ(j: JDate, days: number): JDate {
  const g = toGregorian(j);
  g.setDate(g.getDate() + days);
  return toJalali(g);
}

export function compareJ(a: JDate, b: JDate): number {
  if (a.jy !== b.jy) return a.jy - b.jy;
  if (a.jm !== b.jm) return a.jm - b.jm;
  return a.jd - b.jd;
}

export function isPastJ(j: JDate): boolean {
  return compareJ(j, todayJ()) < 0;
}
