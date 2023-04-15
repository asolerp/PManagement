import React from 'react';

import {Text, View, StyleSheet} from 'react-native';
import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import {Colors} from '../../Theme/Variables';
import Badge from '../Elements/Badge';

export const FinishedListItem = ({
  date,
  title,
  house,
  counter,
  workers,
  subtitle,
  startHour,
  endHour,
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
            Layout.alignItemsCenter,
          ]}>
          <Badge type="outline" text="Finished" variant="danger" />
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
        <View>
          {title && (
            <View style={[Gutters.smallBMargin, Gutters.smallBMargin]}>
              <Text
                style={[Fonts.titleCard, Gutters.smallBMargin]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {title}
              </Text>
            </View>
          )}
          {startHour && endHour && (
            <View style={[theme.flexRow]}>
              <Badge text={startHour} />
              <View style={[theme.mL2]} />
              <Badge variant="danger" text={endHour} />
            </View>
          )}
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
    width: '100%',
    backgroundColor: Colors.white,
    borderColor: Colors.gray300,
    borderWidth: 1,
    borderRadius: 10,
  },
});
