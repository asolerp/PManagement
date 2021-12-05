import React from 'react';

import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

// UI
import TitlePage from './TitlePage';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {popScreen} from '../Router/utils/actions';
import {Colors} from '../Theme/Variables';
import {Platform} from 'react-native';
import {isIOS} from '../utils/platform';

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
  },
  bottomScreen: {
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: isIOS ? 0 : 20,
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
  backButton,
  titleLefSide,
  titleRightSide,
  titleChildren,
  withTitle = true,
  children,
  footer,
}) => (
  <React.Fragment>
    {withTitle && (
      <TitlePage
        {...titleProps}
        leftSide={
          backButton ? (
            <TouchableOpacity
              onPress={() => {
                popScreen();
              }}>
              <View>
                <Icon name="arrow-back" size={25} />
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
    )}
    <View style={styles.pageWrapper}>
      <View style={styles.pageScreen}>{children}</View>
    </View>
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
  withTitle = true,
  edges = ['top', 'bottom'],
  safe = false,
}) => {
  if (safe && Platform.OS === 'ios') {
    return (
      <SafeAreaView style={styles.container} edges={edges}>
        <Container
          white={white}
          withTitle={withTitle}
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
