/* Menyusun halaman statis dari potongan tata letak bersama.
   Jalankan: node scripts/build-pages.mjs   (menulis ulang berkas *.html di akar) */
import { writeFileSync } from 'node:fs';

const SITUS = 'Penama Online';
const DESK_UNIT = 'Pusat MKWK, LPMPP Universitas Mataram';
// Aplikasi pembelajaran adalah direktori dari situs ini. Alamatnya ditulis
// penuh agar tetap benar walau portal disajikan dari host lain.
const URL_APLIKASI = 'https://penama.online/pai/';

const NAV = [
  ['index.html', 'Beranda'],
  ['kurikulum.html', 'Kurikulum MKWK'],
  ['pembelajaran.html', 'Pembelajaran'],
  ['materi.html', 'Materi Dosen'],
  ['dosen.html', 'Direktori Dosen'],
  ['penelitian.html', 'Penelitian'],
  ['jurnal.html', 'Jurnal'],
  ['tentang.html', 'Tentang'],
];

// Berkas pendukung portal berada di /aset/, bukan /assets/: pada apex
// penama.online, /assets/ adalah milik bundel aplikasi pembelajaran, dan dua
// direktori bernama sama akan saling menutupi.
const kepala = (aktif, judul, deskripsi) => `<!doctype html>
<html lang="id" data-basis=".">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${judul} — ${SITUS}</title>
<meta name="description" content="${deskripsi}">
<meta property="og:title" content="${judul} — ${SITUS}">
<meta property="og:description" content="${deskripsi}">
<meta property="og:type" content="website">
<meta property="og:locale" content="id_ID">
<link rel="canonical" href="https://penama.online/${aktif === 'index.html' ? '' : aktif}">
<link rel="icon" href="./aset/favicon.svg" type="image/svg+xml">\n<link rel="stylesheet" href="./aset/css/style.css">
<script defer src="./aset/js/app.js"></script>
</head>
<body>
<div class="topbar"><div class="wrap">
  <span>${DESK_UNIT}</span>
  <span><a href="https://unram.ac.id" rel="noopener" target="_blank">unram.ac.id</a> · <a href="https://lpmpp.unram.ac.id" rel="noopener" target="_blank">lpmpp.unram.ac.id</a></span>
</div></div>
<header class="situs"><div class="wrap">
  <a class="merek" href="./index.html">
    <span class="logo" aria-hidden="true">PN</span>
    <span><strong>Penama Online</strong><span>Pendidikan Agama Islam · Universitas Mataram</span></span>
  </a>
  <nav class="utama" aria-label="Navigasi utama">
    ${NAV.map(([h, t]) => `<a href="./${h}"${h === aktif ? ' aria-current="page"' : ''}>${t}</a>`).join('\n    ')}
    <a href="${URL_APLIKASI}" class="btn btn-utama" style="padding:8px 14px;font-size:14px">Masuk Aplikasi</a>
  </nav>
</div></header>
<main>`;

const kaki = `</main>
<footer class="situs"><div class="wrap">
  <div class="kaki-grid">
    <div>
      <h4>Penama Online</h4>
      <p>Portal informasi pembelajaran Pendidikan Agama Islam di Universitas Mataram, di bawah Pusat MKWK LPMPP Universitas Mataram.</p>
    </div>
    <div>
      <h4>Jelajahi</h4>
      <ul>${NAV.map(([h, t]) => `<li><a href="./${h}">${t}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h4>Tautan Resmi</h4>
      <ul>
        <li><a href="${URL_APLIKASI}">Aplikasi Pembelajaran PAI</a></li>
        <li><a href="https://unram.ac.id" rel="noopener" target="_blank">Universitas Mataram</a></li>
        <li><a href="https://lpmpp.unram.ac.id" rel="noopener" target="_blank">LPMPP Unram</a></li>
        <li><a href="https://mku.unram.ac.id" rel="noopener" target="_blank">Unit MKU Unram</a></li>
        <li><a href="https://jurnal.unram.ac.id/index.php/sila" rel="noopener" target="_blank">Jurnal SILA</a></li>
      </ul>
    </div>
  </div>
  <div class="kaki-bawah">© <span id="tahun">2026</span> Pusat MKWK LPMPP Universitas Mataram · penama.online — konten informasi, bukan dokumen akademik resmi kecuali dinyatakan lain.</div>
