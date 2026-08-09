import type { ProductData } from './product-data';

class ScenarioState {
  private current?: ProductData;
  private original?: ProductData;
  private readonly cleanupNames = new Set<string>();

  reset(): void {
    this.current = undefined;
    this.original = undefined;
    this.cleanupNames.clear();
  }

  setPrepared(product: ProductData): void {
    this.current = product;
    this.original = product;
  }

  currentProduct(): ProductData {
    if (!this.current) {
      throw new Error('Product test data has not been prepared for this scenario.');
    }
    return this.current;
  }

  originalProduct(): ProductData {
    if (!this.original) {
      throw new Error('Original product test data is unavailable.');
    }
    return this.original;
  }

  updateCurrent(product: ProductData): void {
    this.current = product;
  }

  registerForCleanup(productName: string): void {
    this.cleanupNames.add(productName);
  }

  markDeleted(productName: string): void {
    this.cleanupNames.delete(productName);
  }

  cleanupProductNames(): string[] {
    return [...this.cleanupNames].reverse();
  }
}

export const scenarioState = new ScenarioState();
