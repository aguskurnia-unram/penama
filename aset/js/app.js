/* Penama Online — pemuat data direktori (tanpa dependensi eksternal) */

const BASIS = document.documentElement.dataset.basis || '.';

async function muat(nama) {
  const res = await fetch(`${BASIS}/data/${nama}.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Gagal memuat ${nama}.json (${res.status})`);
  return res.json();
}

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const lencana = (status) =>
  status === 'terverifikasi'
    ? '<span class="badge badge-ok">terverifikasi</span>'
    : '<span class="badge badge-tunggu">menunggu verifikasi</span>';

// Blok portal materi pada kartu dosen. Slot ini selalu ada, terisi maupun
// belum: dosen yang belum punya portal mandiri tetap memperlihatkan bahwa
// tempatnya tersedia, bukan seolah fiturnya tidak berlaku baginya.
const blokMateri = (d) =>
  d.portal_materi
    ? `<p style="margin-top:14px">
         <a class="btn btn-utama" style="padding:8px 14px;font-size:14px"
            href="${esc(d.portal_materi.url)}" target="_blank" rel="noopener noreferrer"
            >${esc(d.portal_materi.nama || 'Portal Materi')} →</a>
         ${d.portal_materi.keterangan ? `<br><span style="font-size:13.5px;color:var(--abu)">${esc(d.portal_materi.keterangan)}</span>` : ''}
       </p>`
    : `<p style="margin-top:14px;font-size:13.5px;color:var(--abu)">Portal materi mandiri belum tersedia.</p>`;

// Inisial dipakai sebagai avatar selama belum ada foto, sehingga kartu tetap
// seragam tanpa memuat gambar orang tanpa izin.
const inisial = (nama) =>
  nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((k) => k[0].toUpperCase())
    .join('');

// Gelar depan menempel dengan spasi, gelar belakang dipisah koma sesuai
// kelaziman penulisan nama akademik Indonesia: Dr. Lenny Herlina, M.Pd.I.
const namaLengkap = (d) => {
  const depan = [d.gelar_depan, d.nama].filter(Boolean).join(' ');
  return d.gelar_belakang ? `${depan}, ${d.gelar_belakang}` : depan;
};

/* ---------- Halaman dosen ---------- */
async function renderDosen() {
  const host = document.getElementById('daftar-dosen');
  if (!host) return;
  const cari = document.getElementById('cari-dosen');
  const filter = document.getElementById('filter-verifikasi');

  let data;
  try {
    data = await muat('dosen');
  } catch (e) {
    host.innerHTML = `<div class="kosong">${esc(e.message)}</div>`;
    return;
  }

  const info = document.getElementById('meta-dosen');
  if (info) info.textContent = `Terakhir diperbarui ${data.meta.terakhir_diperbarui} · dikelola ${data.meta.pengelola}`;

  const gambar = () => {
    const q = (cari?.value || '').toLowerCase().trim();
    const v = filter?.value || 'semua';
    const baris = data.dosen.filter((d) => {
      const cocokTeks =
        !q ||
        [namaLengkap(d), d.unit, ...(d.bidang_kajian || []), ...(d.mata_kuliah_diampu || [])]
          .join(' ')
          .toLowerCase()
          .includes(q);
      const cocokStatus = v === 'semua' || d.status_verifikasi === v;
      return cocokTeks && cocokStatus;
    });

    if (!baris.length) {
      host.innerHTML = '<div class="kosong">Tidak ada dosen yang cocok dengan penyaring saat ini.</div>';
      return;
    }

    host.innerHTML = baris
      .map((d) => {
        const tautan = Object.entries(d.profil || {})
          .filter(([, url]) => url)
          .map(([k, url]) => `<a href="${esc(url)}" rel="noopener noreferrer" target="_blank">${esc(k.replace(/_/g, ' '))}</a>`)
          .join(' · ');
        const pend = (d.pendidikan || [])
          .map((p) => `${esc(p.jenjang)} — ${esc(p.program)}, ${esc(p.institusi)}`)
          .join('<br>');
        const rupa = d.foto
          ? `<img class="rupa" src="${esc(d.foto)}" alt="" loading="lazy" width="56" height="56">`
          : `<span class="rupa rupa-inisial" aria-hidden="true">${esc(inisial(d.nama))}</span>`;
        return `<article class="kartu">
          <div style="display:flex;gap:14px;align-items:flex-start">
            ${rupa}
            <div style="flex:1;min-width:0">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
                <h3 style="margin:0">${esc(namaLengkap(d))}</h3>${lencana(d.status_verifikasi)}
              </div>
              <p style="margin:6px 0 0">${esc(d.unit)}<br>${esc(d.institusi)}</p>
            </div>
          </div>
          ${d.homebase ? `<p style="margin-top:10px"><strong>Homebase:</strong> ${esc(d.homebase)}</p>` : ''}
          ${d.mata_kuliah_diampu?.length ? `<p style="margin-top:10px"><strong>Mata kuliah:</strong> ${esc(d.mata_kuliah_diampu.join(', '))}</p>` : ''}
          ${pend ? `<p style="margin-top:10px"><strong>Pendidikan:</strong><br>${pend}</p>` : ''}
          ${d.atestasi ? `<p style="margin-top:10px;font-size:14px;color:var(--abu)"><strong>Asal keterangan:</strong> ${esc(d.atestasi)}</p>` : ''}
          <div style="margin-top:10px">${(d.bidang_kajian || []).map((b) => `<span class="tag">${esc(b)}</span>`).join('')}</div>
          ${tautan ? `<p style="margin-top:12px;font-size:14px">${tautan}</p>` : ''}
          ${blokMateri(d)}
        </article>`;
      })
      .join('');
  };

  cari?.addEventListener('input', gambar);
  filter?.addEventListener('change', gambar);
  gambar();
}

