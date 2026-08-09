import { access, readFile } from 'node:fs/promises';

const requiredFiles = [
  'src/features/product-crud.feature',
  'src/steps/product.steps.ts',
  'src/pages/product-list.page.ts',
  'src/pages/product-form.page.ts',
  'src/pages/product-detail.page.ts',
  'src/support/test-config.ts',
  'wdio.conf.ts',
  '.env.example',
  'README.md'
];

for (const file of requiredFiles) {
  await access(new URL(`../${file}`, import.meta.url));
}

const feature = await readFile(
  new URL('../src/features/product-crud.feature', import.meta.url),
  'utf8'
);

for (const tag of ['@create', '@read', '@update', '@delete']) {
  if (!feature.includes(tag)) {
    throw new Error(`Feature file is missing required tag: ${tag}`);
  }
}

const scenarios = feature.match(/^\s*Scenario:/gm) ?? [];
if (scenarios.length !== 4) {
  throw new Error(`Expected 4 CRUD scenarios, found ${scenarios.length}`);
}

console.log('Static project verification passed.');
