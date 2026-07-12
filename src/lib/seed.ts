import type { Article, Clinic, Doctor, Review, Specialty, WorkHours } from "./types";

export const SPECIALTIES_SEED: Specialty[] = [
  { id: "sp-general", slug: "general", name: "پزشک عمومی", icon: "🩺", color: "bg-blue-500" },
  { id: "sp-cardio", slug: "cardio", name: "قلب و عروق", icon: "❤️", color: "bg-rose-500" },
  { id: "sp-neuro", slug: "neuro", name: "مغز و اعصاب", icon: "🧠", color: "bg-violet-500" },
  { id: "sp-ortho", slug: "ortho", name: "ارتوپدی", icon: "🦴", color: "bg-amber-500" },
  { id: "sp-skin", slug: "skin", name: "پوست و مو", icon: "🧴", color: "bg-pink-500" },
  { id: "sp-women", slug: "women", name: "زنان و زایمان", icon: "🌸", color: "bg-fuchsia-500" },
  { id: "sp-child", slug: "child", name: "اطفال", icon: "🧒", color: "bg-cyan-500" },
  { id: "sp-dent", slug: "dent", name: "دندانپزشکی", icon: "🦷", color: "bg-sky-500" },
  { id: "sp-psy", slug: "psy", name: "روانشناسی", icon: "🧘", color: "bg-teal-500" },
  { id: "sp-internal", slug: "internal", name: "داخلی", icon: "💊", color: "bg-emerald-500" },
  { id: "sp-ent", slug: "ent", name: "گوش و حلق و بینی", icon: "👂", color: "bg-orange-500" },
  { id: "sp-eye", slug: "eye", name: "چشم پزشکی", icon: "👁️", color: "bg-indigo-500" },
  { id: "sp-uro", slug: "uro", name: "اورولوژی", icon: "🩻", color: "bg-lime-600" },
  { id: "sp-gastro", slug: "gastro", name: "گوارش", icon: "🫀", color: "bg-red-500" },
  { id: "sp-endo", slug: "endo", name: "غدد و متابولیسم", icon: "🧪", color: "bg-purple-500" },
];

const CITIES = ["تهران", "اصفهان", "شیراز", "مشهد", "تبریز", "کرج", "قم", "اهواز", "رشت", "یزد"];

const F_FIRST = ["مریم", "زهرا", "فاطمه", "سارا", "نگین", "الهه", "پریسا", "نیلوفر", "شیوا", "لیلا"];
const M_FIRST = ["علی", "رضا", "محمد", "امیر", "حسین", "سعید", "بهرام", "کاوه", "پیمان", "آرش"];
const LAST = ["احمدی", "محمدی", "کریمی", "رضایی", "حسینی", "موسوی", "قاسمی", "علوی", "نوری", "صادقی", "طاهری", "بهرامی"];

function pick<T>(arr: T[], i: number): T { return arr[i % arr.length]; }

function makeWorkHours(seed: number): WorkHours {
  const wh: WorkHours = {};
  for (let d = 0; d < 7; d++) {
    // Friday (6) mostly off; Thursday half day
    if (d === 6) { wh[d] = null; continue; }
    if (d === 5) { wh[d] = { start: "09:00", end: "13:00" }; continue; }
    const morningOnly = (seed + d) % 4 === 0;
    wh[d] = morningOnly ? { start: "09:00", end: "13:00" } : { start: "09:00", end: "18:00" };
  }
  return wh;
}

export function buildClinics(): Clinic[] {
  const list: Clinic[] = [];
  for (let i = 0; i < 24; i++) {
    list.push({
      id: `cl-${i + 1}`,
      name: `کلینیک ${["مهر", "پارس", "نوین", "امید", "سلامت", "شفا", "آرمان", "زندگی"][i % 8]} ${i + 1}`,
      city: pick(CITIES, i),
      address: `خیابان ولیعصر، پلاک ${100 + i}`,
      phone: `021-${(22000000 + i * 137).toString().slice(0, 8)}`,
      rating: 3.8 + ((i % 12) / 10),
    });
  }
  return list;
}

export function buildDoctors(specialties: Specialty[], clinics: Clinic[]): Doctor[] {
  const doctors: Doctor[] = [];
  const count = 60;
  for (let i = 0; i < count; i++) {
    const gender: "male" | "female" = i % 2 === 0 ? "male" : "female";
    const first = gender === "male" ? pick(M_FIRST, i) : pick(F_FIRST, i);
    const last = pick(LAST, i * 3 + 1);
    const sp = pick(specialties, i);
    const cl = pick(clinics, i);
    const supportsOnline = i % 3 !== 0;
    doctors.push({
      id: `dr-${i + 1}`,
      name: `دکتر ${first} ${last}`,
      gender,
      specialtyId: sp.id,
      clinicId: cl.id,
      city: cl.city,
      bio: `بیش از ${5 + (i % 20)} سال تجربه در زمینه ${sp.name}. متخصص در تشخیص و درمان بیماری‌های تخصصی، همراه با رویکردی مدرن و بیمار محور.`,
      education: ["دکترای پزشکی، دانشگاه علوم پزشکی تهران", `فوق تخصص ${sp.name}، دانشگاه شهید بهشتی`],
      certificates: ["عضو نظام پزشکی", "گواهی بورد تخصصی"],
      experienceYears: 5 + (i % 20),
      rating: Number((3.6 + ((i * 7) % 15) / 10).toFixed(1)),
      reviewsCount: 12 + ((i * 13) % 220),
      visitFee: 200000 + ((i % 8) * 50000),
      onlineFee: 150000 + ((i % 6) * 30000),
      supportsOnline,
      isOnline: supportsOnline && i % 4 === 0,
      avatarSeed: `${first}-${last}-${i}`,
      workHours: makeWorkHours(i),
      slotMinutes: [15, 20, 30][i % 3],
      address: cl.address,
    });
  }
  return doctors;
}

