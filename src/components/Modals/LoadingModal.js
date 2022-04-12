import React from 'react';

import Modal from 'react-native-modal';
import {View, ActivityIndicator, Image} from 'react-native';
import {useTheme} from '../../Theme';

export const LoadingModal = ({visible}) => {
  const {Layout} = useTheme();
  return (
    <Modal isVisible={visible} backdropOpacity={0.9}>
      <View style={Layout.colCenter}>
        <Image
          source={require('../../assets/images/logo_pm_servicios.png')}
          resizeMode="contain"
          style={{width: 150}}
        />
        <ActivityIndicator color="white" size="large" />
      </View>
    </Modal>
  );
};
