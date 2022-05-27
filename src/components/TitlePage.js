import React from 'react';
import {useRoute} from '@react-navigation/native';
import {Image, View, Text, StyleSheet, Platform} from 'react-native';
import FastImage from 'react-native-fast-image';

// Utils

import {Colors} from '../Theme/Variables';
import {useTheme} from '../Theme';
import {TouchableWithoutFeedback} from 'react-native';
import {isIOS} from '../utils/platform';

const TitlePage = ({
  title,
  subtitle,
  leftSide,
  rightSide,
  children,
  subPage = false,
  background,
  onPress,
  containerStyles,
}) => {
  const {
    params: {screenKey = ''},
  } = useRoute();
  const {Layout, Gutters} = useTheme();

  const TitleWrapper = () => (
    <React.Fragment>
      {!children ? (
        <View
          style={[Layout.flex, Layout.justifyContentCenter, containerStyles]}>
          <View
            style={[
              Layout.row,
              Layout.alignItemsCenter,
              Layout.justifyContentSpaceBetween,
              !isIOS && Gutters.regularTPadding,
            ]}>
            <View
              style={[
                {
                  width: 30,
                },
              ]}>
              {leftSide}
            </View>
            <View style={[Layout.flexGrow]}>
              {title ? (
                <TouchableWithoutFeedback onPress={onPress}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.title,
                      {
                        textAlign: 'center',
                      },
                    ]}>
                    {title}
                  </Text>
                </TouchableWithoutFeedback>
              ) : (
                <View>
                  {subPage && (
                    <View
                      style={{
                        ...styles.logoContent,
                        ...{
                          paddingTop: isIOS ? 0 : 0,
                        },
                      }}>
                      <FastImage
                        style={styles.logo}
                        source={{
                          uri: 'https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png',
                          headers: {Authorization: 'someAuthToken'},
                          priority: FastImage.priority.normal,
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={{width: 30}}>{rightSide}</View>
          </View>
          <View>
            {subtitle && !subPage && (
              <Text
                style={{
                  ...styles.subtitle,
                  ...{marginLeft: 0},
                }}>
                {subtitle}
              </Text>
            )}
            {subtitle && subPage && (
              <Text
                style={{
                  ...{
                    textAlign: 'center',
                    fontSize: 13,
                    marginBottom: 5,
                  },
                }}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.childrenWrapper}>{children}</View>
      )}
    </React.Fragment>
  );

  if (background) {
    return (
      <React.Fragment>
        <View style={styles.imageContent}>
          <TitleWrapper />
        </View>
        <View
          style={{
            ...styles.imageMask,
            ...{
              backgroundColor: Colors.mediterranean,
            },
          }}
        />
        <Image source={background} style={styles.image} />
      </React.Fragment>
    );
  }
  return (
    <View
      style={{
        ...styles.container,
        ...{
          // height: subPage ? 40 : getHightByRoute(screenKey),
        },
      }}>
      <TitleWrapper />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  box: {
    flexBasis: 1,
    flexGrow: 1,
    flexShrink: 1,
  },
  titleWrapper: {
    justifyContent: 'flex-end',
    width: '100%',
    marginBottom: 0,
  },
  childrenWrapper: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  logo: {
    width: 80,
    height: 30,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    letterSpacing: 2,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoContent: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 20,
  },
  image: {
    width: '100%',
    height: 230,
    borderBottomLeftRadius: 50,
  },
  imageMask: {
    width: '100%',
    height: 230,
    opacity: 0.7,
    position: 'absolute',
    zIndex: 10,
    borderBottomLeftRadius: 50,
  },
  imageContent: {
    width: '100%',
    height: 230,
    position: 'absolute',
    zIndex: 11,
    borderBottomLeftRadius: 50,
    paddingHorizontal: 20,
  },
});

export default TitlePage;
