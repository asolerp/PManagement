import React from 'react';
import { useRoute } from '@react-navigation/native';
import {
  Image,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { isIOS } from '../utils/platform';

const TitlePage = ({
  title,
  subtitle,
  leftSide,
  rightSide,
  children,
  subPage = false,
  background,
  onPress,
  containerStyles
}) => {
  const {
    params: { screenKey = '' }
  } = useRoute();

  const TitleWrapper = () => (
    <>
      {!children ? (
        <View style={[styles.flex, styles.justifyCenter, containerStyles]}>
          <View
            style={[
              styles.row,
              styles.alignCenter,
              styles.spaceBetween,
              !isIOS && styles.paddingTop
            ]}
          >
            <View style={styles.sideBox}>{leftSide}</View>
            <View style={styles.flexGrow}>
              {title ? (
                <TouchableWithoutFeedback onPress={onPress}>
                  <Text
                    numberOfLines={2}
                    style={[styles.title, styles.textCenter]}
                  >
                    {title}
                  </Text>
                </TouchableWithoutFeedback>
              ) : (
                <View>
                  {subPage && (
                    <View
                      style={[
                        styles.logoContent,
                        !isIOS && styles.logoContentAndroid
                      ]}
                    >
                      <FastImage
                        style={styles.logo}
                        source={{
                          uri: 'https://res.cloudinary.com/enalbis/image/upload/v1639415421/PortManagement/varios/port_logo_pv4jqk.png',
                          priority: FastImage.priority.normal
                        }}
                        resizeMode={FastImage.resizeMode.contain}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
            <View style={styles.sideBox}>{rightSide}</View>
          </View>
          <View>
            {subtitle && !subPage && (
              <Text style={styles.subtitle}>{subtitle}</Text>
            )}
            {subtitle && subPage && (
              <Text style={styles.subtitleSubPage}>{subtitle}</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.childrenWrapper}>{children}</View>
      )}
    </>
  );

  if (background) {
    return (
      <>
        <View style={styles.imageContent}>
          <TitleWrapper />
        </View>
        <View style={styles.imageMask} />
        <Image source={background} style={styles.image} />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <TitleWrapper />
    </View>
  );
};

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: 'center'
  },
  childrenWrapper: {
    justifyContent: 'flex-start',
    width: '100%'
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  flex: {
    flex: 1
  },
  flexGrow: {
    flexGrow: 1
  },
  image: {
    borderBottomLeftRadius: 50,
    height: 230,
    width: '100%'
  },
  imageContent: {
    borderBottomLeftRadius: 50,
    height: 230,
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
    zIndex: 11
  },
  imageMask: {
    backgroundColor: '#55A5AD',
    borderBottomLeftRadius: 50,
    height: 230,
    opacity: 0.7,
    position: 'absolute',
    width: '100%',
    zIndex: 10
  },
  justifyCenter: {
    justifyContent: 'center'
  },
  logo: {
    height: 30,
    resizeMode: 'contain',
    width: 80
  },
  logoContent: {
    alignItems: 'center',
    marginTop: 0
  },
  logoContentAndroid: {
    marginTop: 20
  },
  paddingTop: {
    paddingTop: 16
  },
  row: {
    flexDirection: 'row'
  },
  sideBox: {
    width: 50
  },
  spaceBetween: {
    justifyContent: 'space-between'
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 0
  },
  subtitleSubPage: {
    fontSize: 13,
    marginBottom: 5,
    textAlign: 'center'
  },
  textCenter: {
    textAlign: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2
  }
});

export default TitlePage;
