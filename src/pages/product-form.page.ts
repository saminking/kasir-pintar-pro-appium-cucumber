import assert from 'node:assert/strict';

import { browser } from '@wdio/globals';

import {
  productSelectors,
  productText
} from '../selectors/product.selectors';
import type { ProductData } from '../support/product-data';
import type { SelectorKey } from '../support/test-config';
import { BasePage } from './base.page';

interface FieldDefinition {
  label: string;
  selectorKey: SelectorKey;
  fallbackIndex: number;
}

const fields = {
  name: {
    label: 'Nama',
    selectorKey: 'nameInput',
    fallbackIndex: 1
  },
  stock: {
    label: 'Stok',
    selectorKey: 'stockInput',
    fallbackIndex: 2
  },
  code: {
    label: 'Kode',
    selectorKey: 'codeInput',
    fallbackIndex: 3
  },
  basePrice: {
    label: 'Harga dasar',
    selectorKey: 'basePriceInput',
    fallbackIndex: 4
  },
  sellingPrice: {
    label: 'Harga jual',
    selectorKey: 'sellingPriceInput',
    fallbackIndex: 5
  }
} as const satisfies Record<string, FieldDefinition>;

class ProductFormPage extends BasePage {
  async openCreate(): Promise<void> {
    await this.tap(
      this.selectors(
        'addProduct',
        ...this.exactTextSelectors(productText.addProduct)
      ),
      `${productText.addProduct} button`
    );
    await this.waitForDisplayed(
      this.exactTextSelectors(productText.save),
      undefined,
      'product form'
    );
  }

  async fillNewProduct(product: ProductData): Promise<void> {
    await this.scrollToTop();
    await this.setField(fields.name, product.name);

    assert.equal(
      await this.hasExactText(product.type, 3_000),
      true,
      'Tipe Barang must be Default'
    );

    await this.setField(fields.stock, String(product.stock));
    await this.setField(fields.code, product.code);
    await this.setField(fields.basePrice, String(product.basePrice));
    await this.setField(fields.sellingPrice, String(product.sellingPrice));
  }

  async updateProduct(product: ProductData): Promise<void> {
    await this.scrollToTop();
    await this.setField(fields.name, product.name);
    // await this.setField(fields.stock, String(product.stock));
    await this.setField(fields.sellingPrice, String(product.sellingPrice));
  }

  async save(): Promise<void> {
    await this.hideKeyboard();
    await this.tap(
      this.selectors(
        'saveProduct',
        ...productSelectors.saveButton
      ),
      'save product button (btnTambahDataBarang)'
    );
    await browser.pause(1_000);
  }

  private async setField(
    definition: FieldDefinition,
    value: string
  ): Promise<void> {
    await this.hideKeyboard();

    if (definition.label === 'Nama') {
      await this.scrollToTop();
    } else {
      await this.scrollTextIntoView(definition.label);
    }

    const label = definition.label;
    const fieldSelectors = productSelectors.formField(
      this.xpathLiteral(label),
      definition.fallbackIndex
    );

    const field = await this.waitForDisplayed(
      this.selectors(
        definition.selectorKey,
        ...fieldSelectors
      ),
      undefined,
      `${label} input`
    );

    await this.replaceValue(field, value);
  }
}

export const productFormPage = new ProductFormPage();
