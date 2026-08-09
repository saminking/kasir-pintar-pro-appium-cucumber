# Kasir Pintar Pro — Appium Cucumber Automation

Automation Android untuk proses Create, Read, Update, dan Delete (CRUD) data **Barang tipe Default** pada aplikasi Kasir Pintar Pro. Framework menggunakan Appium + UiAutomator2, WebdriverIO, Cucumber BDD, dan TypeScript.

## Cakupan

| Tag | Flow | Assertion utama |
| --- | --- | --- |
| `@create` | Membuat Barang Default dengan nama, stok, kode, harga dasar, dan harga jual | Item muncul di daftar dan seluruh data tampil benar di halaman detail |
| `@read` | Mencari barang menggunakan kode dan membuka detail | Nama, kode, harga jual, serta stok sesuai data yang dibuat |
| `@update` | Mengubah nama, stok, dan harga jual | Data terbaru tampil di detail dan nama lama tidak menjadi item terpisah |
| `@delete` | Menghapus barang melalui dialog konfirmasi `YA` | Barang tidak lagi muncul di daftar |

Setiap skenario berdiri sendiri: data dibuat secara unik menggunakan timestamp dan dibersihkan otomatis setelah skenario selesai. Screenshot otomatis dilampirkan ke report jika sebuah step gagal.

## Struktur proyek

```text
.
├── src
│   ├── features              # Skenario Gherkin
│   ├── pages                 # Page Object: flow, interaction, dan assertion UI
│   ├── selectors             # Registry selector dan label UI
│   ├── steps                 # Step definition Cucumber
│   └── support               # Config, test data, dan scenario state
├── scripts                   # Static project verification
├── reports                   # Dibuat otomatis saat test (gitignored)
├── .env.example              # Template environment
├── wdio.conf.ts              # Appium/WebdriverIO/Cucumber configuration
└── package.json
```

## Prasyarat

