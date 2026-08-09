import { $, $$, browser } from '@wdio/globals';

import {
  selectorOverride,
  testConfig,
  type SelectorKey
} from '../support/test-config';

function escapeUiAutomator(value: string): string {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function xpathLiteral(value: string): string {
  if (!value.includes("'")) return `'${value}'`;
  if (!value.includes('"')) return `"${value}"`;

  const parts = value.split("'").map((part) => `'${part}'`);
  return `concat(${parts.join(', "\'", ')})`;
}

export class BasePage {
  protected xpathLiteral(value: string): string {
    return xpathLiteral(value);
  }

  protected selectors(key: SelectorKey, ...fallbacks: string[]): string[] {
    const override = selectorOverride(key);
    return override ? [override, ...fallbacks] : fallbacks;
  }

  protected exactTextSelectors(text: string): string[] {
    const escaped = escapeUiAutomator(text);
    const xpath = xpathLiteral(text);
    return [
      `android=new UiSelector().text("${escaped}")`,
      `//*[@text=${xpath} or @content-desc=${xpath}]`
    ];
  }

  protected containsTextSelectors(text: string): string[] {
    const escaped = escapeUiAutomator(text);
    const xpath = xpathLiteral(text);
    return [
      `android=new UiSelector().textContains("${escaped}")`,
      `//*[contains(@text, ${xpath}) or contains(@content-desc, ${xpath})]`
    ];
  }

  protected async findDisplayedNow(
    selectors: readonly string[]
  ): Promise<WebdriverIO.Element | undefined> {
    for (const selector of selectors) {
      try {
        const elements = await $$(selector);
        for (const element of elements) {
          if ((await element.isExisting()) && (await element.isDisplayed())) {
            return element;
          }
        }
      } catch {

      }
    }
    return undefined;
  }

  protected async waitForDisplayed(
    selectors: readonly string[],
    timeoutMs = testConfig.waitTimeoutMs,
    description = selectors.join(' | ')
  ): Promise<WebdriverIO.Element> {
    const deadline = Date.now() + timeoutMs;

    do {
      const element = await this.findDisplayedNow(selectors);
      if (element) return element;
      await browser.pause(250);
    } while (Date.now() < deadline);

    throw new Error(`Timed out waiting for visible element: ${description}`);
  }

  protected async isDisplayed(
    selectors: readonly string[],
    timeoutMs = 0
  ): Promise<boolean> {
    if (timeoutMs <= 0) {
      return Boolean(await this.findDisplayedNow(selectors));
    }

    try {
      await this.waitForDisplayed(selectors, timeoutMs);
      return true;
    } catch {
      return false;
    }
  }

  protected async tap(
    selectors: readonly string[],
    description?: string
  ): Promise<void> {
    const element = await this.waitForDisplayed(
      selectors,
      testConfig.waitTimeoutMs,
      description
    );
    await element.click();
  }

  protected async tapExactText(text: string): Promise<void> {
    await this.tap(this.exactTextSelectors(text), `text "${text}"`);
  }

  protected async tapContainingText(text: string): Promise<void> {
    await this.tap(this.containsTextSelectors(text), `text containing "${text}"`);
  }

  async hasExactText(text: string, timeoutMs = 0): Promise<boolean> {
    return this.isDisplayed(this.exactTextSelectors(text), timeoutMs);
  }

  async hasTextContaining(text: string, timeoutMs = 0): Promise<boolean> {
    return this.isDisplayed(this.containsTextSelectors(text), timeoutMs);
  }

  protected async replaceValue(
    element: WebdriverIO.Element,
    value: string
  ): Promise<void> {
    await element.click();
    await element.clearValue();
    await element.setValue(value);
  }

  protected async hideKeyboard(): Promise<void> {
    try {
      if (await browser.isKeyboardShown()) {
        await browser.hideKeyboard();
      }
    } catch {
    }
  }

  protected async scrollTextIntoView(text: string): Promise<void> {
    const escaped = escapeUiAutomator(text);
    const uiScrollable =
      'android=new UiScrollable(new UiSelector().scrollable(true))' +
      `.scrollIntoView(new UiSelector().textContains("${escaped}"))`;

    if (await this.isDisplayed([uiScrollable], 3_000)) return;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await this.scrollGesture('down');
      if (await this.hasTextContaining(text, 750)) return;
    }
  }

  protected async scrollToTop(): Promise<void> {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const canContinue = await this.scrollGesture('up');
      if (!canContinue) break;
    }
  }

  private async scrollGesture(direction: 'up' | 'down'): Promise<boolean> {
    try {
      const { width, height } = await browser.getWindowSize();
      const result = await browser.execute('mobile: scrollGesture', {
        left: Math.round(width * 0.1),
        top: Math.round(height * 0.2),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.6),
        direction,
        percent: 0.75
      });
      return result !== false;
    } catch {
      return false;
    }
  }

  protected async waitUntil(
    condition: () => Promise<boolean>,
    message: string,
    timeoutMs = testConfig.waitTimeoutMs
  ): Promise<void> {
    await browser.waitUntil(condition, {
      timeout: timeoutMs,
      interval: 300,
      timeoutMsg: message
    });
  }
}
