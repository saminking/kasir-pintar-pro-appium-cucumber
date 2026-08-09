Feature: CRUD data Barang tipe Default

  Background:
    Given halaman daftar Barang dapat diakses oleh akun pengujian

  @crud @create @smoke
  Scenario: Create - membuat Barang Default dengan data wajib valid - barang tersimpan
    Given data unik untuk Barang tipe Default telah disiapkan
    When saya membuat Barang Default menggunakan data tersebut
    Then barang tampil pada daftar Barang
    And detail barang sesuai dengan data yang disimpan

  @crud @read
  Scenario: Read - mencari Barang Default menggunakan kode - data yang benar ditampilkan
    Given Barang Default unik sudah tersedia
    When saya mencari barang tersebut menggunakan kode
    Then hasil pencarian menampilkan nama dan kode barang yang sesuai
    When saya membuka detail barang dari hasil pencarian
    Then detail barang sesuai dengan data yang disimpan

  @crud @update
  Scenario: Update - mengubah nama stok dan harga jual Barang Default - perubahan tersimpan
    Given Barang Default unik sudah tersedia
    When saya mengubah nama dan harga jual barang tersebut
    Then detail barang menampilkan data terbaru
    And nama barang sebelum perubahan tidak lagi ditampilkan sebagai item terpisah

  @crud @delete
  Scenario: Delete - menghapus Barang Default dan menyetujui konfirmasi - barang terhapus
    Given Barang Default unik sudah tersedia
    When saya menghapus barang tersebut dan memilih konfirmasi YA
    Then barang tidak lagi tampil pada daftar Barang
