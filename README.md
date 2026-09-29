# Bilol Shashlik — landing page + admin panel

- **Sayt:** `https://<sayt-nomi>.netlify.app/`
- **Admin panel:** `https://<sayt-nomi>.netlify.app/admin`

Keyin `.uz` domen olsangiz: `bilol-shashlik.uz` va `bilol-shashlik.uz/admin`. Kodni o'zgartirish shart emas.

## Tuzilishi

```
public/index.html          -> landing page (menyu, savat, Telegram buyurtma, manzil, footer)
public/admin/index.html    -> admin panel (parol bilan)
netlify/functions/
  data.mjs     GET/PUT /api/data   -> menyu va sozlamalar
  login.mjs    POST    /api/login  -> parol tekshirish, token berish
  upload.mjs   POST    /api/upload -> rasm yuklash
  image.mjs    GET     /img/:key   -> yuklangan rasmni ko'rsatish
netlify/lib/shared.mjs     -> auth, ma'lumotlarni tekshirish, namunaviy menyu
netlify.toml               -> Netlify sozlamalari
```

Ma'lumotlar va rasmlar **Netlify Blobs**'da saqlanadi. Bu Netlify'ning ichki xotirasi: bepul, alohida baza kerak emas.

## 1. Netlify'ga joylash (GitHub orqali)

> ⚠️ Netlify'ning "Drag & drop" usuli bu yerda **ishlamaydi**, chunki admin panel serverless function'larga tayanadi. GitHub orqali ulang.

1. Loyihani GitHub'ga yuklang:
   ```bash
   cd bilol-shashlik
   git init && git add . && git commit -m "Bilol Shashlik sayt"
   git branch -M main
   git remote add origin https://github.com/<username>/bilol-shashlik.git
   git push -u origin main
   ```
2. https://app.netlify.com → **Add new project → Import an existing project → GitHub** → `bilol-shashlik` reponi tanlang.
3. Build sozlamalari `netlify.toml`'dan avtomatik olinadi. Hech narsani o'zgartirmang → **Deploy**.
4. **Admin parolini o'rnating** (eng muhim qadam!):
   **Project configuration → Environment variables → Add a variable**
   - Key: `ADMIN_PASSWORD`
   - Value: kuchli parol (masalan `Bilol-2026!shashlik`)
5. **Deploys → Trigger deploy → Deploy project** (parol ishga tushishi uchun qayta deploy qiling).
6. **Project configuration → Change project name** → `bilol-shashlik`. Shunda manzil `bilol-shashlik.netlify.app` bo'ladi.

Shundan keyin `/admin`'ga kiring, parolni yozing va menyuni to'ldiring.

## 2. Admin panelda nima qilsa bo'ladi

- **Taomlar va narxlar:** narxni ro'yxatning o'zida o'zgartirish, "mavjud/yo'q" tugmasi, yangi taom qo'shish, rasm yuklash, "Mashhur" belgisi, o'chirish.
- **Kategoriyalar:** qo'shish, nomini o'zgartirish, tartibini o'zgartirish, o'chirish.
- **Sozlamalar:** nom, shior, asosiy rasm, telefon raqamlar, Telegram, Instagram, manzil, ish vaqti, Google xarita.

O'zgarishlar **"O'zgarishlarni saqlash"** tugmasi bosilgandagina saytga chiqadi.

## 3. Keyinchalik .uz domenga o'tish

Sayt Netlify'da qoladi, faqat domen ulanadi:

1. Domenni oling (ahost.uz, webname.uz va h.k.).
2. Netlify → **Domain management → Add a domain** → `bilol-shashlik.uz`.
3. Netlify ko'rsatgan DNS yozuvlarini domen sotuvchi paneliga kiriting. Odatda bu `A` yozuvi `75.2.60.5` va `www` uchun `CNAME` `bilol-shashlik.netlify.app`. Aniq qiymatlarni Netlify o'zi ko'rsatadi.
4. SSL (https) avtomatik yoqiladi.

Menyu, rasmlar va admin panel o'z joyida qoladi. `bilol-shashlik.uz/admin` darhol ishlaydi.

## 4. Kompyuterda sinab ko'rish (ixtiyoriy)

```bash
npm install
npm i -g netlify-cli
ADMIN_PASSWORD=test123 netlify dev
# http://localhost:8888  va  http://localhost:8888/admin
```

## Xavfsizlik haqida

- Parol kodda emas, faqat Netlify Environment variables'da turadi.
- Kirishda 12 soatlik imzolangan token beriladi. Token o'tgach, qayta kirish kerak.
- Server kiruvchi ma'lumotlarni tekshiradi va tozalaydi, saytda esa hamma matn xavfsiz (escape qilingan) ko'rinishda chiqariladi.
- Rasm hajmi 4 MB gacha. Admin panel rasmni yuklashdan oldin o'zi kichraytiradi.
