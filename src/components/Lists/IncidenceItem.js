import React from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text, StyleSheet} from 'react-native';

import useNoReadMessages from '../../hooks/useNoReadMessages';

import {useTheme} from '../../Theme';
import {Colors} from '../../Theme/Variables';
import {INCIDENCES} from '../../utils/firebaseKeys';
import {parseDateWithText, parseStateIncidecne} from '../../utils/parsers';
import Avatar from '../Avatar';
import Counter from '../Counter';
import Badge from '../Elements/Badge';

const IncidenceItem = ({item}) => {
  const {t} = useTranslation();
  const {Layout, Gutters, Fonts} = useTheme();

  const {noReadCounter} = useNoReadMessages({
    collection: INCIDENCES,
    docId: item.id,
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
          borderLeftColor: parseStateIncidecne(item?.state),
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
          {item?.title}
        </Text>
        <View style={styles.infoWrapper}>
          <Text style={styles.infoStyle} ellipsizeMode="tail" numberOfLines={2}>
            {item?.incidence}
          </Text>
          <Badge
            text={item?.house?.houseName}
            variant="purple"
            containerStyle={Gutters.smallBMargin}
          />
          {!item?.workers || item?.workers.length === 0 ? (
            <Badge text={'Sin asignar'} variant="danger" />
          ) : (
            <View style={[Layout.row]}>
              {item?.workers?.map((worker, i) => (
                <React.Fragment key={worker.id}>
                  <Avatar
                    overlap={item?.workers?.length > 1}
                    index={i}
                    id={worker.id}
                    uri={worker.profileImage}
                    size="medium"
                  />
                </React.Fragment>
              ))}
            </View>
          )}
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
    height: 200,
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

export default IncidenceItem;
