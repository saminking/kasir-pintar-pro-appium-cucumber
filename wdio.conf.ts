import { mkdir } from 'node:fs/promises';

import { browser } from '@wdio/globals';

import { productListPage } from './src/pages/product-list.page';
import { scenarioState } from './src/support/scenario-state';
import { testConfig } from './src/support/test-config';

const appiumUrl = new URL(testConfig.appiumServerUrl);

const capability: WebdriverIO.Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': testConfig.deviceName,
  'appium:noReset': testConfig.noReset,
  'appium:autoGrantPermissions': testConfig.autoGrantPermissions,
  'appium:newCommandTimeout': 180,
  'appium:disableWindowAnimation': true,
  ...(testConfig.udid ? { 'appium:udid': testConfig.udid } : {}),
  ...(testConfig.platformVersion
    ? { 'appium:platformVersion': testConfig.platformVersion }
    : {}),
  ...(testConfig.appPath ? { 'appium:app': testConfig.appPath } : {}),
  ...(testConfig.appActivity
    ? {
        'appium:appPackage': testConfig.appPackage,
        'appium:appActivity': testConfig.appActivity,
        'appium:appWaitActivity': '*'
      }
    : {})
};

export const config: WebdriverIO.Config = {
  runner: 'local',
  tsConfigPath: './tsconfig.json',
  specs: ['./src/features/**/*.feature'],
  maxInstances: 1,
  logLevel: testConfig.logLevel,
  bail: 0,
  waitforTimeout: testConfig.waitTimeoutMs,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 1,
  hostname: appiumUrl.hostname,
  port: Number(appiumUrl.port || 4723),
  path: appiumUrl.pathname,
  capabilities: [capability],
  services: testConfig.useExternalAppium
    ? []
    : [
        [
          'appium',
          {
            args: {
              address: appiumUrl.hostname,
              port: Number(appiumUrl.port || 4723),
              basePath: appiumUrl.pathname,
              sessionOverride: true
            },
            logPath: './reports/appium'
          }
        ]
      ],
  framework: 'cucumber',
  reporters: [
    'spec',
    [
      'junit',
      {
        outputDir: './reports/junit',
        outputFileFormat: (options) => `results-${options.cid}.xml`
      }
    ]
  ],
  cucumberOpts: {
    require: ['./src/steps/**/*.ts'],
    backtrace: false,
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: true,
    tagExpression: testConfig.cucumberTags,
    timeout: testConfig.cucumberTimeoutMs,
    ignoreUndefinedDefinitions: false,
    format: [
      'pretty',
      'json:./reports/cucumber/cucumber-report.json',
      'html:./reports/cucumber/cucumber-report.html'
    ]
  },

  onPrepare: async function () {
    await Promise.all([
      mkdir('./reports/appium', { recursive: true }),
      mkdir('./reports/cucumber', { recursive: true }),
      mkdir('./reports/junit', { recursive: true })
    ]);
  },

  beforeScenario: async function () {
    scenarioState.reset();
    await browser.activateApp(testConfig.appPackage);
    await productListPage.open();
  },

  afterStep: async function (_step, _scenario, result, world) {
    if (!result.passed) {
      const screenshot = await browser.takeScreenshot();
      await world.attach(Buffer.from(screenshot, 'base64'), 'image/png');
    }
  },

  afterScenario: async function (_world, _result, context) {
    const cleanupFailures: string[] = [];

    for (const productName of scenarioState.cleanupProductNames()) {
      try {
        await productListPage.deleteIfPresent(productName);
      } catch (error) {
        cleanupFailures.push(
          `${productName}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (cleanupFailures.length > 0) {
      await context.attach(
        `Cleanup warning:\n${cleanupFailures.join('\n')}`,
        'text/plain'
      );
    }

    scenarioState.reset();
  }
};
