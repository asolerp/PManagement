import React from 'react';
import {useRoute} from '@react-navigation/native';
import {Image, View, Text, StyleSheet, Platform} from 'react-native';

// UI
import LinearGradient from 'react-native-linear-gradient';

// Utils
import {getHightByRoute} from '../utils/parsers';

const TitlePage = ({
  title,
  subtitle,
  leftSide,
  children,
  subPage = false,
  color = 'white',
}) => {
  const route = useRoute();

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={['#4D84A0', '#55A7AE', '#67B26F']}
      style={{
        ...styles.container,
        ...{
          height: subPage ? 90 : getHightByRoute(route.name),
          paddingTop: children ? (Platform.OS === 'ios' ? 50 : 0) : 0,
        },
      }}>
      <View
        style={{
          ...styles.titleWrapper,
          ...{
            justifyContent: 'center',
            marginTop: Platform.OS === 'ios' ? 0 : 20,
          },
        }}>
        {title ? (
          <React.Fragment>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                }}>
                {leftSide && (
                  <View
                    style={{
                      ...{
                        width: 30,
                        marginTop: Platform.OS === 'ios' ? 40 : 0,
                      },
                    }}>
                    {leftSide}
                  </View>
                )}
                <View
                  style={{
                    ...styles.box,
                    ...{marginHorizontal: leftSide ? 20 : 0},
                  }}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                      ...styles.title,
                      ...{
                        color: color,
                        marginTop: leftSide
                          ? Platform.OS === 'ios'
                            ? 40
                            : 0
                          : 0,
                        // fontSize: leftSide ? 20 : 35,
                        textAlign: leftSide ? 'center' : 'left',
                      },
                    }}>
                    {title}
                  </Text>
                </View>
                <View style={{...{width: 30}}} />
              </View>
              <View>
                {subtitle && !subPage && (
                  <Text
                    style={{
                      ...styles.subtitle,
                      ...{color: color, marginLeft: leftSide ? 0 : 0},
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
          </React.Fragment>
        ) : (
          <View
            style={{
              alignItems: 'center',
              marginTop: Platform.OS === 'ios' ? 0 : 20,
            }}>
            {/* <Text>Hola</Text> */}
            <Image
              style={styles.logo}
              source={require('../assets/images/logo_pm_servicios.png')}
            />
          </View>
        )}
      </View>
      {children && <View style={styles.childrenWrapper}>{children}</View>}
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
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  logo: {
    width: 80,
    height: 40,
    margin: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default TitlePage;
