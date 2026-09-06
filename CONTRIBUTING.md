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

## Mengubah tampilan atau isi halaman

Berkas `*.html` di akar repositori **dihasilkan otomatis** oleh
`scripts/build-pages.mjs`. Sunting generatornya, lalu jalankan:

```bash
node scripts/build-pages.mjs
```

dan commit hasilnya. CI akan gagal bila HTML tidak sinkron dengan generator.

Gaya visual berada di `assets/css/style.css`, logika direktori di
`assets/js/app.js`. Portal ini sengaja tanpa kerangka kerja dan tanpa
dependensi npm agar mudah dirawat lintas tahun akademik.

## Menjalankan secara lokal

```bash
python3 -m http.server 8080
# lalu buka http://localhost:8080
```

Berkas JSON dimuat lewat `fetch`, jadi situs harus disajikan melalui server —
membuka `index.html` langsung dari sistem berkas tidak akan memuat data.
