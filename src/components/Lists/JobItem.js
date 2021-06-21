import {View, Text, StyleSheet} from 'react-native';

import React from 'react';
import useNoReadMessages from '../../hooks/useNoReadMessages';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import {JOBS} from '../../utils/firebaseKeys';
import {parseDateWithText, parseStateIncidecne} from '../../utils/parsers';
import Avatar from '../Avatar';
import Counter from '../Counter';

const JobItem = ({item}) => {
  const {Layout, Gutters} = useTheme();

  const {noReadCounter} = useNoReadMessages({
    collection: JOBS,
    docId: item?._id,
  });

  return (
    <View
      style={[
        styles.incidenceWrapper,
        Gutters.mediumRMargin,
        {
          borderWidth: 1,
          borderTopColor: Colors.lowGrey,
          borderRightColor: Colors.lowGrey,
          borderBottomColor: Colors.lowGrey,
          borderLeftColor: Colors.pm,
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
          <Counter count={noReadCounter} />
        </View>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {item?.task?.desc}
        </Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.infoStyle} ellipsizeMode="tail" numberOfLines={2}>
            {item?.observations}
          </Text>
          <Text style={[styles.bold]}>{item?.house?.[0].houseName}</Text>
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  incidenceWrapper: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 230,
    borderLeftWidth: 10,
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
    height: 30,
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
    width: 10,
    height: 10,
    borderRadius: 100,
  },
  filterWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginVertical: 20,
  },
  badget: {
    color: Colors.white,
    backgroundColor: Colors.danger,
    width: 30,
    height: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default JobItem;
