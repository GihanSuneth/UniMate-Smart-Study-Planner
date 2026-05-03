import baseConfig from './playwright.config.js';

export default {
  ...baseConfig,
  use: {
    ...baseConfig.use,
    screenshot: 'on',
  },
};
