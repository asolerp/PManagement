import React from 'react';
import {Dimensions} from 'react-native';
import {ActivityIndicator} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.success,
    opacity: 0.8,
    position: 'absolute',
    zIndex: 5,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  content: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    zIndex: 10,
  },
});

const Loading = () => {
  const {Layout, Fonts, Gutters} = useTheme();
  return (
    <>
      <View style={[Layout.fill, Layout.colCenter, styles.wrapper]} />
      <View style={[Layout.fill, Layout.colCenter, styles.content]}>
        <ActivityIndicator
          style={[Gutters.mediumBMargin]}
          color={Colors.white}
        />
        <Text style={[Fonts.textWhite]}>Loading ...</Text>
      </View>
    </>
  );
};

export default Loading;