</div></footer>
</body>
</html>
`;

const halaman = {};

halaman['index.html'] = {
  judul: 'Beranda',
  deskripsi: 'Portal informasi pembelajaran Pendidikan Agama Islam Universitas Mataram di bawah Pusat MKWK LPMPP Unram.',
  isi: `
<section class="hero"><div class="wrap">
  <h1>Pembelajaran Pendidikan Agama Islam<br>Universitas Mataram</h1>
  <p>Penama Online adalah portal informasi mata kuliah Pendidikan Agama Islam di Universitas Mataram — kurikulum, praktik pembelajaran, direktori dosen pengampu, dan basis data penelitian — dikelola di bawah Pusat MKWK LPMPP Universitas Mataram.</p>
  <div class="tombol-baris">
    <a class="btn btn-utama" href="./kurikulum.html">Lihat Kurikulum MKWK</a>
    <a class="btn btn-garis" href="./dosen.html">Direktori Dosen</a>
    <a class="btn btn-garis" href="${URL_APLIKASI}">Masuk Aplikasi Pembelajaran</a>
  </div>
</div></section>

<section><div class="wrap">
  <h2>Lima pilar portal</h2>
  <p class="sub">Setiap bagian berdiri di atas berkas data terbuka yang dapat diverifikasi dan dibaca ulang oleh sistem lain, termasuk aplikasi pembelajaran AKSARA/Penama.</p>
  <div class="grid g2">
    <article class="kartu"><h3>Kurikulum MKWK</h3><p>Kedudukan Pendidikan Agama di antara mata kuliah wajib kurikulum dan mata kuliah wajib institusi Universitas Mataram.</p><p style="margin-top:12px"><a href="./kurikulum.html">Telusuri →</a></p></article>
    <article class="kartu"><h3>Praktik Pembelajaran</h3><p>Rancangan pembelajaran, capaian, pendekatan terintegrasi, kolaboratif, dan berbasis proyek untuk kelas Pendidikan Agama Islam.</p><p style="margin-top:12px"><a href="./pembelajaran.html">Telusuri →</a></p></article>
    <article class="kartu"><h3>Direktori Dosen</h3><p>Identitas profesional dosen pengampu Pendidikan Agama Islam beserta bidang kajian dan tautan profil ilmiah publik.</p><p style="margin-top:12px"><a href="./dosen.html">Telusuri →</a></p></article>
    <article class="kartu"><h3>Basis Data Penelitian</h3><p>Publikasi dan kajian tentang pendidikan agama di lingkungan Universitas Mataram, lengkap dengan tautan sumbernya.</p><p style="margin-top:12px"><a href="./penelitian.html">Telusuri →</a></p></article>
    <article class="kartu"><h3>Direktori Jurnal</h3><p>Wadah publikasi yang dikelola Pusat MKWK Unram — SILA dan PANCA — beserta fokus, cakupan, dan cara menempatkan naskah.</p><p style="margin-top:12px"><a href="./jurnal.html">Telusuri →</a></p></article>
  </div>
</div></section>

<section style="background:var(--putih);border-block:1px solid var(--garis)"><div class="wrap">
  <h2>Mata kuliah yang dinaungi Pusat MKWK</h2>
  <p class="sub">Pendidikan Agama adalah satu dari empat mata kuliah wajib kurikulum; Universitas Mataram melengkapinya dengan mata kuliah wajib institusi berciri kepulauan.</p>
  <div class="grid g2" id="daftar-mkwk"></div>
</div></section>
`,
};

halaman['kurikulum.html'] = {
  judul: 'Kurikulum MKWK',
  deskripsi: 'Struktur mata kuliah wajib kurikulum dan wajib institusi Universitas Mataram serta kedudukan Pendidikan Agama Islam.',
  isi: `
