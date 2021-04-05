import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

// UI
import TitlePage from './TitlePage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {SafeAreaView} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    width: '100%',
    paddingHorizontal: 20,
    height: '8%',
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
    <View style={styles.container}>
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
    </View>
  );
};

export default PagetLayout;
