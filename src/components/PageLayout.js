import React from 'react';

import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// UI
import TitlePage from './TitlePage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {popScreen} from '../Router/utils/actions';
import {Colors} from '../Theme/Variables';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  pageWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
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

const Container = ({
  titleProps,
  white,
  backButton,
  titleLefSide,
  titleRightSide,
  titleChildren,
  children,
  footer,
}) => (
  <React.Fragment>
    <TitlePage
      {...titleProps}
      leftSide={
        backButton ? (
          <TouchableOpacity
            onPress={() => {
              popScreen();
            }}>
            <View>
              <Icon name="arrow-back" size={25} color={Colors.white} />
            </View>
          </TouchableOpacity>
        ) : (
          titleLefSide
        )
      }
      rightSide={titleRightSide}
      align="center">
      {titleChildren}
    </TitlePage>
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={white ? ['#FFFFFF', '#FFFFFF'] : ['#126D9B', '#67B26F']}
      style={styles.pageBackScreen}>
      <View style={styles.pageWrapper}>
        <View style={styles.pageScreen}>{children}</View>
      </View>
    </LinearGradient>
    {footer && <View style={styles.bottomScreen}>{footer}</View>}
  </React.Fragment>
);

const PageLayout = ({
  white,
  backButton,
  titleChildren,
  titleProps,
  children,
  footer,
  titleLefSide,
  titleRightSide,
  edges = ['bottom'],
  safe = false,
}) => {
  if (safe) {
    return (
      <SafeAreaView style={styles.container} edges={edges}>
        <Container
          white={white}
          backButton={backButton}
          titleProps={titleProps}
          children={children}
          titleLefSide={titleLefSide}
          titleRightSide={titleRightSide}
          titleChildren={titleChildren}
          footer={footer}
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Container
        white={white}
        backButton={backButton}
        titleProps={titleProps}
        children={children}
        titleLefSide={titleLefSide}
        titleRightSide={titleRightSide}
        titleChildren={titleChildren}
        footer={footer}
      />
    </View>
  );
};

export default PageLayout;
