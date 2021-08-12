import Bugsnag from '@bugsnag/react-native';
import Config from 'react-native-config';

import packageJSON from '../../../../package.json';

let isBugsnagInitialised = false;

const getCustomData = () => {
  try {
    return {
      country: Config.COUNTRY_CODE,
      appVersion: packageJSON.version,
    };
  } catch (e) {
    console.error('Unable to generate Bugsnag customData');
  }
};

export const init = () => {
  try {
    if (isBugsnagInitialised) {
      return;
    }
    const customData = getCustomData();
    Bugsnag.start({
      metadata: {
        customData,
      },
    });
    isBugsnagInitialised = true;
  } catch (e) {
    console.error('Unable to initialise Bugsnag');
    throw new Error(e);
  }
};

export const trackError = ({message, data}) => {
  if (!isBugsnagInitialised) {
    init();
  }
  Bugsnag.notify(new Error(message), (event) => {
    event.addMetadata('customData', {
      ...getCustomData(),
      extraData: JSON.stringify(data),
    });
  });
};
