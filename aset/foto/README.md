# Foto dosen

Letakkan foto di direktori ini dan rujuk dari `data/dosen.json` pada bidang
`foto`, misalnya `"foto": "aset/foto/lenny-herlina.jpg"`.

## Ketentuan

- **Izin lebih dulu.** Foto seseorang hanya dimuat setelah yang bersangkutan
  menyetujuinya. Permintaan penghapusan dipenuhi tanpa perlu alasan.
- **Berkas ada di repositori ini**, bukan tautan ke situs lain — portal tidak
  boleh bergantung pada gambar milik pihak lain yang dapat berubah atau hilang.
  Pemeriksaan otomatis menolak nilai `foto` berupa URL luar.
- Format `.jpg`, `.jpeg`, `.png`, atau `.webp`; potong persegi, sisi sekitar
  400 piksel sudah cukup karena kartu menampilkannya 56 piksel.
- Nama berkas mengikuti `id` dosen, mis. `arif-nasrullah.jpg`.

Selama `foto` masih `null`, kartu menampilkan inisial nama — seragam dan tidak
memuat gambar siapa pun tanpa izin.
