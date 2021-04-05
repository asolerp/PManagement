import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
    marginRight: 10,
  },
  icon: {
    marginLeft: 5,
  },
  textStyle: {
    color: 'white',
  },
});

const InfoIcon = ({info, icon, color, active}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIcon = () => {
    Animated.sequence([
      Animated.delay(100),
      Animated.timing(scaleAnim, {
        toValue: 0.7,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      // Call on self when animation completes
    ]).start(animateIcon);
  };

  // useEffect(() => {
  //   if (active) {
  //     animateIcon();
  //   } else {
  //     Animated.timing(scaleAnim).stop();
  //   }
  // }, [active]);

  return (
    <Animated.View
      style={{
        ...styles.container,
        ...{backgroundColor: color, transform: [{scale: scaleAnim}]},
      }}>
      <Text style={styles.textStyle}>{info}</Text>
      {icon && (
        <Icon name={icon} size={15} color={'white'} style={styles.icon} />
      )}
    </Animated.View>
  );
};

export default InfoIcon;
