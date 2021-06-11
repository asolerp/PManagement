import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// UI
import TitlePage from './TitlePage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {LOW_GREY} from '../styles/colors';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOW_GREY,
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: LOW_GREY,
    borderTopRightRadius: 50,
    paddingHorizontal: 20,
  },
  pageBackScreen: {
    flex: 1,
  },
  pageScreen: {
    flex: 1,
    borderTopRightRadius: 50,
  },
  bottomScreen: {
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      height: 0,
      width: 0,
    },
    shadowColor: '#BCBCBC',
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

const PagetLayout = ({
  backButton,
  titleChildren,
  titleProps,
  children,
  footer,
  titleLefSide,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TitlePage
        {...titleProps}
        leftSide={
          backButton ? (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}>
              <View style={styles.iconWrapper}>
                <Icon name="arrow-back" size={25} color="#5090A5" />
              </View>
            </TouchableOpacity>
          ) : (
            titleLefSide
          )
        }
        align="center">
        {titleChildren}
      </TitlePage>
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        colors={['#126D9B', '#67B26F']}
        style={styles.pageBackScreen}>
        <View style={styles.pageWrapper}>
          <View style={styles.pageScreen}>{children}</View>
        </View>
      </LinearGradient>
      {footer && <View style={styles.bottomScreen}>{footer}</View>}
    </SafeAreaView>
  );
};

export default PagetLayout;
