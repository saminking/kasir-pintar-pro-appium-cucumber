export interface ProductData {
  name: string;
  code: string;
  stock: number;
  basePrice: number;
  sellingPrice: number;
  type: 'Default';
}

let sequence = 0;

export function uniqueProduct(): ProductData {
  sequence += 1;
  const timestamp = Date.now().toString();
  const suffix = `${timestamp.slice(-7)}${sequence}`;

  return {
    name: `AUTO Barang ${suffix}`,
    code: timestamp,
    stock: 100,
    basePrice: 100_000,
    sellingPrice: 115_000,
    type: 'Default'
  };
}

export function updatedProduct(product: ProductData): ProductData {
  return {
    ...product,
    name: `Product Sudah di Update`,
    // stock: 125,
    sellingPrice: 120_000
  };
}

export function formatIdr(value: number): string {
  return `Rp ${new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(value)}`;
}
