import { I18nConfiguration } from '@aurelia/i18n';
import Fetch from 'i18next-fetch-backend';

const i18nConf = () => {
  return I18nConfiguration.customize((options) => {
    console.log('customizing i18n');
    options.initOptions = {
      plugins: [Fetch],
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      defaultNS: 'global',
      ns: 'global',
      fallbackLng: 'en',
      lng: 'fr',
      whitelist: ['en', 'fr'],
      debug: false
    };
  });
}

export { i18nConf };