- Node.js `20.19+`, `22.12+`, atau `24+`
- npm `10+`
- Java JDK 17 atau lebih baru untuk Android tooling/Appium
- Android SDK dengan `adb` tersedia di `PATH`
- Emulator Android atau perangkat fisik dengan USB debugging aktif
- Kasir Pintar Pro sudah terpasang. Package ID default adalah `org.owline.kasirpintarpro`, sesuai [listing resmi Google Play](https://play.google.com/store/apps/details?id=org.owline.kasirpintarpro)
- Akun testing sudah login dan memiliki akses ke menu `Manajemen > Barang atau jasa`

Gunakan akun/toko khusus testing karena automation membuat, mengubah, dan menghapus data barang.

## Instalasi

1. Install dependency:

   ```bash
   npm ci
   ```

2. Install UiAutomator2 driver untuk Appium (cukup satu kali):

   ```bash
   npm run appium:setup
   npm run appium:doctor
   ```

3. Salin `.env.example` menjadi `.env`, lalu sesuaikan device:

   ```dotenv
   ANDROID_DEVICE_NAME=Android Emulator
   ANDROID_UDID=emulator-5554
   ANDROID_PLATFORM_VERSION=15
   ANDROID_APP_PACKAGE=org.owline.kasirpintarpro
   ANDROID_NO_RESET=true
   ```

   `ANDROID_NO_RESET=true` dipakai agar sesi login tidak dihapus. Credential tidak disimpan di repository.

4. Pastikan perangkat terdeteksi:

   ```bash
   adb devices
   ```

`@wdio/appium-service` akan menjalankan server Appium lokal secara otomatis. Jika ingin memakai server yang sudah berjalan, set:

```dotenv
USE_EXTERNAL_APPIUM=true
APPIUM_SERVER_URL=http://127.0.0.1:4723/
```

## Menjalankan test

Seluruh skenario:

```bash
npm test
```

Seluruh CRUD:

```bash
npm run test:crud
```

Per operasi:

```bash
npm run test:create
npm run test:read
npm run test:update
npm run test:delete
```

Tag expression khusus:

```bash
CUCUMBER_TAGS="@smoke and not @manual" npm test
```

Di PowerShell:

```powershell
$env:CUCUMBER_TAGS = "@smoke and not @manual"
npm test
```

## Report

Setelah eksekusi, hasil tersedia di:

- `reports/cucumber/cucumber-report.html`
- `reports/cucumber/cucumber-report.json`
- `reports/junit/*.xml`
- `reports/appium/`

Jika sebuah step gagal, screenshot device disisipkan ke report Cucumber.

## Strategi locator

Selector khusus halaman Barang dipusatkan di `src/selectors/product.selectors.ts`. Page Object di `src/pages/` memakai registry tersebut sehingga perubahan resource-id, teks, atau struktur XPath dapat dilakukan dari satu tempat.

Locator memakai urutan berikut:

1. Selector override dari `.env` jika tersedia.
2. Resource-id aktual aplikasi untuk elemen yang sudah diidentifikasi.
3. Android UiSelector atau XPath berdasarkan text/content-description.
4. Hubungan label ke `EditText`, lalu index `EditText` sebagai fallback terakhir pada form Barang.

Selector yang menerima data runtime dibuat sebagai fungsi. Contohnya, hasil pencarian produk membentuk XPath menggunakan `productName` dari scenario state, tetapi tetap dibatasi ke resource-id `tvNamaBarang` agar search input tidak salah dianggap sebagai baris produk.

Untuk kestabilan terbaik, buka aplikasi lewat Appium Inspector dan isi resource-id aktual sebagai raw WebdriverIO selector:

| Environment | Elemen |
| --- | --- |
| `KP_SELECTOR_MENU_PRODUCTS` | Menu Barang atau jasa |
| `KP_SELECTOR_ADD_PRODUCT` | Tombol Tambah Barang |
| `KP_SELECTOR_SEARCH_INPUT` | Input pencarian |
| `KP_SELECTOR_NAME_INPUT` | Input Nama |
| `KP_SELECTOR_STOCK_INPUT` | Input Stok |
| `KP_SELECTOR_CODE_INPUT` | Input Kode |
| `KP_SELECTOR_BASE_PRICE_INPUT` | Input Harga dasar |
| `KP_SELECTOR_SELLING_PRICE_INPUT` | Input Harga jual |
| `KP_SELECTOR_SAVE_PRODUCT` | Tombol Simpan |
| `KP_SELECTOR_EDIT_PRODUCT` | Tombol Edit Barang |
| `KP_SELECTOR_DELETE_PRODUCT` | Tombol Hapus |
| `KP_SELECTOR_CONFIRM_DELETE` | Tombol konfirmasi YA |

Contoh:

```dotenv
KP_SELECTOR_SAVE_PRODUCT=id=org.owline.kasirpintarpro:id/btnTambahDataBarang
KP_SELECTOR_CONFIRM_DELETE=~YA
```

Jika aplikasi memerlukan activity eksplisit, dapatkan nilainya dengan:

```bash
adb shell cmd package resolve-activity --brief org.owline.kasirpintarpro
```

Lalu isi `ANDROID_APP_ACTIVITY` di `.env`.

## Batasan Scope

- User sudah login; flow login tidak termasuk scope CRUD pada dokumen assessment.
- Akun memiliki hak akses create, read, update, dan delete Barang.
- Tipe `Default` adalah pilihan awal pada form, sesuai screenshot. Test tetap melakukan assertion bahwa nilai `Default` tampil.
- Upload/crop foto tidak dibuat sebagai syarat karena foto bukan field wajib pada task CRUD.
- Eksekusi real-device perlu satu kali validasi locator menggunakan Appium Inspector karena resource-id tidak terlihat dari screenshot.

## Static validation

Validasi TypeScript, kelengkapan struktur, sintaks Gherkin, dan kecocokan seluruh step definition tanpa membuka device:

```bash
npm run verify
```
