import React from 'react';
import {ActivityIndicator} from 'react-native';
import {TouchableOpacity} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientButton = ({
  colors,
  wrapperStyle,
  onPress,
  title,
  loading = true,
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{...styles.container, ...wrapperStyle}}>
        <LinearGradient
          colors={colors}
          style={styles.gradientButton}
          start={{y: 0.0, x: 0.0}}
          end={{y: 0.0, x: 1.0}}>
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.loginButton}>{title}</Text>
          )}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  gradientButton: {
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 20,
    textAlign: 'center',
    color: 'white',
  },
});

export default GradientButton;
