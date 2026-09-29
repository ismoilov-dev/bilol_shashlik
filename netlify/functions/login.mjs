// POST /api/login  { password } -> { token }
import { json, checkPassword, signToken } from "../lib/shared.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!process.env.ADMIN_PASSWORD) {
    return json({ error: "Serverda ADMIN_PASSWORD o'rnatilmagan (Netlify > Environment variables)" }, 500);
  }
  let password = "";
  try {
    ({ password } = await req.json());
  } catch {}
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // parolni tez-tez sinab ko'rishni sekinlashtiradi
    return json({ error: "Parol noto'g'ri" }, 401);
  }
  return json({ token: signToken() });
};

export const config = { path: "/api/login" };
