import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TitlePage from './TitlePage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { popScreen } from '../Router/utils/actions';
import { isIOS } from '../utils/platform';

const Container = ({
  titleProps,
  backButton,
  titleLefSide,
  titleRightSide,
  titleChildren,
  withTitle = true,
  withPadding = true,
  children,
  footer
}) => {
  return (
    <>
      {withTitle && (
        <TitlePage
          {...titleProps}
          leftSide={
            backButton ? (
              <TouchableOpacity
                onPress={() => {
                  popScreen();
                }}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="arrow-back" size={25} color="#284748" />
              </TouchableOpacity>
            ) : (
              titleLefSide
            )
          }
          rightSide={titleRightSide}
          align="center"
        >
          {titleChildren}
        </TitlePage>
      )}
      <View
        style={[
          styles.pageWrapper,
          { paddingHorizontal: withPadding ? 20 : 0 }
        ]}
      >
        <View style={styles.pageScreen}>{children}</View>
      </View>
      {footer && <View style={styles.bottomScreen}>{footer}</View>}
    </>
  );
};

const PageLayout = ({
  white,
  backButton,
  titleChildren,
  titleProps,
  children,
  footer,
  statusBar = 'dark-content',
  titleLefSide,
  titleRightSide,
  containerStyles,
  withPadding,
  withTitle = true,
  edges = ['top', 'bottom'],
  safe = false
}) => {
  if (safe && Platform.OS === 'ios') {
    return (
      <SafeAreaView style={[styles.container, containerStyles]} edges={edges}>
        {Platform.OS === 'ios' && <StatusBar barStyle={statusBar} />}
        <Container
          white={white}
          withPadding={withPadding}
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
    <View style={[styles.container, containerStyles]}>
      {Platform.OS === 'ios' && <StatusBar barStyle={statusBar} />}
      <Container
        white={white}
        withTitle={withTitle}
        withPadding={withPadding}
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

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44
  },
  bottomScreen: {
    justifyContent: 'flex-start',
    marginBottom: isIOS ? 0 : 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%'
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  pageScreen: {
    flex: 1,
    flexGrow: 1
  },
  pageWrapper: {
    flexGrow: 1
  }
});

export default PageLayout;
