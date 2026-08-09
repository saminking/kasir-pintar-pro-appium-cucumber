import dotenv from 'dotenv';

dotenv.config({ quiet: true });

function optional(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function booleanValue(name: string, fallback: boolean): boolean {
  const value = optional(name);
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'y'].includes(value.toLowerCase());
}

function integerValue(name: string, fallback: number): number {
  const value = optional(name);
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`${name} must be an integer, received: ${value}`);
  }
  return parsed;
}

const supportedLogLevels = [
  'trace',
  'debug',
  'info',
  'warn',
  'error',
  'silent'
] as const;

type LogLevel = (typeof supportedLogLevels)[number];

function logLevel(): LogLevel {
  const value = optional('LOG_LEVEL') ?? 'info';
  if (!supportedLogLevels.includes(value as LogLevel)) {
    throw new Error(
      `LOG_LEVEL must be one of ${supportedLogLevels.join(', ')}, received: ${value}`
    );
  }
  return value as LogLevel;
}

export const testConfig = {
  appiumServerUrl:
    optional('APPIUM_SERVER_URL') ?? 'http://127.0.0.1:4723/',
  useExternalAppium: booleanValue('USE_EXTERNAL_APPIUM', false),
  deviceName: optional('ANDROID_DEVICE_NAME') ?? 'Android Emulator',
  udid: optional('ANDROID_UDID'),
  platformVersion: optional('ANDROID_PLATFORM_VERSION'),
  appPackage:
    optional('ANDROID_APP_PACKAGE') ?? 'org.owline.kasirpintarpro',
  appActivity: optional('ANDROID_APP_ACTIVITY'),
  appPath: optional('ANDROID_APP_PATH'),
  noReset: booleanValue('ANDROID_NO_RESET', true),
  autoGrantPermissions: booleanValue('ANDROID_AUTO_GRANT_PERMISSIONS', true),
  waitTimeoutMs: integerValue('WAIT_TIMEOUT_MS', 20_000),
  cucumberTimeoutMs: integerValue('CUCUMBER_TIMEOUT_MS', 120_000),
  cucumberTags: optional('CUCUMBER_TAGS') ?? 'not @manual',
  logLevel: logLevel()
} as const;

export type SelectorKey =
  | 'menuProducts'
  | 'addProduct'
  | 'searchInput'
  | 'nameInput'
  | 'stockInput'
  | 'codeInput'
  | 'basePriceInput'
  | 'sellingPriceInput'
  | 'saveProduct'
  | 'editProduct'
  | 'deleteProduct'
  | 'confirmDelete';

const selectorEnvironment: Record<SelectorKey, string> = {
  menuProducts: 'KP_SELECTOR_MENU_PRODUCTS',
  addProduct: 'KP_SELECTOR_ADD_PRODUCT',
  searchInput: 'KP_SELECTOR_SEARCH_INPUT',
  nameInput: 'KP_SELECTOR_NAME_INPUT',
  stockInput: 'KP_SELECTOR_STOCK_INPUT',
  codeInput: 'KP_SELECTOR_CODE_INPUT',
  basePriceInput: 'KP_SELECTOR_BASE_PRICE_INPUT',
  sellingPriceInput: 'KP_SELECTOR_SELLING_PRICE_INPUT',
  saveProduct: 'KP_SELECTOR_SAVE_PRODUCT',
  editProduct: 'KP_SELECTOR_EDIT_PRODUCT',
  deleteProduct: 'KP_SELECTOR_DELETE_PRODUCT',
  confirmDelete: 'KP_SELECTOR_CONFIRM_DELETE'
};

export function selectorOverride(key: SelectorKey): string | undefined {
  return optional(selectorEnvironment[key]);
}
