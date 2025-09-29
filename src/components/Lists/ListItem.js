import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../Theme';
import theme from '../../Theme/Theme';
import { Colors, FontSize } from '../../Theme/Variables';

import Badge from '../Elements/Badge';

const FULL_WIDTH = '100%';
const CARD_WIDTH = 220;

export const ListItem = ({
  date,
  title,
  house,
  workers,
  endHour,
  subtitle,
  startHour,
  dateVariant,
  fullWidth = false,
  statusColor = Colors.pm
}) => {
  const { Layout, Gutters } = useTheme();

  return (
    <View
      style={[
        Layout.row,
        Gutters.smallHPadding,
        Gutters.smallVPadding,
        Gutters.smallBMargin,
        styles.checkWrapper,
        Gutters.smallRMargin,
        {
          width: fullWidth ? FULL_WIDTH : CARD_WIDTH
        }
      ]}
    >
      <View style={{ height: '100%' }}>
        {statusColor && (
          <View
            style={[
              styles.statusBarContainer,
              { backgroundColor: statusColor }
            ]}
          />
        )}
      </View>
      <View style={Layout.grow}>
        <View
          style={[
            Layout.row,
            Layout.justifyContentSpaceBetween,
            Layout.alignItemsCenter,
            Gutters.tinyBMargin
          ]}
        >
          <Badge type="outline" text={house} variant="purple" iconName="home" />
          <Badge
            text={date}
            variant={dateVariant}
            type="outline"
            iconName="schedule"
          />
        </View>
        <View>
          <View>
            {title && (
              <Text
                style={[styles.titleText, { marginBottom: 4 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={styles.subtitleText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        <View style={[Layout.justifyContentEnd, Gutters.tinyTMargin]}>
          {/* Información de trabajadores */}
          {workers && workers.length > 0 && (
            <View style={Gutters.tinyBMargin}>
              <Text style={styles.workersLabel}>Asignado a:</Text>
              <View
                style={[
                  Layout.row,
                  Layout.alignItemsCenter,
                  { flexWrap: 'wrap' }
                ]}
              >
                {workers.slice(0, 2).map((worker, index) => (
                  <Badge
                    key={worker.id || index}
                    text={worker.name || worker.displayName || worker.firstName}
                    variant="success"
                    type="outline"
                    iconName="person"
                    containerStyle={[Gutters.tinyRMargin, Gutters.tinyTMargin]}
                  />
                ))}
                {workers.length > 2 && (
                  <Badge
                    text={`+${workers.length - 2}`}
                    variant="gray"
                    type="outline"
                    containerStyle={[Gutters.tinyRMargin, Gutters.tinyTMargin]}
                  />
                )}
              </View>
            </View>
          )}

          {/* Horarios si existen */}
          {startHour && endHour && (
            <View style={[Layout.row, Layout.alignItemsCenter]}>
              <Badge text={startHour} variant="pm" type="solid" />
              <View style={theme.mL2} />
              <Badge variant="danger" text={endHour} type="solid" />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start'
  },
  badget: {
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 100,
    height: 30,
    justifyContent: 'center',
    width: 30
  },
  bold: {
    color: Colors.darkBlue,
    fontSize: FontSize.small,
    fontWeight: 'bold',
    marginBottom: 10
  },
  buble: {
    borderRadius: 100,
    height: 20,
    width: 20
  },
  checkDoneMask: {
    alignItems: 'center',
    backgroundColor: `${Colors.pm}90`,
    borderRadius: 10,
    height: 165,
    justifyContent: 'center',
    position: 'absolute',
    width: 220,
    zIndex: 9999
  },
  checkWrapper: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray300,
    borderRadius: 10,
    borderWidth: 1
  },
  date: {
    color: Colors.darkBlue,
    fontSize: 12
  },
  filterWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  infoWrapper: {
    flexDirection: 'column',
    justifyContent: 'flex-start'
  },
  statusBarContainer: {
    borderRadius: 20,
    flexGrow: 1,
    marginRight: 10,
    width: 8
  },
  subtitleText: {
    color: Colors.gray700,
    fontSize: FontSize.small,
    fontWeight: '400',
    lineHeight: FontSize.small * 1.3,
    paddingRight: 16
  },
  title: {
    color: Colors.darkBlue,
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 5
  },
  titleText: {
    color: Colors.darkBlue,
    fontSize: FontSize.regular,
    fontWeight: '600',
    lineHeight: FontSize.regular * 1.2
  },
  titleWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  workersLabel: {
    color: Colors.gray600,
    fontSize: FontSize.tiny,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: 'uppercase'
  }
});
