# Panduan Mudah DompetKita (Bahasa Melayu)

## 1. Flow aplikasi

```text
Splash / Halaman Pengenalan (/)
       |
       +-- Belum ada akaun? --> Register (/register) --> Sahkan e-mel jika diminta
       |
       +-- Sudah ada akaun? --> Login (/login)
       |
       +-- Cuba dulu? -------> Mod Demo (data tersimpan dalam browser)
       |
       v
Main Dashboard (/dashboard)
       |
       +-- Duit Masuk (/income) --> Gaji, Elaun, Upah | Pinjaman PTPTN, Lain-lain
       +-- Perbelanjaan (/expenses) --> 8 kategori biasa | 3 bil bulanan
       +-- Simpanan (/savings) --> Cadangan harian/mingguan/bulanan | Tabung matlamat
       +-- Ringkasan (/summary) --> Graf | Status bajet | Eksport CSV
       +-- Kalendar (/calendar) --> Pilih tarikh --> Tambah, edit, padam rekod
       +-- Chatbot (/chat) --> Tips kewangan asas / AI pilihan
       +-- Profil (/profile) --> Nama, gambar, bajet, bahasa, kata laluan
```

**Bottom bar di telefon:** Utama, Duit Masuk, Perbelanjaan, Simpanan, Profil. Ringkasan, Kalendar dan Chatbot ada dalam menu navigasi; Chatbot juga melalui butang terapung.

## 2. Fail penting

| Fail | Fungsi |
| --- | --- |
| `app/page.jsx` | Splash / pengenalan |
| `app/login/page.jsx` & `app/register/page.jsx` | Login / daftar |
| `app/(system)/dashboard/page.jsx` | Halaman utama dan ringkasan |
| `app/(system)/income/page.jsx` | Duit masuk termasuk pinjaman berasingan |
| `app/(system)/expenses/page.jsx` | Kategori perbelanjaan dan bil |
| `app/(system)/savings/page.jsx` | Simpanan dan tabung matlamat |
| `app/(system)/summary/page.jsx` | Laporan dan eksport CSV |
| `app/(system)/calendar/page.jsx` | Kalendar rekod |
| `app/(system)/chat/page.jsx` | DompetBot |
| `app/(system)/profile/page.jsx` | Profil pengguna |
| `components/transaction-modal.jsx` | Borang tambah dan edit transaksi |
| `context/finance-context.jsx` | Sambungan auth, database dan fungsi simpan data |
| `lib/finance.js` | Kategori dan formula pengiraan |
| `database/supabase.sql` | Database + perlindungan data pengguna |
| `app/globals.css` | Reka bentuk dan responsif |
| `.env.example` | Contoh setting sambungan Supabase dan chatbot AI |

## 3. Arahan untuk VS Code

Buka **Terminal** dari VS Code dalam folder `DompetKita`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Pada peringkat ini, **Mod Demo** terus boleh digunakan. Untuk simpan data sebenar di antara peranti, buat projek Supabase, jalankan `database/supabase.sql`, dan isi URL serta public key dalam `.env.local` mengikut `README.md`.

## 4. Cara database menyimpan data

- `profiles`: nama, nama keluarga, bajet, sasaran simpanan, bahasa dan gambar.
- `transactions`: semua rekod duit masuk, perbelanjaan dan simpanan dengan `type`, `category`, `amount`, `occurred_on`, `note`, dan `member`.
- `savings_goals`: nama tabung, jumlah sasaran dan jumlah terkumpul.
- `avatars`: storan gambar profil persendirian.

**Contoh satu transaksi:**

```json
{
  "type": "expense",
  "category": "bill_electricity",
  "amount": 145.35,
  "occurred_on": "2026-11-13",
  "note": "Bil elektrik November",
  "member": "Ayah"
}
```

Setiap rekod transaksi sebenar dikaitkan dengan `user_id` akaun Supabase. Polisi RLS menghalang pengguna membaca atau menukar rekod pengguna lain.

## 5. Perbezaan penting

**Gaji RM3,000 + PTPTN RM500** bukan bermakna pendapatan sebenar RM3,500. Pendapatan sebenar ialah **RM3,000**; pinjaman **RM500** dipaparkan asing. Jika perbelanjaan RM1,000 dan simpanan RM300, maka:

- Baki tanpa pinjaman = RM3,000 − RM1,000 − RM300 = **RM1,700**.
- Aliran tunai termasuk pinjaman = RM3,000 + RM500 − RM1,000 − RM300 = **RM2,200**.

Bil termasuk sekali dalam perbelanjaan bulanan. **Jumlah bil jangan tambah sekali lagi** pada jumlah perbelanjaan.

## 6. Selepas siap coding

1. Cuba Mod Demo dan semak semua kategori.
2. Buat Supabase SQL + `.env.local`.
3. Daftar akaun sebenar dan log masuk.
4. Cuba tambah/edit/padam transaksi serta tukar bahasa.
5. Cuba login akaun sama pada telefon untuk melihat data yang sama.
6. Jika mahu AI, tambah API key OpenAI di `.env.local` (caj API berasingan).
7. Upload ke GitHub dan deploy melalui Vercel mengikut README.
