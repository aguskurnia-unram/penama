/* Pemeriksaan data Penama Online — tanpa dependensi eksternal.
   Menegakkan aturan tata kelola: setiap entri wajib bersumber dan berstatus jelas. */
import { readFileSync } from 'node:fs';

let galat = 0;
const salah = (m) => { console.error('✗ ' + m); galat++; };
const benar = (m) => console.log('✓ ' + m);

const baca = (p) => JSON.parse(readFileSync(p, 'utf8'));
const urlSah = (u) => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch { return false; } };
const STATUS = ['terverifikasi', 'menunggu_verifikasi'];
const JENIS = ['artikel', 'prosiding', 'buku', 'bab-buku', 'laporan', 'pengabdian', 'hki'];

/* --- dosen.json --- */
const dosen = baca('data/dosen.json');
if (!dosen.meta?.terakhir_diperbarui) salah('dosen.json: meta.terakhir_diperbarui wajib diisi');
const idDosen = new Set();
for (const d of dosen.dosen) {
  const label = d.id || d.nama || '(tanpa id)';
  if (!/^[a-z0-9-]+$/.test(d.id || '')) salah(`dosen ${label}: id harus huruf kecil, angka, dan tanda hubung`);
  if (idDosen.has(d.id)) salah(`dosen ${label}: id ganda`);
  idDosen.add(d.id);
  if (!d.nama || d.nama.length < 2) salah(`dosen ${label}: nama wajib diisi`);
  if (!STATUS.includes(d.status_verifikasi)) salah(`dosen ${label}: status_verifikasi harus salah satu dari ${STATUS.join(', ')}`);
  if (!d.institusi) salah(`dosen ${label}: institusi wajib diisi`);
  if (!d.unit) salah(`dosen ${label}: unit wajib diisi`);
  if (d.status_verifikasi === 'terverifikasi' && !(d.sumber?.length)) salah(`dosen ${label}: entri terverifikasi wajib punya minimal satu sumber`);
  for (const s of d.sumber || []) if (!urlSah(s)) salah(`dosen ${label}: sumber bukan URL sah — ${s}`);
  for (const [k, v] of Object.entries(d.profil || {})) if (v && !urlSah(v)) salah(`dosen ${label}: profil.${k} bukan URL sah`);
  if (/\b\d{18}\b/.test(JSON.stringify(d))) salah(`dosen ${label}: terdeteksi angka 18 digit yang menyerupai NIP — data pribadi tidak boleh ditayangkan`);
}
benar(`dosen.json: ${dosen.dosen.length} entri diperiksa`);

/* --- penelitian.json --- */
const riset = baca('data/penelitian.json');
if (!riset.meta?.terakhir_diperbarui) salah('penelitian.json: meta.terakhir_diperbarui wajib diisi');
const idRiset = new Set();
for (const p of riset.penelitian) {
  const label = p.id || p.judul || '(tanpa id)';
  if (!/^[a-z0-9-]+$/.test(p.id || '')) salah(`penelitian ${label}: id harus huruf kecil, angka, dan tanda hubung`);
  if (idRiset.has(p.id)) salah(`penelitian ${label}: id ganda`);
  idRiset.add(p.id);
  if (!p.judul || p.judul.length < 5) salah(`penelitian ${label}: judul wajib diisi`);
  if (!Array.isArray(p.penulis) || !p.penulis.length) salah(`penelitian ${label}: penulis wajib diisi minimal satu`);
  if (!JENIS.includes(p.jenis)) salah(`penelitian ${label}: jenis harus salah satu dari ${JENIS.join(', ')}`);
  if (!STATUS.includes(p.status_verifikasi)) salah(`penelitian ${label}: status_verifikasi tidak sah`);
  if (!(p.sumber?.length)) salah(`penelitian ${label}: setiap entri wajib punya minimal satu sumber`);
  for (const s of p.sumber || []) if (!urlSah(s)) salah(`penelitian ${label}: sumber bukan URL sah — ${s}`);
  if (p.tahun !== null && !Number.isInteger(p.tahun)) salah(`penelitian ${label}: tahun harus bilangan bulat atau null`);
}
for (const w of riset.wadah_publikasi || []) {
  if (!w.nama) salah('wadah_publikasi: nama wajib diisi');
  if (w.url && !urlSah(w.url)) salah(`wadah_publikasi ${w.nama}: url tidak sah`);
}
benar(`penelitian.json: ${riset.penelitian.length} entri + ${(riset.wadah_publikasi || []).length} wadah publikasi diperiksa`);

/* --- matakuliah.json --- */
const mk = baca('data/matakuliah.json');
for (const m of [...(mk.mkwk || []), ...(mk.mkwi || [])]) {
  if (!m.kode || !m.nama || !m.deskripsi) salah(`matakuliah ${m.nama || m.kode}: kode, nama, dan deskripsi wajib diisi`);
}
benar(`matakuliah.json: ${(mk.mkwk || []).length} MKWK + ${(mk.mkwi || []).length} MKWI diperiksa`);

if (galat) { console.error(`\n${galat} masalah ditemukan.`); process.exit(1); }
console.log('\nSemua berkas data lolos pemeriksaan.');
