# Brief Pengembangan Dashboard: Vendor Performance Monitoring

## 1. Tujuan Dashboard

Dashboard ini dibuat untuk memantau **performa vendor** — bukan sekadar menampilkan angka mentah, tapi menjawab pertanyaan:

- Vendor mana yang performanya paling baik/buruk?
- Apakah performa vendor secara umum membaik atau memburuk dari waktu ke waktu?
- Apakah vendor yang dipakai berulang kali konsisten performanya?
- Kategori vendor mana yang kualitasnya paling baik?

Seluruh visual harus bersifat **interaktif** dan merespons filter yang dipilih user (dengan beberapa pengecualian yang dijelaskan di bagian 4).

---

## 2. Filter Global (di bagian atas dashboard)

Ada 4 filter yang harus tersedia dan bisa dikombinasikan (multi-filter, bukan saling eksklusif):

1. **Bulan** (dropdown, single/multi-select — silakan sesuaikan dengan kebutuhan)
2. **Vendor** (dropdown, pilih 1 atau lebih vendor)
3. **Event** (dropdown, pilih event tertentu)
4. **Kategori** (dropdown, kategori vendor — misal Catering, Sound System, Dekorasi, dll)

Default: semua filter kosong/menampilkan seluruh data.

---

## 3. Komponen Dashboard (urutan dari atas ke bawah)

### 3.1 KPI Cards (3 kartu angka)

| KPI | Definisi | Cara Hitung |
|---|---|---|
| **Total Vendor** | Jumlah vendor unik yang digunakan pada periode/filter aktif | `COUNT(DISTINCT vendor_id)` dari data yang sudah difilter |
| **Total Event** | Jumlah event yang menggunakan vendor pada periode/filter aktif | `COUNT(DISTINCT event_id)` dari data yang sudah difilter |
| **Average Performance** | Rata-rata skor performa seluruh evaluasi vendor pada periode/filter aktif | `AVG(skor_performa)` dari seluruh baris evaluasi yang sudah difilter |

### 3.2 Vendor Performance Overview (horizontal bar chart)

- Setiap bar = 1 vendor, panjang bar = skor performa rata-rata vendor tersebut.
- Urutkan dari skor tertinggi ke terendah.
- Jika jumlah vendor banyak, tampilkan **Top 5 + Bottom 5** (bisa dibuat toggle "lihat semua" jika diperlukan).
- Data per vendor: `nama_vendor`, `AVG(skor_performa)` dikelompokkan per `vendor_id`.

### 3.3 Performance Trend (line chart)

- Sumbu X: Bulan (Januari–Juni, tetap tampil penuh — lihat aturan filter di bagian 4).
- Sumbu Y: rata-rata skor performa.
- Data: `AVG(skor_performa)` dikelompokkan per bulan.
- Jika filter Vendor aktif, garis menunjukkan tren skor khusus vendor tersebut (bisa multi-line jika lebih dari 1 vendor dipilih).

### 3.4 Performance Distribution (donut chart)

- Kategori skor:
  - 90–100 → Excellent
  - 80–89 → Good
  - 70–79 → Fair
  - <70 → Poor
- Data: hitung jumlah vendor (atau evaluasi — **perlu konfirmasi mana yang dipakai**, lihat catatan di bagian 5) yang masuk ke tiap rentang skor tersebut, dari data yang sudah difilter.

### 3.5 Repeat Vendor Performance ⭐ (highlight utama dashboard)

- Hanya menampilkan vendor yang digunakan **lebih dari 1 kali** (secara histori keseluruhan, bukan hanya dari filter aktif — lihat bagian 4).
- Bentuk visual: line chart per vendor (sumbu X = urutan pemakaian/event ke-1, ke-2, dst, atau bisa berdasarkan tanggal event; sumbu Y = skor performa).
- Tujuannya menunjukkan apakah skor vendor tersebut naik, turun, atau fluktuatif setiap kali dipakai.
- Data per vendor repeat: daftar `(tanggal_event / urutan_pemakaian, skor_performa)` diurutkan berdasarkan waktu.

### 3.6 Performance by Vendor Category (bar chart)

