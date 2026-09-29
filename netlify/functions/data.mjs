// GET  /api/data  -> saytdagi barcha ma'lumotlar (hamma uchun ochiq)
// PUT  /api/data  -> ma'lumotlarni saqlash (faqat admin)
import { dataStore, json, isAuthed, sanitize, DEFAULT_DATA } from "../lib/shared.mjs";

export default async (req) => {
  const store = dataStore();

  if (req.method === "GET") {
    const data = (await store.get("site", { type: "json" })) || DEFAULT_DATA;
    return json(data, 200, { "cache-control": "no-store" });
  }

  if (req.method === "PUT") {
    if (!isAuthed(req)) return json({ error: "Avtorizatsiya kerak" }, 401);
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ error: "JSON noto'g'ri" }, 400);
    }
    let clean;
    try {
      clean = sanitize(body);
    } catch (e) {
      return json({ error: e.message }, 400);
    }
    await store.setJSON("site", clean);
    return json({ ok: true, data: clean });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: "/api/data" };
