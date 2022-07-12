import React from 'react';

import {Text, View, StyleSheet} from 'react-native';
import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import Badge from '../Elements/Badge';

export const FinishedListItem = ({
  date,
  title,
  house,
  counter,
  workers,
  subtitle,
  dateVariant,
  statusPercentage,
  fullWidth = true,
}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  return (
    <View
      style={[
        Layout.row,
        Gutters.smallHPadding,
        Gutters.smallVPadding,
        Gutters.smallBMargin,
        Gutters.mediumRMargin,
        styles.checkWrapper,
      ]}>
      <View style={[Layout.grow]}>
        <View
          style={[
            Layout.row,
            Layout.justifyContentSpaceBetween,
            Gutters.smallBMargin,
          ]}>
          <Badge
            type="outline"
            text={house}
            variant="purple"
            iconName="home"
            containerStyle={{width: 100}}
          />
          <Badge
            text={date}
            variant={dateVariant}
            type="outline"
            iconName="schedule"
          />
          <Badge
            text={counter}
            variant={counter === 0 ? 'pm' : 'danger'}
            type="outline"
            iconName="message"
            containerStyle={[Gutters.smallRMargin]}
          />
        </View>
        <View style={[Layout.grow]}>
          <View style={[Gutters.smallBMargin, Gutters.smallBMargin]}>
            {title && (
              <Text
                style={[Fonts.titleCard, Gutters.smallBMargin]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {title}
              </Text>
            )}
          </View>
        </View>
        <View style={[Layout.justifyContentEnd]}>
          <View
            style={[
              Layout.row,
              Layout.alignItemsCenter,
              Layout.justifyContentSpaceBetween,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkWrapper: {
    minHeight: 50,
    maxHeight: 100,
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowColor: '#4f4f4f',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
});