export function buildReviews(doctors: Doctor[]): Review[] {
  const templates = [
    "پزشک بسیار دقیق و صبور بودند، کاملاً راضی هستم.",
    "برخوردشون خیلی خوب بود و توضیحات کاملی دادن.",
    "نوبت‌دهی منظم بود و معطل نشدم.",
    "درمانشون خیلی به من کمک کرد.",
    "تشخیصشون کاملاً درست بود، ممنون.",
  ];
  const names = ["کاربر مهمان", "بیمار راضی", "ح. محمدی", "س. رضایی", "ز. کریمی", "م. احمدی"];
  const reviews: Review[] = [];
  doctors.forEach((d, idx) => {
    const count = 3 + (idx % 5);
    for (let i = 0; i < count; i++) {
      reviews.push({
        id: `rv-${d.id}-${i}`,
        doctorId: d.id,
        author: pick(names, i + idx),
        rating: 3 + ((idx + i) % 3),
        comment: pick(templates, i + idx),
        date: new Date(Date.now() - (i + idx) * 86400000).toISOString(),
      });
    }
  });
  return reviews;
}

export const ARTICLES_SEED: Article[] = [
  {
    id: "art-1",
    title: "۱۰ عادت غذایی برای یک قلب سالم",
    category: "تغذیه",
    excerpt: "با رعایت این عادت‌های ساده روزانه، از قلب خود بهتر مراقبت کنید.",
    content: "قلب مهم‌ترین عضو بدن ماست و تغذیه سالم نقش کلیدی در حفظ سلامت آن دارد...\n\n- مصرف سبزیجات و میوه‌ها\n- کاهش نمک\n- ورزش منظم\n- خواب کافی\n- کنترل استرس",
    cover: "gradient-1",
    minutes: 5,
    date: "2025-06-14",
  },
  {
    id: "art-2",
    title: "چگونه با اضطراب روزمره کنار بیاییم؟",
    category: "سلامت روان",
    excerpt: "راهکارهای عملی و اثبات‌شده برای مدیریت اضطراب در زندگی روزمره.",
    content: "اضطراب پاسخ طبیعی بدن به شرایط پرتنش است، اما وقتی بیش از حد شود، بر کیفیت زندگی اثر می‌گذارد...",
    cover: "gradient-2",
    minutes: 7,
    date: "2025-06-20",
  },
  {
    id: "art-3",
    title: "علائم اولیه دیابت که نباید نادیده گرفت",
    category: "بیماری‌ها",
    excerpt: "شناسایی زودهنگام دیابت می‌تواند از عوارض جدی جلوگیری کند.",
    content: "دیابت یکی از شایع‌ترین بیماری‌های مزمن است...",
    cover: "gradient-3",
    minutes: 6,
    date: "2025-06-22",
  },
  {
    id: "art-4",
    title: "مراقبت‌های ماه اول بارداری",
    category: "بارداری",
    excerpt: "همه چیز درباره اولین ماه بارداری و مراقبت‌های ضروری.",
    content: "ماه اول بارداری مرحله‌ای حساس است...",
    cover: "gradient-4",
    minutes: 8,
    date: "2025-06-25",
  },
  {
    id: "art-5",
    title: "بهترین ورزش‌ها برای کمر درد",
    category: "ورزش",
    excerpt: "با این حرکات ساده کمردرد خود را کاهش دهید.",
    content: "کمر درد یکی از شایع‌ترین مشکلات...",
    cover: "gradient-5",
    minutes: 5,
    date: "2025-06-28",
  },
  {
    id: "art-6",
    title: "تغذیه صحیح کودکان زیر ۵ سال",
    category: "کودکان",
    excerpt: "راهنمای کامل تغذیه سالم برای کودکان خردسال.",
    content: "سال‌های اولیه زندگی برای رشد بسیار حیاتی است...",
    cover: "gradient-6",
    minutes: 6,
    date: "2025-07-01",
  },
  {
    id: "art-7",
    title: "خواب باکیفیت و اثر آن بر سلامت",
    category: "سلامت روان",
    excerpt: "چرا خواب کافی به اندازه تغذیه سالم مهم است؟",
    content: "خواب فرآیندی است که در آن بدن و ذهن بازسازی می‌شوند...",
    cover: "gradient-2",
    minutes: 4,
    date: "2025-07-04",
  },
  {
    id: "art-8",
    title: "پیشگیری از سرماخوردگی در فصل سرد",
    category: "بیماری‌ها",
    excerpt: "چند نکته ساده برای تقویت سیستم ایمنی.",
    content: "با رعایت این نکات ساده...",
    cover: "gradient-3",
    minutes: 4,
    date: "2025-07-06",
  },
];
