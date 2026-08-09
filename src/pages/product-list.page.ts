import assert from 'node:assert/strict';

import { browser } from '@wdio/globals';

import {
  productSelectors,
  productText
} from '../selectors/product.selectors';
import type { ProductData } from '../support/product-data';
import { formatIdr } from '../support/product-data';
import { testConfig } from '../support/test-config';
import { BasePage } from './base.page';
import { productDetailPage } from './product-detail.page';

class ProductListPage extends BasePage {
  private productResultSelectors(productName: string): string[] {
    return productSelectors.productResult(this.xpathLiteral(productName));
  }

  private listReadySelectors(): string[] {
    return this.selectors(
      'addProduct',
      ...this.exactTextSelectors(productText.addProduct)
    );
  }

  async isLoaded(timeoutMs = 0): Promise<boolean> {
    return this.isDisplayed(this.listReadySelectors(), timeoutMs);
  }

  async open(): Promise<void> {
    if (await this.isLoaded(1_000)) return;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const productMenuSelectors = this.selectors(
        'menuProducts',
        ...this.exactTextSelectors(productText.productMenu)
      );

      if (await this.isDisplayed(productMenuSelectors, 1_000)) {
        await this.tap(productMenuSelectors, `${productText.productMenu} menu`);
        if (await this.isLoaded(testConfig.waitTimeoutMs)) return;
      }

      if (await this.hasExactText(productText.management, 750)) {
        await this.tapExactText(productText.management);
      } else if (await this.hasExactText(productText.managementTitle, 750)) {
        // The screenshot shows this as a page title; no click is needed.
      } else {
        await browser.back();
      }

      if (await this.isLoaded(1_500)) return;
    }

    throw new Error(
      'Unable to navigate to Barang list. Ensure the account is logged in and can access Manajemen > Barang atau jasa.'
    );
  }

  async search(query: string): Promise<void> {
    await this.open();
    const search = await this.waitForDisplayed(
      this.selectors(
        'searchInput',
        ...productSelectors.searchInput
      ),
      undefined,
      'product search input'
    );

    await this.replaceValue(search, query);
    await this.hideKeyboard();
    await browser.pause(600);
  }

  async productIsListed(productName: string, timeoutMs = 0): Promise<boolean> {
    return this.isDisplayed(
      this.productResultSelectors(productName),
      timeoutMs
    );
  }

  async assertSummaryMatches(product: ProductData): Promise<void> {
    assert.equal(
      await this.productIsListed(product.name, 5_000),
      true,
      `Product name is not listed: ${product.name}`
    );
    assert.equal(
      await this.hasExactText(product.code, 5_000),
      true,
      `Product code is not listed: ${product.code}`
    );
    assert.equal(
      await this.hasTextContaining(formatIdr(product.sellingPrice), 5_000),
      true,
      `Selling price is not listed: ${formatIdr(product.sellingPrice)}`
    );
    assert.equal(
      await this.hasTextContaining(
        `Hrg Beli Terakhir ${formatIdr(product.basePrice)}`,
        5_000
      ),
      true,
      `Base price summary is not listed: ${formatIdr(product.basePrice)}`
    );
  }

  async openProduct(productName: string): Promise<void> {
    await this.search(productName);
    await this.tap(
      this.productResultSelectors(productName),
      `product search result "${productName}"`
    );
    await productDetailPage.waitLoaded();
  }

  async waitUntilProductMissing(productName: string): Promise<void> {
    await this.waitUntil(
      async () => !(await this.productIsListed(productName)),
      `Product should no longer be listed: ${productName}`
    );
  }

  async deleteIfPresent(productName: string): Promise<void> {
    await this.open();
    await this.search(productName);

    if (!(await this.productIsListed(productName, 2_000))) return;

    await this.tap(
      this.productResultSelectors(productName),
      `product search result "${productName}"`
    );
    await productDetailPage.waitLoaded();
    await productDetailPage.deleteAndConfirm();
    await this.open();
    await this.search(productName);
    await this.waitUntilProductMissing(productName);
  }
}

export const productListPage = new ProductListPage();
