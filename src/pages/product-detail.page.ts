import assert from 'node:assert/strict';

import { productText } from '../selectors/product.selectors';
import type { ProductData } from '../support/product-data';
import { formatIdr } from '../support/product-data';
import { BasePage } from './base.page';

class ProductDetailPage extends BasePage {
  async waitLoaded(): Promise<void> {
    await this.waitForDisplayed(
      this.selectors(
        'editProduct',
        ...this.exactTextSelectors(productText.edit)
      ),
      undefined,
      'product detail page'
    );
  }

  async assertMatches(product: ProductData): Promise<void> {
    await this.waitLoaded();

    assert.equal(
      await this.hasExactText(product.name, 5_000),
      true,
      `Product name is not displayed: ${product.name}`
    );
    // assert.equal(
    //   await this.hasExactText(product.code, 5_000),
    //   true,
    //   `Product code is not displayed: ${product.code}`
    // );
    assert.equal(
      await this.hasTextContaining(formatIdr(product.sellingPrice), 5_000),
      true,
      `Selling price is not displayed: ${formatIdr(product.sellingPrice)}`
    );
    // assert.equal(
    //   await this.hasTextContaining(`${product.stock} item`, 5_000),
    //   true,
    //   `Stock is not displayed: ${product.stock} item`
    // );
  }

  async edit(): Promise<void> {
    await this.tap(
      this.selectors(
        'editProduct',
        ...this.exactTextSelectors(productText.edit)
      ),
      `${productText.edit} button`
    );
    await this.waitForDisplayed(
      this.exactTextSelectors(productText.save),
      undefined,
      'edit product form'
    );
  }

  async deleteAndConfirm(): Promise<void> {
    await this.tap(
      this.selectors(
        'deleteProduct',
        ...this.exactTextSelectors(productText.delete)
      ),
      `${productText.delete} button`
    );

    assert.equal(
      await this.hasTextContaining(productText.deleteConfirmation, 5_000),
      true,
      'Delete confirmation dialog was not displayed'
    );

    await this.tap(
      this.selectors(
        'confirmDelete',
        ...this.exactTextSelectors(productText.confirmDelete)
      ),
      `${productText.confirmDelete} confirmation button`
    );
  }
}

export const productDetailPage = new ProductDetailPage();
