// POST /api/upload  (body = rasm fayli, Content-Type: image/*) -> { url: "/img/<key>" }
import { imageStore, json, isAuthed } from "../lib/shared.mjs";
import crypto from "node:crypto";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB (Netlify Functions so'rov limiti ~6 MB)
const ALLOWED = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!isAuthed(req)) return json({ error: "Avtorizatsiya kerak" }, 401);

  const type = (req.headers.get("content-type") || "").split(";")[0].trim();
  if (!ALLOWED[type]) return json({ error: "Faqat JPG, PNG, WEBP yoki GIF rasm yuklash mumkin" }, 415);

  const buf = await req.arrayBuffer();
  if (!buf.byteLength) return json({ error: "Fayl bo'sh" }, 400);
  if (buf.byteLength > MAX_BYTES) return json({ error: "Rasm 4 MB dan katta" }, 413);

  const key = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${ALLOWED[type]}`;
  await imageStore().set(key, buf, { metadata: { type } });
  return json({ url: `/img/${key}` });
};

export const config = { path: "/api/upload" };