- Setiap bar = 1 kategori vendor, tinggi bar = rata-rata skor performa kategori tersebut.
- Data: `AVG(skor_performa)` dikelompokkan per `kategori_vendor`.

---

## 4. Aturan Interaksi Filter per Visual (PENTING)

Ini bagian paling krusial — tolong diikuti persis, karena beberapa visual **sengaja tidak mengikuti semua filter** agar tetap informatif.

| Visual | Filter Bulan | Filter Vendor | Filter Event | Filter Kategori |
|---|---|---|---|---|
| KPI Cards | Ikut | Ikut | Ikut | Ikut |
| Vendor Performance Overview | Ikut | **Highlight saja** (lihat catatan a) | Ikut | Ikut |
| Performance Trend | **Diabaikan** (selalu Jan–Jun, lihat catatan b) | Ikut | Ikut | Ikut |
| Performance Distribution | Ikut | Ikut | Ikut | Ikut |
| Repeat Vendor Performance | **Diabaikan** (selalu histori penuh, lihat catatan c) | Ikut | **Diabaikan** (lihat catatan c) | Ikut |
| Performance by Category | Ikut | Ikut | Ikut | **Highlight saja** (lihat catatan a) |

**Catatan penjelasan:**

**(a) "Highlight saja" bukan "filter/menyaring"**
Untuk Vendor Performance Overview dan Performance by Category: kalau user memilih 1 vendor/kategori di filter, chart **tetap menampilkan semua vendor/kategori** (agar tetap ada pembanding), tapi item yang dipilih ditandai dengan warna berbeda/lebih menonjol. Jangan menyaring chart jadi cuma 1 bar, karena chart ini fungsinya untuk perbandingan.

**(b) Performance Trend tidak terpengaruh filter Bulan**
Chart ini selalu menampilkan rentang Januari–Juni penuh, walaupun user memilih 1 bulan tertentu di filter. Ini supaya fungsinya sebagai "chart tren" tidak hilang (kalau ikut difilter ke 1 bulan, chart akan jadi cuma 1 titik data, tidak ada gunanya).

**(c) Repeat Vendor Performance dihitung dari histori keseluruhan**
"Repeat" (vendor dipakai >1 kali) harus dihitung dari **seluruh data yang ada di database**, bukan dari hasil filter Bulan/Event yang sedang aktif. Jadi meskipun user memfilter ke 1 bulan tertentu, chart ini tetap menampilkan histori lengkap vendor-vendor yang repeat (sepanjang waktu). Filter Bulan dan Event khusus untuk chart ini **diabaikan/di-disable**, sementara filter Vendor dan Kategori tetap berlaku normal.

---

## 5. Hal yang Perlu Dikonfirmasi Sebelum Development

Mohon konfirmasi dulu ke saya sebelum mulai coding untuk poin-poin berikut, karena akan memengaruhi struktur query:

1. **Performance Distribution** — dihitung berdasarkan rata-rata skor per vendor, atau berdasarkan setiap baris evaluasi/event? (Keduanya valid tapi hasilnya beda.)
2. **Struktur data sumber** — apakah data evaluasi vendor sudah tersedia dalam bentuk tabel/API tertentu? Mohon info nama tabel/endpoint dan kolom-kolom yang tersedia (skor performa dihitung dari mana, per event atau per kriteria yang dijumlahkan, dst).
3. **Definisi "skor performa"** — apakah ini sudah berupa angka final (0–100), atau perlu dihitung dari beberapa sub-kriteria penilaian?
4. **Rentang waktu default** — dashboard defaultnya menampilkan data periode apa saat pertama dibuka (misal: 6 bulan terakhir, tahun berjalan, dll)?

---

## 6. Ringkasan Prioritas Pengerjaan (saran)

1. Setup filter global + KPI Cards (paling dasar, dipakai semua visual)
2. Vendor Performance Overview (visual paling sering dicek)
3. Repeat Vendor Performance (nilai jual utama dashboard ini)
4. Performance Trend
5. Performance Distribution
6. Performance by Category

---

*Dokumen ini adalah hasil rangkuman diskusi kebutuhan dashboard. Jika ada bagian yang kurang jelas, silakan tanyakan langsung sebelum mulai development agar tidak ada rework di kemudian hari.*
