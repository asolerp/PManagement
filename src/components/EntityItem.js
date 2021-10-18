import moment from 'moment';
import React from 'react';
import {TouchableOpacity, StyleSheet, View, Text} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import useNoReadMessages from '../hooks/useNoReadMessages';
import {DARK_BLUE, GREY_1} from '../styles/colors';
import {useTheme} from '../Theme';
import {Colors} from '../Theme/Variables';
import {CHECKLISTS} from '../utils/firebaseKeys';
import Avatar from '../components/Avatar';

// Utils
import {minimizetext} from '../utils/parsers';
import {parsePercentageDone} from '../utils/parsers';
import Counter from './Counter';
import Badge from './Elements/Badge';
import {useTranslation} from 'react-i18next';
import {Divider} from 'react-native-elements';

const EntityItem = ({
  statusColor,
  title,
  subtitle,
  workers,
  date,
  dateVariant,
  house,
  check,
  onPress,
}) => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const {noReadCounter} = useNoReadMessages({
    collection: CHECKLISTS,
    docId: check.id,
  });

  return (
    <React.Fragment>
      {/* {noReadCounter > 0 && (
        <Counter
          size="big"
          count={noReadCounter}
          customStyles={{
            position: 'absolute',
            zIndex: 1000,
            right: 5,
            top: 2,
          }}
        />
      )} */}
      <TouchableOpacity onPress={onPress}>
        <View style={[Layout.row, styles.checkItemWrapper]}>
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
              <Badge
                type="outline"
                text={house}
                variant="purple"
                iconName="home"
              />
              <Divider
                color={Colors.darkGrey}
                style={[Gutters.smallTMargin, Gutters.tinyBMargin]}
              />
              <View
                style={[
                  Layout.row,
                  Layout.alignItemsCenter,
                  Layout.justifyContentSpaceBetween,
                ]}>
                <View style={[Layout.row]}>
                  <Badge
                    text={noReadCounter}
                    variant={noReadCounter === 0 ? dateVariant : 'danger'}
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
            </View>
          </View>
          <View style={styles.percentageContainer}>
            <AnimatedCircularProgress
              size={50}
              width={3}
              fill={Math.round((check?.done / check?.total) * 100)}
              tintColor={Colors.pm}
              backgroundColor={Colors.lowGrey}
              backgroundWidth={2}>
              {() => (
                <Text style={{fontSize: 12}}>
                  {Math.round((check?.done / check?.total) * 100)}%
                </Text>
              )}
            </AnimatedCircularProgress>
          </View>
        </View>
      </TouchableOpacity>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  checkItemWrapper: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: GREY_1,
  },
  statusBarContainer: {
    width: 8,
    height: '100%',
    borderRadius: 20,
  },
  checkText: {
    marginTop: 5,
    color: DARK_BLUE,
  },
  priority: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 10,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'white',
  },
  date: {
    fontSize: 10,
  },
  countStyle: {
    color: DARK_BLUE,
    fontWeight: '600',
    fontSize: 14,
  },
  percentageContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
});

export default EntityItem;
