/* Impor entri dosen dari berkas CSV ke data/dosen.json.
 *
 * Dipakai ketika daftar dosen disalin dari sumber resmi — staf.unram.ac.id,
 * SINTA, Google Scholar, atau dokumen unit — lalu perlu masuk ke direktori
 * tanpa menyunting JSON satu per satu.
 *
 *   node scripts/tambah-dosen.mjs berkas.csv           # tinjau saja
 *   node scripts/tambah-dosen.mjs berkas.csv --tulis   # tulis perubahan
 *
 * Kolom CSV (baris pertama adalah judul kolom, urutan bebas):
 *
 *   nama            wajib, tanpa gelar
 *   gelar_depan     opsional, mis. Dr.
 *   gelar_belakang  opsional, mis. S.Ag., M.Pd.I.
 *   unit            opsional, bawaan "Pusat MKWK / MKWU, LPMPP Universitas Mataram"
 *   homebase        opsional, fakultas atau program studi asal
 *   foto            opsional, jalur seperti aset/foto/nama.jpg
 *   mata_kuliah     opsional, dipisah titik koma
 *   bidang          opsional, dipisah titik koma
 *   scholar         opsional, URL profil Google Scholar
 *   sinta           opsional, URL profil SINTA
 *   researchgate    opsional, URL profil ResearchGate
 *   sumber          opsional, URL dipisah titik koma
 *   atestasi        opsional, keterangan siapa yang menyatakan nama ini —
 *                   dicatat apa adanya dan TIDAK menggantikan sumber publik
 *
 * Entri masuk sebagai "menunggu_verifikasi" kecuali ada minimal satu sumber
 * atau satu URL profil — persis aturan yang ditegakkan validate-data.mjs,
 * sehingga nama tanpa rujukan tidak pernah tampil sebagai data resmi.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [berkasCsv, ...opsi] = process.argv.slice(2);
const tulis = opsi.includes('--tulis');

if (!berkasCsv) {
  console.error('Pemakaian: node scripts/tambah-dosen.mjs <berkas.csv> [--tulis]');
  process.exit(2);
}

const UNIT_BAWAAN = 'Pusat MKWK / MKWU, LPMPP Universitas Mataram';

/* Pembaca CSV kecil yang menghormati tanda kutip ganda, karena nama bergelar
   kerap memuat koma: "Ahmad, S.Ag., M.Pd.I.". */
function uraikanCsv(teks) {
  const baris = [];
  let sel = '', larik = [], dalamKutip = false;
  for (let i = 0; i < teks.length; i++) {
    const c = teks[i];
    if (dalamKutip) {
      if (c === '"') {
        if (teks[i + 1] === '"') { sel += '"'; i++; } else dalamKutip = false;
      } else sel += c;
      continue;
    }
    if (c === '"') dalamKutip = true;
    else if (c === ',') { larik.push(sel); sel = ''; }
    else if (c === '\n') { larik.push(sel); baris.push(larik); larik = []; sel = ''; }
    else if (c !== '\r') sel += c;
  }
  if (sel !== '' || larik.length) { larik.push(sel); baris.push(larik); }
  return baris.filter((b) => b.some((s) => s.trim() !== ''));
}

const pisah = (v) => (v || '').split(';').map((s) => s.trim()).filter(Boolean);

/* Id stabil dari nama: huruf kecil, tanpa tanda baca, dipisah tanda hubung. */
function buatId(nama, dipakai) {
  const dasar =
    nama
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'dosen';
  let id = dasar, n = 2;
  while (dipakai.has(id)) id = `${dasar}-${n++}`;
  return id;
}

const baris = uraikanCsv(readFileSync(berkasCsv, 'utf8'));
const judul = baris.shift().map((h) => h.trim().toLowerCase());
if (!judul.includes('nama')) {
  console.error('CSV harus memiliki kolom "nama" pada baris pertama.');
  process.exit(1);
}

const data = JSON.parse(readFileSync('data/dosen.json', 'utf8'));
const dipakai = new Set(data.dosen.map((d) => d.id));
const namaAda = new Set(data.dosen.map((d) => d.nama.toLowerCase()));

const baru = [];
const dilewati = [];

for (const b of baris) {
  const kolom = Object.fromEntries(judul.map((h, i) => [h, (b[i] ?? '').trim()]));
  const nama = kolom.nama;
  if (!nama) continue;
  if (namaAda.has(nama.toLowerCase())) { dilewati.push(`${nama} — sudah ada di direktori`); continue; }

  const profil = {
    google_scholar: kolom.scholar || null,
    sinta: kolom.sinta || null,
    researchgate: kolom.researchgate || null,
  };
  const sumber = pisah(kolom.sumber);
  // Sebuah URL profil resmi adalah sumber yang sah dengan sendirinya.
  for (const u of Object.values(profil)) if (u && !sumber.includes(u)) sumber.push(u);

  const id = buatId(nama, dipakai);
  dipakai.add(id);
  namaAda.add(nama.toLowerCase());

  baru.push({
    id,
    nama,
    gelar_depan: kolom.gelar_depan || '',
    gelar_belakang: kolom.gelar_belakang || '',
    status_verifikasi: sumber.length ? 'terverifikasi' : 'menunggu_verifikasi',
    institusi: 'Universitas Mataram',
    unit: kolom.unit || UNIT_BAWAAN,
    homebase: kolom.homebase || null,
    foto: kolom.foto || null,
    mata_kuliah_diampu: pisah(kolom.mata_kuliah).length ? pisah(kolom.mata_kuliah) : ['Pendidikan Agama Islam'],
    bidang_kajian: pisah(kolom.bidang),
    pendidikan: [],
    atestasi: kolom.atestasi || null,
    profil,
    sumber,
  });
}

for (const d of baru) {
  const tanda = d.status_verifikasi === 'terverifikasi' ? '✓' : '·';
  console.log(`${tanda} ${d.id.padEnd(24)} ${d.nama}${d.sumber.length ? '' : '  (tanpa sumber → menunggu verifikasi)'}`);
}
for (const s of dilewati) console.log(`- dilewati: ${s}`);

if (!baru.length) {
  console.log('\nTidak ada entri baru.');
  process.exit(0);
}

if (!tulis) {
  console.log(`\n${baru.length} entri siap ditambahkan. Jalankan ulang dengan --tulis untuk menyimpan.`);
  process.exit(0);
}

data.dosen.push(...baru);
data.meta.terakhir_diperbarui = new Date().toISOString().slice(0, 10);
writeFileSync('data/dosen.json', JSON.stringify(data, null, 2) + '\n');
console.log(`\n${baru.length} entri ditulis ke data/dosen.json.`);
console.log('Selanjutnya: node scripts/validate-data.mjs');
