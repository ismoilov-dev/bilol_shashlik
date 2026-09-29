// GET /img/<key>  -> yuklangan rasmni qaytaradi
import { imageStore } from "../lib/shared.mjs";

export default async (req, context) => {
  const key = context.params?.key || "";
  if (!/^[a-z0-9-]+\.(jpg|png|webp|gif)$/i.test(key)) return new Response("Not found", { status: 404 });

  const res = await imageStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!res) return new Response("Not found", { status: 404 });

  return new Response(res.data, {
    headers: {
      "content-type": res.metadata?.type || "application/octet-stream",
      // kalit har safar yangi bo'lgani uchun uzoq keshlash xavfsiz
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/img/:key" };
