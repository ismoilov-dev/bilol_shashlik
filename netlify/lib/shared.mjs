// Umumiy yordamchi funksiyalar: ma'lumotlar ombori (Netlify Blobs) va admin autentifikatsiyasi.
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const dataStore = () => getStore({ name: "bilol-site", consistency: "strong" });
export const imageStore = () => getStore({ name: "bilol-images", consistency: "strong" });

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 soat

function secret() {
  const s = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!s) throw new Error("ADMIN_PASSWORD environment variable is not set");
  return s;
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

export function signToken() {
  const payload = b64url(JSON.stringify({ exp: Date.now() + TOKEN_TTL_MS }));
  const sig = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return false;
  const [payload, sig] = token.split(".");
  const expected = b64url(crypto.createHmac("sha256", secret()).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export function checkPassword(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || typeof input !== "string") return false;
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

export function isAuthed(req) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  try {
    return verifyToken(token);
  } catch {
    return false;
  }
}

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });

// Birinchi ishga tushishda ko'rsatiladigan namunaviy ma'lumotlar.
// Admin paneldan saqlanganidan keyin bular ishlatilmaydi.
export const DEFAULT_DATA = {
  settings: {
    name: "Bilol Shashlik",
    tagline: "Olovda pishgan ta'm",
    heroText:
      "Har kuni yangi go'sht, maxsus marinad va ko'mirda sekin pishirilgan shashlik. Oila va do'stlar bilan keling yoki uyingizga buyurtma bering.",
    heroImage: "",
    phones: ["+998 90 000 00 00"],
    telegram: "Bilolshashlik_Bot",
    instagram: "bilol_shashlik1",
    address: "Manzilni admin paneldan kiriting",
    mapEmbed: "",
    hours: "Har kuni 10:00 — 23:00",
    currency: "so'm",
  },
  categories: [
    { id: "shashlik", name: "Shashliklar" },
    { id: "salat", name: "Salatlar" },
    { id: "non", name: "Non va garnir" },
    { id: "ichimlik", name: "Ichimliklar" },
  ],
  items: [
    { id: "i1", name: "Qo'y go'shti shashlik", description: "Yumshoq qo'y go'shti, piyoz bilan", price: 25000, categoryId: "shashlik", image: "", available: true, popular: true },
    { id: "i2", name: "Mol go'shti shashlik", description: "Maxsus marinadda", price: 22000, categoryId: "shashlik", image: "", available: true, popular: false },
    { id: "i3", name: "Jigar shashlik", description: "Dumba bilan", price: 18000, categoryId: "shashlik", image: "", available: true, popular: false },
    { id: "i4", name: "Lula kabob", description: "Qiyma go'shtdan", price: 20000, categoryId: "shashlik", image: "", available: true, popular: true },
    { id: "i5", name: "Achchiq-chuchuk", description: "Pomidor, bodring, piyoz", price: 12000, categoryId: "salat", image: "", available: true, popular: false },
    { id: "i6", name: "Tandir non", description: "Issiq, tandirdan", price: 5000, categoryId: "non", image: "", available: true, popular: false },
    { id: "i7", name: "Ko'k choy", description: "Choynakda", price: 5000, categoryId: "ichimlik", image: "", available: true, popular: false },
  ],
};

// Kiruvchi ma'lumotni tekshirish va tozalash (admin noto'g'ri narsa yuborsa sayt buzilmasin).
const str = (v, max = 500) => (typeof v === "string" ? v.slice(0, max).trim() : "");
const safeUrl = (v) => {
  const s = str(v, 2000);
  if (!s) return "";
  if (s.startsWith("/img/")) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? s : "";
  } catch {
    return "";
  }
};

export function sanitize(input) {
  if (!input || typeof input !== "object") throw new Error("Noto'g'ri ma'lumot");
  const s = input.settings || {};
  const settings = {
    name: str(s.name, 80) || "Bilol Shashlik",
    tagline: str(s.tagline, 160),
    heroText: str(s.heroText, 600),
    heroImage: safeUrl(s.heroImage),
    phones: (Array.isArray(s.phones) ? s.phones : []).map((p) => str(p, 30)).filter(Boolean).slice(0, 5),
    telegram: str(s.telegram, 64).replace(/^@/, "").replace(/^https?:\/\/t\.me\//, ""),
    instagram: str(s.instagram, 64).replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, ""),
    address: str(s.address, 200),
    mapEmbed: safeUrl(s.mapEmbed),
    hours: str(s.hours, 120),
    currency: str(s.currency, 10) || "so'm",
  };
  const categories = (Array.isArray(input.categories) ? input.categories : [])
    .map((c) => ({ id: str(c.id, 40).replace(/[^a-z0-9_-]/gi, "") , name: str(c.name, 60) }))
    .filter((c) => c.id && c.name)
    .slice(0, 30);
  const catIds = new Set(categories.map((c) => c.id));
  const items = (Array.isArray(input.items) ? input.items : [])
    .map((i) => ({
      id: str(i.id, 40).replace(/[^a-z0-9_-]/gi, ""),
      name: str(i.name, 100),
      description: str(i.description, 300),
      price: Math.max(0, Math.round(Number(i.price) || 0)),
      categoryId: catIds.has(i.categoryId) ? i.categoryId : categories[0]?.id || "",
      image: safeUrl(i.image),
      available: i.available !== false,
      popular: !!i.popular,
    }))
    .filter((i) => i.id && i.name)
    .slice(0, 300);
  return { settings, categories, items, updatedAt: new Date().toISOString() };
}
