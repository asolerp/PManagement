import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../../Theme';
import {HDivider} from '../UI/HDivider';

export const MenuItem = ({
  title,
  textStyle,
  onPress,
  iconName,
  iconColor = 'black',
}) => {
  const {Gutters, Layout, Fonts} = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        style={[
          Layout.row,
          Layout.justifyContentSpaceBetween,
          Layout.alignItemsCenter,
          Gutters.smallAPadding,
        ]}>
        <View style={[Layout.row, Layout.alignItemsCenter]}>
          <Icon name={iconName} size={25} color={iconColor} />
          <Text style={[Gutters.smallLMargin, Fonts.textSm, textStyle]}>
            {title}
          </Text>
        </View>
        <Icon name="ios-chevron-forward" size={25} color="black" />
      </TouchableOpacity>
      <HDivider />
    </>
  );
};
