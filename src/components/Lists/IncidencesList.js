import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import Avatar from '../Avatar';

import {defaultLabel, marginRight, width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollection} from 'react-firebase-hooks/firestore';

// Utils
import {parseDateWithText, parseStateIncidecne} from '../../utils/parsers';
import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import sortByDate from '../../utils/sorts';
import {openScreen, openScreenWithPush} from '../../Router/utils/actions';
import {INCIDENCE_SCREEN_KEY} from '../../Router/utils/routerKeys';

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
    height: 50,
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

const BubleIncidence = ({status}) => {
  return (
    <View
      style={{
        ...styles.buble,
        backgroundColor: Colors.danger,
      }}
    />
  );
};

const IncidencesList = () => {
  const {Gutters, Layout} = useTheme();
  const [values, loading] = useCollection(
    firestore().collection('incidences').where('done', '!=', true),
  );

  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      openScreenWithPush(INCIDENCE_SCREEN_KEY, {
        incidenceId: item.id,
      });
    };

    return (
      <TouchableOpacity
        style={[
          styles.incidenceWrapper,
          Gutters.mediumRMargin,
          {
            borderLeftColor: parseStateIncidecne(item?.data().state),
          },
        ]}
        onPress={() => handlePressIncidence()}>
        <View style={[Layout.fill]}>
          <View
            style={[
              Layout.rowCenter,
              Layout.justifyContentSpaceBetween,
              Gutters.smallBMargin,
            ]}>
            <Text style={styles.date}>
              🕜 {parseDateWithText(item?.data().date)}
            </Text>
            <BubleIncidence />
          </View>
          <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {item?.data().title}{' '}
          </Text>
          <View style={styles.infoWrapper}>
            <Text
              style={styles.infoStyle}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {item?.data().incidence}
            </Text>
            <Text style={[styles.bold, Gutters.regularBMargin]}>
              {item?.data().house?.houseName}
            </Text>
            <View style={styles.avatarWrapper}>
              <Avatar
                key={item?.data().user?.id}
                uri={item?.data().user?.profileImage}
                size="medium"
              />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <DashboardSectionSkeleton />;
  }

  if (values?.docs?.length === 0) {
    return <Text>No hay ninguna incidencia</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={{...defaultLabel, ...marginRight(10)}}>Incidencias</Text>
        <View style={styles.badget}>
          <Text style={{...defaultLabel, ...{color: 'white'}}}>
            {values?.docs.filter((item) => item.id !== 'stats').length}
          </Text>
        </View>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={values?.docs
          .filter((item) => item.id !== 'stats')
          .sort(sortByDate)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </React.Fragment>
  );
};

export default IncidencesList;