<section><div class="wrap">
  <h2>Kurikulum Mata Kuliah Wajib</h2>
  <p class="sub">Mata kuliah wajib kurikulum (MKWK) diselenggarakan mengikuti ketentuan Direktorat Jenderal Pendidikan Tinggi dan dikelola di Universitas Mataram oleh Pusat MKWK di bawah koordinasi LPMPP.</p>
  <h3 style="margin-top:26px">Mata Kuliah Wajib Kurikulum (MKWK)</h3>
  <div class="grid g2" id="daftar-mkwk" style="margin-top:14px"></div>
  <h3 style="margin-top:38px">Mata Kuliah Wajib Institusi (MKWI)</h3>
  <div class="grid g3" id="daftar-mkwi" style="margin-top:14px"></div>
  <div class="catatan" style="margin-top:32px"><strong>Catatan.</strong> Bobot sks, kode resmi, dan sebaran semester mengikuti dokumen kurikulum yang ditetapkan universitas.</div>
</div></section>`,
};

halaman['pembelajaran.html'] = {
  judul: 'Pembelajaran',
  deskripsi: 'Pendekatan, capaian, dan perangkat pembelajaran Pendidikan Agama Islam di Universitas Mataram.',
  isi: `
<section><div class="wrap">
  <h2>Pembelajaran Pendidikan Agama Islam</h2>
  <p class="sub">Pendidikan Agama Islam ditempuh sebagai mata kuliah dasar umum yang mengkaji berbagai persoalan kehidupan dari perspektif ajaran Islam, dengan sasaran penguatan karakter, nalar keilmuan, dan kepekaan sosial mahasiswa.</p>

  <div class="grid g3">
    <article class="kartu"><h3>Terintegrasi</h3><p>Materi keagamaan ditautkan dengan bidang keilmuan program studi mahasiswa, bukan diajarkan terpisah dari konteks keahliannya.</p></article>
    <article class="kartu"><h3>Kolaboratif</h3><p>Kelas berbasis kerja kelompok, diskusi terarah, dan pembelajaran sebaya lintas program studi.</p></article>
    <article class="kartu"><h3>Berbasis Proyek</h3><p>Capaian dibuktikan melalui proyek dan portofolio, bukan semata ujian tulis.</p></article>
  </div>

  <h3 style="margin-top:42px">Perangkat pembelajaran</h3>
  <p class="sub">Dokumen berikut menjadi rujukan penyelenggaraan kelas dan dikelola pada aplikasi pembelajaran Penama/AKSARA.</p>
  <div class="tabel-bungkus">
    <table>
      <thead><tr><th>Perangkat</th><th>Fungsi</th><th>Pengelola</th></tr></thead>
      <tbody>
        <tr><td><strong>RPS</strong> — Rencana Pembelajaran Semester</td><td>Peta capaian, materi, dan penilaian per pertemuan selama satu semester.</td><td>Dosen pengampu, disahkan unit</td></tr>
        <tr><td><strong>RTM</strong> — Rencana Tugas Mahasiswa</td><td>Rincian tugas, luaran, dan rubrik penilaian tiap penugasan.</td><td>Dosen pengampu</td></tr>
        <tr><td><strong>Kontrak Kuliah</strong></td><td>Kesepakatan aturan kelas, kehadiran, dan bobot penilaian antara dosen dan mahasiswa.</td><td>Dosen dan kelas</td></tr>
        <tr><td><strong>Portofolio Mahasiswa</strong></td><td>Bukti capaian belajar berupa proyek, refleksi, dan praktik ibadah.</td><td>Mahasiswa</td></tr>
      </tbody>
    </table>
  </div>

  <h3 style="margin-top:42px">Digitalisasi kelas</h3>
  <p class="sub">Pemanfaatan teknologi dalam pembelajaran PAI di Universitas Mataram telah menjadi objek kajian tersendiri; portal ini menjadi lapisan informasi publiknya, sementara pelaksanaan kelas berjalan pada aplikasi Penama (AKSARA).</p>
  <div class="grid g2">
    <article class="kartu"><h3>Aplikasi Pembelajaran (AKSARA PAI)</h3><p>Direktori <code>penama.online/pai/</code> — ruang kelas digital untuk dosen, mahasiswa, dan admin: dokumen mata kuliah, agenda, portofolio, dan audit kelas.</p></article>
    <article class="kartu"><h3>Portal Penama Online</h3><p>Situs utama di <code>penama.online</code>: kurikulum, direktori dosen, jurnal, dan basis data penelitian yang terbuka untuk ditelusuri siapa pun.</p></article>
  </div>
