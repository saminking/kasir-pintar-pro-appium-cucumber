# Referensi UI dan pemetaan flow

Screenshot berikut menjadi acuan fallback locator dan urutan proses ketika APK serta hierarchy Appium Inspector belum tersedia.

## 1. Buka menu Barang

Masuk dari halaman `MANAJEMEN`, lalu pilih `Barang atau jasa`.

![Halaman Manajemen](screenshots/01-management.jpeg)

## 2. Kondisi awal daftar Barang

Daftar dapat kosong dan menyediakan tombol `Tambah Barang`.

![Daftar Barang kosong](screenshots/02-empty-product-list.jpeg)

## 3. Create Barang tipe Default

Field wajib yang diautomasi adalah Nama, Stok, Kode, Harga dasar, dan Harga jual. Nilai `Tipe Barang` harus `Default`, lalu data disimpan melalui tombol `Simpan`.

![Form tambah bagian atas](screenshots/03-add-product-top.jpeg)

![Form tambah bagian bawah](screenshots/04-add-product-bottom.jpeg)

Upload dan crop foto terlihat pada aplikasi, tetapi tidak menjadi field wajib pada task CRUD.

![Crop foto](screenshots/05-photo-crop.jpeg)

## 4. Read melalui daftar dan detail

Data diverifikasi dari hasil pencarian serta halaman detail. Assertion mencakup nama, kode, stok, dan harga jual.

![Daftar Barang berisi data](screenshots/06-product-list.jpeg)

![Detail Barang](screenshots/07-product-detail.jpeg)

## 5. Update dan Delete

Update dimulai melalui tombol `Edit Barang`. Delete dimulai melalui `Hapus` dan hanya dilanjutkan setelah dialog `KONFIRMASI` disetujui dengan tombol `YA`.

![Konfirmasi hapus](screenshots/08-delete-confirmation.jpeg)
