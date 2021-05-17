import React from 'react';
import {useNavigation} from '@react-navigation/core';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {defaultLabel, width} from '../../styles/common';

//Firebase
import firestore from '@react-native-firebase/firestore';
import {useCollection} from 'react-firebase-hooks/firestore';

// Utils

import {Colors} from '../../Theme/Variables';
import {useTheme} from '../../Theme';
import {parseDateWithText, parsePercentageDone} from '../../utils/parsers';

import DashboardSectionSkeleton from '../Skeleton/DashboardSectionSkeleton';

const styles = StyleSheet.create({
  checkWrapper: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    width: 220,
    height: 150,
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

const ChecklistList = () => {
  const {Gutters, Layout, Fonts} = useTheme();

  const [value, loading] = useCollection(firestore().collection('checklists'), {
    snapshotListenOptions: {includeMetadataChanges: true},
  });

  const navigation = useNavigation();

  const renderItem = ({item}) => {
    const handlePressIncidence = () => {
      navigation.navigate('Check', {
        checkId: item.id,
      });
    };

    return (
      <TouchableOpacity
        style={[
          styles.checkWrapper,
          Gutters.mediumRMargin,
          {
            backgroundColor: Colors.white,
            borderLeftWidth: 5,
            borderWidth: 1,
            borderColor: Colors.lowGrey,
            borderLeftColor: parsePercentageDone(
              item?.data().done / item?.data().total,
            ),
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
            <Text style={styles.date}>
              🕜 {parseDateWithText(item?.data().date)}
            </Text>
          </View>
          <View style={styles.infoWrapper}>
            <Text style={[styles.bold, Gutters.smallBMargin]}>
              {item?.data().house?.[0].houseName}
            </Text>
            <Text
              style={styles.infoStyle}
              ellipsizeMode="tail"
              numberOfLines={2}>
              {item?.data().observations}
            </Text>
          </View>
          <View
            style={[
              Layout.grow,
              Layout.justifyContentEnd,
              Layout.alignItemsEnd,
            ]}>
            <Text style={[Fonts.textSmall]}>
              {item?.data().done}/{item?.data().total}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <DashboardSectionSkeleton />;
  }

  if (value.docs.length === 0) {
    return <Text>No hay ningun checklist</Text>;
  }

  return (
    <React.Fragment>
      <View style={{...styles.filterWrapper, ...width(80)}}>
        <Text style={[Fonts.textTitle, Gutters.mediumRMargin]}>Checklists</Text>
        <View style={styles.badget}>
          <Text style={{...defaultLabel, ...{color: Colors.white}}}>
            {value.docs.length}
          </Text>
        </View>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={value.docs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </React.Fragment>
  );
};

export default ChecklistList;
