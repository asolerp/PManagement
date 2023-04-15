import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {DEFAULT_IMAGE} from '../../constants/general';

import {useTheme} from '../../Theme';
import theme from '../../Theme/Theme';
import {Colors, FontSize} from '../../Theme/Variables';

import Avatar from '../Avatar';

import Badge from '../Elements/Badge';

const FULL_WIDTH = '100%';
const CARD_WIDTH = 220;

export const ListItem = ({
  date,
  title,
  house,
  counter,
  workers,
  endHour,
  subtitle,
  startHour,
  dateVariant,
  statusPercentage,
  fullWidth = false,
  statusColor = Colors.pm,
}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  return (
    <View
      style={[
        Layout.row,
        Gutters.smallHPadding,
        Gutters.smallVPadding,
        Gutters.smallBMargin,
        styles.checkWrapper,
        Gutters.mediumRMargin,
        {
          width: fullWidth ? FULL_WIDTH : CARD_WIDTH,
        },
      ]}>
      <View style={[{height: '100%'}]}>
        {statusColor && (
          <View
            style={[styles.statusBarContainer, {backgroundColor: statusColor}]}
          />
        )}
      </View>
      <View style={[Layout.grow]}>
        <View
          style={[
            Layout.row,
            Layout.justifyContentSpaceBetween,
            Gutters.smallBMargin,
          ]}>
          <Badge type="outline" text={house} variant="purple" iconName="home" />
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
          <View>
            {title && (
              <Text
                style={[Fonts.titleCard, Gutters.smallBMargin]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={styles.infoStyle}
                numberOfLines={2}
                ellipsizeMode="tail">
                {subtitle}
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
            ]}>
            <View style={[Layout.row]}>
              {workers?.map((worker, i) => (
                <Avatar
                  overlap={workers?.length > 1}
                  index={i}
                  id={worker.id}
                  key={worker.id}
                  uri={worker.profileImage?.small || DEFAULT_IMAGE}
                  size="tiny"
                />
              ))}
            </View>
            {startHour && endHour && (
              <View style={[theme.flexRow]}>
                <Badge text={startHour} />
                <View style={[theme.mL2]} />
                <Badge variant="danger" text={endHour} />
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderColor: Colors.gray300,
    borderWidth: 1,
  },
  checkDoneMask: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.pm}90`,
    zIndex: 9999,
    width: 220,
    height: 165,
    borderRadius: 10,
  },
  statusBarContainer: {
    width: 8,
    borderRadius: 20,
    flexGrow: 1,
    marginRight: 10,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  infoStyle: {
    color: 'black',
    paddingRight: 20,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
    fontWeight: '500',
    color: Colors.darkBlue,
  },
  bold: {
    fontSize: FontSize.small,
    fontWeight: 'bold',
    color: Colors.darkBlue,
    marginBottom: 10,
  },
  date: {
    fontSize: 12,
    color: Colors.darkBlue,
  },
  buble: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  badget: {
    backgroundColor: Colors.success,
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
