# Integrasi repositori `penama` dengan `AKSARA`

Dua repositori, satu domain, satu kontrak data.

| Repositori | Peran | Teknologi | Sifat |
|---|---|---|---|
| `aguskurnia-unram/AKSARA` | Aplikasi pembelajaran Penama (dosen, mahasiswa, admin) | React + Vite + Cloudflare Worker (`aksara`) + D1/Firestore | Butuh autentikasi |
| `aguskurnia-unram/penama` | Portal informasi publik (kurikulum, dosen, penelitian) | Statis: HTML + CSS + JSON | Terbuka |

## 1. Pembagian domain

Domain `penama.online` dirutekan ke Worker `aksara` (`pai.penama.online`,
`penama.online`, `aksara.penama.online`), jadi repositori ini tidak boleh
memakai domain itu untuk dirinya sendiri.

**Cara yang dipakai sekarang: Worker mem-proxy portal di `penama.online/info/`.**
Rutenya ada di `worker/penamaPortal.ts` (`portalPages`, dipasang di `/info`)
dan membaca berkas repositori ini apa adanya dari branch `main`.

Proxy, bukan salinan — itu titik pentingnya:

- repositori ini tetap satu-satunya sumber kebenaran, tidak ada isi yang digandakan;
- suntingan portal langsung tayang tanpa men-deploy ulang AKSARA;
- tidak ada yang perlu disediakan lebih dulu: tanpa GitHub Pages, tanpa data DNS,
  tanpa paket berbayar.

Pindah tempat cukup dengan mengganti `PENAMA_PORTAL_URL` — GitHub Pages di
subdomain, Cloudflare Pages, atau kembali ke repositori langsung — tanpa
menyentuh kode. Tabel langkahnya ada di README repositori ini.

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

Pengambilan dilakukan di sisi Worker, sehingga portal tidak perlu header CORS
sama sekali.

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
| `GET /info/*` | halaman portal | proxy berkas repositori ini, cache 5 menit |

Sifatnya publik tanpa autentikasi — isinya memang informasi publik. Pengambilan
dilakukan di sisi Worker, bukan di browser, sehingga portal tidak perlu header
CORS sama sekali. Jawaban di-cache satu jam lewat `cf: { cacheTtl }`, dan bila
portal tidak dapat dihubungi rutenya menjawab `503` dengan pesan berbahasa
Indonesia yang bisa langsung ditampilkan di antarmuka — kegagalan portal tidak
pernah menjatuhkan halaman AKSARA.

Alamat portal diatur lewat variabel `PENAMA_PORTAL_URL` di `wrangler.jsonc`
(bawaan `https://raw.githubusercontent.com/aguskurnia-unram/penama/main`); untuk
pengembangan lokal, timpa di `.dev.vars`, misalnya
`PENAMA_PORTAL_URL="http://localhost:8099"` sambil menjalankan
`python3 -m http.server 8099` di repositori ini.
