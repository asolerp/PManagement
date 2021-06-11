import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {defaultLabel, width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollectionData} from 'react-firebase-hooks/firestore';

// Utils

import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import {parseDateWithText, parsePercentageDone} from '../../utils/parsers';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';
import sortByDate from '../../utils/sorts';
import Avatar from '../Avatar';

const styles = StyleSheet.create({
  checkWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 160,
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
    marginBottom: 10,
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

const ChecklistList = ({uid, house}) => {
  const {Gutters, Layout, Fonts} = useTheme();
  let firestoreQuery;
  if (house) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false)
      .where('houseId', '==', house?.id);
  }
  if (uid) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false)
      .where('workersId', 'array-contains', uid);
  }
  if (!uid && !house) {
    firestoreQuery = firestore()
      .collection('checklists')
      .where('send', '==', false);
  }

  const [value, loading] = useCollectionData(firestoreQuery, {
    idField: 'id',
  });

  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Check', {
        docId: item.id,
      });
    };

    return (
      <TouchableOpacity
        style={[
          styles.checkWrapper,
          Gutters.mediumRMargin,
          {
            backgroundColor: Colors.white,
            borderColor: Colors.lowGrey,
            borderLeftColor: parsePercentageDone(item?.done / item?.total),
          },
        ]}
        onPress={() => handlePressIncidence()}>
        <View style={[Layout.fill]}>
          <View
            style={[
              Layout.rowCenter,
              Layout.justifyContentStart,
              Gutters.smallBMargin,
            ]}>
            <Text style={styles.date}>🕜 {parseDateWithText(item?.date)}</Text>
          </View>
          <View style={styles.infoWrapper}>
            <Text style={[styles.bold, Gutters.smallBMargin]}>
              {item?.house?.[0].houseName}
            </Text>
            <Text
              style={styles.infoStyle}
              ellipsizeMode="tail"
              numberOfLines={2}>
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
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <DashboardSectionSkeleton />;
  }

  if (!value || value?.length === 0) {
    return <Text>No hay ningun checklist</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={[Fonts.textTitle, Gutters.mediumRMargin]}>Checklists</Text>
        {!house && (
          <View style={styles.badget}>
            <Text style={{...defaultLabel, ...{color: Colors.white}}}>
              {value?.length || 0}
            </Text>
          </View>
        )}
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={value.sort((a, b) => sortByDate(a, b, 'des'))}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </React.Fragment>
  );
};

export default ChecklistList;
