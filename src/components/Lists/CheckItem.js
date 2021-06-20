import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import useNoReadMessages from '../../hooks/useNoReadMessages';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import {CHECKLISTS} from '../../utils/firebaseKeys';
import {parseDateWithText, parsePercentageDone} from '../../utils/parsers';
import Avatar from '../Avatar';
import Counter from '../Counter';

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
            Layout.justifyContentSpaceBetween,
            Gutters.smallBMargin,
          ]}>
          <Text style={styles.date}>🕜 {parseDateWithText(item?.date)}</Text>
          {noReadCounter > 0 && <Counter count={noReadCounter} />}
        </View>
        <View style={styles.infoWrapper}>
          <Text style={[styles.bold, Gutters.smallBMargin]}>
            {item?.house?.[0].houseName}
          </Text>
          <Text style={styles.infoStyle} ellipsizeMode="tail" numberOfLines={2}>
            {item?.observations}
          </Text>
        </View>
        <View
          style={[
            Layout.grow,
            Layout.rowCenter,
            Layout.justifyContentSpaceBetween,
            Layout.alignItemsCenter,
            Gutters.smallVMargin,
          ]}>
          <View style={[Layout.rowCenter, Gutters.smallLMargin]}>
            {item?.workers?.map((worker) => (
              <Avatar
                key={worker.id}
                uri={worker.profileImage}
                size="medium"
                overlap={item?.workers?.length > 0}
              />
            ))}
          </View>
          <Text style={[Fonts.textSmall]}>
            {item?.done}/{item?.total}
          </Text>
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
    height: 170,
    borderLeftWidth: 10,
    borderWidth: 1,
  },
  avatarWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  infoWrapper: {
    marginTop: 10,
  },
  infoStyle: {
    color: Colors.darkBlue,
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
    fontWeight: '600',
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
