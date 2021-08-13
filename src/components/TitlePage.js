import React from 'react';
import {useRoute} from '@react-navigation/native';
import {Image, View, Text, StyleSheet, Platform} from 'react-native';

// UI
import LinearGradient from 'react-native-linear-gradient';

// Utils
import {getHightByRoute} from '../utils/parsers';
import {Colors} from '../Theme/Variables';
import {useTheme} from '../Theme';
import {TouchableWithoutFeedback} from 'react-native';

const TitlePage = ({
  title,
  subtitle,
  leftSide,
  rightSide,
  children,
  subPage = false,
  color = 'white',
  background,
  onPress,
}) => {
  const {
    params: {screenKey = ''},
  } = useRoute();
  const {Layout} = useTheme();

  const TitleWrapper = () => (
    <React.Fragment>
      {!children ? (
        <View
          style={{
            ...styles.titleWrapper,
            ...{
              justifyContent: 'center',
              marginTop: Platform.OS === 'ios' ? 0 : 20,
            },
          }}>
          <View>
            <View style={[Layout.rowCenter]}>
              <View
                style={{
                  ...{
                    width: 30,
                    marginTop: Platform.OS === 'ios' ? 30 : 0,
                  },
                }}>
                {leftSide}
              </View>
              <View
                style={{
                  ...styles.box,
                  ...{marginHorizontal: 20},
                }}>
                {title ? (
                  <TouchableWithoutFeedback onPress={onPress}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={2}
                      style={{
                        ...styles.title,
                        ...{
                          color: color,
                          marginTop: Platform.OS === 'ios' ? 30 : 0,
                          textAlign: 'center',
                        },
                      }}>
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
                            paddingTop: 35,
                          },
                        }}>
                        <Image
                          style={styles.logo}
                          source={require('../assets/images/logo_pm_servicios.png')}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>
              <View
                style={{
                  ...{
                    width: 30,
                    marginTop: Platform.OS === 'ios' ? 30 : 0,
                  },
                }}>
                {rightSide}
              </View>
            </View>
            <View>
              {subtitle && !subPage && (
                <Text
                  style={{
                    ...styles.subtitle,
                    ...{color: color, marginLeft: 0},
                  }}>
                  {subtitle}
                </Text>
              )}
              {subtitle && subPage && (
                <Text
                  style={{
                    ...{
                      color: color,
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
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={['#4D84A0', '#55A7AE', '#67B26F']}
      style={{
        ...styles.container,
        ...{
          height: subPage ? 90 : getHightByRoute(screenKey),
          paddingTop: children ? (Platform.OS === 'ios' ? 50 : 0) : 0,
        },
      }}>
      <TitleWrapper />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 50,
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
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 40,
    margin: 0,
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
