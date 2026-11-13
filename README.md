# DompetKita — Pengurusan Kewangan Keluarga

**Aplikasi web responsif (Next.js + Supabase + chatbot AI pilihan).** Antara muka Bahasa Melayu / English; sesuai untuk laptop dan telefon.

## 1. Apa yang ada?

- Splash/landing → Daftar → Log masuk → Dashboard
- Pendapatan: gaji, elaun, upah. **Pinjaman PTPTN dan lain-lain dipaparkan secara berasingan** daripada pendapatan sebenar.
- Belanja: 8 kategori harian + 3 bil (Astro, Air, Elektrik), semua boleh ditambah/diedit/dipadam.
- Simpanan harian/mingguan/bulanan, cadangan mengikut pendapatan dan perbelanjaan, tabung matlamat.
- Graf donat, bar dan trend harian; perbandingan dengan bulan lalu, laporan & eksport CSV.
- Kalendar pilih tarikh dan edit transaksi.
- Chatbot: **mod asas** berfungsi tanpa API; **chatbot AI** memerlukan OPENAI_API_KEY.
- Profil: gambar, nama, nama keluarga, bajet, bahasa, sasaran simpanan, tukar kata laluan.
- Mod demo dengan data contoh tersimpan hanya dalam `localStorage` browser. Tidak memerlukan database.

## 2. Keperluan

- Node.js versi 20.9 atau lebih baharu, npm.
- Akaun [Supabase](https://supabase.com) untuk pendaftaran/login sebenar, database PostgreSQL dan penyimpanan gambar.
- Akaun [OpenAI API](https://platform.openai.com) serta kredit API **jika** mahu chatbot AI (ini perkhidmatan berbayar yang berasingan daripada langganan ChatGPT).

## 3. Jalankan projek

Buka folder projek di VS Code, kemudian Terminal:

```bash
npm install
cp .env.example .env.local
npm run dev
```

**Windows PowerShell:** Gantikan `cp` dengan:

```powershell
Copy-Item .env.example .env.local
```

Buka http://localhost:3000 . Tanpa env pun, klik **Cuba Mod Demo** untuk melihat dan mengubah data contoh pada browser.

## 4. Sediakan database Supabase

1. Buat projek baharu di https://supabase.com/dashboard .
2. Buka **SQL Editor** dalam projek Supabase.
3. Buka fail `database/supabase.sql`, salin semua SQL, jalankan **Run**. Skrip ini mewujudkan `profiles`, `transactions`, `savings_goals`, `avatars` bucket dan semua polisi RLS.
4. Pergi ke **Project Settings → API** (atau **Connect → Project URL / publishable key** mengikut antaramuka). Ambil project URL dan public **anon/publishable** key, **BUKAN** service-role atau secret key.
5. Isi `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_or_publishable_key
```

6. Di Supabase **Authentication → Providers → Email**, aktifkan Email. Jika **Confirm Email** diaktifkan, pengguna perlu klik pautan e-mel selepas daftar. Untuk pembangunan setempat, semak juga **Authentication → URL Configuration**, `Site URL` = `http://localhost:3000` dan tetapkan `Redirect URLs` mengikut domain deploy nanti.
7. **Restart `npm run dev`** selepas ubah `.env.local`.

Setiap pengguna melihat rekod sendiri melalui *Row Level Security* (`auth.uid() = user_id`), bukan sekadar ditapis dalam UI.

## 5. Aktifkan chatbot AI (pilihan)

Tambah dalam `.env.local`:

```env
OPENAI_API_KEY=sk-...your_private_api_key
OPENAI_MODEL=gpt-5.5
```

Restart server. Kunci API **mesti berada pada server** (tiada `NEXT_PUBLIC_`). Chatbot menghantar soalan pengguna serta jumlah agregat untuk bulan dipilih kepada OpenAI API, **tidak menghantar senarai transaksi atau nota individu**. Apabila tiada API key, chatbot menggunakan jawapan panduan asas tanpa API. Dalam Mod Demo, hanya mod asas digunakan.

## 6. Deploy GitHub + Vercel

1. Buat repository baharu di GitHub (jangan upload `.env.local`).
2. Dalam Terminal folder projek:

```bash
git init
git add .
git commit -m "Initial DompetKita app"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

3. Di https://vercel.com → **Add New Project** → Import Git Repository → Deploy.
4. Set **Environment Variables** di Vercel bagi `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` dan pilihan `OPENAI_API_KEY`, `OPENAI_MODEL`.
5. Di Supabase Auth URL Configuration, tambah domain `https://nama-projek.vercel.app` sebagai Site URL / Redirect URL, mengikut keperluan.
6. Redeploy jika pemboleh ubah env ditambah selepas build.

## 7. Cara kira kewangan

- **Pendapatan sebenar** = gaji + elaun + upah (tidak termasuk PTPTN/pinjaman).
- **Pinjaman** = PTPTN + pinjaman lain (kredit tunai, bukan pendapatan).
- **Perbelanjaan** = semua 11 kategori, termasuk Astro, air dan elektrik. Jumlah bil hanya **pecahan** perbelanjaan, **tidak ditambah dua kali**.
- **Simpanan** = wang yang dialihkan kepada tabung, **bukan** perbelanjaan penggunaan.
- **Baki tanpa pinjaman** = pendapatan sebenar − perbelanjaan − simpanan.
- **Aliran tunai termasuk pinjaman** = pendapatan sebenar + pinjaman − perbelanjaan − simpanan.
- **Cadangan simpanan** = `min(pendapatan × % sasaran, max(0, pendapatan − perbelanjaan))`. Harian = cadangan bulanan ÷ 30; mingguan = ÷ 4. Cadangan bergantung pada data bulan dipilih, bukan komitmen wajib.
- **Tabung matlamat** dikemas kini secara manual dan tidak mengubah rekod simpanan bulanan secara automatik (elak kiraan berganda).

## 8. Nota versi pertama

- Versi ini untuk **sebuah akaun keluarga**; medan `Ahli keluarga` membolehkan anda melabel perbelanjaan mengikut individu. Ia **belum** menyokong beberapa akaun berlainan berkongsi data secara serentak.
- Jumlah rekod yang diambil bagi sesebuah akaun dihadkan kepada **2,000 transaksi terkini** untuk prototaip. Tambah pagination/server queries untuk penggunaan jangka panjang.
- Tiada import akaun bank, autopay bil, jadual bayaran balik pinjaman, atau PWA/offline sync pada versi ini.
- Mod demo hanya dalam browser/peranti yang sama; data demo boleh hilang jika browser clear storage.
- Jangan kongsi kata laluan atau nombor bank dalam chatbot. AI mungkin tersilap; semak dahulu sebelum membuat keputusan kewangan.
- Untuk produksi skala besar, tambah kadar had API global (contoh Redis), monitoring, ujian automatik, sistem reset password e-mel dan polisi privasi.

## Struktur projek

```text
app/          Pages, layouts dan API chatbot
components/   Navigasi, borang transaksi, graf dan komponen UI
context/      State auth, rekod dan Supabase CRUD
lib/          Kategori, pengiraan, data demo dan klien Supabase
database/     SQL untuk jadual, RLS dan storage
```

**Nama projek:** DompetKita. **Mata wang:** RM (MYR). **Dwibahasa:** BM / English.
