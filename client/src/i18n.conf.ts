import { I18nConfiguration } from '@aurelia/i18n';
// import Fetch from 'i18next-fetch-backend';
import * as globalEn from './locales/en/global.json';
import * as globalFr from './locales/fr/global.json';

const i18nConf = () => {
  return I18nConfiguration.customize((options) => {
    options.initOptions = {
      // plugins: [Fetch],
      // backend: {
      //   loadPath: '/locales/{{lng}}/{{ns}}.json',
      // },
      defaultNS: 'global',
      ns: 'global',
      fallbackLng: 'en',
      lng: 'fr',
      whitelist: ['en', 'fr'],
      resources: {
        en: { global: globalEn },
        fr: { global: globalFr }
      },
      debug: false
    };
  });
}

export { i18nConf };
