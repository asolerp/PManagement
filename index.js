import 'react-native-gesture-handler';

import {AppRegistry} from 'react-native';
import App from './src/App';
import CodePush from 'react-native-code-push';

import {name as appName} from './app.json';

let CodePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: {
    appendReleaseDescription: true,
    title: 'a new update is available!',
  },
};

const AppWithCodePush = CodePush(CodePushOptions)(App);

AppRegistry.registerComponent(appName, () => AppWithCodePush);
