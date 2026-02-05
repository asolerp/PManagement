import React from 'react';
import Modal from 'react-native-modal';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';

export const LoadingModal = ({ visible }) => {
  return (
    <Modal isVisible={visible} backdropOpacity={0.9}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/images/logo_pm_servicios.png')}
          resizeMode="contain"
          style={styles.logo}
        />
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  logo: {
    width: 150
  }
});
