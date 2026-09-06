# Panduan Kontribusi

Terima kasih telah membantu merawat portal Penama Online.

## Menambah atau mengoreksi data

Seluruh isi direktori dosen, penelitian, dan mata kuliah berada di berkas JSON
pada direktori `data/`. Ubah berkasnya, bukan berkas HTML.

1. Buat cabang baru.
2. Sunting `data/dosen.json`, `data/penelitian.json`, atau `data/matakuliah.json`.
3. Jalankan pemeriksaan: `node scripts/validate-data.mjs`
4. Ajukan pull request dengan menyebutkan sumber setiap data baru.

### Aturan yang tidak bisa ditawar

- **Setiap entri wajib bersumber.** Sertakan URL publik yang dapat dibuka siapa
  pun: profil SINTA, Google Scholar, ResearchGate, DOI, laman jurnal, atau
  halaman resmi unit. Entri penelitian tanpa `sumber` akan ditolak CI.
- **Jangan mengarang identitas.** Nama, gelar, jabatan, dan afiliasi harus
  sesuai sumber. Bila belum yakin, isi `status_verifikasi` dengan
  `menunggu_verifikasi` dan jangan menebak kolom yang tidak diketahui.
- **Jangan memuat data pribadi.** NIP, NIDN, NIK, nomor telepon, alamat rumah,
  dan surel pribadi tidak boleh masuk ke repositori. CI menolak angka 18 digit
  pada berkas dosen karena menyerupai NIP.
- **Hormati permintaan penghapusan.** Dosen yang bersangkutan berhak meminta
  entrinya dihapus tanpa perlu memberi alasan.

## Mengimpor banyak dosen sekaligus

Bila daftar dosen disalin dari sumber resmi — [staf.unram.ac.id](https://staf.unram.ac.id),
SINTA, Google Scholar, atau dokumen unit — pakai pengimpor CSV alih-alih
menyunting JSON satu per satu:

```bash
node scripts/tambah-dosen.mjs daftar.csv          # tinjau dulu, tidak menulis apa pun
node scripts/tambah-dosen.mjs daftar.csv --tulis  # simpan ke data/dosen.json
node scripts/validate-data.mjs                    # periksa hasilnya
```

Baris pertama CSV adalah judul kolom; urutannya bebas dan hanya `nama` yang wajib:

| Kolom | Isi |
|---|---|
| `nama` | **wajib**, tanpa gelar |
| `gelar_depan`, `gelar_belakang` | mis. `Dr.` dan `S.Ag., M.Pd.I.` |
| `unit` | bawaan: Pusat MKWK / MKWU, LPMPP Universitas Mataram |
| `mata_kuliah`, `bidang` | beberapa nilai dipisah titik koma |
| `scholar`, `sinta`, `researchgate` | URL profil |
| `sumber` | URL lain, dipisah titik koma |

Nilai bergelar yang memuat koma cukup diapit tanda kutip ganda:
`"Ahmad, S.Ag., M.Pd.I."`.

Pengimpor menolak menambah nama yang sudah ada, membuat `id` stabil dari nama,
dan menandai entri **tanpa satu pun sumber atau URL profil** sebagai
`menunggu_verifikasi` — sehingga nama tanpa rujukan tidak pernah tampil sebagai
data resmi.

## Mendaftarkan portal materi seorang dosen

Setiap dosen dapat memiliki portal materi pembelajaran mandiri. Isi bidang
`portal_materi` miliknya di `data/dosen.json`:

```json
"portal_materi": {
  "nama": "Materi Penama",
  "url": "https://materi.penama.online",
  "keterangan": "Portal materi pembelajaran mandiri untuk kelas Pendidikan Agama Islam"
}
```

Hanya `url` yang wajib. Selama nilainya `null`, kartu dosen menampilkan
keterangan bahwa portalnya belum tersedia, dan namanya muncul pada daftar
"Menunggu pendaftaran" di halaman [Materi Dosen](materi.html) — tempatnya sudah
tersedia, tinggal diisi.

Lewat pengimpor CSV, kolomnya bernama `portal_materi` dan `portal_materi_nama`.

## Mengubah tampilan atau isi halaman

Berkas `*.html` di akar repositori **dihasilkan otomatis** oleh
`scripts/build-pages.mjs`. Sunting generatornya, lalu jalankan:

```bash
node scripts/build-pages.mjs
```

dan commit hasilnya. CI akan gagal bila HTML tidak sinkron dengan generator.

Gaya visual berada di `aset/css/style.css`, logika direktori di
`aset/js/app.js`. Portal ini sengaja tanpa kerangka kerja dan tanpa
dependensi npm agar mudah dirawat lintas tahun akademik.

## Menjalankan secara lokal

```bash
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

Berkas JSON dimuat lewat `fetch`, jadi situs harus disajikan melalui server —
membuka `index.html` langsung dari sistem berkas tidak akan memuat data.
