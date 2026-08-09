import assert from 'node:assert/strict';

import { Given, Then, When } from '@wdio/cucumber-framework';

import { productDetailPage } from '../pages/product-detail.page';
import { productFormPage } from '../pages/product-form.page';
import { productListPage } from '../pages/product-list.page';
import {
  uniqueProduct,
  updatedProduct,
  type ProductData
} from '../support/product-data';
import { scenarioState } from '../support/scenario-state';

async function createProduct(product: ProductData): Promise<void> {
  scenarioState.registerForCleanup(product.name);
  await productListPage.open();
  await productFormPage.openCreate();
  await productFormPage.fillNewProduct(product);
  await productFormPage.save();

  assert.equal(
    await productListPage.isLoaded(10_000),
    true,
    'Product list was not displayed after saving'
  );
}

Given(
  'halaman daftar Barang dapat diakses oleh akun pengujian',
  async function () {
    assert.equal(
      await productListPage.isLoaded(5_000),
      true,
      'Barang list must be accessible for the authenticated test account'
    );
  }
);

Given(
  'data unik untuk Barang tipe Default telah disiapkan',
  async function () {
    scenarioState.setPrepared(uniqueProduct());
  }
);

Given('Barang Default unik sudah tersedia', async function () {
  const product = uniqueProduct();
  scenarioState.setPrepared(product);
  await createProduct(product);
});

When(
  'saya membuat Barang Default menggunakan data tersebut',
  async function () {
    await createProduct(scenarioState.currentProduct());
  }
);

Then('barang tampil pada daftar Barang', async function () {
  const product = scenarioState.currentProduct();
  await productListPage.search(product.name);
  await productListPage.assertSummaryMatches(product);
});

Then('detail barang sesuai dengan data yang disimpan', async function () {
  const product = scenarioState.currentProduct();
  await productListPage.openProduct(product.name);
  await productDetailPage.assertMatches(product);
});

When('saya mencari barang tersebut menggunakan kode', async function () {
  await productListPage.search(scenarioState.currentProduct().code);
});

Then(
  'hasil pencarian menampilkan nama dan kode barang yang sesuai',
  async function () {
    const product = scenarioState.currentProduct();
    await productListPage.assertSummaryMatches(product);
  }
);

When('saya membuka detail barang dari hasil pencarian', async function () {
  await productListPage.openProduct(scenarioState.currentProduct().name);
});

When(
  'saya mengubah nama dan harga jual barang tersebut',
  async function () {
    const current = scenarioState.currentProduct();
    const updated = updatedProduct(current);

    await productListPage.openProduct(current.name);
    await productDetailPage.edit();

    scenarioState.registerForCleanup(updated.name);
    await productFormPage.updateProduct(updated);
    await productFormPage.save();
    scenarioState.updateCurrent(updated);
  }
);

Then('detail barang menampilkan data terbaru', async function () {
  const updated = scenarioState.currentProduct();
  await productListPage.open();
  await productListPage.openProduct(updated.name);
  await productDetailPage.assertMatches(updated);
});

Then(
  'nama barang sebelum perubahan tidak lagi ditampilkan sebagai item terpisah',
  async function () {
    const original = scenarioState.originalProduct();
    await productListPage.open();
    await productListPage.search(original.name);

    assert.equal(
      await productListPage.productIsListed(original.name, 2_000),
      false,
      `Original product name still exists as an exact item: ${original.name}`
    );
  }
);

When(
  'saya menghapus barang tersebut dan memilih konfirmasi YA',
  async function () {
    const product = scenarioState.currentProduct();
    await productListPage.openProduct(product.name);
    await productDetailPage.deleteAndConfirm();
    scenarioState.markDeleted(product.name);
    await productListPage.open();
    await productListPage.search(product.name);
  }
);

Then('barang tidak lagi tampil pada daftar Barang', async function () {
  const product = scenarioState.currentProduct();
  await productListPage.waitUntilProductMissing(product.name);

  assert.equal(
    await productListPage.productIsListed(product.name),
    false,
    `Deleted product is still listed: ${product.name}`
  );
});