/* ---------- Halaman penelitian ---------- */
async function renderPenelitian() {
  const host = document.getElementById('tabel-penelitian');
  if (!host) return;
  const cari = document.getElementById('cari-penelitian');
  const jenis = document.getElementById('filter-jenis');

  let data;
  try {
    data = await muat('penelitian');
  } catch (e) {
    host.innerHTML = `<div class="kosong">${esc(e.message)}</div>`;
    return;
  }

  const info = document.getElementById('meta-penelitian');
  if (info) info.textContent = `Terakhir diperbarui ${data.meta.terakhir_diperbarui} · ${data.penelitian.length} entri terdata`;

  if (jenis) {
    const jenisUnik = [...new Set(data.penelitian.map((p) => p.jenis))].sort();
    jenis.insertAdjacentHTML('beforeend', jenisUnik.map((j) => `<option value="${esc(j)}">${esc(j)}</option>`).join(''));
  }

  const gambar = () => {
    const q = (cari?.value || '').toLowerCase().trim();
    const j = jenis?.value || 'semua';
    const baris = data.penelitian.filter((p) => {
      const cocokTeks =
        !q || [p.judul, ...(p.penulis || []), ...(p.topik || [])].join(' ').toLowerCase().includes(q);
      return cocokTeks && (j === 'semua' || p.jenis === j);
    });

    if (!baris.length) {
      host.innerHTML = '<div class="kosong">Belum ada entri penelitian yang cocok.</div>';
      return;
    }

    host.innerHTML = `<div class="tabel-bungkus"><table>
      <thead><tr><th>Judul</th><th>Penulis</th><th>Tahun</th><th>Topik</th><th>Sumber</th></tr></thead>
      <tbody>${baris
        .map(
          (p) => `<tr>
            <td><strong>${esc(p.judul)}</strong><br>${lencana(p.status_verifikasi)}
              ${p.relevansi_mkwk ? `<div style="margin-top:6px;color:var(--abu);font-size:14px">${esc(p.relevansi_mkwk)}</div>` : ''}</td>
            <td>${esc((p.penulis || []).join('; '))}</td>
            <td>${p.tahun ?? '—'}</td>
            <td>${(p.topik || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</td>
            <td>${(p.sumber || []).map((s, i) => `<a href="${esc(s)}" target="_blank" rel="noopener noreferrer">tautan ${i + 1}</a>`).join('<br>')}</td>
          </tr>`
        )
        .join('')}</tbody></table></div>`;
  };

  cari?.addEventListener('input', gambar);
  jenis?.addEventListener('change', gambar);
  gambar();

}

/* ---------- Halaman materi ---------- */
async function renderMateri() {
  const punya = document.getElementById('materi-tersedia');
  const belum = document.getElementById('materi-belum');
  if (!punya && !belum) return;

  let data;
  try {
    data = await muat('dosen');
  } catch (e) {
    if (punya) punya.innerHTML = `<div class="kosong">${esc(e.message)}</div>`;
    return;
  }

  const info = document.getElementById('meta-materi');
  const berportal = data.dosen.filter((d) => d.portal_materi);
  if (info) {
    info.textContent = `${berportal.length} dari ${data.dosen.length} dosen telah memiliki portal materi mandiri · diperbarui ${data.meta.terakhir_diperbarui}`;
  }

  if (punya) {
    punya.innerHTML = berportal.length
      ? berportal
          .map(
            (d) => `<article class="kartu">
              <span class="kode">${esc(d.portal_materi.nama || 'Portal Materi')}</span>
              <h3>${esc(namaLengkap(d))}</h3>
              ${d.portal_materi.keterangan ? `<p>${esc(d.portal_materi.keterangan)}</p>` : ''}
              <p style="margin-top:12px"><a href="${esc(d.portal_materi.url)}" target="_blank" rel="noopener noreferrer">${esc(d.portal_materi.url.replace(/^https?:\/\//, ''))} →</a></p>
            </article>`
          )
          .join('')
      : '<div class="kosong">Belum ada portal materi yang terdaftar.</div>';
  }

  if (belum) {
    const sisa = data.dosen.filter((d) => !d.portal_materi);
    belum.innerHTML = sisa.length
      ? `<div class="tabel-bungkus"><table>
          <thead><tr><th>Dosen</th><th>Status</th></tr></thead>
          <tbody>${sisa
            .map((d) => `<tr><td>${esc(namaLengkap(d))}</td><td style="color:var(--abu)">Menunggu pendaftaran portal</td></tr>`)
            .join('')}</tbody></table></div>`
      : '<div class="kosong">Seluruh dosen telah memiliki portal materi.</div>';
  }
}

/* ---------- Halaman jurnal ---------- */
async function renderJurnal() {
  const host = document.getElementById('daftar-jurnal');
  if (!host) return;

  let data;
  try {
    data = await muat('jurnal');
  } catch (e) {
    host.innerHTML = `<div class="kosong">${esc(e.message)}</div>`;
    return;
  }

  const info = document.getElementById('meta-jurnal');
  if (info) info.textContent = `Terakhir diperbarui ${data.meta.terakhir_diperbarui} · dikelola ${data.meta.pengelola}`;

  // ISSN dan akreditasi hanya muncul setelah diverifikasi; selama null, baris
  // itu tidak digambar sama sekali daripada menampilkan tanda tanya.
  const baris = (label, nilai) =>
    nilai ? `<p style="margin-top:8px"><strong>${esc(label)}:</strong> ${esc(nilai)}</p>` : '';

  host.innerHTML = data.jurnal
    .map(
      (j) => `<article class="kartu">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <h3>${esc(j.singkatan)}</h3>${lencana(j.status_verifikasi)}
        </div>
        <p style="font-weight:600;color:var(--tinta)">${esc(j.nama)}</p>
        <p style="margin-top:10px">${esc(j.fokus)}</p>
        ${j.relevansi_pai ? `<p style="margin-top:10px"><strong>Bagi PAI:</strong> ${esc(j.relevansi_pai)}</p>` : ''}
        <div style="margin-top:12px">${(j.cakupan || []).map((c) => `<span class="tag">${esc(c)}</span>`).join('')}</div>
        ${baris('Pengelola', j.pengelola)}
        ${baris('Penerbit', j.penerbit)}
        ${baris('Terbit', j.periode_terbit)}
        ${baris('Bahasa', (j.bahasa || []).join(', '))}
        ${baris('Jenis naskah', (j.jenis_naskah || []).join(', '))}
        ${baris('ISSN cetak', j.issn_cetak)}
        ${baris('ISSN elektronik', j.issn_elektronik)}
        ${baris('Akreditasi SINTA', j.akreditasi_sinta)}
        <p style="margin-top:14px"><a href="${esc(j.url)}" target="_blank" rel="noopener noreferrer">Kunjungi jurnal →</a></p>
      </article>`
    )
    .join('');
}

/* ---------- Halaman kurikulum ---------- */
async function renderKurikulum() {
  const mkwk = document.getElementById('daftar-mkwk');
  const mkwi = document.getElementById('daftar-mkwi');
  if (!mkwk && !mkwi) return;

  let data;
  try {
    data = await muat('matakuliah');
  } catch (e) {
    if (mkwk) mkwk.innerHTML = `<div class="kosong">${esc(e.message)}</div>`;
    return;
  }

  const kartu = (m) => `<article class="kartu">
      <span class="kode">${esc(m.kode)}</span>
      <h3>${esc(m.nama)}${m.fokus_situs ? ' ★' : ''}</h3>
      <p>${esc(m.deskripsi)}</p>
    </article>`;

  if (mkwk) mkwk.innerHTML = data.mkwk.map(kartu).join('');
  if (mkwi) mkwi.innerHTML = data.mkwi.map(kartu).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderDosen();
  renderPenelitian();
  renderJurnal();
  renderMateri();
  renderKurikulum();
  const th = document.getElementById('tahun');
  if (th) th.textContent = new Date().getFullYear();
});
