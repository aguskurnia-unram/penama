# Penama Online

Portal informasi publik pembelajaran **Pendidikan Agama Islam Universitas
Mataram**, di bawah **Pusat MKWK, Lembaga Penjaminan Mutu dan Pengembangan
Pembelajaran (LPMPP) Universitas Mataram**. Ditujukan untuk domain
`penama.online` (lihat catatan penempatan domain di bawah).

Situs statis tanpa kerangka kerja dan tanpa dependensi npm: HTML + CSS + JSON,
sehingga bisa dirawat lintas tahun akademik tanpa utang teknis.

## Isi portal

| Halaman | Isi |
|---|---|
| `index.html` | Ringkasan portal dan mata kuliah yang dinaungi Pusat MKWK |
| `kurikulum.html` | Struktur MKWK (Pendidikan Agama, Pancasila, Bahasa Indonesia, Kewarganegaraan) dan MKWI (Literasi Digital Abad 21, Ekosistem Kepulauan, Bahasa Inggris) |
| `pembelajaran.html` | Pendekatan pembelajaran PAI, perangkat (RPS, RTM, kontrak kuliah, portofolio), dan digitalisasi kelas |
| `dosen.html` | Direktori dosen pengampu, dapat dicari dan disaring menurut status verifikasi |
| `penelitian.html` | Basis data penelitian pendidikan agama dan wadah publikasi |
| `tentang.html` | Pengelola, tata kelola data, dan hubungan dengan AKSARA |

## Data terbuka

```
data/dosen.json        direktori dosen        (skema: data/schema/dosen.schema.json)
data/penelitian.json   basis data penelitian  (skema: data/schema/penelitian.schema.json)
data/matakuliah.json   struktur MKWK & MKWI
```

Berkas-berkas ini adalah antarmuka publik repositori dan boleh dikonsumsi
langsung oleh aplikasi lain — lihat [`docs/integrasi-aksara.md`](docs/integrasi-aksara.md).

### Status data saat ini — harap dibaca

Basis data ini **sengaja dimulai kecil dan hanya berisi entri yang bersumber**.
Portal-portal resmi Unram (`mku.unram.ac.id`, `jurnal.unram.ac.id`,
`sinta.kemdikbud.go.id`, Google Scholar) tidak dapat diakses dari lingkungan
tempat repositori ini disusun, sehingga roster dosen tidak dapat dipanen
otomatis. Alih-alih mengisi daftar dengan nama dan NIP karangan, repositori ini
menyediakan **kerangka data + pemeriksaan otomatis**, dan pengisiannya dilakukan
Pusat MKWK dari dokumen resmi unit.

Yang sudah terisi dan terverifikasi:

- 1 entri dosen (Agus Kurnia — MKWK/MKWU Unram, dengan tautan Google Scholar dan ResearchGate);
- 2 entri penelitian dengan tautan sumber;
- 2 wadah publikasi (Jurnal SILA dan PANCA, Universitas Mataram);
- struktur lengkap MKWK dan MKWI.

Cara menambah entri ada di [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Menjalankan secara lokal

```bash
python3 -m http.server 8080   # lalu buka http://localhost:8080
```

Data dimuat lewat `fetch`, jadi situs harus disajikan melalui server HTTP.

## Perawatan

```bash
node scripts/validate-data.mjs   # periksa keutuhan & aturan tata kelola data
node scripts/build-pages.mjs     # bangun ulang berkas *.html dari generator
```

Berkas `*.html` di akar dihasilkan otomatis oleh `scripts/build-pages.mjs` —
sunting generatornya, bukan HTML-nya. CI memverifikasi keduanya tetap sinkron.

## Penerbitan

Portal disajikan oleh Cloudflare Worker `aksara` (repositori AKSARA) di
**<https://penama.online/info/>**. Worker mem-proxy repositori ini alih-alih
menyalin isinya, sehingga:

- tidak perlu GitHub Pages dan tidak perlu data DNS tersendiri;
- **suntingan di sini langsung tayang** setelah di-merge ke `main`, tanpa perlu
  men-deploy ulang AKSARA (cache halaman 5 menit, data JSON 1 jam).

Asal portal ditentukan variabel `PENAMA_PORTAL_URL` di `wrangler.jsonc` milik
AKSARA, bawaannya membaca branch `main` repositori ini lewat
`raw.githubusercontent.com`.

### Memindahkan portal di kemudian hari

Cukup satu variabel, tanpa mengubah kode:

| Tujuan | Langkah |
|---|---|
| GitHub Pages di `info.penama.online` | Aktifkan Settings → Pages → Source: GitHub Actions, jalankan alur **Terbitkan ke GitHub Pages** (kini manual saja), buat CNAME DNS `info` → `aguskurnia-unram.github.io` (proxy mati), lalu set `PENAMA_PORTAL_URL` ke `https://info.penama.online` |
| Cloudflare Pages | Hubungkan repositori ini ke Cloudflare Pages, lalu set `PENAMA_PORTAL_URL` ke alamat `*.pages.dev`-nya |
| Kembali ke repositori langsung | Kosongkan `PENAMA_PORTAL_URL` agar kembali ke bawaan |

Alur **Validasi data & bangun halaman** tetap berjalan pada setiap push dan
pull request, apa pun cara penerbitannya.

## Kaitan dengan AKSARA

`aguskurnia-unram/AKSARA` memuat aplikasi pembelajaran Penama (React + Vite +
Cloudflare Worker) yang butuh autentikasi; repositori ini memuat lapisan
informasi publiknya. Integrasi berjalan satu arah — AKSARA membaca `data/*.json`
milik portal, dan portal tidak pernah membaca basis data AKSARA, sehingga data
mahasiswa tidak pernah masuk ke ranah publik.

## Lisensi

Kode: [MIT](LICENSE). Isi informasi: hak Universitas Mataram, mohon sertakan
atribusi bila digunakan ulang.
