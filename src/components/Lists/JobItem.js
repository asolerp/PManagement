import {View, Text, StyleSheet} from 'react-native';

import React from 'react';
import useNoReadMessages from '../../hooks/useNoReadMessages';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import {JOBS} from '../../utils/firebaseKeys';
import {parseDateWithText} from '../../utils/parsers';
import Avatar from '../Avatar';
import Counter from '../Counter';
import Badge from '../Elements/Badge';
import {useTranslation} from 'react-i18next';
import {useLocales} from '../../utils/useLocales';

const JobItem = ({item}) => {
  const {Layout, Gutters, Fonts} = useTheme();
  const {t} = useTranslation();
  const {locale} = useLocales();
  const {noReadCounter} = useNoReadMessages({
    collection: JOBS,
    docId: item?.id,
  });

  const taksDescByLocale =
    item?.task?.locales?.[locale]?.desc ||
    item?.task?.locales?.en.desc ||
    item?.task?.desc;

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
          <Badge
            text={t(parseDateWithText(item?.date).text, {
              numberOfDays: parseDateWithText(item?.date).metaData
                ?.numberOfDays,
            })}
            variant={parseDateWithText(item?.date).variant}
          />
          {noReadCounter > 0 && <Counter count={noReadCounter} />}
        </View>
        <Text style={[Fonts.titleCard]} numberOfLines={2} ellipsizeMode="tail">
          {taksDescByLocale}
        </Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.infoStyle} ellipsizeMode="tail" numberOfLines={2}>
            {item?.observations}
          </Text>
          <Badge
            text={item?.house?.[0].houseName}
            variant="purple"
            containerStyle={Gutters.smallBMargin}
          />
        </View>
        <View
          style={[
            Layout.row,
            Layout.justifyContentSpaceBetween,
            Layout.alignItemsCenter,
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
    height: 210,
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
    color: Colors.darkGrey,
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
    height: 40,
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