</div></section>`,
};

halaman['materi.html'] = {
  judul: 'Materi Dosen',
  deskripsi: 'Portal materi pembelajaran mandiri milik dosen pengampu Pendidikan Agama Islam Universitas Mataram.',
  isi: `
<section><div class="wrap">
  <h2>Portal Materi Dosen</h2>
  <p class="sub" id="meta-materi">Memuat data…</p>

  <p class="sub">Selain ruang kelas digital bersama, setiap dosen pengampu dapat memiliki portal materi pembelajaran mandiri — tempat bahan ajar, rekaman, dan penugasan kelasnya sendiri. Portal yang sudah berjalan terdaftar di bawah ini.</p>

  <div class="grid g2" id="materi-tersedia" style="margin-top:26px"></div>

  <h3 style="margin-top:46px">Menunggu pendaftaran</h3>
  <p class="sub">Dosen berikut belum mendaftarkan portal mandiri. Tempatnya sudah tersedia dan tinggal diisi bila kelak dibangun.</p>
  <div id="materi-belum"></div>

</div></section>`,
};

halaman['dosen.html'] = {
  judul: 'Direktori Dosen',
  deskripsi: 'Direktori dosen pengampu Pendidikan Agama Islam Universitas Mataram beserta bidang kajian dan profil ilmiah.',
  isi: `
<section><div class="wrap">
  <h2>Direktori Dosen Pendidikan Agama Islam</h2>
  <p class="sub" id="meta-dosen">Memuat data…</p>

  <div class="alat">
    <input id="cari-dosen" type="search" placeholder="Cari nama, homebase, atau bidang kajian…" aria-label="Cari dosen">
    <select id="filter-verifikasi" aria-label="Saring berdasarkan status verifikasi">
      <option value="semua">Semua status</option>
      <option value="terverifikasi">Terverifikasi</option>
      <option value="menunggu_verifikasi">Menunggu verifikasi</option>
    </select>
  </div>

  <div class="grid g2" id="daftar-dosen"></div>

</div></section>`,
};

halaman['penelitian.html'] = {
  judul: 'Penelitian',
  deskripsi: 'Basis data penelitian pendidikan agama di Universitas Mataram dan wadah publikasi Pusat MKWK.',
  isi: `
<section><div class="wrap">
  <h2>Basis Data Penelitian</h2>
  <p class="sub" id="meta-penelitian">Memuat data…</p>

  <div class="alat">
    <input id="cari-penelitian" type="search" placeholder="Cari judul, penulis, atau topik…" aria-label="Cari penelitian">
    <select id="filter-jenis" aria-label="Saring berdasarkan jenis luaran">
      <option value="semua">Semua jenis</option>
    </select>
  </div>

  <div id="tabel-penelitian"></div>

  <h3 style="margin-top:46px">Hendak menerbitkan naskah?</h3>
  <p class="sub">Jurnal yang dikelola Pusat MKWK Universitas Mataram beserta fokus dan cakupannya kini berdiri sebagai direktori tersendiri.</p>
  <p><a class="btn btn-utama" href="./jurnal.html">Buka Direktori Jurnal →</a></p>

</div></section>`,
};

halaman['jurnal.html'] = {
  judul: 'Direktori Jurnal',
  deskripsi: 'Direktori jurnal publikasi pendidikan agama dan MKWK di Universitas Mataram: SILA dan PANCA.',
  isi: `
