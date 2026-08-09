export const productText = {
  addProduct: 'Tambah Barang',
  productMenu: 'Barang atau jasa',
  management: 'Manajemen',
  managementTitle: 'MANAJEMEN',
  save: 'Simpan',
  edit: 'Edit Barang',
  delete: 'Hapus',
  confirmDelete: 'YA',
  deleteConfirmation: 'Anda yakin ingin menghapus data?'
} as const;

export const productSelectors = {
  searchInput: [
    'android=new UiSelector().className("android.widget.EditText").textContains("Cari nama")',
    "//android.widget.EditText[contains(@text, 'Cari nama') or contains(@content-desc, 'Cari nama')]",
    '(//android.widget.EditText)[1]'
  ],

  saveButton: [
    '//android.widget.LinearLayout[@resource-id="org.owline.kasirpintarpro:id/btnTambahDataBarang"]',
    'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().resourceId("org.owline.kasirpintarpro:id/btnTambahDataBarang"))'
  ],

  productResult(productNameLiteral: string): string[] {
    return [
      `//android.widget.TextView[@resource-id="org.owline.kasirpintarpro:id/tvNamaBarang" and contains(@text, ${productNameLiteral})]`
    ];
  },

  formField(labelLiteral: string, fallbackIndex: number): string[] {
    return [
      `//*[contains(@text, ${labelLiteral}) or contains(@content-desc, ${labelLiteral})]` +
        `/following::*[@class='android.widget.EditText'][1]`,
      `(//android.widget.EditText)[${fallbackIndex}]`
    ];
  }
} as const;
