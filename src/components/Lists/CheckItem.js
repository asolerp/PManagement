import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import useNoReadMessages from '../../hooks/useNoReadMessages';

import {useTheme} from '../../Theme';
import {Colors, FontSize} from '../../Theme/Variables';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {parseDateWithText, parsePercentageDone} from '../../utils/parsers';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

import Avatar from '../Avatar';
import Counter from '../Counter';
import Badge from '../Elements/Badge';

const CheckItem = ({item}) => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {noReadCounter} = useNoReadMessages({
    collection: CHECKLISTS,
    docId: item.id,
  });

  return (
    <View
      style={[
        styles.checkWrapper,
        Gutters.mediumRMargin,
        {
          backgroundColor: Colors.white,
          borderTopColor: Colors.lowGrey,
          borderRightColor: Colors.lowGrey,
          borderBottomColor: Colors.lowGrey,
          borderLeftColor: parsePercentageDone(item?.done / item?.total),
        },
      ]}>
      <View style={[Layout.fill]}>
        <View
          style={[
            Layout.rowCenter,
            Layout.justifyContentStart,
            Gutters.smallBMargin,
          ]}>
          <Badge
            text={parseDateWithText(item?.date).text}
            variant={parseDateWithText(item?.date).variant}
          />

          {noReadCounter > 0 && <Counter count={noReadCounter} />}
        </View>
        <View style={styles.infoWrapper}>
          <Text style={styles.infoStyle} ellipsizeMode="tail" numberOfLines={2}>
            {item?.observations}
          </Text>
          <Badge text={item?.house?.[0].houseName} variant="purple" />
        </View>
        <View
          style={[
            Layout.grow,
            Layout.rowCenter,
            Layout.justifyContentSpaceBetween,
            Layout.alignItemsCenter,
            Gutters.smallVMargin,
          ]}>
          <View style={[Layout.row]}>
            {item?.workers?.map((worker, i) => (
              <Avatar
                overlap={item?.workers?.length > 1}
                index={i}
                id={worker.id}
                key={worker.id}
                uri={worker.profileImage}
                size="medium"
              />
            ))}
          </View>
          <AnimatedCircularProgress
            size={30}
            width={3}
            fill={Math.round((item?.done / item?.total) * 100)}
            tintColor={Colors.pm}
            backgroundColor={Colors.lowGrey}
            backgroundWidth={2}
            onAnimationComplete={() => console.log('onAnimationComplete')}>
            {() => (
              <Text style={{fontSize: 7}}>
                {Math.round((item?.done / item?.total) * 100)}%
              </Text>
            )}
          </AnimatedCircularProgress>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 165,
    borderLeftWidth: 10,
    borderWidth: 1,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  infoStyle: {
    color: Colors.darkGrey,
    height: 40,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
    marginVertical: 20,
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

export default CheckItem;