<section><div class="wrap">
  <h2>Direktori Jurnal Publikasi</h2>
  <p class="sub" id="meta-jurnal">Memuat data…</p>

  <p class="sub">Pusat MKWK LPMPP Universitas Mataram mengelola dua jurnal yang menjadi muara luaran akademik mata kuliah wajib, termasuk Pendidikan Agama Islam: satu untuk kajian ilmiah, satu untuk pengabdian dan aksi nyata.</p>

  <div class="grid g2" id="daftar-jurnal" style="margin-top:26px"></div>

  <h3 style="margin-top:46px">Memilih wadah yang tepat</h3>
  <div class="tabel-bungkus">
    <table>
      <thead><tr><th>Bentuk luaran</th><th>Jurnal yang sesuai</th></tr></thead>
      <tbody>
        <tr><td>Kajian pembelajaran PAI, analisis kurikulum, pemikiran keagamaan</td><td><strong>SILA</strong></td></tr>
        <tr><td>Penelitian tindakan kelas dan evaluasi capaian MKWK</td><td><strong>SILA</strong></td></tr>
        <tr><td>Program keagamaan berbasis masyarakat, luaran pembelajaran berbasis proyek</td><td><strong>PANCA</strong></td></tr>
        <tr><td>Laporan pengabdian dosen bersama mahasiswa</td><td><strong>PANCA</strong></td></tr>
      </tbody>
    </table>
  </div>

</div></section>`,
};

halaman['tentang.html'] = {
  judul: 'Tentang',
  deskripsi: 'Tentang Penama Online, pengelola, tata kelola data, dan hubungannya dengan aplikasi AKSARA.',
  isi: `
<section><div class="wrap">
  <h2>Tentang Penama Online</h2>
  <p class="sub">Penama Online adalah portal informasi publik untuk pembelajaran Pendidikan Agama Islam di Universitas Mataram, berada di bawah Pusat MKWK Lembaga Penjaminan Mutu dan Pengembangan Pembelajaran (LPMPP) Universitas Mataram.</p>

  <div class="grid g2">
    <article class="kartu"><h3>Pengelola</h3><p>Pusat MKWK, LPMPP Universitas Mataram — unit yang mengoordinasikan penyelenggaraan mata kuliah wajib kurikulum dan wajib institusi di lingkungan universitas.</p></article>
    <article class="kartu"><h3>Cakupan</h3><p>Informasi kurikulum, praktik pembelajaran, direktori dosen, dan basis data penelitian pendidikan agama. Portal ini bukan sistem akademik dan tidak memuat nilai atau data mahasiswa.</p></article>
  </div>

  <h3 style="margin-top:42px">Tata kelola data</h3>
  <div class="tabel-bungkus">
    <table>
      <thead><tr><th>Prinsip</th><th>Penerapan</th></tr></thead>
      <tbody>
        <tr><td>Dapat ditelusuri</td><td>Setiap entri dosen dan penelitian wajib menyertakan tautan sumber publik.</td></tr>
        <tr><td>Ditandai statusnya</td><td>Entri bertanda <em>terverifikasi</em> atau <em>menunggu verifikasi</em>; keduanya dibedakan secara kasatmata.</td></tr>
        <tr><td>Minim data pribadi</td><td>NIP/NIDN, kontak pribadi, dan alamat tidak ditayangkan tanpa persetujuan tertulis.</td></tr>
        <tr><td>Dapat dikoreksi</td><td>Koreksi dan permintaan penghapusan dapat diajukan kepada Pusat MKWK.</td></tr>
      </tbody>
    </table>
  </div>

  <h3 style="margin-top:42px">Portal dan ruang kelas digital</h3>
  <p class="sub">Portal ini menyajikan informasi yang terbuka bagi siapa pun. Ruang kelas digitalnya — tempat dosen dan mahasiswa mengelola dokumen mata kuliah, agenda, dan portofolio — berada di direktori <a href="${URL_APLIKASI}">Aplikasi Pembelajaran</a> dan memerlukan akun. Data mahasiswa tidak pernah masuk ke halaman publik ini.</p>

  <div class="catatan" style="margin-top:26px"><strong>Penyangkalan.</strong> Isi portal bersifat informatif. Dokumen akademik resmi (RPS, kontrak kuliah, transkrip) tetap mengacu pada dokumen yang disahkan Universitas Mataram.</div>
</div></section>`,
};

for (const [berkas, h] of Object.entries(halaman)) {
  writeFileSync(berkas, kepala(berkas, h.judul, h.deskripsi) + h.isi + '\n' + kaki);
  console.log('tulis', berkas);
}
