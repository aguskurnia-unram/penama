# Integrasi repositori `penama` dengan `AKSARA`

Dua repositori, satu domain, satu kontrak data.

| Repositori | Peran | Teknologi | Sifat |
|---|---|---|---|
| `aguskurnia-unram/AKSARA` | Aplikasi pembelajaran Penama (dosen, mahasiswa, admin) | React + Vite + Cloudflare Worker (`aksara`) + D1/Firestore | Butuh autentikasi |
| `aguskurnia-unram/penama` | Portal informasi publik (kurikulum, dosen, penelitian) | Statis: HTML + CSS + JSON | Terbuka |

## 1. Pembagian domain

Domain `penama.online` saat ini sudah dirutekan ke Worker `aksara`
(`pai.penama.online`, `penama.online`, `aksara.penama.online`). Karena itu
**jangan** menambahkan berkas `CNAME` berisi `penama.online` di repositori ini —
itu akan berbenturan dengan rute Worker yang sudah berjalan.

Tiga pilihan penempatan, dari yang paling ringan:

1. **Subdomain terpisah (disarankan).** Terbitkan portal ke GitHub Pages,
   arahkan `info.penama.online` (atau `mkwk.penama.online`) ke Pages melalui
   CNAME DNS, lalu tambahkan berkas `CNAME` berisi subdomain tersebut.
   Aplikasi tetap utuh di `penama.online`.
2. **Sub-path pada Worker.** Salin keluaran statis repositori ini ke direktori
   aset Worker AKSARA saat proses build, lalu sajikan di `penama.online/info/*`.
   Satu domain, tetapi build AKSARA menjadi bergantung pada repositori ini.
3. **Cloudflare Pages tersendiri** dengan rute khusus, jika di kemudian hari
   portal berkembang menjadi situs dinamis.

## 2. Kontrak data

Direktori `data/` adalah antarmuka publik repositori ini. Berkasnya stabil dan
boleh dikonsumsi langsung oleh AKSARA:

- `data/dosen.json` — direktori dosen, skema di `data/schema/dosen.schema.json`
- `data/penelitian.json` — basis data penelitian dan wadah publikasi
- `data/matakuliah.json` — struktur MKWK dan MKWI

Aturan yang dijamin repositori ini (ditegakkan `scripts/validate-data.mjs` di CI):

- setiap entri punya `id` stabil (huruf kecil, angka, tanda hubung) dan unik;
- setiap entri penelitian punya minimal satu `sumber` berupa URL;
- setiap entri dosen berstatus `terverifikasi` punya minimal satu `sumber`;
- `status_verifikasi` selalu bernilai `terverifikasi` atau `menunggu_verifikasi`;
- tidak ada angka 18 digit (pola NIP) di dalam berkas dosen.

### Contoh konsumsi dari AKSARA

```ts
const BASIS_PENAMA = 'https://info.penama.online';

export async function ambilDosenAgama() {
  const res = await fetch(`${BASIS_PENAMA}/data/dosen.json`, {
    cf: { cacheTtl: 3600, cacheEverything: true },
  });
  if (!res.ok) throw new Error(`Direktori dosen tidak tersedia (${res.status})`);
  const { dosen } = await res.json();
  return dosen.filter((d) => d.status_verifikasi === 'terverifikasi');
}
```

Karena portal statis, tambahkan header CORS pada penyajian jika AKSARA
mengambil data dari browser, atau lakukan pengambilan di sisi Worker (opsi di
atas) sehingga CORS tidak diperlukan sama sekali.

## 3. Arah pengembangan lanjutan

- **Satu arah, bukan dua.** AKSARA membaca data portal; portal tidak pernah
  membaca basis data AKSARA, agar data mahasiswa tidak pernah bocor ke ranah publik.
- **Profil dosen tertaut.** Halaman dosen di AKSARA dapat menautkan `id` dosen
  ke `https://info.penama.online/dosen.html#<id>` sebagai profil publiknya.
- **Luaran penelitian dari kelas.** Karya mahasiswa/dosen yang layak publik dapat
  dipromosikan ke `data/penelitian.json` melalui pengajuan perubahan manual —
  bukan sinkronisasi otomatis, agar verifikasi tetap melekat pada manusia.

## 4. Status integrasi saat ini

Sudah terpasang di sisi AKSARA (`worker/penamaPortal.ts`, dipasang di
`/api/portal`):

| Rute | Isi | Catatan |
|---|---|---|
| `GET /api/portal/dosen` | direktori dosen | hanya entri `terverifikasi`; `?semua=1` menampilkan semuanya |
| `GET /api/portal/penelitian` | penelitian + wadah publikasi | penyaringan sama |
| `GET /api/portal/matakuliah` | struktur MKWK & MKWI | diteruskan apa adanya |

Sifatnya publik tanpa autentikasi — isinya memang informasi publik. Pengambilan
dilakukan di sisi Worker, bukan di browser, sehingga portal tidak perlu header
CORS sama sekali. Jawaban di-cache satu jam lewat `cf: { cacheTtl }`, dan bila
portal tidak dapat dihubungi rutenya menjawab `503` dengan pesan berbahasa
Indonesia yang bisa langsung ditampilkan di antarmuka — kegagalan portal tidak
pernah menjatuhkan halaman AKSARA.

Alamat portal diatur lewat variabel `PENAMA_PORTAL_URL` di `wrangler.jsonc`
(bawaan `https://info.penama.online`); untuk pengembangan lokal, timpa di
`.dev.vars`, misalnya `PENAMA_PORTAL_URL="http://localhost:8099"` sambil
menjalankan `python3 -m http.server 8099` di repositori ini.
