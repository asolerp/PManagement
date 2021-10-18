import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import {useTheme} from '../../Theme';
import {Colors, FontSize} from '../../Theme/Variables';

import {AnimatedCircularProgress} from 'react-native-circular-progress';

import Avatar from '../Avatar';
import * as Progress from 'react-native-progress';
import Badge from '../Elements/Badge';
import {Divider} from 'react-native-elements/dist/divider/Divider';

const CARD_WIDTH = 220;

export const ListItem = ({
  date,
  title,
  house,
  header,
  footer,
  counter,
  workers,
  subtitle,
  dateVariant,
  statusPercentage,
  fullWidth = false,
  statusColor = Colors.pm,
}) => {
  const {Layout, Gutters, Fonts} = useTheme();

  return (
    <React.Fragment>
      <View
        style={[
          Layout.row,
          Gutters.tinyBMargin,
          Gutters.smallAPadding,
          styles.checkWrapper,
          Gutters.mediumRMargin,
          {
            width: fullWidth ? '100%' : CARD_WIDTH,
          },
        ]}>
        {statusColor && (
          <View
            style={[
              Gutters.smallRMargin,
              styles.statusBarContainer,
              {backgroundColor: statusColor},
            ]}
          />
        )}
        <View style={[Layout.fill]}>
          <View
            style={[
              Layout.row,
              Layout.alignItemsCenter,
              Layout.justifyContentSpaceBetween,
              Gutters.smallBMargin,
            ]}>
            {title && (
              <Text
                style={[Fonts.titleCard]}
                numberOfLines={2}
                ellipsizeMode="tail">
                {title}
              </Text>
            )}
          </View>
          <View style={[Gutters.smallBMargin, styles.infoWrapper]}>
            {subtitle && (
              <Text
                style={styles.infoStyle}
                ellipsizeMode="tail"
                numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
          <View style={[Layout.grow, Layout.col, Layout.justifyContentEnd]}>
            {statusPercentage && (
              <View style={[Gutters.smallBMargin]}>
                <Progress.Bar
                  borderColor={Colors.pm}
                  color={Colors.pm}
                  progress={statusPercentage}
                  width={180}
                />
              </View>
            )}
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Layout.justifyContentSpaceBetween,
              ]}>
              <Badge
                type="outline"
                text={house}
                variant="purple"
                iconName="home"
              />
              <View style={[Layout.row]}>
                {workers?.map((worker, i) => (
                  <Avatar
                    overlap={workers?.length > 1}
                    index={i}
                    id={worker.id}
                    key={worker.id}
                    uri={worker.profileImage}
                    size="tiny"
                  />
                ))}
              </View>
            </View>
            <Divider
              color={Colors.darkGrey}
              style={[Gutters.smallTMargin, Gutters.tinyBMargin]}
            />
            <View
              style={[
                Layout.row,
                Layout.alignItemsCenter,
                Layout.justifyContentSpaceBetween,
                Gutters.tinyVPadding,
              ]}>
              <Badge
                text={counter}
                variant={counter === 0 ? 'pm' : 'danger'}
                type="outline"
                iconName="message"
                containerStyle={[Gutters.smallRMargin]}
              />
              <Badge
                text={date}
                variant={dateVariant}
                type="outline"
                iconName="schedule"
              />
            </View>
          </View>
        </View>
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  checkWrapper: {
    borderWidth: 1,
    borderColor: Colors.lowGrey,
    borderRadius: 10,
    minHeight: 165,
    maxHeight: 185,
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
    height: '100%',
    borderRadius: 20,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  infoStyle: {
    color: 'black',
    maxHeight: 40,
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
    height: 60,
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
