import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {GREY_1} from '../styles/colors';

import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';

export const CustomSelect = ({
  backgroundColor = `${Colors.white}`,
  withBubbles = false,
  onPressBubble,
  disabled = false,
  onPress,
  iconName = 'chevron-forward-outline',
  label,
  placeHolder,
  value,
}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  return (
    <View style={[styles.container]}>
      {label && (
        <Text style={[Gutters.smallBMargin, {color: Colors.white}]}>
          {label}
        </Text>
      )}
      <Pressable onPress={!disabled && onPress} style={{width: '100%'}}>
        <View style={[Layout.row]}>
          <View
            style={[
              Gutters.smallVPadding,
              Gutters.smallHPadding,
              styles.inputContainer,
              {backgroundColor},
            ]}>
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Layout.justifyContentSpaceBetween,
                {width: '100%'},
              ]}>
              {value ? (
                <Text style={[Fonts.pageNormalText]}>{value}</Text>
              ) : (
                <Text
                  style={[
                    Layout.row,
                    Layout.alignItemsCenter,
                    Layout.justifyContentCenter,
                    styles.placeHolder,
                  ]}>
                  {placeHolder}
                </Text>
              )}
              <Icon name={iconName} size={30} />
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  bubble: {
    marginRight: 10,
    marginVertical: 5,
  },
  inputContainer: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREY_1,
  },
  placeHolder: {
    opacity: 0.5,
  },
});
